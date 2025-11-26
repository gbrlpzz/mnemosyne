import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { StorageService } from '../services/storage';
import type { Item } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface FeedProps {
    storage: StorageService;
}

export function Feed({ storage }: FeedProps) {
    const { data: items, isLoading, error } = useQuery({
        queryKey: ['items'],
        queryFn: () => storage.getItems(),
    });

    if (isLoading) return <div className="text-gray text-center">Loading your mind...</div>;
    if (error) return <div className="text-gray text-center">Failed to load items.</div>;
    if (!items || items.length === 0) return <div className="text-gray text-center">Nothing here yet.</div>;

    return (
        <div className="grid" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1.5rem',
            alignItems: 'start' // Masonry-ish effect requires more complex CSS or JS, simple grid for now
        }}>
            {items.map((item) => (
                <Card key={item.id} item={item} storage={storage} />
            ))}
        </div>
    );
}

function Card({ item, storage }: { item: Item, storage: StorageService }) {
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (item.type === 'image' && item.image) {
            storage.getAsset(item.image).then(base64 => {
                if (base64) {
                    // Determine mime type from extension
                    const ext = item.image!.split('.').pop();
                    const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/webp';
                    setImageUrl(`data:${mime};base64,${base64}`);
                }
            });
        }
    }, [item, storage]);

    return (
        <div style={{
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            backgroundColor: 'white',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            overflow: 'hidden',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {item.type === 'image' && imageUrl && (
                <div style={{ margin: '-1.5rem -1.5rem 1rem -1.5rem' }}>
                    <img src={imageUrl} alt={item.content} style={{ width: '100%', display: 'block' }} />
                </div>
            )}

            {item.type === 'link' ? (
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                        <a href={item.content} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            {item.title || item.content}
                        </a>
                    </h3>
                    <p className="text-gray text-sm" style={{ wordBreak: 'break-all' }}>{item.content}</p>
                </div>
            ) : item.type === 'image' ? (
                <div>
                    {/* Image is handled above, maybe show caption if any */}
                </div>
            ) : (
                <div>
                    <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{item.content}</p>
                </div>
            )}

            <div className="flex justify-between items-center" style={{ marginTop: '1rem' }}>
                <span className="text-gray text-sm" style={{ fontSize: '0.75rem' }}>
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
                <span style={{
                    fontSize: '0.75rem',
                    padding: '2px 6px',
                    backgroundColor: 'var(--color-gray-100)',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {item.type}
                </span>
            </div>
        </div>
    );
}
