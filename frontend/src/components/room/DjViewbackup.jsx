import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FiPlus, FiX, FiSearch, FiPlay, FiPause, FiSkipForward, FiMusic, 
  FiHeart, FiShare2, FiMessageSquare, FiMenu, FiShoppingCart, FiUser
} from 'react-icons/fi';
import { debounce } from '../../utils/debounce';
import { msToMinutes } from '../../utils/time';

const DjView = ({ spotifyToken }) => {
  // State
  const [playlist, setPlaylist] = useState([
    {
      id: '1',
      name: 'Calm Down',
      artist: 'Rema',
      duration: '3:15',
      albumArt: 'https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228',
      isPlaying: true
    },
    {
      id: '2',
      name: 'Butter',
      artist: 'BTS',
      duration: '2:42',
      albumArt: 'https://i.scdn.co/image/ab67616d00001e02a935e8e2a8c33b2a7b3b8a9f',
      isPlaying: false
    }
  ]);

  // Inside your component

const [searchOffset, setSearchOffset] = useState(0); // For pagination
const searchCache = useRef({}); // Simple cache
  const [openModal, setOpenModal] = useState(null); // 'dj-control' | 'search' | null
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('playlist');
  const [isConnected, setIsConnected] = useState(false);
  const [likes, setLikes] = useState(1200);
  const [listeners, setListeners] = useState(24);
  const [plays, setPlays] = useState(5800);
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, user: 'MusicLover42', text: 'These tacos go hard with this beat!', icon: '👤' },
    { id: 2, user: 'FoodieDJ', text: 'Try the new spicy mayo dip!', icon: '🦄' },
    { id: 3, user: 'KpopStan99', text: 'OMG this remix 🔥', icon: '👒' }
  ]);

  const chatEndRef = useRef(null);
  const currentSong = useMemo(() => playlist.find(track => track.isPlaying) || playlist[0], [playlist]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Spotify search
  const handleSearch = async (query) => {

// Debounced search to avoid rate limits
const debouncedSearch = useMemo(
     () => debounce(handleSearch, 300),
     [handleSearch]  // Add dependency
   );
    
// Trigger search on query change (e.g., from input field)
const handleQueryChange = (query) => {
  setSearchQuery(query);
  if (query.trim() === '') {
    setSearchResults([]);
    return;
  }
  debouncedSearch(query);
};

// Main search function
const handleSearch = async (query, offset = 0) => {
  const cacheKey = `${query}-${offset}`;
  
  // Return cached results if available
  if (searchCache.current[cacheKey]) {
    setSearchResults(prev => offset === 0 
      ? searchCache.current[cacheKey] 
      : [...prev, ...searchCache.current[cacheKey]]
    );
    return;
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album,playlist&limit=10&offset=${offset}`,
      {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      }
    );

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();
    const formattedResults = formatSpotifyResults(data); // Extracted for clarity

    // Cache results
    searchCache.current[cacheKey] = formattedResults;

    setSearchResults(prev => 
      offset === 0 ? formattedResults : [...prev, ...formattedResults]
    );
  } catch (error) {
    console.error('Search failed:', error);
    setNotification(error.message || 'Search failed');
  }
};

// Format Spotify API response consistently
const formatSpotifyResults = (data) => {
  return [
    ...(data.tracks?.items.map(track => ({
      type: 'track',
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      duration: msToMinutes(track.duration_ms),
      albumArt: track.album.images[0]?.url,
      uri: track.uri
    })) || []),
    
    ...(data.albums?.items.map(album => ({
      type: 'album',
      id: album.id,
      name: album.name,
      artist: album.artists.map(a => a.name).join(', '),
      albumArt: album.images[0]?.url,
      uri: album.uri,
      release_date: album.release_date,
      total_tracks: album.total_tracks
    })) || []),

    ...(data.playlists?.items.map(playlist => ({
      type: 'playlist',
      id: playlist.id,
      name: playlist.name,
      artist: playlist.owner.display_name,
      albumArt: playlist.images[0]?.url,
      uri: playlist.uri,
      total_tracks: playlist.tracks.total
    })) || [])
  ];
};

// Load more results (attach to "Load More" button)
const loadMoreResults = () => {
  const newOffset = searchOffset + 10;
  setSearchOffset(newOffset);
  handleSearch(searchQuery, newOffset);
};

  // adding track to playlist after search
  const handleAddToPlaylist = async (item) => {
  // Handle single track addition
  if (item.type === 'track') {
    if (playlist.some(t => t.id === item.id)) {
      setNotification(`${item.name} is already in the playlist`);
      return;
    }
    setPlaylist([...playlist, { ...item, isPlaying: false }]);
    setNotification(`${item.name} added to queue`);
    return;
  }

  // Handle albums/playlists
  if (item.type === 'album' || item.type === 'playlist') {
    try {
      const endpoint = item.type === 'album' 
        ? `https://api.spotify.com/v1/albums/${item.id}/tracks`
        : `https://api.spotify.com/v1/playlists/${item.id}/tracks`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      const data = await response.json();

      // Filter out duplicates before adding
      const tracksToAdd = data.items
        .map(track => ({
          type: 'track',
          id: track.id,
          name: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          duration: msToMinutes(track.duration_ms),
          albumArt: item.albumArt,
          uri: track.uri,
          isPlaying: false
        }))
        .filter(track => !playlist.some(t => t.id === track.id)); // Skip duplicates

      if (tracksToAdd.length === 0) {
        setNotification(`All tracks from ${item.name} are already in the playlist`);
        return;
      }

      setPlaylist([...playlist, ...tracksToAdd]);
      setNotification(`Added ${tracksToAdd.length} songs from ${item.name}`);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      setNotification('Failed to add album/playlist');
    }
  }
};
    
  // toggle track
   const togglePlay = (id) => {
  const targetTrack = playlist.find(track => track.id === id);
  if (!targetTrack) return; // Guard clause

  setPlaylist(playlist.map(track => ({
    ...track,
    isPlaying: track.id === id 
      ? !targetTrack.isPlaying // Toggle clicked track
      : false                  // Pause others
  })));
};
    // remove playlist track
   const removeFromPlaylist = (index) => {
      if (index < 0 || index >= playlist.length) return;
     const wasPlaying = playlist[index].isPlaying;
     const newPlaylist = playlist.filter((_, i) => i !== index);
     
     setPlaylist(wasPlaying && newPlaylist.length > 0 
       ? newPlaylist.map((track, i) => ({
           ...track,
           isPlaying: i === 0 // Play first track if removed track was playing
         }))
       : newPlaylist
     );
   };
    
  // Chat actions
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, { id: messages.length + 1, user: 'You', text: message, icon: '😊' }]);
      setMessage('');
    }
  };

  // Player Controls Component (Only used in modals)
  const PlayerControls = () => (
    <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={currentSong?.albumArt} 
            alt="Now Playing" 
            className="w-10 h-10 rounded-md"
          />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{currentSong?.name || 'No track'}</p>
            <p className="text-xs text-gray-400 truncate">{currentSong?.artist || 'Select track'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <FiSkipForward className="transform rotate-180" size={18} />
          </button>
          <button 
            onClick={() => currentSong && togglePlay(currentSong.id)}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full"
          >
            {currentSong?.isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-full">
            <FiSkipForward size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-purple-600 to-blue-500 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FiMusic /> Vinyl & Veggie Night
        </h1>
        <button 
          onClick={() => setOpenModal('dj-control')}
          className="p-2 rounded-full hover:bg-purple-700 transition-all"
          aria-label="Open DJ controls"
        >
          <FiMenu size={20} />
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-screen">
        {/* Desktop: Playlist Column (30%) */}
        <div className="hidden lg:flex lg:w-1/3 bg-gray-800 flex-col border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-xl font-bold">Playlist</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {playlist.map((track, index) => (
              <div key={track.id} className={`flex items-center p-3 ${track.isPlaying ? 'bg-purple-900/50' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
                <img src={track.albumArt} alt={track.name} className="w-12 h-12 rounded-md mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.name}</p>
                  <p className="text-sm text-gray-400 truncate">{track.artist} • {track.duration}</p>
                </div>
                <div className="flex gap-3 ml-4">
                  <button 
                    onClick={() => togglePlay(track.id)} 
                    className="p-2 hover:bg-gray-600 rounded-full"
                  >
                    {track.isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                  </button>
                  <button 
                    onClick={() => removeFromPlaylist(index)} 
                    className="p-2 hover:bg-gray-600 text-gray-400 hover:text-red-400 rounded-full"
                  >
                    <FiX size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Search */}
          <div className="p-4 border-t border-gray-700">
            <div className="relative mb-4">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                 value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="Search songs, albums, playlists..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="divide-y divide-gray-700">
              {searchResults.map(track => (
                <div key={track.id} className="flex items-center p-3 hover:bg-gray-700/50">
                  <img src={track.albumArt} alt={track.name} className="w-12 h-12 rounded-md mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-gray-400 truncate">{track.artist} • {track.duration}</p>
                  </div>
                  <button 
                    onClick={() => handleAddToPlaylist(track)}
                    className="ml-2 p-2 bg-green-600 hover:bg-green-700 rounded-full"
                  >
                    <FiPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Column (30%) */}
        {/* Main Content Column (30%) */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 lg:w-1/3">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
              <FiMusic className="text-purple-400" /> Vinyl & Veggie Night
            </h1>
            <p className="text-purple-300">By BTS</p>
          </div>

          <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-3 text-center mb-6 animate-pulse">
            <p className="font-medium">Syncing as ARMY</p>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl mb-2">
              🦄
            </div>
            <p className="flex items-center gap-2">
              @FoodieDJ 
              <button onClick={() => setLikes(likes + 1)} className="flex items-center text-pink-500">
                <FiHeart className="mr-1" /> {likes.toLocaleString()}
              </button>
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 text-center">Now Playing</h2>
            <div className="flex items-center justify-center gap-4">
              <div className="text-4xl">🎧</div>
              <div>
                <h3 className="font-bold text-xl">{currentSong?.name || 'No track playing'}</h3>
                <p className="text-purple-300">{currentSong?.artist || 'Select a track'}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsConnected(!isConnected)}
            className={`w-full py-3 rounded-full mb-6 flex items-center justify-center gap-2 font-medium ${
              isConnected ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <FiMusic />
            {isConnected ? 'Connected to Spotify' : 'Connect Spotify'}
          </button>

          <div className="flex justify-center gap-6 mb-8 text-gray-300">
            <span className="flex items-center gap-1">▶️ {plays.toLocaleString()}</span>
            <span className="flex items-center gap-1">👥 {listeners.toLocaleString()}</span>
          </div>
        </div>

        {/* Chat Column (30%) - Removed Player Controls */}
        {/* Chat Column (30%) */}
        <div className="lg:w-1/3 bg-gray-800/50 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col h-[50vh] lg:h-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FiMessageSquare /> Chat
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4 max-h-[calc(100%-120px)]">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{msg.icon}</span>
                  <span className="font-bold">@{msg.user}</span>
                </div>
                <p className="ml-10 mt-1">{msg.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 w-10 h-10 rounded-full flex items-center justify-center"
              >
                →
              </button>
            </div>
          </form>

          <div className="flex justify-around p-3 border-t border-gray-700 bg-gray-800/70">
            <button className="p-2 hover:bg-gray-700 rounded-full text-gray-300 hover:text-purple-400">
              <FiMessageSquare size={20} />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-full text-gray-300 hover:text-blue-400">
              <FiShoppingCart size={20} />
            </button>
            <button 
              onClick={() => setLikes(likes + 1)}
              className="p-2 hover:bg-gray-700 rounded-full text-pink-500 hover:text-pink-400"
            >
              <FiHeart size={20} />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-full text-gray-300 hover:text-green-400">
              <FiShare2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* DJ Control Modal (Mobile Only) */}
      {openModal === 'dj-control' && (
        <div className="lg:hidden fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl w-full max-h-[90vh] flex flex-col">
            {/* ... (keep modal content) ... */}
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-800 flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">DJ CONTROL</h3>
              <button
                onClick={() => setOpenModal(null)}
                className="p-1 text-white hover:bg-gray-700 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="sticky top-14 z-10 bg-gray-800 flex border-b border-gray-700">
              {['playlist', 'guests', 'requests'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-center ${activeTab === tab ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-4">
              {activeTab === 'playlist' && (
                <>
                  <button
                    onClick={() => setOpenModal('search')}
                    className="w-full mb-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FiPlus /> Add Music
                  </button>
                  
                  <div className="space-y-3">
                    {playlist.map((track, index) => (
                      <div key={track.id} className={`flex items-center p-3 rounded-lg ${track.isPlaying ? 'bg-purple-900/50' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
                        <img src={track.albumArt} alt={track.name} className="w-12 h-12 rounded-md mr-3" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-gray-400 truncate">{track.artist} • {track.duration}</p>
                        </div>
                        <div className="flex gap-3 ml-4">
                          <button 
                            onClick={() => togglePlay(track.id)} 
                            className="p-2 hover:bg-gray-600 rounded-full"
                          >
                            {track.isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                          </button>
                          <button 
                            onClick={() => removeFromPlaylist(index)} 
                            className="p-2 hover:bg-gray-600 text-gray-400 hover:text-red-400 rounded-full"
                          >
                            <FiX size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {activeTab === 'guests' && (
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Guest Management</h2>
                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <FiUser size={20} />
                    <span>Guest list will appear here</span>
                  </div>
                </div>
              )}
              
              {activeTab === 'requests' && (
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4">Song Requests</h2>
                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <FiMusic size={20} />
                    <span>Song requests will appear here</span>
                  </div>
                </div>
              )}
            </div>
            <PlayerControls />
          </div>
        </div>
      )}

      {/* Search Modal (Mobile Only) */}
      {openModal === 'search' && (
        <div className="lg:hidden fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl w-full max-h-[90vh] flex flex-col">
            {/* ... (keep search content) ... */}
            {/* Header */}
            <div className="sticky top-0 z-20 bg-gray-800 flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold">SEARCH SONGS</h3>
              <button
                onClick={() => setOpenModal('dj-control')}
                className="p-1 text-white hover:bg-gray-700 rounded-full"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Search Content */}
            <div className="overflow-y-auto flex-1 p-4">
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                placeholder="Search songs, albums, playlists..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <button
                onClick={handleSearch}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg mb-4"
              >
                Search
              </button>
              
              <div className="divide-y divide-gray-700">
                {searchResults.map(track => (
                  <div key={track.id} className="flex items-center p-3 hover:bg-gray-700/50">
                    <img src={track.albumArt} alt={track.name} className="w-12 h-12 rounded-md mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artist} • {track.duration}</p>
                    </div>
                    <button 
                      onClick={() => handleAddToPlaylist(track)}
                      className="ml-2 p-2 bg-green-600 hover:bg-green-700 rounded-full"
                    >
                      <FiPlus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <PlayerControls />
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-lg animate-bounce z-50">
          {notification}
        </div>
      )}
    </div>
  );
};

export default DjView;
