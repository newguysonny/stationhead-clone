//src/contexts/SpotifyAuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const SpotifyAuthContext = createContext();

export const SpotifyAuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    // Initialize from localStorage if available
    const token = localStorage.getItem('spotify_token');
    return {
      isConnected: !!token,
      token: token || null,
      status: 'idle', // 'idle' | 'loading' | 'connected' | 'error'
      error: null
    };
  });

  // Check for token in URL (fallback for non-popup .flows)
  useEffect(() => {
    const handleTokenFromURL = () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');

      if (token) {
        connect(token);
        // Clean the URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    };

    handleTokenFromURL();
  }, []);

  const connect = (token) => {
    localStorage.setItem('spotify_token', token);
    setAuth({
      isConnected: true,
      token,
      status: 'connected',
      error: null
    });
  };

  const disconnect = () => {
    localStorage.removeItem('spotify_token');
    setAuth({
      isConnected: false,
      token: null,
      status: 'idle',
      error: null
    });
  };

  const startAuth = () => {
    setAuth(prev => ({
      ...prev,
      status: 'loading',
      error: null
    }));
  };

  const setAuthError = (error) => {
    setAuth(prev => ({
      ...prev,
      status: 'error',
      error: error.message || String(error)
    }));
  };

  return (
    <SpotifyAuthContext.Provider value={{
      ...auth,
      connect,
      disconnect,
      startAuth,
      setAuthError
    }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
};

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);
  if (!context) {
    throw new Error('useSpotifyAuth must be used within a SpotifyAuthProvider');
  }
  return context;
};
