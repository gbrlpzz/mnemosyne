import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
    const [token, setToken] = useState('');
    const { login, isLoading } = useAuth();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;
        try {
            await login(token);
        } catch (err) {
            setError('Failed to login. Check your token.');
        }
    };

    return (
        <div className="container flex items-center justify-center" style={{ height: '100vh' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 600 }}>Mnemosyne</h1>
                <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                            GitHub Personal Access Token
                        </label>
                        <input
                            type="password"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="ghp_..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-gray-200)',
                                fontSize: '1rem',
                            }}
                        />
                        <p className="text-gray text-sm" style={{ marginTop: '0.5rem' }}>
                            Requires <code>repo</code> scope.
                        </p>
                    </div>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            backgroundColor: 'var(--color-text)',
                            color: 'var(--color-bg)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}
                    >
                        {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                </form>
            </div>
        </div>
    );
}
