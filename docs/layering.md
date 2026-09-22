# Layering: CKVF vs Discovery

CKVF is the **SComm.AI-maintained** portable encrypted vault **container** (this repo).

Discovery Protocol / `discovery.scomm.ai` is a separate **mailbox metadata + HTTP** stack.

```text
Discovery/Pubkey client (sdk_pubkey)
  - discoverMailbox, MSK, hosted vault sync orchestration
  - depends on → ckvf (container bytes only)

ckvf (this repo, scomm-public/ckvf)
  - create / open / export / import vault.ckvf
  - MUST NOT import Discovery HTTP or hosted vault APIs
```

JS and Dart packages in **this** monorepo stay in sync on CKVF test-vectors.
Discovery JS/Dart sync is owned by `sdk_pubkey` + `discovery-protocol` fixtures.

Do not add Discovery Document types, pubkey HTTP clients, or MSK signing to
this repository. That layering is technical, not a claim that CKVF is a
vendor-neutral standards body.
