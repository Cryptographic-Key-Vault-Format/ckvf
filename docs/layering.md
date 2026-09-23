# Layering: CKVF vs Discovery

CKVF is the **SComm.AI-maintained** portable encrypted vault **container** (this repo).

Discovery Protocol / `discovery.scomm.ai` (debug port 3000) is the mailbox directory and mailer.

The vault host is `vault.scomm.ai` (debug port 3001). Its HTTP profile is [specification/profiles/vault-host.md](../specification/profiles/vault-host.md).

```text
Pubkey client (sdk_pubkey)
  - discoverMailbox and directory MSK against discovery.scomm.ai
  - OPRF, vault open, and ciphertext sync against vault.scomm.ai
  - depends on → ckvf (container bytes only)

ckvf (this repo, scomm-public/ckvf)
  - create / open / export / import vault.ckvf
  - vault-host profile (opaque records, grants, OPRF evaluate)
  - container packages MUST NOT import Discovery HTTP or perform vault-host calls
```

JS and Dart packages in **this** monorepo stay in sync on CKVF test-vectors.
Discovery JS/Dart sync is owned by `sdk_pubkey` + `discovery-protocol` fixtures.

Do not add Discovery Document types, pubkey HTTP clients, or MSK signing to
this repository. That layering is technical, not a claim that CKVF is a
vendor-neutral standards body.
