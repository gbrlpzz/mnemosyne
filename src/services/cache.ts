import type { Item } from '../types';

const CACHE_KEY = 'mnemosyne_items_cache';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const IMAGE_CACHE_KEY = 'mnemosyne_images_cache';
const IMAGE_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface CacheData {
    items: Item[];
    timestamp: number;
}

export class CacheService {
    private memoryCache: Map<string, Item> = new Map();
    private lastSync: number = 0;

    load(): Item[] | null {
        try {
            const data = localStorage.getItem(CACHE_KEY);
            if (!data) return null;
            
            const parsed: CacheData = JSON.parse(data);
            
            // Check if cache is still valid and has items
            if (Date.now() - parsed.timestamp > CACHE_TTL) {
                return null;
            }
            
            // Don't return empty caches - treat them as invalid
            if (!parsed.items || parsed.items.length === 0) {
                return null;
            }
            
            // Populate memory cache
            parsed.items.forEach(item => this.memoryCache.set(item.id, item));
            this.lastSync = parsed.timestamp;
            
            return parsed.items;
        } catch {
            return null;
        }
    }

    save(items: Item[]): void {
        this.memoryCache.clear();
        items.forEach(item => this.memoryCache.set(item.id, item));
        this.lastSync = Date.now();
        
        const data: CacheData = {
            items,
            timestamp: this.lastSync,
        };
        
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save to localStorage cache', e);
        }
    }

    get(id: string): Item | undefined {
        return this.memoryCache.get(id);
    }

    set(item: Item): void {
        this.memoryCache.set(item.id, item);
        this.persistToStorage();
    }

    update(id: string, updates: Partial<Item>): Item | undefined {
        const existing = this.memoryCache.get(id);
        if (!existing) return undefined;
        
        const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
        this.memoryCache.set(id, updated);
        this.persistToStorage();
        return updated;
    }

    delete(id: string): boolean {
        const deleted = this.memoryCache.delete(id);
        if (deleted) {
            this.persistToStorage();
        }
        return deleted;
    }

    getAll(): Item[] {
        return Array.from(this.memoryCache.values());
    }

    clear(): void {
        this.memoryCache.clear();
        localStorage.removeItem(CACHE_KEY);
    }

    isStale(): boolean {
        return Date.now() - this.lastSync > CACHE_TTL;
    }

    private persistToStorage(): void {
        const items = this.getAll();
        const data: CacheData = {
            items,
            timestamp: Date.now(),
        };
        
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to persist cache', e);
        }
    }
}

// Singleton instance
export const cache = new CacheService();

// Image URL cache (separate from items cache)
interface ImageCacheData {
    urls: Record<string, string>;
    timestamp: number;
}

class ImageCacheService {
    private urlCache: Map<string, string> = new Map();
    private initialized = false;

    private load(): void {
        if (this.initialized) return;
        this.initialized = true;
        
        try {
            const data = localStorage.getItem(IMAGE_CACHE_KEY);
            if (!data) return;
            
            const parsed: ImageCacheData = JSON.parse(data);
            if (Date.now() - parsed.timestamp > IMAGE_CACHE_TTL) {
                localStorage.removeItem(IMAGE_CACHE_KEY);
                return;
            }
            
            Object.entries(parsed.urls).forEach(([key, url]) => {
                this.urlCache.set(key, url);
            });
        } catch {
            // Ignore cache errors
        }
    }

    get(imageId: string | undefined): string | null {
        if (!imageId) return null;
        this.load();
        return this.urlCache.get(imageId) || null;
    }

    set(imageId: string | undefined, url: string): void {
        if (!imageId) return;
        this.load();
        this.urlCache.set(imageId, url);
        this.persist();
    }

    private persist(): void {
        const urls: Record<string, string> = {};
        this.urlCache.forEach((url, key) => {
            urls[key] = url;
        });
        
        try {
            localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify({
                urls,
                timestamp: Date.now()
            }));
        } catch {
            // Ignore storage errors
        }
    }
}

export const imageCache = new ImageCacheService();

