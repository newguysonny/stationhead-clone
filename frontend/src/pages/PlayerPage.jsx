// src/pages/PlayerPage.jsx
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export default function PlayerPage() {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const token = localStorage.getItem('spotify_token');

  // 1. Load Spotify Web Playback SDK
  useEffect(() => {
    if (window.Spotify) {
      initPlayer();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    
    script.onload = () => {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 2. Initialize Spotify Player
  const initPlayer = () => {
    const newPlayer = new window.Spotify.Player({
      name: 'My Spotify Player',
      getOAuthToken: cb => cb(token),
      volume: 0.5
    });

    newPlayer.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
      setDeviceId(device_id);
    });

    newPlayer.addListener('initialization_error', ({ message }) => {
      console.error('Init Error:', message);
    });

    newPlayer.connect();
    setPlayer(newPlayer);

    return () => newPlayer.disconnect();
  };

  // 3. Connect to Socket.IO
  useEffect(() => {
    if (!deviceId) return;

    const socket = io('https://stationhead-clone-production.up.railway.app');
    
    socket.on('connect', () => {
      console.log('Socket connected!');
    });

    return () => socket.disconnect();
  }, [deviceId]);

  if (!player) {
    return (
      <div style={{ padding: '2rem', color: 'white', background: '#121212' }}>
        <h2>Loading Spotify Player...</h2>
        <p>Please wait while we connect to Spotify</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', color: 'white', background: '#121212' }}>
      <h1>Now Playing</h1>
      <p>Device ID: {deviceId}</p>
      <button 
        onClick={() => {
          // Example: Play a track
          fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              uris: ['spotify:track:11dFghVXANMlKmJXsNCbNl'] // Example track
            })
          });
        }}
        style={{
          padding: '1rem',
          background: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        Play Sample Track
      </button>
    </div>
  );
}
