# Architecture

Agent Lanes is intentionally small. It models one agent-era Git primitive:

`objective -> parallel isolated lanes -> rationale + implementation -> automated evidence -> ranking -> promotion candidate`

## Cloudflare mapping

- **Lane** -> one Cloudflare Artifacts fork/repository per candidate agent or task.
- **Context** -> versioned `AGENT_CONTEXT.json` stored beside code.
- **Evidence** -> versioned `EVIDENCE.json` produced by tests/review automation.
- **Git handoff** -> agents use Artifacts repo-scoped short-lived Git credentials.
- **Preview** -> non-production branches can be connected to Workers Previews.
- **Promotion** -> an external policy layer decides whether the winning candidate may merge/deploy.

## CEA compatibility

CEA is not embedded here. A CEA-compatible adapter can supply:
- objective/task envelopes;
- authority classification;
- evaluator/Labs scoring;
- promotion gates;
- audit/provenance storage.

This repository is deliberately generic and contains no proprietary CEA implementation.
