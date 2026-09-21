# Layering: CKVF vs Discovery

CKVF is a **portable encrypted vault container** format and SDK family.

Discovery Protocol / `discovery.scomm.ai` is a separate **mailbox metadata + HTTP** stack.

```text
Discovery/Pubkey client (sdk_pubkey)
  - discoverMailbox, MSK, hosted vault sync orchestration
  - depends on → ckvf (container bytes only)

ckvf (this repo)
  - create / open / export / import vault.ckvf
  - MUST NOT import SComm or Discovery HTTP
```

JS and Dart packages in **this** monorepo stay in sync on CKVF test-vectors.
Discovery JS/Dart sync is owned by `sdk_pubkey` + `discovery-protocol` fixtures.

Do not add Discovery Document types, pubkey HTTP clients, or MSK signing to
this repository.
