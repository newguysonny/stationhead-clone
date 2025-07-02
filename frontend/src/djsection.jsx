import { useState } from 'react';

export default function DJSection() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);

  const token = window.localStorage.getItem('spotify_token');

  const handleSearch = () => {
    if (!search || !token) return;

    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(search)}&type=track&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.tracks && data.tracks.items) {
          setResults(data.tracks.items);
        } else {
          setResults([]);
        }
      })
      .catch(err => {
        console.error("Search error:", err);
        setResults([]);
      });
  };

  const playTrack = (track) => {
    console.log("Playing:", track.name);
    setCurrentTrack({
      name: track.name,
      artist: track.artists[0].name,
      albumArt: track.album.images[0]?.url,
      uri: track.uri
    });

    // TODO: Send WebSocket event to backend here to sync listeners
  };

  return (
    <div style={{ padding: '2rem', color: 'white', background: '#121212', minHeight: '100vh' }}>
      <h2>DJ Room - BurnaRoom</h2>
      <p>Listeners: 5</p>

      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Search Spotify..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', width: '60%' }}
        />
        <button onClick={handleSearch} style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}>
          Search
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Search Results:</h3>
        {results.length === 0 ? <p>No results</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {results.map((track) => (
              <li key={track.id} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                <img src={track.album.images[2]?.url} alt="Album" style={{ width: '50px', marginRight: '1rem' }} />
                <div style={{ flexGrow: 1 }}>
                  {track.name} - {track.artists[0].name}
                </div>
                <button onClick={() => playTrack(track)} style={{ marginLeft: '1rem' }}>
                  Play
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {currentTrack && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#282828', borderRadius: '0.5rem' }}>
          <h4>Now Playing:</h4>
          <p>{currentTrack.name} - {currentTrack.artist}</p>
          {currentTrack.albumArt && (
            <img src={currentTrack.albumArt} alt="Album Art" style={{ width: '100px', marginTop: '1rem' }} />
          )}
        </div>
      )}
    </div>
  );
}
