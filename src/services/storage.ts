import { GitHubService } from './github';
import type { Item } from '../types';

const REPO_NAME = 'mnemosyne-db';

export class StorageService {
    private github: GitHubService;

    constructor(github: GitHubService) {
        this.github = github;
        this.github.setRepo(REPO_NAME);
    }

    async init() {
        const repo = await this.github.getRepo(REPO_NAME);
        if (!repo) {
            await this.github.createRepo(REPO_NAME);
        }
    }

    async saveItem(item: Item) {
        const path = `data/${item.createdAt}-${item.id}.json`;
        const content = JSON.stringify(item, null, 2);
        await this.github.createFile(path, content, `Save ${item.type}: ${item.title || item.id}`);
    }

    async getItems(): Promise<Item[]> {
        const files = await this.github.listFiles('data');
        // Sort by name (which starts with timestamp) descending
        const sortedFiles = files
            .filter((f: any) => f.name.endsWith('.json'))
            .sort((a: any, b: any) => b.name.localeCompare(a.name));

        // Fetch content for top 20 items (pagination later)
        const items = await Promise.all(
            sortedFiles.slice(0, 20).map(async (file: any) => {
                const content = await this.github.getFile(file.path);
                if (content) {
                    try {
                        return JSON.parse(content) as Item;
                    } catch (e) {
                        return null;
                    }
                }
                return null;
            })
        );

        return items.filter((i): i is Item => i !== null);
    }
}
