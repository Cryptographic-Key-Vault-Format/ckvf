# Vault host

CKVF ciphertext is stored by the vault host. This profile is the hosted
record API. It is not a Discovery Document and it is not part of
[`discovery-protocol`](https://github.com/scomm-public/discovery-protocol).

| Mode | Origin |
| --- | --- |
| Debug | `http://127.0.0.1:3001` |
| Production | `https://vault.scomm.ai` |

The directory and its mailer are a different origin (`http://127.0.0.1:3000`,
`https://discovery.scomm.ai`). The vault host does not send mail and does not
accept a mailbox address or `mailboxSha256`.

## Routes

- `POST /v1/id/oprf/evaluate` with `{ "blind" }` returns `{ "evaluation" }`.
  The OPRF secret stays on this host. The info string
  `Scomm/Pubkey/identity/v1` is not mixed into Finalize.
- `POST /v1/vault/open` with `{ "identity_id", "vault_id", "otp_grant", "msk" }`
  binds a client-minted `vault_id` after a discovery mailer grant of purpose
  `vault_open`. The presented MSK must match the grant's `msk_fingerprint`.
- `GET /v1/vault/{vault_id}/current`
- `GET /v1/vault/{vault_id}/generation/{n}`
- `GET /v1/vault/{vault_id}/pending-mutations`
- `POST /v1/vault/{vault_id}/records` stores one opaque generation. The body
  is ciphertext. The host does not parse the CKVF container.

Container libraries in this repository MUST NOT call these routes. The
SComm.AI pubkey SDK calls them on the vault origin.

## Grant

The discovery mailer signs the grant. Vault verifies it and burns `jti`.

```text
Scomm/grant/v1
purpose=<purpose>
identity_id=<64 lowercase hex>
msk_fingerprint=<64 lowercase hex SHA-256 of the armed MSK public key>
exp=<unix ms>
jti=<opaque>
```

Purposes consumed here: `vault_open`, `replace_msk`, `recovery_envelope`,
`recovery_generation`, `vault_backup`.

A vault is opened only after the directory already has an armed MSK for that
mailbox. The mailer enforces that precondition. This host never looks up the
directory.
