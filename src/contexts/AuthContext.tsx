import React, { createContext, useContext, useState, useEffect } from 'react';
import { GitHubService } from '../services/github';

interface User {
    login: string;
    avatar_url: string;
    name: string | null;
}

interface AuthContextType {
    token: string | null;
    user: User | null;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    github: GitHubService | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(localStorage.getItem('mnemosyne_token'));
    const [user, setUser] = useState<User | null>(null);
    const [github, setGithub] = useState<GitHubService | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const gh = new GitHubService(token);
                    const userData = await gh.getUser();
                    setGithub(gh);
                    setUser({
                        login: userData.login,
                        avatar_url: userData.avatar_url,
                        name: userData.name,
                    });
                } catch (e) {
                    console.error("Failed to auth", e);
                    logout();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (newToken: string) => {
        setIsLoading(true);
        localStorage.setItem('mnemosyne_token', newToken);
        setToken(newToken);
        // Effect will trigger
    };

    const logout = () => {
        localStorage.removeItem('mnemosyne_token');
        setToken(null);
        setUser(null);
        setGithub(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, isLoading, login, logout, github }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
