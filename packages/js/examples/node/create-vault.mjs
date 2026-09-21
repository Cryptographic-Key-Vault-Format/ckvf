import { createVault, serializeContainer, TEST_ARGON2ID } from "@ckvf/core";
import { createNodeCrypto } from "@ckvf/node";

const vault = await createVault({
  identityType: "email",
  identityValue: "alice@example.com",
  password: process.env.CKVF_PASSWORD ?? "change-me",
  crypto: createNodeCrypto(),
  kdf: TEST_ARGON2ID,
});

process.stdout.write(serializeContainer(vault.container));
