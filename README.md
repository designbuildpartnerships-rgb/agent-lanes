# Agent Lanes

A small open-source proof for the agentic-Git era: give one objective to multiple agents, isolate each candidate in its own workspace, preserve *why* each agent made its change, evaluate every candidate, and surface the best result for promotion.

The project is designed to map cleanly onto **Cloudflare Artifacts** without making Cloudflare the only possible storage rail.

## Why

Human-first Git collaboration assumes relatively few concurrent authors. Agentic development can produce many candidate changes at once. Agent Lanes explores a different primitive:

**objective -> parallel isolated lanes -> rationale -> implementation -> evidence -> compare -> promote**

## Current proof

The repository includes:
- an in-memory rail so the orchestration behavior can be tested without a cloud account;
- a minimal Cloudflare Artifacts adapter contract;
- isolated agent lanes;
- versioned rationale (`AGENT_CONTEXT.json`);
- versioned evaluation evidence (`EVIDENCE.json`);
- automatic candidate ranking;
- deterministic tests.

## Run locally

Requires Node.js 22+.

```bash
npm test
npm run demo
```

## Cloudflare Artifacts mapping

Cloudflare Artifacts can create/fork repositories programmatically, expose a standard Git remote, and issue repo-scoped credentials. The intended hosted flow is:

1. receive an objective;
2. fork the baseline Artifacts repo once per agent;
3. give each agent only its own repo-scoped Git credential;
4. persist rationale and work in that isolated repo;
5. run tests/review against each candidate;
6. store evidence with the candidate;
7. rank/compare candidates;
8. submit the winner to an explicit promotion/merge policy.

A production system should keep authority outside the storage rail: a repository credential does not itself authorize a production deploy.

## Open-source boundary

This proof is generic by design. It contains no private customer data, proprietary CEA source, credentials, or production infrastructure configuration. Systems such as CEA can integrate through adapters and policy/evaluation interfaces.

## License

MIT
