import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import StreamingRoom from "./components/StreamingRoom";
import './styles/tailwind.output.css';
import './App.min.css'; // The processed version



export default function App() {
  return (
    <div className="bg-blue-100 p-8">
      <h1 className="text-3xl font-bold text-blue-800">
        Tailwind Test (blue)
      </h1>
      <div className="custom-red">
        Custom CSS Test (should be red)
      </div>
    </div>
  )
}

/*
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

// This wrapper helps extract rooms name from the URL
import { useParams } from "react-router-dom";

function StreamingRoomWrapper() {
  const { name } = useParams();
  return <StreamingRoom room={{ name }} />;
}
*/
