require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createClient } = require("redis");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");

// Initialize Express and HTTP server
const app = express();
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const {
  SPOTIFY_CLIENT_ID: CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: CLIENT_SECRET,
  REDIRECT_URI,
  REDIS_URL,
  PORT = 5000
} = process.env;

// Initialize Redis client for general use
const redisClient = createClient({ url: REDIS_URL });
redisClient.connect()
  .then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis connection error:", err));

// Initialize Redis clients for Socket.IO adapter
const pubClient = createClient({ url: REDIS_URL });
const subClient = createClient({ url: REDIS_URL });

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO Redis adapter initialized");
  });

// Spotify token endpoint
app.post("/auth/token", async (req, res) => {
  const { code } = req.body;

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      params,
      {
        headers: {
          "Authorization": `Basic ${authHeader}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Store tokens in Redis with a short TTL (optional)
    await redisClient.setEx(access_token, 3600, JSON.stringify({ refresh_token }));

    res.json({
      access_token,
      refresh_token,
      expires_in,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`Client ${socket.id} joined room ${room}`);
  });

  socket.on("sync-playback", (data) => {
    socket.to(data.room).emit("sync-playback", data);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
