import { Octokit } from "octokit";

export class GitHubService {
  private octokit: Octokit;
  private owner: string | null = null;
  private repo: string | null = null;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getUser() {
    const { data } = await this.octokit.rest.users.getAuthenticated();
    this.owner = data.login;
    return data;
  }

  setRepo(repoName: string) {
    this.repo = repoName;
  }

  async getRepo(repoName: string) {
    if (!this.owner) await this.getUser();
    console.log(`Checking for repo: ${this.owner}/${repoName}`);
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner: this.owner!,
        repo: repoName,
      });
      console.log("Repo found");
      return data;
    } catch (e) {
      console.log("Repo not found or error", e);
      return null;
    }
  }

  async createRepo(repoName: string) {
    console.log(`Creating repo: ${repoName}`);
    const { data } = await this.octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      private: true,
      auto_init: true,
      description: "Mnemosyne Memory Storage",
    });
    console.log("Repo created");
    return data;
  }

  async createFile(path: string, content: string, message: string) {
    if (!this.owner || !this.repo) throw new Error("Repo not set");

    // Base64 encode content for GitHub API
    const contentEncoded = btoa(unescape(encodeURIComponent(content)));

    await this.octokit.rest.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path,
      message,
      content: contentEncoded,
    });
  }

  async getFile(path: string) {
    if (!this.owner || !this.repo) throw new Error("Repo not set");
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });

      if ('content' in data) {
        const content = decodeURIComponent(escape(atob(data.content)));
        return content;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async listFiles(path: string) {
    if (!this.owner || !this.repo) throw new Error("Repo not set");
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
      });
      if (Array.isArray(data)) {
        return data;
      }
      return [];
    } catch (e) {
      return [];
    }
  }
}
