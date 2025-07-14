//pages/RoomPage.jsx
/*
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DjView from '../components/room/DjView';
import ListenerView from '../components/room/ListenerView';
import SpotifyConnect from '../components/room/SpotifyConnect';

export default function RoomPage() {
  const { roomId } = useParams();
  const currentUserId = 'dj456'; //'user123'; Assume this comes from a global state/database
  const room = {
    id: roomId,
    host_id: 'dj456', // Assume fetched from database
    is_live: true,
  };
  console.log("Room data:", room); // Check browser consoles
  console.log("Current user ID:", currentUserId);
  
  const [spotifyToken, setSpotifyToken] = useState(null);

  // Check if user is the host
  const isHost = currentUserId === room.host_id;

  return (
    <div>
      {!spotifyToken ? (
        <SpotifyConnect onConnect={setSpotifyToken} /> // Show Spotify button if not connected
      ) : (
        isHost ? <DjView spotifyToken={spotifyToken} /> : <ListenerView />
      )}
    </div>
  );
}
*/

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import DjView from '../components/room/DjView';
import ListenerView from '../components/room/ListenerView';
import SpotifyConnect from '../components/room/SpotifyConnect';

export default function RoomPage() {
  const { roomId } = useParams();
  
  // Mock data - replace with real API calls
  const [room, setRoom] = useState({ 
    id: roomId, 
    host_id: 'dj456',  // From database
    is_live: true 
  });
  const currentUserId = 'dj456'; // From auth context
  
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Check if current user is the host
  const isHost = currentUserId === room.host_id;

  const handleAuthError = (error) => {
    setAuthError(`Spotify connection failed: ${error}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!spotifyToken ? (
        <div className="p-4">
          {/* Show header only during auth phase */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h1 className="text-xl font-bold">Room: {roomId}</h1>
            <p className="text-gray-600">
              {isHost ? 'You are the host' : 'You are a listener'}
            </p>
          </div>
    /*
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Room Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h1 className="text-xl font-bold">Room: {roomId}</h1>
        <p className="text-gray-600">
          {isHost ? 'You are the host' : 'You are a listener'}
        </p>
      </div> */

      {/* Auth Status */}
      {authError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {authError}
        </div>
      )}

      {/* Main Content */}
      {!spotifyToken ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <SpotifyConnect 
            isHost={isHost} 
            onAuthComplete={setSpotifyToken} 
            onAuthError={handleAuthError} 
          />
        </div>
      ) : isHost ? (
        <DjView spotifyToken={spotifyToken} />
      ) : (
        <ListenerView spotifyToken={spotifyToken} />
      )}
    </div>
  );
}
