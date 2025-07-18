import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  FiPlus, FiX, FiSearch, FiPlay, FiPause, FiSkipForward, FiMusic, 
  FiHeart, FiShare2, FiMessageSquare, FiMenu, FiShoppingCart, FiUser,
  FiLoader
} from 'react-icons/fi';
import { debounce } from '../../utils/debounce';
import { msToMinutes } from '../../utils/time';
import { useSpotifyAuth } from '../../contexts/SpotifyAuthContext';


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

  const [searchOffset, setSearchOffset] = useState(0);
  const searchCache = useRef({});
 const { isConnected, startAuth, disconnect } = useSpotifyAuth();
  const [openModal, setOpenModal] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('playlist');
  //const [isConnected, setIsConnected] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const chatEndRef = useRef(null);
  const currentSong = useMemo(() => playlist.find(track => track.isPlaying) || playlist[0], [playlist]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up debounce
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  // Memoized search handler
  const handleSearch = useCallback(async (query, offset = 0) => {
  // 1. Validate empty query (already present)
  if (query.trim() === '') {
    setSearchResults([]);
    return;
  }

  // 2. Validate Spotify token
  if (!spotifyToken || typeof spotifyToken !== 'string') {
    setNotification('Invalid Spotify token');
    return;
  }

  const cacheKey = `${query}-${offset}`;
  if (searchCache.current[cacheKey]) {
    setSearchResults(prev => offset === 0 
      ? searchCache.current[cacheKey] 
      : [...prev, ...searchCache.current[cacheKey]]
    );
    return;
  }

  setIsSearching(true);
  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album,playlist&limit=10&offset=${offset}`,
      { headers: { 'Authorization': `Bearer ${spotifyToken}` } }
    );

    // 3. Validate HTTP response
    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    const data = await response.json();

    // 4. Validate API response structure
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid API response format');
    }

    // Add null checks for each category
    const formattedResults = [
      ...(data.tracks?.items?.map(track => ({
        type: 'track',
        id: track?.id || '',
        name: track?.name || 'Unknown Track',
        artist: track?.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
        duration: track?.duration_ms ? msToMinutes(track.duration_ms) : '0:00',
        albumArt: track?.album?.images?.[0]?.url || '',
        uri: track?.uri || ''
      })) || []),
      ...(data.albums?.items?.map(album => ({
        type: 'album',
        id: album?.id || '',
        name: album?.name || 'Unknown Album',
        artist: album?.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
        albumArt: album?.images?.[0]?.url || '',
        uri: album?.uri || ''
      })) || []),
      ...(data.playlists?.items?.map(playlist => ({
        type: 'playlist',
        id: playlist?.id || '',
        name: playlist?.name || 'Unknown Playlist',
        artist: playlist?.owner?.display_name || 'Unknown Owner',
        albumArt: playlist?.images?.[0]?.url || '',
        uri: playlist?.uri || ''
      })) || [])
    ];


    searchCache.current[cacheKey] = formattedResults;
    setSearchResults(prev => 
      offset === 0 ? formattedResults : [...prev, ...formattedResults]
    );

  } catch (error) {
    console.error('Search failed:', error);
    setNotification(error.message || 'Search failed');
  } finally {
    setIsSearching(false);
  }
}, [spotifyToken]); // Dependency ensures token changes trigger rechecks
  
  

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

 
  const handleQueryChange = (query) => {
  setSearchQuery(query);
  if (query.trim() === '') {
    debouncedSearch.cancel(); // Cancel pending debounced searches
    setSearchResults([]); // Clear results immediately
    return;
  }
  debouncedSearch(query);
};

  const loadMoreResults = () => {
    const newOffset = searchOffset + 10;
    setSearchOffset(newOffset);
    handleSearch(searchQuery, newOffset);
  };

  // Consolidated playlist handler add to queue and UI

  const handleAddToPlaylist = async (item) => {
  if (!spotifyToken) {
    setNotification('Please connect to Spotify first');
    return;
  }

  try {
    setIsLoading(true);
    
    // For tracks - add directly to queue
    if (item.type === 'track') {
      // Add to Spotify's queue
      const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${item.uri}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });

      if (!response.ok) throw new Error('Failed to add to queue');

      // Also add to local state for UI
      setPlaylist(prev => [...prev, { 
        ...item, 
        isPlaying: false 
      }]);
      
      setNotification(`Added ${item.name} to queue`);
    } 
    // For albums/playlists - fetch tracks first
    else {
      const endpoint = item.type === 'album' 
        ? `https://api.spotify.com/v1/albums/${item.id}/tracks`
        : `https://api.spotify.com/v1/playlists/${item.id}/tracks`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      const data = await response.json();

      // Add each track to Spotify's queue
      for (const track of data.items) {
        await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${track.uri}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${spotifyToken}` }
        });
      }

      // Update local state
      const tracksToAdd = data.items.map(track => ({
        type: 'track',
        id: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        duration: msToMinutes(track.duration_ms),
        albumArt: item.albumArt,
        uri: track.uri,
        isPlaying: false
      }));

      setPlaylist(prev => [...prev, ...tracksToAdd]);
      setNotification(`Added ${tracksToAdd.length} songs to queue`);
    }
  } catch (error) {
    console.error('Error:', error);
    setNotification(error.message || 'Failed to add to queue');
  } finally {
    setIsLoading(false);
  }
};

 // REMOVE FROM PLAYLIST AND RECONCILE WITH PLAYER STATES AND QUEUE
  
  const removeFromPlaylist = async (index) => {
  const trackToRemove = playlist[index];
  
  // Optimistic UI update
  setPlaylist(prev => prev.filter((_, i) => i !== index));

  try {
    // If removing currently playing track, skip to next
    if (trackToRemove.isPlaying) {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
    }
    
    // Let the periodic sync handle the state reconciliation
    setNotification(`Skipping ${trackToRemove.name}...`);
    
  } catch (error) {
    // Revert UI if Spotify operation fails
    setPlaylist(prev => [...prev.slice(0, index), trackToRemove, ...prev.slice(index)]);
    setNotification('Failed to skip track');
  }
};

  // Chat actions
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, { 
        id: Date.now(), 
        user: 'You', 
        text: message, 
        icon: '😊' 
      }]);
      setMessage('');
    }
  };

  // Add these player control functions near your other handlers
const playTrack = async (uri) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${spotifyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uris: [uri] })
    });

    if (!response.ok) throw new Error('Playback failed');
    
    // Update local state
    setPlaylist(prev => prev.map(track => ({
      ...track,
      isPlaying: track.uri === uri
    })));

  } catch (error) {
    console.error('Play error:', error);
    setNotification(error.message || 'Failed to play track');
  }
};

const togglePlayback = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/${currentSong?.isPlaying ? 'pause' : 'play'}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${spotifyToken}` }
    });

    if (!response.ok) throw new Error('Playback toggle failed');
    
    // Toggle local state
    setPlaylist(prev => prev.map(track => ({
      ...track,
      isPlaying: track.id === currentSong?.id ? !currentSong.isPlaying : false
    })));

  } catch (error) {
    console.error('Playback toggle error:', error);
    setNotification(error.message || 'Failed to toggle playback');
  }
};

