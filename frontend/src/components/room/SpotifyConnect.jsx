// components/room/SpotifyConnect.jsx
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
