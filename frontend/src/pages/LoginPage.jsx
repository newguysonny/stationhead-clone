// src/pages/LoginPage.jsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CLIENT_ID = "50a01731e3b443d693a613063e476140"; // Replace this with your actual Spotify App client ID
const REDIRECT_URI = window.location.origin;
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state"
];

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(" "))}`;

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get("access_token");
      if (token) {
        localStorage.setItem("spotify_token", token);
        window.location.hash = "";
        // 👇 Redirect to default room after login
        navigate("/room/default", { replace: true }); 
      }
    }
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  return (
    <div style={pageStyle}>
      <h1 style={{ marginBottom: "2rem" }}>Login to Stream with Spotify</h1>
      <button onClick={handleLogin} style={buttonStyle}>
        Login with Spotify
      </button>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#121212",
  color: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const buttonStyle = {
  padding: "1rem 2rem",
  backgroundColor: "#1DB954",
  color: "white",
  border: "none",
  borderRadius: "30px",
  fontSize: "1.2rem",
  cursor: "pointer",
};
