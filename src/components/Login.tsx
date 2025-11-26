import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const { login } = useAuth();
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            await login(token.trim());
        } catch (err) {
            setError('Invalid token. Please check and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-swiss">
            <h1 style={{ marginBottom: '1rem' }}>MNEMOSYNE</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '3rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                The Atlas of Memory.
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
                <input
                    type="password"
                    className="input-swiss"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter Access Key"
                    disabled={isLoading}
                    autoComplete="off"
                    style={{ textAlign: 'center', fontSize: '1.2rem' }}
                />
                
                {error && (
                    <p style={{ color: 'var(--color-accent)', marginTop: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
                        {error}
                    </p>
                )}

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button type="submit" className="btn" disabled={isLoading || !token.trim()}>
                        {isLoading ? 'ENTERING...' : 'ENTER ARCHIVE'}
                    </button>
                </div>
            </form>

            <p style={{ marginTop: '4rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                <a 
                    href="https://github.com/settings/tokens/new?scopes=repo&description=Mnemosyne" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ borderBottom: '1px solid var(--color-text-muted)' }}
                >
                    Generate Key
                </a>
            </p>
        </div>
    );
}
