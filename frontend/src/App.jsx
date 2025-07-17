import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from "./pages/LoginPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import RoomPage from "./pages/RoomPage";
import StreamingRoom from "./components/StreamingRoom";
/*import './styles/tailwind.output.css';*/
import './App.css'; // The processed version
// src/contexts/SpotifyAuthContext.js
import { initiateSpotifyAuth } from '../components/SpotifyConnect';



export default function App() {
  const [authState, setAuthState] = useState({
    isConnected: false,
    token: null
  });
  const connect = () => {
    // Your auth logic (or import from SpotifyConnect.jsx)
  };
  
  return (
    <>
    <BrowserRouter>
        <SpotifyAuthContext.Provider 
        value={{
          ...authState,
          connect,
          disconnect: () => setAuthState({ isConnected: false, token: null })
        }}
      >
      <Routes>
        <Route path="/callback" element={<RoomPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/startroom" element={<CreateRoomPage />} />
        <Route path="/rom" element={<RoomPage />} />
        <Route path="/room/:roomName" element={<StreamingRoomWrapper />} />
      </Routes>
     </SpotifyAuthContext.Provider>
    </BrowserRouter>

        
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
    
  );
}

// This wrapper helps extract rooms name from the URL
import { useParams } from "react-router-dom";

function StreamingRoomWrapper() {
  const { name } = useParams();
  return <StreamingRoom room={{ name }} />;
}

