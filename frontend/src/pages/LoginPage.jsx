// src/pages/LoginPage.jsx
/*
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
*/

// src/pages/Login.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CLIENT_ID = "50a01731e3b443d693a613063e476140";
const REDIRECT_URI = "https://stationhead-clone-production.up.railway.app/callback";
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-read-playback-state",
  "user-modify-playback-state",
];

const AUTH_URL = `https://accounts.spotify.com/authorize?` +
  new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
  });

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Exchange code for access token
      axios
        .post("https://stationhead-clone-production.up.railway.app/auth/token", { code })
        .then((res) => {
          const { access_token } = res.data;
          localStorage.setItem("spotify_token", access_token);
          navigate("/room/default"); // or wherever your StreamingRoom route is
        })
        .catch((err) => {
          console.error("Failed to get token:", err);
        });
    }
  }, [navigate]);

  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Login with Spotify</h1>
      <button onClick={handleLogin} style={buttonStyle}>
        Connect to Spotify
      </button>
    </div>
  );
}

const buttonStyle = {
  padding: "1rem 2rem",
  backgroundColor: "#1DB954",
  color: "white",
  fontSize: "1.2rem",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
