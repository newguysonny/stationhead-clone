import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import StreamingRoom from "./components/StreamingRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/startroom" element={<CreateRoomPage />} />
        <Route path="/room/:name" element={<StreamingRoomWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

// This wrapper helps extract room name from the URL
import { useParams } from "react-router-dom";

function StreamingRoomWrapper() {
  const { name } = useParams();
  return <StreamingRoom room={{ name }} />;
}
