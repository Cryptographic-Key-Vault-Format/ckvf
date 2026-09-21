# Signed operations

Community registry of `body.operation` values. SPEC.md Sections 4.7, 8, and Appendix A.6. Payload objects: SPEC Appendix B.

Protocol `CKVF`, `protocol_version` `"1.0"`. `signature.algorithm` MUST be `Ed25519`. The signed message is UTF-8 JCS(`body`) only, not the envelope.

| Value | Payload (Appendix B) |
| --- | --- |
| `ADD_KEY` | `{ "key": { /* key record */ } }` |
| `RETIRE_KEY` | `{ "absolute_key_id", "status": "retired" }` plus optional `family_revocation` |
| `REVOKE_KEY` | `{ "absolute_key_id", "status": "revoked" }` plus optional `family_revocation` |
| `SET_PREFERRED_KEY` | `{ "family", "purpose", "absolute_key_id" }` (`absolute_key_id` MAY be JSON `null` to clear) |
| `ADD_DEVICE` | `{ "slot_id", "slot": { /* full unlock slot */ } }` |
| `REMOVE_DEVICE` | `{ "slot_id" }` only |
| `COMMIT_VAULT_GENERATION` | `{ "generation", "previous_generation_hash", "generation_hash" }` (`body.generation` MUST equal `payload.generation`) |
| `MERGE_VAULT` | `{ "parents": [ { "generation", "generation_hash" }, { "generation", "generation_hash" } ], "result_generation", "result_generation_hash" }` |
| `UPDATE_METADATA` | `{ "updated_at" }` |
| `DELETE_PRIVATE_KEY` | `{ "absolute_key_id", "reason" }` (`user-requested` \| `compromised-purge` \| `policy`) |
| `ESTABLISH_MSK` | `{ "msk_id", "algorithm": "Ed25519", "public_key", "activated_at", "verification_method", "proof_id" }` |
| `REPLACE_MSK` | Same payload as `ESTABLISH_MSK`. Default: REQUIRES a fresh Identity ownership proof. |

Unknown operations MUST be rejected (`ERR_OPERATION`). Additional payload members MUST be rejected unless placed in a registered extension object inside `payload` where a payload schema allows `extensions`.

`ESTABLISH_MSK` is signed by the **new** MSK and MUST be rejected if a current MSK already exists (`ERR_MSK_EXISTS`). `REPLACE_MSK` is signed by the **new** MSK.
