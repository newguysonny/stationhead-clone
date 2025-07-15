export default function DJView({ spotifyToken }) {
  return (
    <div>
      <h1>DJ Controls</h1>
      <p>Spotify Connected: {spotifyToken ? '✅' : '❌'}</p>
      <button>Play/Pause</button>
    </div>
  );
}
