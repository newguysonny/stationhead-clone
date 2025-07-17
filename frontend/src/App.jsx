import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from "./pages/LoginPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import RoomPage from "./pages/RoomPage";
import StreamingRoom from "./components/StreamingRoom";
/*import './styles/tailwind.output.css';*/
import './App.css'; // The processed version





export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/callback" element={<RoomPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/startroom" element={<CreateRoomPage />} />
        <Route path="/rom" element={<RoomPage />} />
        <Route path="/room/:roomName" element={<StreamingRoomWrapper />} />
      </Routes>
    </BrowserRouter>

     {/* Toast Container - placed outside BrowserRouter but in the same fragment */}
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

