#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runConformance, writeResult } from "./index.js";

function findTestVectors(start: string): string {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, "test-vectors");
    if (fs.existsSync(path.join(candidate, "VERSION"))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("test-vectors/ not found from " + start);
}

const args = process.argv.slice(2);
const idx = args.indexOf("--vectors");
const here = path.dirname(fileURLToPath(import.meta.url));
const vectorsDir = path.resolve(
  idx >= 0 ? args[idx + 1] : findTestVectors(here),
);
const result = await runConformance(vectorsDir);
const out = path.join(vectorsDir, "..", "conformance", "results", "ckvf-node-0.1.0.json");
await writeResult(result, out);
const failed = Object.values(result.profiles).some((p) => p.result === "fail");
console.log(JSON.stringify(result.profiles, null, 2));
if (failed) {
  console.error("conformance failed");
  process.exit(1);
}
console.log(`wrote ${out}`);
