// In your main routing file (e.g., App.jsx)
import { Routes, Route, Navigate } from 'react-router-dom';
import SpotifyAuth from './pages/SpotifyAuth';
import PlayerPage from './pages/PlayerPage';

function App() {
  const token = localStorage.getItem('spotify_token');

  return (
    <Routes>
      <Route path="/auth" element={<SpotifyAuth />} />
      <Route 
        path="/player" 
        element={token ? <PlayerPage /> : <Navigate to="/auth" />} 
      />
      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}

/*
import { useEffect, useState } from "react";
import io from "socket.io-client";


// Replace your SOCKET_URL with:
const SOCKET_URL = window.location.protocol === 'https:' 
  ? "https://stationhead-clone-production.up.railway.app" 
  : "http://stationhead-clone-production.up.railway.app";

let socket;

export default function StreamingRoom({ room }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [playbackData, setPlaybackData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");

  useEffect(() => {
    socket = io(SOCKET_URL, {
    reconnectionAttempts: 5,
    timeout: 10000,
  });

    socket.on("connect", () => {
      console.log("Connected to socket.io:", socket.id);
      socket.emit("join-room", room.name);
    });
  
  //test error only
  
   socket.on("connect_error", (err) => {
    console.error("Connection error:", err);
  });
 
    socket.on("sync-playback", (data) => {
      console.log("Received playback sync:", data);
      setPlaybackData(data);
      if (player && data.track) {
        playTrack(data.track, data.position);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [room, player]);

  useEffect(() => {
    if (token && window.Spotify) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }
  }, [token]);

  const initializePlayer = () => {
    const _player = new window.Spotify.Player({
      name: "Stationhead Clone Player",
      getOAuthToken: (cb) => cb(token),
      volume: 0.8,
    });

    _player.addListener("ready", ({ device_id }) => {
      console.log("Player ready with device ID:", device_id);
      setDeviceId(device_id);
      setPlayer(_player);
    });

    _player.addListener("initialization_error", ({ message }) => console.error(message));
    _player.addListener("authentication_error", ({ message }) => console.error(message));
    _player.addListener("account_error", ({ message }) => console.error(message));
    _player.addListener("playback_error", ({ message }) => console.error(message));

    _player.connect();
  };

  const sendPlaybackSync = () => {
    const data = {
      room: room.name,
      track: "spotify:track:YOUR_TRACK_URI",
      position: 0,
      isPlaying: true,
    };
    socket.emit("sync-playback", data);
  };

  const playTrack = (trackUri, positionMs) => {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uris: [trackUri],
        position_ms: positionMs * 1000 || 0,
      }),
    })
      .then((res) => {
        if (res.status === 204) {
          console.log("Track playing");
        } else {
          console.error("Failed to play track", res.status);
        }
      })
      .catch(console.error);
  };

  return (
    <div style={{ padding: "2rem", color: "white", background: "#121212", minHeight: "100vh" }}>
      <h1>Streaming Room: {room.name}</h1>
      <p>Music is now playing and synced!</p>

      {playbackData && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>Track:</strong> {playbackData.track}</p>
          <p><strong>Position:</strong> {playbackData.position}s</p>
          <p><strong>Playing:</strong> {playbackData.isPlaying ? "Yes" : "No"}</p>
        </div>
      )}

      <button style={buttonStyle} onClick={sendPlaybackSync}>
        Simulate Playback Sync
      </button>
    </div>
  );
}

const buttonStyle = {
  padding: "1rem 2rem",
  backgroundColor: "#1DB954",
  color: "white",
  border: "none",
  borderRadius: "0.5rem",
  fontSize: "1rem",
  cursor: "pointer",
};
*/
