import { readFile } from "node:fs/promises";
import { inspectPublicMetadata, openVault } from "@ckvf/core";
import { createNodeCrypto } from "@ckvf/node";

const file = process.argv[2];
if (!file) {
  console.error("usage: node open-vault.mjs <vault.ckvf>");
  process.exit(1);
}
const json = await readFile(file, "utf8");
console.log(inspectPublicMetadata(json));
if (process.env.CKVF_PASSWORD) {
  const unlocked = await openVault(json, { password: process.env.CKVF_PASSWORD, crypto: createNodeCrypto() });
  console.log("keys", unlocked.payload.keys.map((k) => ({ id: k.absolute_key_id, family: k.family, status: k.status })));
}
