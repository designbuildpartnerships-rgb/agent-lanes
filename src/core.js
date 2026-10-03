import crypto from 'node:crypto';

export class InMemoryArtifactRail {
  constructor(seed = {}) {
    this.seed = structuredClone(seed);
    this.repos = new Map();
  }
  async fork(baseName, laneName) {
    const files = structuredClone(this.repos.get(baseName)?.files ?? this.seed);
    const repo = { name: laneName, files, commits: [] };
    this.repos.set(laneName, repo);
    return repo;
  }
  async read(repoName, path) {
    return this.repos.get(repoName)?.files?.[path] ?? null;
  }
  async write(repoName, path, content, message) {
    const repo = this.repos.get(repoName);
    if (!repo) throw new Error(`Unknown repo: ${repoName}`);
    repo.files[path] = content;
    repo.commits.push({ id: crypto.randomUUID(), message, at: new Date().toISOString() });
  }
  async snapshot(repoName) {
    return structuredClone(this.repos.get(repoName));
  }
}

export class AgentLaneOrchestrator {
  constructor({ rail, evaluator }) {
    this.rail = rail;
    this.evaluator = evaluator;
  }

  async run({ objective, baseRepo = 'baseline', candidates = [] }) {
    if (!objective?.trim()) throw new Error('objective is required');
    if (candidates.length < 2) throw new Error('at least two candidate agents are required');

    const runs = await Promise.all(candidates.map(async (candidate) => {
      const lane = `task-${slug(objective)}-${candidate.id}`;
      await this.rail.fork(baseRepo, lane);
      const startedAt = new Date().toISOString();
      const rationale = await candidate.plan(objective);
      await this.rail.write(lane, 'AGENT_CONTEXT.json', JSON.stringify({ objective, agent: candidate.id, rationale, startedAt }, null, 2), 'record agent rationale');
      const change = await candidate.implement({ objective, lane, rail: this.rail });
      const evidence = await this.evaluator({ objective, lane, rail: this.rail, change });
      await this.rail.write(lane, 'EVIDENCE.json', JSON.stringify(evidence, null, 2), 'record evaluation evidence');
      return { agent: candidate.id, lane, rationale, change, evidence, startedAt, completedAt: new Date().toISOString() };
    }));

    const ranked = runs.toSorted((a, b) => b.evidence.score - a.evidence.score);
    return { objective, winner: ranked[0], candidates: ranked };
  }
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36);
}
