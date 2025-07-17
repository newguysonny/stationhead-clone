//src/contexts/SpotifyAuthContext.js
// src/contexts/SpotifyAuthContext.js
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SpotifyAuthContext = createContext();

export const SpotifyAuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('spotify_token');
    return {
      isConnected: !!token,
      token: token || null,
      status: 'idle', // 'idle' | 'loading' | 'connected' | 'error'
      error: null,
      isHost: false
    };
  });

  const navigate = useNavigate();

  // PKCE Functions (identical to SpotifyConnect.jsx)
  const generateCodeVerifier = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((byte) => possible[byte % possible.length])
      .join('');
  };

  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  // Auth initialization (replaces handleConnect)
  const startAuth = useCallback(async (isHost = false) => {
    try {
      setAuth(prev => ({ ...prev, status: 'loading', isHost }));
      
      const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
      const redirectUri = window.location.origin + '/callback';
      const verifier = generateCodeVerifier(64);
      const challenge = await generateCodeChallenge(verifier);

      localStorage.setItem('spotify_verifier', verifier);

      const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: [
          'streaming',
          'user-read-email',
          ...(isHost ? [
            'user-modify-playback-state',
            'user-read-playback-state',
            'user-read-currently-playing'
          ] : [])
        ].join(' '),
        code_challenge_method: 'S256',
        code_challenge: challenge
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (err) {
      setAuth(prev => ({ ...prev, status: 'error', error: err.message }));
    }
  }, []);

  // Token handling (replaces handleCallback)
  const handleTokenExchange = useCallback(async (code) => {
    try {
      const verifier = localStorage.getItem('spotify_verifier');
      if (!verifier) throw new Error('Missing verifier');

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
          grant_type: 'authorization_code',
          code,
          redirect_uri: window.location.origin + '/callback',
          code_verifier: verifier
        })
      });

      const data = await response.json();
      if (!data.access_token) throw new Error('No access token received');

      localStorage.setItem('spotify_token', data.access_token);
      localStorage.removeItem('spotify_verifier');
      
      setAuth({
        isConnected: true,
        token: data.access_token,
        status: 'connected',
        error: null,
        isHost: auth.isHost
      });

      return true;
    } catch (err) {
      setAuth(prev => ({ ...prev, status: 'error', error: err.message }));
      return false;
    }
  }, [auth.isHost]);

  // Auto-handle callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setAuth(prev => ({ ...prev, status: 'error', error }));
      navigate(window.location.pathname); // Clean URL
      return;
    }

    if (code) {
      (async () => {
        const success = await handleTokenExchange(code);
        navigate(success ? '/room' : '/?error=auth_failed');
        window.history.replaceState({}, '', window.location.pathname);
      })();
    }
  }, [handleTokenExchange, navigate]);

  const disconnect = useCallback(() => {
    localStorage.removeItem('spotify_token');
    setAuth({
      isConnected: false,
      token: null,
      status: 'idle',
      error: null,
      isHost: false
    });
  }, []);

  return (
    <SpotifyAuthContext.Provider value={{
      ...auth,
      startAuth,
      disconnect,
      handleTokenExchange // Optional: expose for manual handling
    }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
};

export const useSpotifyAuth = () => {
  const context = useContext(SpotifyAuthContext);
  if (!context) {
    throw new Error('useSpotifyAuth must be used within SpotifyAuthProvider');
  }
  return context;
};
