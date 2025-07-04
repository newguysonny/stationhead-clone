/*
export default function Test() {
  return (
    <div style={{padding: '20px', background: 'black', color: 'white'}}>
      <h1>Basic Test</h1>
      <p>If you see this, React is working</p>
    </div>
  );
}
*/

// src/Test.jsx
import { useEffect } from 'react';
import io from 'socket.io-client';

export default function Test() {
  useEffect(() => {
    const socket = io("https://stationhead-clone-production.up.railway.app", {
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log("✅ Connected! Socket ID:", socket.id);
      document.body.style.backgroundColor = "#121212";
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection failed:", err);
      document.body.style.backgroundColor = "darkred";
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>Socket.IO Connection Test</h1>
      <p>Check browser console (F12) for real-time connection status</p>
      <p>Background will turn dark if connected, red if failed</p>
    </div>
  );
}
