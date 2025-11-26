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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsSaving(true);
        try {
            const isUrl = /^(http|https):\/\/[^ "]+$/.test(input);
            const type: ItemType = isUrl ? 'link' : 'note';

            const item: Item = {
                id: generateId(),
                type,
                content: input,
                createdAt: new Date().toISOString(),
                tags: [],
                title: isUrl ? input : undefined, // Placeholder title
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

    return (
        <div style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Save a link, note, or idea..."
                    disabled={isSaving}
                    style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-gray-200)',
                        fontSize: '1.125rem',
                        boxShadow: 'var(--shadow-sm)',
                        outline: 'none',
                        transition: 'box-shadow 0.2s',
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
