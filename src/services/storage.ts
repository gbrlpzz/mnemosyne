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
        console.log("StorageService: init started");
        const repo = await this.github.getRepo(REPO_NAME);
        if (!repo) {
            console.log("StorageService: Repo not found, creating...");
            await this.github.createRepo(REPO_NAME);
        }
        console.log("StorageService: init completed");
    }

    async saveItem(item: Item) {
        const path = `data/${item.createdAt}-${item.id}.json`;
        const content = JSON.stringify(item, null, 2);
        await this.github.createFile(path, content, `Save ${item.type}: ${item.title || item.id}`);
    }

    async uploadAsset(file: File): Promise<string> {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        // We don't need btoa here because GitHubService.createFile does it, 
        // BUT GitHubService.createFile expects a string. 
        // Let's adjust GitHubService to handle this or just pass the binary string.
        // Actually, let's just do the base64 conversion here to be safe and clear.

        // Better approach: Read as DataURL and strip prefix
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64Content = (reader.result as string).split(',')[1];
                const ext = file.name.split('.').pop();
                const id = Math.random().toString(36).substring(2, 15);
                const path = `assets/${id}.${ext}`;

                // We need a way to pass raw base64 to GitHubService without it double-encoding
                // Or we update GitHubService to accept base64 flag.
                // For now, let's assume we can modify GitHubService or use a raw put.

                // Let's modify GitHubService to support direct base64 content
                await this.github.createFile(path, base64Content, `Upload asset: ${file.name}`, true);
                resolve(path);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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

    async getAsset(path: string): Promise<string | null> {
        return await this.github.getFileRaw(path);
    }
}
