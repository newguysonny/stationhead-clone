/*
import { useEffect, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = window.location.protocol === 'https:' 
  ? "https://stationhead-clone-production.up.railway.app" 
  : "http://stationhead-clone-production.up.railway.app";

let socket;

export default function StreamingRoom({ room }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [playbackData, setPlaybackData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");

  // ⏯️ Connect to Socket.IO room and handle sync
  useEffect(() => {
    socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("Connected to socket.io:", socket.id);
      socket.emit("join-room", room?.name);
    });

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
  }, [room?.name, player]);

  // 🎧 Load Spotify Web Playback SDK
  useEffect(() => {
    const initializePlayer = () => {
      const _player = new window.Spotify.Player({
        name: "Stationhead Clone Player",
        getOAuthToken: cb => cb(token),
        volume: 0.8,
      });

      _player.addListener("ready", ({ device_id }) => {
        console.log("Player ready:", device_id);
        setDeviceId(device_id);
        setPlayer(_player);
      });

      _player.addListener("initialization_error", ({ message }) => console.error(message));
      _player.addListener("authentication_error", ({ message }) => console.error(message));
      _player.addListener("account_error", ({ message }) => console.error(message));
      _player.addListener("playback_error", ({ message }) => console.error(message));

      _player.connect();
      _player.setVolume(1.0).then(() => {
  console.log("Volume set to 100%");
});
    };

    if (window.Spotify && token) {
      initializePlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }
  }, [token]);

  
if (!token) {
  return <Navigate to="/login" />;
}

  // 🔁 Manually sync playback to server
  const sendPlaybackSync = () => {
    const data = {
      room: room?.name,
      //track: "spotify:track:YOUR_TRACK_URI", // Replace with real track 
      track: "spotify:track:7ouMYWpwJ422jRcDASZB7P", // Example: Bruno Mars – 24K Magic
      position: 0,
      isPlaying: true,
    };
    socket.emit("sync-playback", data);
  };

  // ▶️ Play track on Spotify
  const playTrack = (trackUri, positionMs) => {
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
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
      <h1>Streaming Room: {room?.name || "Loading..."}</h1>
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
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Navigate } from "react-router-dom";

const SOCKET_URL = window.location.protocol === 'https:' 
  ? "https://stationhead-clone-production.up.railway.app" 
  : "http://stationhead-clone-production.up.railway.app";

let socket;

export default function StreamingRoom({ room }) {
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState("");
  const [playbackData, setPlaybackData] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("spotify_token") || "");
  const [sdkReady, setSdkReady] = useState(false);

  // Load Spotify Web Playback SDK script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize player once SDK is ready
  useEffect(() => {
    if (!token || !window.Spotify) return;

    const initializePlayer = () => {
      const _player = new window.Spotify.Player({
        name: "Stationhead Clone Player",
        getOAuthToken: cb => cb(token),
        volume: 0.8,
      });

      _player.addListener("ready", ({ device_id }) => {
        console.log("Player ready:", device_id);
        setDeviceId(device_id);
        setPlayer(_player);
      });

      _player.addListener("initialization_error", ({ message }) => console.error(message));
      _player.addListener("authentication_error", ({ message }) => console.error(message));
      _player.addListener("account_error", ({ message }) => console.error(message));
      _player.addListener("playback_error", ({ message }) => console.error(message));

      _player.connect().then(success => {
        if (success) {
          console.log("Connected to Spotify player");
          _player.setVolume(1.0).then(() => {
            console.log("Volume set to 100%");
          });
        }
      });
    };

    // Check if SDK is loaded every 500ms until ready
    const checkSdkInterval = setInterval(() => {
      if (window.Spotify) {
        clearInterval(checkSdkInterval);
        initializePlayer();
      }
    }, 500);

    return () => clearInterval(checkSdkInterval);
  }, [token]);

  // Socket.IO connection and sync handling
  useEffect(() => {
    if (!room?.name) return;

    socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("Connected to socket.io:", socket.id);
      socket.emit("join-room", room.name);
    });

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
  }, [room?.name, player]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  const sendPlaybackSync = () => {
    const data = {
      room: room?.name,
      track: "spotify:track:7ouMYWpwJ422jRcDASZB7P",
      position: 0,
      isPlaying: true,
    };
    socket.emit("sync-playback", data);
  };

  const playTrack = (trackUri, positionMs) => {
    if (!deviceId) return;

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
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
      <h1>Streaming Room: {room?.name || "Loading..."}</h1>
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
