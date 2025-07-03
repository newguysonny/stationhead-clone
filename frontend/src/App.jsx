import { useState, useEffect } from "react";

export default function App() { const [selectedRoom, setSelectedRoom] = useState(null); const [showModal, setShowModal] = useState(false); const [spotifyConnected, setSpotifyConnected] = useState(false); const [streaming, setStreaming] = useState(false); const [token, setToken] = useState("");

const BACKEND_URL = "https://stationhead-clone-production.up.railway.app"; // Replace with your Railway backend URL

const rooms = [ { id: 1, name: "Afrobeats Party" }, { id: 2, name: "Hip-Hop Session" }, { id: 3, name: "Chill Vibes" }, ];

useEffect(() => { const query = new URLSearchParams(window.location.search); const code = query.get("code");

if (code) {
  fetch(`${BACKEND_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.access_token) {
        window.localStorage.setItem("spotify_token", data.access_token);
        setToken(data.access_token);
        setSpotifyConnected(true);
        window.history.replaceState({}, document.title, "/"); // Clean URL
      }
    })
    .catch((err) => console.error("Token exchange error:", err));
} else {
  const _token = window.localStorage.getItem("spotify_token");
  if (_token) {
    setToken(_token);
    setSpotifyConnected(true);
  }
}

}, []);

const handleConnectSpotify = () => { const CLIENT_ID = "50a01731e3b443d693a613063e476140"; const REDIRECT_URI = window.location.hostname === "localhost" ? "http://localhost:3000" : "https://stationhead-clone.vercel.app"; const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"; const RESPONSE_TYPE = "code"; const SCOPES = "user-read-playback-state user-modify-playback-state streaming";

window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(
  SCOPES
)}`;

};

if (streaming) { return <StreamingRoom room={selectedRoom} />; }

return ( <div style={{ padding: "2rem", color: "white", background: "#121212", minHeight: "100vh" }}> {!selectedRoom ? ( <div> <h1>Available Rooms</h1> <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}> {rooms.map((room) => ( <div key={room.id} style={cardStyle} onClick={() => setSelectedRoom(room)}> {room.name} </div> ))} </div> </div> ) : ( <div> <h2>Room: {selectedRoom.name}</h2> <button onClick={() => setShowModal(true)} style={buttonStyle}> Start Listening </button> </div> )}

{showModal && (
    <SpotifyModal
      spotifyConnected={spotifyConnected}
      onConnect={handleConnectSpotify}
      onStartStreaming={() => {
        setShowModal(false);
        setStreaming(true);
      }}
    />
  )}
</div>

); }

function SpotifyModal({ spotifyConnected, onConnect, onStartStreaming }) { return ( <div style={modalOverlayStyle}> <div style={modalStyle}> <h3>Connect Your Spotify</h3> {!spotifyConnected ? ( <button onClick={onConnect} style={buttonStyle}> Connect Spotify </button> ) : ( <div> <p style={{ color: "lightgreen" }}>✅ Verified</p> <button onClick={onStartStreaming} style={buttonStyle}> Start Streaming </button> </div> )} </div> </div> ); }

function StreamingRoom({ room }) { return ( <div style={{ padding: "2rem", color: "white", background: "#121212", minHeight: "100vh" }}> <h1>Streaming Room: {room.name}</h1> <p>Music is now playing and synced!</p> </div> ); }

const cardStyle = { background: "#282828", padding: "2rem", borderRadius: "0.5rem", cursor: "pointer", textAlign: "center", width: "150px", };

const buttonStyle = { padding: "1rem 2rem", backgroundColor: "#1DB954", color: "white", border: "none", borderRadius: "0.5rem", fontSize: "1rem", cursor: "pointer", };

const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", };

const modalStyle = { background: "#282828", padding: "2rem", borderRadius: "0.5rem", textAlign: "center", };

