import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import type { Item, ItemType } from '../types';

// Simple UUID generator if we don't want to install uuid package just for this
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

interface CaptureBarProps {
    storage: StorageService;
    onSave: () => void;
}

export function CaptureBar({ storage, onSave }: CaptureBarProps) {
    const [input, setInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleSave = async (content: string, file?: File) => {
        setIsSaving(true);
        try {
            let type: ItemType = 'note';
            let imagePath: string | undefined;

            if (file) {
                type = 'image';
                imagePath = await storage.uploadAsset(file);
            } else if (/^(http|https):\/\/[^ "]+$/.test(content)) {
                type = 'link';
            }

            const item: Item = {
                id: generateId(),
                type,
                content: content || (file ? file.name : ''),
                createdAt: new Date().toISOString(),
                tags: [],
                title: type === 'link' ? content : undefined,
                image: imagePath,
            };

            await storage.saveItem(item);
            setInput('');
            onSave();
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save item");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        handleSave(input);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                await handleSave('', file);
            }
        }
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <form
                onSubmit={handleSubmit}
                style={{ position: 'relative' }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isDragOver ? "Drop image here..." : "Save a link, note, or drag an image..."}
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: isDragOver ? '2px dashed var(--color-accent)' : '1px solid var(--color-gray-200)',
                        fontSize: '1.125rem',
                        boxShadow: 'var(--shadow-sm)',
                        outline: 'none',
                        transition: 'all 0.2s',
                        backgroundColor: isDragOver ? 'var(--color-gray-100)' : 'white',
                    }}
                    onFocus={(e) => e.target.style.boxShadow = 'var(--shadow-md)'}
                    onBlur={(e) => e.target.style.boxShadow = 'var(--shadow-sm)'}
                />
                {isSaving && (
                    <div style={{
                        position: 'absolute',
                        right: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-gray-500)'
                    }}>
                        Saving...
                    </div>
                )}
            </form>
        </div>
    );
}
