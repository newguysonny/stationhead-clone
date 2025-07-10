// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { createClient } = require("redis");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient: createSuperbaseClient } = require("@supabase/supabase-js");




const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:[
  "https://stationhead-clone.vercel.app",
  "stationhead-clone-git-main-newguysonnys-projects.vercel.app", //temp url
  "https://*-newguysonnys-projects.vercel.app", // All branch deployments
  "http://localhost:3000"
],
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());


const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REDIS_URL = process.env.REDIS_URL;

// Initialize Supabase
const supabase = createSuperbaseClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize Redis client for general use
const redisClient = createClient({ url: REDIS_URL });
redisClient.connect().then(() => console.log("Connected to Redis"))
  .catch((err) => console.error("Redis connection error:", err));

// Initialize Redis clients for socket.io adapter
const pubClient = createClient({ url: REDIS_URL });
const subClient = createClient({ url: REDIS_URL });
Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("Socket.IO Redis adapter initialized");
});

//Database connection
// Test DB connection
async function testConnection() {
  const { data, error } = await supabase
    .from('your_table_name') // Replace this with your actual table name
    .select('*')
    .limit(1);

  if (error) {
    console.error('❌ Supabase connection failed:', error.message);
  } else {
    console.log('✅ Supabase connected. Sample data:', data);
  }
}
testConnection();
// database connection ends here

app.get("/callback", (req, res) => {
  const code = req.query.code;
  return res.redirect(`https://stationhead-clone.vercel.app/login?code=${code}`);
});

app.post("/auth/token", async (req, res) => {
  const code = req.body.code;

  try {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", REDIRECT_URI);

    const authHeader = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const response = await axios.post("https://accounts.spotify.com/api/token", params, {
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    // Store tokens in Redis with a short TTL (optional)
    await redisClient.setEx(accessToken, 3600, JSON.stringify({ refreshToken }));

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: response.data.expires_in,
    });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to exchange code for token" });
  }
});

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

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
