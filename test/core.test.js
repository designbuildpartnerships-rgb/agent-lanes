import test from 'node:test';
import assert from 'node:assert/strict';
import { AgentLaneOrchestrator, InMemoryArtifactRail } from '../src/core.js';

test('runs candidates in isolated lanes and selects highest evidence score', async () => {
  const rail = new InMemoryArtifactRail({ 'x.txt': 'base' });
  const agents = [
    { id: 'a', plan: async () => 'A', implement: async ({lane, rail}) => { await rail.write(lane, 'x.txt', 'A', 'A'); return {}; } },
    { id: 'b', plan: async () => 'B', implement: async ({lane, rail}) => { await rail.write(lane, 'x.txt', 'B', 'B'); return {}; } }
  ];
  const orchestrator = new AgentLaneOrchestrator({
    rail,
    evaluator: async ({ lane }) => ({ score: lane.endsWith('-b') ? 0.9 : 0.5, tests: [] })
  });
  const result = await orchestrator.run({ objective: 'Test isolation', candidates: agents });
  assert.equal(result.winner.agent, 'b');
  assert.notEqual(result.candidates[0].lane, result.candidates[1].lane);
});

test('persists rationale and evidence in each lane', async () => {
  const rail = new InMemoryArtifactRail();
  const agents = [
    { id: 'a', plan: async () => 'plan-a', implement: async () => ({}) },
    { id: 'b', plan: async () => 'plan-b', implement: async () => ({}) }
  ];
  const orchestrator = new AgentLaneOrchestrator({ rail, evaluator: async () => ({ score: 1, tests: [] }) });
  const result = await orchestrator.run({ objective: 'Persist context', candidates: agents });
  for (const candidate of result.candidates) {
    assert.ok(await rail.read(candidate.lane, 'AGENT_CONTEXT.json'));
    assert.ok(await rail.read(candidate.lane, 'EVIDENCE.json'));
  }
});

test('candidate implementations overlap in time', async () => {
  const rail = new InMemoryArtifactRail();
  const marks = [];
  const mk = (id) => ({
    id,
    plan: async () => id,
    implement: async () => {
      marks.push(`${id}:start`);
      await new Promise(resolve => setTimeout(resolve, 40));
      marks.push(`${id}:end`);
      return {};
    }
  });
  const orchestrator = new AgentLaneOrchestrator({ rail, evaluator: async () => ({ score: 1, tests: [] }) });
  await orchestrator.run({ objective: 'Concurrent work', candidates: [mk('a'), mk('b')] });
  const firstEnd = Math.min(marks.indexOf('a:end'), marks.indexOf('b:end'));
  assert.ok(marks.indexOf('a:start') < firstEnd);
  assert.ok(marks.indexOf('b:start') < firstEnd);
});
