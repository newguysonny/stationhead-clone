//components/room/SpotifyConnect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


export default function SpotifyConnect({ isHost, onAuthComplete, onAuthError }) {
  // Generate PKCE code verifier and challenge
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

  const handleConnect = async () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = window.location.origin + '/callback';
    const verifier = generateCodeVerifier(64);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('spotify_verifier', verifier);

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('response_type', 'code');
    params.append('redirect_uri', redirectUri);
    params.append('scope', [
      'streaming',
      'user-read-email',
      ...(isHost ? ['user-modify-playback-state','user-read-playback-state','user-read-currently-playing] : [])
    ].join(' '));
    params.append('code_challenge_method', 'S256');
    params.append('code_challenge', challenge);

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  // Handle callback when component mounts
  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        console.error('Spotify auth error:', error);
        if (onAuthError) onAuthError(error);
        return;
      }

      if (code) {
        try {
          const verifier = localStorage.getItem('spotify_verifier');
          if (!verifier) {
            throw new Error('Missing code verifier');
          }

          const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
          const redirectUri = window.location.origin + '/callback';

          const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              client_id: clientId,
              grant_type: 'authorization_code',
              code,
              redirect_uri: redirectUri,
              code_verifier: verifier
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || 'Token exchange failed');
          }

          const data = await response.json();
          localStorage.removeItem('spotify_verifier'); // Clean up
          onAuthComplete(data.access_token);
          
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        } catch (err) {
          console.error('Token exchange failed:', err);
          if (onAuthError) onAuthError(err.message);
        }
      }
    };

    handleCallback();
  }, [onAuthComplete, onAuthError]);

  return (
    <button
      onClick={handleConnect}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium"
    >
      Connect Spotify
    </button>
  );
}

/*
export default function SpotifyConnect({ onConnect }) {
  const handleConnect = () => {
    // Simulate Spotify connection (replace with real OAuth)
    const fakeToken = 'spotify_fake_token_123';
    onConnect(fakeToken);
  };

  return (
    <button onClick={handleConnect}>
      Connect Spotify to Join Room
    </button>
  );
}
*/
/*
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpotifyConnect({ isHost, onAuthComplete }) {
  const navigate = useNavigate();

  // Scopes needed for both host and listeners
  const getRequiredScopes = () => {
    const baseScopes = ['streaming', 'user-read-email'];
    return isHost 
      ? [...baseScopes, 'user-modify-playback-state', 'playlist-modify-public']
      : baseScopes;
  };

  const handleConnect = () => {
    const authEndpoint = "https://accounts.spotify.com/authorize";
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = encodeURIComponent(`${window.location.origin}/callback`);
    const scopes = encodeURIComponent(getRequiredScopes().join(' '));

    // Store host/listener mode before redirect
    sessionStorage.setItem('spotifyAuthMode', isHost ? 'host' : 'listener');

    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=token&show_dialog=true`;
  };

  // Handle callback if we're returning from Spotify
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    const error = params.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      navigate('/'); // Redirect to safety
      return;
    }

    if (token) {
      const authMode = sessionStorage.getItem('spotifyAuthMode');
      onAuthComplete(token, authMode === 'host');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [navigate, onAuthComplete]);

  return (
    <div className="spotify-connect">
      <button 
        onClick={handleConnect}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full"
      >
        Connect Spotify
      </button>
      <p className="mt-2 text-sm text-gray-400">
        {isHost ? 'Host requires playback control' : 'Listener needs streaming access'}
      </p>
    </div>
  );
}
*/
