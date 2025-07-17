import { useState, useEffect, useCallback } from 'react';
import { 
  FiPlus, FiX, FiSearch, FiPlay, FiPause, 
  FiSkipForward, FiMusic, FiRefreshCw 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helpers
const msToMinutes = (ms) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}:${seconds.padStart(2, '0')}`;
};

const trackToLocalFormat = (track, isInQueue = false) => ({
  id: track.id,
  name: track.name,
  artist: track.artists.map(a => a.name).join(', '),
  duration: msToMinutes(track.duration_ms),
  albumArt: track.album?.images?.[0]?.url || '',
  uri: track.uri,
  isPlaying: false,
  inSpotifyQueue: isInQueue
});

// Helper functions (persistence token)
const persistToken = (token) => {
  localStorage.setItem('spotify_token', token);
};

const getPersistedToken = () => {
  return localStorage.getItem('spotify_token');
};

const clearToken = () => {
  localStorage.removeItem('spotify_token');
};

const DjView = ({ SpotifyToken }) => {
  // State
  const [localPlaylist, setLocalPlaylist] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('playlist');

  // Persist new tokens on prop change
  useEffect(() => {
    if (SpotifyToken) {
      persistToken(SpotifyToken);
    }
  }, [SpotifyToken]);

  
  // API Wrapper
  const spotifyApi = useCallback(async (endpoint, method = 'GET', body = null) => {
  const token = SpotifyToken || getPersistedToken();
  if (!token) throw new Error('No Spotify token available');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) })
    });

    if (response.status === 401) {
      clearToken();
      throw new Error('Session expired - please reconnect');
    }

    return response.status === 204 ? true : await response.json();
  } catch (error) {
    toast.error(`Spotify Error: ${error.message}`);
    throw error;
  }
}, [SpotifyToken]);

  // Fetch current playback state and queue
  const fetchPlaybackState = useCallback(async () => {
    try {
      setIsLoading(true);
      const [queue, playback] = await Promise.all([
        spotifyApi('/me/player/queue'),
        spotifyApi('/me/player')
      ]);

      if (!playback) return;

      const allTracks = [
        playback.item,
        ...(queue?.queue || [])
      ].filter(Boolean).map(track => ({
        ...trackToLocalFormat(track),
        isPlaying: track.id === playback.item?.id
      }));

      setLocalPlaylist(allTracks);
      setCurrentlyPlaying(allTracks.find(t => t.isPlaying) || null);
      setIsPlaying(playback.is_playing);
      setDeviceId(playback.device?.id);
    } catch (error) {
      console.error('Fetch playback error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [spotifyApi]);

  // Get available devices
  const fetchDevices = useCallback(async () => {
    try {
      const data = await spotifyApi('/me/player/devices');
      const activeDevice = data.devices.find(d => d.is_active);
      if (activeDevice) setDeviceId(activeDevice.id);
      return data.devices;
    } catch (error) {
      console.error('Fetch devices error:', error);
      return [];
    }
  }, [spotifyApi]);

  // Initialize and periodic sync
  useEffect(() => {
    if (!SpotifyToken) return;

    const initialize = async () => {
      await fetchDevices();
      await fetchPlaybackState();
    };

    initialize();

    // Set up periodic sync (every 15 seconds)
    const syncInterval = setInterval(fetchPlaybackState, 15000);
    return () => clearInterval(syncInterval);
  }, [SpotifyToken, fetchPlaybackState, fetchDevices]);

  // Search Spotify
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const data = await spotifyApi(`/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`);
      setSearchResults(data.tracks.items.map(trackToLocalFormat));
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, spotifyApi]);

  // Add track to queue
  const addToQueue = useCallback(async (track) => {
    try {
      await spotifyApi(`/me/player/queue?uri=${track.uri}&device_id=${deviceId}`, 'POST');
      
      // Optimistic UI update
      setLocalPlaylist(prev => [...prev, track]);
      toast.success(`Added "${track.name}" to queue`);
      
      // Sync with Spotify after a short delay
      setTimeout(fetchPlaybackState, 1000);
    } catch (error) {
      console.error('Add to queue error:', error);
    }
  }, [deviceId, fetchPlaybackState, spotifyApi]);

  // Play specific track immediately
  const playTrack = useCallback(async (trackUri) => {
    try {
      await spotifyApi('/me/player/play', 'PUT', {
        uris: [trackUri]
      });
      
      // Optimistic UI update
      setLocalPlaylist(prev => 
        prev.map(track => ({
          ...track,
          isPlaying: track.uri === trackUri
        }))
      );
      setCurrentlyPlaying(localPlaylist.find(t => t.uri === trackUri));
      setIsPlaying(true);
      
      // Full sync after a delay
      setTimeout(fetchPlaybackState, 1000);
    } catch (error) {
      console.error('Play track error:', error);
    }
  }, [fetchPlaybackState, localPlaylist, spotifyApi]);

  // Play/pause toggle
  const togglePlayback = useCallback(async () => {
    try {
      if (isPlaying) {
        await spotifyApi('/me/player/pause', 'PUT');
      } else {
        await spotifyApi('/me/player/play', 'PUT');
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback toggle error:', error);
    }
  }, [isPlaying, spotifyApi]);

  // Skip to next/previous track
  const skipTrack = useCallback(async (direction = 'next') => {
    try {
      await spotifyApi(`/me/player/${direction}`, 'POST');
      setTimeout(fetchPlaybackState, 500); // Wait a moment before syncing
    } catch (error) {
      console.error('Skip error:', error);
    }
  }, [fetchPlaybackState, spotifyApi]);

  // Remove from local playlist
  const removeFromPlaylist = useCallback((index) => {
    setLocalPlaylist(prev => {
      const newPlaylist = [...prev];
      newPlaylist.splice(index, 1);
      return newPlaylist;
    });
  }, []);

  // Manual sync button
  const handleRefresh = useCallback(async () => {
    await fetchPlaybackState();
    toast.info('Playlist refreshed');
  }, [fetchPlaybackState]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiMusic className="text-white" /> 
              Spotify DJ Controller
            </h1>
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <FiRefreshCw className={`${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-6 py-3 font-medium ${activeTab === 'playlist' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          >
            Playlist
          </button>
        </div>
        
        {/* Playlist Content */}
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Queue</h2>
          
          {/* Playlist Items */}
          <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
            {localPlaylist.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FiMusic size={48} className="mx-auto mb-4" />
                <p>Your queue is empty</p>
              </div>
            ) : (
              localPlaylist.map((track, index) => (
                <div 
                  key={`${track.id}-${index}`} 
                  className={`flex items-center p-3 rounded-lg transition-colors ${
                    track.isPlaying 
                      ? 'bg-purple-900/50' 
                      : 'bg-gray-700/50 hover:bg-gray-700'
                  } ${
                    track.inSpotifyQueue ? 'border-l-4 border-green-500' : ''
                  }`}
                >
                  <img 
                    src={track.albumArt} 
                    alt={track.name} 
                    className="w-12 h-12 rounded-md mr-4 object-cover"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {track.artist} • {track.duration}
                      {track.inSpotifyQueue && (
                        <span className="ml-2 text-green-400">• In Queue</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <button 
                      onClick={() => playTrack(track.uri)}
                      disabled={isLoading}
                      className="p-2 rounded-full hover:bg-gray-600 disabled:opacity-50"
                    >
                      {track.isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                    </button>
                    <button 
                      onClick={() => removeFromPlaylist(index)}
                      className="p-2 rounded-full hover:bg-gray-600 text-gray-400 hover:text-red-400"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Add Music Button */}
          <button
            onClick={() => {
              setShowSearchModal(true);
              setSearchResults([]);
              setSearchQuery('');
            }}
            disabled={!deviceId}
            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-colors ${
              deviceId 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            <FiPlus /> Add Music
            {!deviceId && (
              <span className="text-xs ml-2">(No active device detected)</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FiMusic /> Search Spotify
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search songs..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isLoading}
                  className={`px-4 rounded-lg flex items-center gap-2 ${
                    !searchQuery.trim() || isLoading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>
            
            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <FiRefreshCw className="animate-spin text-2xl" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {searchResults.map(track => (
                    <div key={track.id} className="flex items-center p-4 hover:bg-gray-700/50 transition-colors">
                      <img 
                        src={track.albumArt} 
                        alt={track.name} 
                        className="w-12 h-12 rounded-md mr-4 object-cover"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/50'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                      <button 
                        onClick={() => {
                          addToQueue(track);
                          setShowSearchModal(false);
                        }}
                        disabled={!deviceId}
                        className={`ml-4 p-2 rounded-full transition-colors ${
                          deviceId
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <FiPlus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <FiSearch size={48} className="mx-auto mb-4" />
                  <p>{searchQuery ? 'No results found' : 'Search for songs to add to your queue'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Player Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={currentlyPlaying?.albumArt || 'https://via.placeholder.com/50'} 
              alt="Now Playing" 
              className="w-10 h-10 rounded-md object-cover"
            />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">
                {currentlyPlaying?.name || 'No track playing'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentlyPlaying?.artist || 'Select a track'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => skipTrack('previous')}
              disabled={!currentlyPlaying || isLoading}
              className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
            >
              <FiSkipForward className="transform rotate-180" />
            </button>
            <button 
              onClick={togglePlayback}
              disabled={!currentlyPlaying || isLoading}
              className={`p-3 rounded-full ${
                currentlyPlaying
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {isPlaying ? <FiPause /> : <FiPlay />}
            </button>
            <button 
              onClick={() => skipTrack('next')}
              disabled={!currentlyPlaying || isLoading}
              className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50"
            >
              <FiSkipForward />
            </button>
          </div>
          
          <div className="w-1/4 hidden md:block">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-1000" 
                style={{ 
                  width: isPlaying ? '70%' : '0%' // Simulated progress
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjView;
