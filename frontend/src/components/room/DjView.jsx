import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FiPlus, FiX, FiSearch, FiPlay, FiPause, FiSkipForward, FiMusic, 
  FiHeart, FiShare2, FiMessageSquare, FiMenu, FiShoppingCart, FiUser
} from 'react-icons/fi';

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

  // Mock search
  const handleSearch = () => {
    setSearchResults([
      {
        id: '3',
        name: 'Dynamite',
        artist: 'BTS',
        duration: '3:19',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e026c619e0e60dcd4e6a3c4c7a3'
      },
      {
        id: '4',
        name: 'Take Two',
        artist: 'BTS',
        duration: '3:49',
        albumArt: 'https://i.scdn.co/image/ab67616d00001e02f8a6d6a5b5d5c5e5d5e5d5e5'
      }
    ]);
  };

  // Playlist actions
  const addToPlaylist = (track) => {
    setPlaylist([...playlist, { ...track, isPlaying: false }]);
    setNotification(`${track.name} added to queue`);
    setTimeout(() => setNotification(null), 3000);
    // Search modal remains open
  };

  const removeFromPlaylist = (index) => setPlaylist(playlist.filter((_, i) => i !== index));
  const togglePlay = (id) => setPlaylist(playlist.map(track => ({
    ...track,
    isPlaying: track.id === id ? !track.isPlaying : false
  })));

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
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search songs..."
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
                    onClick={() => addToPlaylist(track)}
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
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 lg:w-1/3">
          {/* ... (keep your existing main content) ... */}
        </div>

        {/* Chat Column (30%) - Removed Player Controls */}
        <div className="lg:w-1/3 bg-gray-800/50 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col h-[50vh] lg:h-auto">
          {/* ... (keep your existing chat) ... */}
        </div>
      </div>

      {/* DJ Control Modal (Mobile Only) */}
      {openModal === 'dj-control' && (
        <div className="lg:hidden fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl w-full max-h-[90vh] flex flex-col">
            {/* ... (keep modal content) ... */}
            <PlayerControls />
          </div>
        </div>
      )}

      {/* Search Modal (Mobile Only) */}
      {openModal === 'search' && (
        <div className="lg:hidden fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl w-full max-h-[90vh] flex flex-col">
            {/* ... (keep search content) ... */}
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
