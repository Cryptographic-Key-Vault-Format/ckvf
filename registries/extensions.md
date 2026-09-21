# Extensions

Community registry of extension `id` values. SPEC.md Sections 4.6, 13, and Appendix A.8.

No standard extensions are registered in Community Draft 0.1.

| id | critical typical | Specification |
| --- | --- | --- |
| *(none)* | — | — |

## Identifier syntax

```
id = prefix ":" name
```

| Prefix | Namespace | Meaning |
| --- | --- | --- |
| `std:` | Standard | Assigned in this table (or a future IANA registry) |
| `exp:` | Experimental | MUST NOT be required for interoperability of core features |
| `priv:` | Private / vendor | MUST be collision-resistant (for example, reverse-DNS after `priv:`) |

`name` MUST match `^[a-z0-9][a-z0-9._-]*$`. The full `id` therefore matches `^(std|exp|priv):[a-z0-9][a-z0-9._-]*$`.

Each extension object is `{ "id", "critical", "data" }`. `data` MUST be present. `critical` MUST be `true` if and only if the object appears in a `critical_extensions` array, and MUST be `false` if and only if it appears in `extensions`.

## Processing

- Unknown **non-critical** extensions: preserve through read/write cycles that do not intentionally strip extensions; ignore `data` for security-sensitive processing.
- Unknown **critical** extensions: reject security-sensitive processing (`ERR_CRITICAL_EXTENSION`), including unlock for use, merge, and publication of keys derived from the vault.
- Core objects MUST NOT contain loose arbitrary JSON properties. Extensions are the only forward-compatible data channel.

## How to add a row

See [CONTRIBUTING.md](CONTRIBUTING.md). Standard (`std:`) entries require a specification reference and review. Experimental (`exp:`) entries MUST NOT be required to parse or unlock a v1.0 vault. Private (`priv:`) IDs MAY be used without a row in this table.
