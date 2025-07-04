import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SpotifyAuth() {
  const navigate = useNavigate();
  const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
  const SCOPE = 'streaming user-read-playback-state user-modify-playback-state';

  useEffect(() => {
    // Check if we're returning from Spotify auth
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Exchange code for token (you'll need your backend endpoint)
      exchangeCodeForToken(code).then(() => {
        navigate('/player'); // Redirect to player after auth
      });
    }
  }, []);

  const handleLogin = () => {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}`;
    window.location.href = authUrl;
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Connect to Spotify</h1>
      <button 
        onClick={handleLogin}
        style={{ padding: '1rem 2rem', background: '#1DB954', color: 'white', border: 'none', borderRadius: '50px', fontSize: '1.2rem' }}
      >
        Login with Spotify
      </button>
    </div>
  );
}

async function exchangeCodeForToken(code) {
  try {
    const response = await fetch('https://stationhead-clone-production.up.railway.app/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const { access_token, refresh_token } = await response.json();
    localStorage.setItem('spotify_token', access_token);
  } catch (err) {
    console.error('Token exchange failed:', err);
  }
}
