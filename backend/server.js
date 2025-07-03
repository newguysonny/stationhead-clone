 require("dotenv").config(); const express = require("express"); const cors = require("cors"); const axios = require("axios");

const app = express(); app.use(cors()); app.use(express.json());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID; const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET; const REDIRECT_URI = process.env.REDIRECT_URI;

app.post("/auth/token", async (req, res) => { const code = req.body.code;

try { const params = new URLSearchParams(); params.append("grant_type", "authorization_code"); params.append("code", code); params.append("redirect_uri", REDIRECT_URI);

const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const response = await axios.post("https://accounts.spotify.com/api/token", params, {
  headers: {
    "Authorization": `Basic ${authHeader}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
});

res.json({
  access_token: response.data.access_token,
  refresh_token: response.data.refresh_token,
  expires_in: response.data.expires_in,
});

} catch (err) { console.error(err.response?.data || err.message); res.status(500).json({ error: "Failed to exchange code for token" }); } });

const PORT = process.env.PORT || 5000; app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
