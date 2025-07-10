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
const { z } = require('zod'); // For validation



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

//api endpoint for sending room creation data

// Define validation schema
const roomSchema = z.object({
  roomtype: z.string().min(1),
  artistname: z.string().min(1),
  roomname: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  tags: z.array(z.string().max(20)).max(10).optional(),
  issyncenabled: z.boolean().default(false),
  foodpartner: z.string().max(50).optional(),
  privacy: z.enum(['public', 'private', 'unlisted']),
  cohosts: z.array(z.string().uuid()).max(5).optional(),
  enabletips: z.boolean().default(false),
  sponsorroom: z.boolean().default(false),
  themecolor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#000000')
});
/* //this is to test for the Front end validation if any error
const roomSchema = z.object({
  // Basic info
  roomType: z.enum(['fan', 'verified']).default('fan'),
  artistName: z.string()
    .min(1, "Artist name is required")
    .max(50, "Artist name too long")
    .transform(str => str.trim()),
  roomName: z.string()
    .min(1, "Room name is required")
    .max(50, "Room name too long")
    .transform(str => str.trim()),
  description: z.string()
    .max(500, "Description too long")
    .optional()
    .transform(str => str?.trim() || ''),

  // Tags (array of strings)
  tags: z.array(
    z.string()
      .min(1, "Tag cannot be empty")
      .max(20, "Tag too long")
      .transform(str => str.trim().replace(/\s+/g, '-')) // Convert spaces to hyphens
  ).max(10, "Maximum 10 tags allowed"),

  // Settings
  isSyncEnabled: z.boolean().default(true),
  foodPartner: z.string()
    .refine(val => val !== 'none' || val.length > 0, "Select a valid partner")
    .default('none'),
  privacy: z.enum(['public', 'private']).default('public'),

  // User relationships
  coHosts: z.array(
    z.string().email("Invalid email format") // Or use username pattern: /^@[a-z0-9_]{3,20}$/i
  ).max(5, "Maximum 5 co-hosts allowed"),

  // Monetization
  enableTips: z.boolean().default(false),
  sponsorRoom: z.boolean().default(false),

  // Customization
  themeColor: z.enum(['blue', 'red', 'green', 'purple'])
    .default('blue')
    .transform(color => {
      // Map to hex values if needed
      const colors = { blue: '#3b82f6', red: '#ef4444', green: '#10b981', purple: '#8b5cf6' };
      return colors[color as keyof typeof colors];
    }),

  // System fields (optional)
  createdAt: z.date().default(() => new Date())
}).strict(); // Prevents unknown properties
*/

app.post('/submit', async (req, res) => {
  try {
    // 1. Validate input
    const validatedData = roomSchema.parse(req.body);
    
    // 2. Sanitize data (example: trim strings)
    const sanitizedData = {
      ...validatedData,
      artistName: validatedData.artistName.trim(),
      roomName: validatedData.roomName.trim()
    };

    // 3. Insert with RLS (Row Level Security) considerations
    const { data, error } = await supabase
      .from('rooms')
      .insert([sanitizedData])
      .select(); // Returns the inserted record

    if (error) throw error;

    // 4. Success response
    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Room created successfully'
    });

  } catch (error) {
    // Handle different error types
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.errors,
        message: 'Validation failed'
      });
    }

    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

// api callback endpoint for Spotify room connection
app.get("/callback", (req, res) => {
  const code = req.query.code;
  return res.redirect(`https://stationhead-clone.vercel.app/login?code=${code}`);
});

//api endpoint callback for Spotify login

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
