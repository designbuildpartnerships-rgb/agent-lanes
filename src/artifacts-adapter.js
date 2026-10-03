/**
 * Minimal Cloudflare Artifacts adapter contract.
 * This file intentionally contains no credentials and no CEA-specific code.
 * Wire these methods to the Artifacts Workers binding in production.
 */
export class CloudflareArtifactsRail {
  constructor(binding, namespace = 'default') {
    this.binding = binding;
    this.namespace = namespace;
  }

  async fork(baseName, laneName) {
    using project = await this.binding.get(baseName);
    const workspace = await project.fork(laneName);
    return { name: workspace.name, remote: workspace.remote, token: workspace.token };
  }

  async read(repoName, path, ref) {
    using repo = await this.binding.get(repoName);
    const info = await repo.info();
    const file = await repo.readFile({ ref: ref ?? info.defaultBranch, path });
    return file ? await file.text() : null;
  }

  // Commits are expected to arrive through normal Git clients/agents using
  // repo-scoped short-lived credentials issued by Artifacts.
}
