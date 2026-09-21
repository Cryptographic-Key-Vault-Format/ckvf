# IETF packaging (future)

CKVF Community Draft 0.1 is **not** an IETF Internet-Draft, RFC, or working-group output.

This directory holds a [kramdown-rfc](https://github.com/cabo/kramdown-rfc) source file so the community can later submit a document named along the lines of `draft-<authors>-ckvf` without rewriting the data model.

## Current files

| File | Role |
| --- | --- |
| [draft-ckvf-community-00.md](draft-ckvf-community-00.md) | kramdown-rfc Community Draft `00` |

Until an actual IETF submission exists:

- Do not request IANA action (registries stay in [SPEC.md](../SPEC.md) Appendix A).
- Do not set `ipr: trust200902` or `submissiontype: IETF` in a way that implies the IETF has accepted the work. The Community Draft uses `ipr: none` and `submissiontype: independent`.
- If [SPEC.md](../SPEC.md) and the kramdown file disagree, **SPEC.md wins**.

## Later rename

A future IETF-bound document SHOULD use a filename of the form `draft-<authors>-ckvf-00` (or a working-group name if one exists). That rename is a process step, not a wire-format change. Container `version` remains `"1.0"` unless SPEC.md says otherwise.

## Build (optional)

When Ruby, `kramdown-rfc`, and `xml2rfc` are available:

```bash
kramdown-rfc draft-ckvf-community-00.md > draft-ckvf-community-00.xml
xml2rfc --text draft-ckvf-community-00.xml
```

Building is not required to implement CKVF. Implementers SHOULD read [SPEC.md](../SPEC.md).

## IANA

Community registries are structured for later migration (unlock methods, families, encodings, operations, extension prefixes). No IANA request is made in Draft 0.1.
