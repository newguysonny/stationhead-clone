// src/pages/LoginPage.jsx

import { useEffect } from "react";

const CLIENT_ID = "50a01731e3b443d693a613063e476140"; // Replace this with your real Spotify Client ID
const REDIRECT_URI = window.location.origin; // Handles local and Vercel URLs
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state"
];

const AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(" "))}`;

export default function LoginPage() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get("access_token");
      if (token) {
        localStorage.setItem("spotify_token", token);
        window.location.hash = ""; // Clean up the URL
        window.location.reload();  // Reload app with token set
      }
    }
  }, []);

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
