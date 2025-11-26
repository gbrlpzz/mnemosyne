import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { StorageService } from './services/storage';
import { CaptureBar } from './components/CaptureBar';
import { Feed } from './components/Feed';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const { user, isLoading, github, logout } = useAuth();
  const queryClient = useQueryClient();
  const [isStorageReady, setIsStorageReady] = useState(false);

  const storage = useMemo(() => {
    if (github) return new StorageService(github);
    return null;
  }, [github]);

  useEffect(() => {
    const initStorage = async () => {
      if (storage) {
        try {
          await storage.init();
          setIsStorageReady(true);
        } catch (e) {
          console.error("Failed to init storage", e);
        }
      }
    };
    initStorage();
  }, [storage]);

  if (isLoading) {
    return <div className="container flex items-center justify-center" style={{ height: '100vh' }}>Loading...</div>;
  }

  if (!user || !storage) {
    return <Login />;
  }

  if (!isStorageReady) {
    return <div className="container flex items-center justify-center" style={{ height: '100vh' }}>Initializing your mind...</div>;
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header className="flex justify-between items-center" style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Mnemosyne</h1>
        <div className="flex items-center" style={{ gap: '1rem' }}>
          <img
            src={user.avatar_url}
            alt={user.login}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <button
            onClick={logout}
            className="text-gray text-sm"
            style={{ border: 'none', background: 'none', textDecoration: 'underline' }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <CaptureBar
          storage={storage}
          onSave={() => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
          }}
        />

        <div style={{ marginTop: '4rem' }}>
          <Feed storage={storage} />
        </div>
      </main>
    </div>
  );
}

export default App;
