import { useState, useEffect } from 'react';
import SpotifyPlayer from '../components/SpotifyPlayer';

export default function PlayerPage() {
  const [playerReady, setPlayerReady] = useState(false);

  useEffect(() => {
    if (!window.Spotify) {
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.onload = () => setPlayerReady(true);
      document.body.appendChild(script);
    } else {
      setPlayerReady(true);
    }
  }, []);

  if (!playerReady) return <div>Loading player...</div>;

  return <SpotifyPlayer />;
}
