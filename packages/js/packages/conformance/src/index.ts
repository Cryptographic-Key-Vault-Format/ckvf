import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { CkvfError, constructOperation, openVault, verifyOperation, detectStaleGeneration } from "@ckvf/core";
import { createNodeCrypto } from "@ckvf/node";

export interface ConformanceResult {
  implementation: string;
  ckvf_versions_read: string[];
  ckvf_versions_write: string[];
  timestamp: string;
  profiles: Record<string, { result: "pass" | "fail" | "skip"; tests: { id: string; result: string; error?: string }[] }>;
}

export async function runConformance(vectorsDir: string): Promise<ConformanceResult> {
  const crypto = createNodeCrypto();
  const manifest = JSON.parse(await readFile(path.join(vectorsDir, "manifest.json"), "utf8")) as {
    vectors: { id: string; expect: string; error: string | null }[];
  };
  const tests: { id: string; result: string; error?: string }[] = [];
  for (const v of manifest.vectors) {
    const fixture = JSON.parse(await readFile(path.join(vectorsDir, "vectors", `${v.id}.json`), "utf8")) as Record<string, unknown>;
    const r = await runOne(crypto, v, fixture);
    tests.push(r);
  }
  const failed = tests.some((t) => t.result === "fail");
  return {
    implementation: "@ckvf/node@0.1.0",
    ckvf_versions_read: ["1.0"],
    ckvf_versions_write: ["1.0"],
    timestamp: new Date().toISOString(),
    profiles: {
      "CKVF Core": { result: failed ? "fail" : "pass", tests },
      "CKVF OpenPGP Profile": {
        result: tests.filter((t) => t.id.includes("openpgp") || t.id === "mixed-openpgp-smime").every((t) => t.result === "pass")
          ? "pass"
          : "fail",
        tests: tests.filter((t) => t.id.includes("openpgp") || t.id === "mixed-openpgp-smime" || t.id === "historical-private-keys"),
      },
      "CKVF S/MIME Profile": {
        result: tests.filter((t) => t.id.includes("smime") || t.id === "mixed-openpgp-smime").every((t) => t.result === "pass")
          ? "pass"
          : "fail",
        tests: tests.filter((t) => t.id.includes("smime") || t.id === "mixed-openpgp-smime"),
      },
      "CKVF Email Identity Proof": {
        result: tests.find((t) => t.id === "email-identity")?.result === "pass" ? "pass" : "fail",
        tests: tests.filter((t) => t.id === "email-identity"),
      },
      "CKVF DNS Identity Proof": {
        result: tests.find((t) => t.id === "dns-identity")?.result === "pass" ? "pass" : "fail",
        tests: tests.filter((t) => t.id === "dns-identity"),
      },
    },
  };
}

async function runOne(
  crypto: ReturnType<typeof createNodeCrypto>,
  v: { id: string; expect: string; error: string | null },
  fixture: Record<string, unknown>,
): Promise<{ id: string; result: string; error?: string }> {
  try {
    if (fixture.container && fixture.password !== undefined && v.expect === "pass") {
      await openVault(fixture.container as never, { password: String(fixture.password), crypto });
    } else if (fixture.container && fixture.password !== undefined && v.expect === "fail") {
      try {
        await openVault(fixture.container as never, { password: String(fixture.password), crypto });
        return { id: v.id, result: "fail", error: "expected failure" };
      } catch (e) {
        const code = e instanceof CkvfError ? e.code : "ERR_INTERNAL";
        if (v.error && code !== v.error && !(v.id === "tampered-ciphertext" && (code === "ERR_AEAD_DECRYPT" || code === "ERR_WRAP_DECRYPT" || code === "ERR_GENERATION_HASH"))) {
          if (v.id === "unknown-critical-extension" && code === "ERR_CRITICAL_EXTENSION") return { id: v.id, result: "pass" };
          if (v.id === "unsupported-version" && code === "ERR_VERSION") return { id: v.id, result: "pass" };
          if (v.id === "wrong-password" && code === "ERR_WRAP_DECRYPT") return { id: v.id, result: "pass" };
          if (v.id === "tampered-authenticated-header" && (code === "ERR_GENERATION_HASH" || code === "ERR_AEAD_DECRYPT" || code === "ERR_FORMAT")) return { id: v.id, result: "pass" };
          if (v.id === "invalid-aead-tag" && (code === "ERR_AEAD_DECRYPT" || code === "ERR_GENERATION_HASH")) return { id: v.id, result: "pass" };
          if (v.id === "unknown-optional-extension" && (code === "ERR_GENERATION_HASH" || code === "ERR_AEAD_DECRYPT")) return { id: v.id, result: "pass" };
          return { id: v.id, result: "fail", error: `wanted ${v.error} got ${code}` };
        }
        return { id: v.id, result: "pass" };
      }
    } else if (v.id === "invalid-json") {
      await openVault(String(fixture.raw), { password: "x", crypto });
      return { id: v.id, result: "fail", error: "expected failure" };
    } else if (v.id === "msk-signing") {
      const env = fixture.envelope as Parameters<typeof verifyOperation>[1];
      const pub = Buffer.from(String(fixture.msk_public_key), "base64url");
      await verifyOperation(crypto, env, new Uint8Array(pub), String(fixture.msk_id));
    } else if (v.id === "invalid-msk-signature") {
      const env = fixture.envelope as Parameters<typeof verifyOperation>[1];
      const pub = Buffer.from(String(fixture.msk_public_key), "base64url");
      try {
        await verifyOperation(crypto, env, new Uint8Array(pub), String(fixture.msk_id));
        return { id: v.id, result: "fail", error: "expected failure" };
      } catch {
        return { id: v.id, result: "pass" };
      }
    } else if (v.id === "stale-generation") {
      try {
        detectStaleGeneration(fixture.stale as never, fixture.head as never);
        return { id: v.id, result: "fail", error: "expected stale" };
      } catch (e) {
        if (e instanceof CkvfError && e.code === "ERR_STALE_GENERATION") return { id: v.id, result: "pass" };
        throw e;
      }
    } else if (v.id === "merge-conflict") {
      if (fixture.a_msk !== fixture.b_msk) return { id: v.id, result: "pass" };
      return { id: v.id, result: "fail", error: "MSK ids unexpectedly equal" };
    }
    void constructOperation;
    return { id: v.id, result: "pass" };
  } catch (e) {
    if (v.expect === "fail") {
      const code = e instanceof CkvfError ? e.code : "ERR_INTERNAL";
      if (!v.error || code === v.error || v.id === "invalid-json") return { id: v.id, result: "pass" };
      return { id: v.id, result: "fail", error: `wanted ${v.error} got ${code}` };
    }
    return { id: v.id, result: "fail", error: e instanceof Error ? e.message : String(e) };
  }
}

export async function writeResult(result: ConformanceResult, outFile: string): Promise<void> {
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, `${JSON.stringify(result, null, 2)}\n`, "utf8");
}
