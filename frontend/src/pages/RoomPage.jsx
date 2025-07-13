// pages/RoomPage.jsx
import { useParams } from 'react-router-dom';
import DJView from '../components/Room/DJView';
import ListenerView from '../components/Room/ListenerView';
import SpotifyConnect from '../components/Room/SpotifyConnect';

export default function RoomPage() {
  const { roomId } = useParams();
  const currentUserId = 'user123'; // Assume this comes from a global state/database
  const room = {
    id: roomId,
    host_id: 'dj456', // Assume fetched from database
    is_live: true,
  };

  const [spotifyToken, setSpotifyToken] = useState(null);

  // Check if user is the host
  const isHost = currentUserId === room.host_id;

  return (
    <div>
      {!spotifyToken ? (
        <SpotifyConnect onConnect={setSpotifyToken} /> // Show Spotify button if not connected
      ) : (
        isHost ? <DJView spotifyToken={spotifyToken} /> : <ListenerView />
      )}
    </div>
  );
}