const skipToNext = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/next`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${spotifyToken}` }
    });

    if (!response.ok) throw new Error('Skip failed');
    
    // Note: You might want to fetch the current state from Spotify here
    // This is a simplified version that just moves to the next track in local state
    const currentIndex = playlist.findIndex(track => track.isPlaying);
    if (currentIndex >= 0 && currentIndex < playlist.length - 1) {
      setPlaylist(prev => prev.map((track, i) => ({
        ...track,
        isPlaying: i === currentIndex + 1
      })));
    }

  } catch (error) {
    console.error('Skip error:', error);
    setNotification(error.message || 'Failed to skip track');
  }
};

const skipToPrevious = async () => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/previous`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${spotifyToken}` }
    });

    if (!response.ok) throw new Error('Previous failed');
    
    // Simplified local state update
    const currentIndex = playlist.findIndex(track => track.isPlaying);
    if (currentIndex > 0) {
      setPlaylist(prev => prev.map((track, i) => ({
        ...track,
        isPlaying: i === currentIndex - 1
      })));
    }

  } catch (error) {
    console.error('Previous error:', error);
    setNotification(error.message || 'Failed to go to previous track');
  }
};

// Updated PlayerControls component
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
        <button 
          onClick={skipToPrevious}
          className="p-2 hover:bg-gray-700 rounded-full"
          disabled={!currentSong}
        >
          <FiSkipForward className="transform rotate-180" size={18} />
        </button>
        <button 
          onClick={togglePlayback}
          className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full"
          disabled={!currentSong}
        >
          {currentSong?.isPlaying ? <FiPause size={18} /> : <FiPlay size={18} />}
        </button>
        <button 
          onClick={skipToNext}
          className="p-2 hover:bg-gray-700 rounded-full"
          disabled={!currentSong}
        >
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
        {/* Desktop: Playlist Column */}
        <div className="hidden lg:flex lg:w-1/3 bg-gray-800 flex-col border-r border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-xl font-bold">Playlist</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {playlist.map((track, index) => (
              <div key={`${track.id}-${index}`} className={`flex items-center p-3 ${track.isPlaying ? 'bg-purple-900/50' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
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
                disabled={isSearching}
              />
              {isSearching && (
                <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" />
              )}
            </div>
            <div className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
              {searchResults.map((result) => (
                <div key={`${result.id}-${result.type}`} className="flex items-center p-3 hover:bg-gray-700/50">
                  <img src={result.albumArt} alt={result.name} className="w-12 h-12 rounded-md mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{result.name}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {result.type === 'track' && `${result.artist} • ${result.duration}`}
                      {result.type === 'album' && `${result.artist} • Album (${result.total_tracks} tracks)`}
                      {result.type === 'playlist' && `By ${result.artist} • ${result.total_tracks} songs`}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleAddToPlaylist(result)}
                    className="ml-2 p-2 bg-green-600 hover:bg-green-700 rounded-full"
                    disabled={isLoading || (result.type !== 'track' && isSearching)}
                  >
                    {isLoading ? <FiLoader className="animate-spin" /> : <FiPlus size={18} />}
                  </button>
                </div>
              ))}
              {searchResults.length > 0 && !isSearching && (
                <button 
                  onClick={loadMoreResults}
                  className="w-full py-3 text-center text-purple-400 hover:bg-gray-800/50 flex items-center justify-center gap-2"
                >
                  <FiPlus /> Load More
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Column */}
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
        onClick={() => isConnected ? disconnect() : startAuth()}
        disabled={status === 'loading'}
        className={`w-full py-3 rounded-full mb-6 flex items-center justify-center gap-2 font-medium ${
          isConnected ? 'bg-green-600' : 
          status === 'loading' ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        <FiMusic />
        {status === 'loading' ? 'Connecting...' : 
         isConnected ? 'Connected to Spotify' : 'Connect Spotify'}
      </button>
          
          <div className="flex justify-center gap-6 mb-8 text-gray-300">
            <span className="flex items-center gap-1">▶️ {plays.toLocaleString()}</span>
            <span className="flex items-center gap-1">👥 {listeners.toLocaleString()}</span>
          </div>
        </div>

        {/* Chat Column */}
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

      {/* Modals (Mobile Only) */}
      {/* ... (keep existing modal implementations) ... */}
      {/* DJ Control Modal (Mobile Only) */}
{openModal === 'dj-control' && (
  <div className="lg:hidden fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
    <div className="bg-gray-800 rounded-xl w-full max-h-[90vh] flex flex-col">
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                <div key={`${track.id}-${index}-mobile`} className={`flex items-center p-3 rounded-lg ${track.isPlaying ? 'bg-purple-900/50' : 'bg-gray-700/50 hover:bg-gray-700'}`}>
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
            <div className="space-y-3">
              {[].map(guest => ( // Replace with actual guest data
                <div key={guest.id} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                  <FiUser className="mr-3" size={20} />
                  <span>{guest.name}</span>
                </div>
              ))}
              {[].length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No guests currently connected
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'requests' && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Song Requests</h2>
            <div className="space-y-3">
              {[].map(request => ( // Replace with actual request data
                <div key={request.id} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                  <FiMusic className="mr-3" size={20} />
                  <div className="flex-1">
                    <p className="font-medium">{request.song}</p>
                    <p className="text-sm text-gray-400">From: {request.user}</p>
                  </div>
                  <button className="p-2 bg-green-600 rounded-full">
                    <FiPlus size={16} />
                  </button>
                </div>
              ))}
              {[].length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No pending requests
                </div>
              )}
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
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gray-800 flex justify-between items-center p-4 border-b border-gray-700">
        <h3 className="text-xl font-semibold">SEARCH</h3>
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
            disabled={isSearching}
          />
          {isSearching && (
            <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin" />
          )}
        </div>
        
        <div className="divide-y divide-gray-700">
          {searchResults.map((result) => (
            <div key={`${result.id}-${result.type}-mobile`} className="flex items-center p-3 hover:bg-gray-700/50">
              <img src={result.albumArt} alt={result.name} className="w-12 h-12 rounded-md mr-3" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{result.name}</p>
                <p className="text-sm text-gray-400 truncate">
                  {result.type === 'track' && `${result.artist} • ${result.duration}`}
                  {result.type === 'album' && `${result.artist} • Album`}
                  {result.type === 'playlist' && `By ${result.artist}`}
                </p>
              </div>
              <button 
                onClick={() => handleAddToPlaylist(result)}
                className="ml-2 p-2 bg-green-600 hover:bg-green-700 rounded-full"
                disabled={isLoading}
              >
                {isLoading ? <FiLoader className="animate-spin" size={18} /> : <FiPlus size={18} />}
              </button>
            </div>
          ))}
          {searchResults.length > 0 && !isSearching && (
            <button 
              onClick={loadMoreResults}
              className="w-full py-3 text-center text-purple-400 hover:bg-gray-800/50 flex items-center justify-center gap-2"
            >
              <FiPlus /> Load More
            </button>
          )}
          {isSearching && searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-400">
              Searching...
            </div>
          )}
          {!isSearching && searchResults.length === 0 && searchQuery && (
            <div className="p-4 text-center text-gray-400">
              No results found for "{searchQuery}"
            </div>
          )}
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
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 p-1 rounded-full hover:bg-purple-700"
          >
            <FiX size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DjView;
