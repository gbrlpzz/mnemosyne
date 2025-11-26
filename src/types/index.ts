export type ItemType = 'note' | 'link' | 'image';

export interface Item {
    id: string;
    type: ItemType;
    content: string; // URL or text
    title?: string;
    description?: string;
    image?: string; // URL to image (external or internal)
    createdAt: string;
    tags: string[];
}
