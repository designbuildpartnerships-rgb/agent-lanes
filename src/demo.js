import { AgentLaneOrchestrator, InMemoryArtifactRail } from './core.js';

const rail = new InMemoryArtifactRail({
  'src/message.txt': 'baseline\n'
});

const agents = [
  makeAgent('concise', 'ship small, deterministic changes', 'candidate A\n'),
  makeAgent('robust', 'add validation and clear evidence', 'candidate B with validation\n'),
  makeAgent('experimental', 'try a more ambitious variant', 'candidate C experimental path\n')
];

const orchestrator = new AgentLaneOrchestrator({
  rail,
  evaluator: async ({ lane, rail }) => {
    const text = await rail.read(lane, 'src/message.txt');
    const score = text.includes('validation') ? 0.95 : text.includes('experimental') ? 0.72 : 0.80;
    return { score, tests: [{ name: 'message-written', passed: Boolean(text) }], summary: `Scored ${score}` };
  }
});

const result = await orchestrator.run({
  objective: 'Improve the message implementation',
  candidates: agents
});

console.log(JSON.stringify(result, null, 2));

function makeAgent(id, rationale, content) {
  return {
    id,
    plan: async () => rationale,
    implement: async ({ lane, rail }) => {
      await rail.write(lane, 'src/message.txt', content, `${id}: implement candidate`);
      return { path: 'src/message.txt' };
    }
  };
}
