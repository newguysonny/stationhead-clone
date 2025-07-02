import { useEffect, useState } from 'react';
import './App.css';

const SPOTIFY_CLIENT_ID = '50a01731e3b443d693a613063e476140'; // Replace this with your actual Spotify Client  ID
const REDIRECT_URI = 'https://stationhead-clone.vercel.app'; // Replace with your deployed Vercel URL
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

export default function App() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const hash = window.location.hash;
    let tokenFromStorage = window.localStorage.getItem('spotify_token');

    if (!tokenFromStorage && hash) {
      const urlParams = new URLSearchParams(hash.replace('#', '?'));
      tokenFromStorage = urlParams.get('access_token');
      window.localStorage.setItem('spotify_token', tokenFromStorage);
      window.location.hash = '';
    }

    setToken(tokenFromStorage);
  }, []);

  const logout = () => {
    setToken('');
    window.localStorage.removeItem('spotify_token');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'black',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Stationhead Clone</h1>

      {!token ? (
        <a
          href={`${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-read-playback-state user-modify-playback-state streaming`}
          style={{
            backgroundColor: '#1DB954',
            padding: '0.75rem 1.5rem',
            borderRadius: '9999px',
            color: 'white',
            textDecoration: 'none'
          }}
        >
          Login with Spotify
        </a>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p>Logged in with Spotify!</p>
          <button
            onClick={logout}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              backgroundColor: '#ff4d4d',
              color: 'white',
              border: 'none'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
