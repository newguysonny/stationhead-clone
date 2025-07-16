import { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, FiX, FiSearch, FiPlay, FiPause, FiSkipForward, FiMusic, 
  FiHeart, FiShare2, FiMessageSquare, FiMenu, FiShoppingCart, FiUser
} from 'react-icons/fi';

const DjView = ({ spotifyToken }) => {
  // State management
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

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeTab, setActiveTab] = useState('playlist'); // Added tab state
  const [isConnected, setIsConnected] = useState(false);
  const [likes, setLikes] = useState(1200);
  const [listeners, setListeners] = useState(24);
  const [plays, setPlays] = useState(5800);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'MusicLover42', text: 'These tacos go hard with this beat!', icon: '👤' },
    { id: 2, user: 'FoodieDJ', text: 'Try the new spicy mayo dip!', icon: '🦄' },
    { id: 3, user: 'KpopStan99', text: 'OMG this remix 🔥', icon: '👒' }
  ]);

  const chatEndRef = useRef(null);
  const currentSong = playlist.find(track => track.isPlaying) || playlist[0];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock search function
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
    // Removed modal close here to allow multiple adds
  };

  const removeFromPlaylist = (index) => {
    const newPlaylist = [...playlist];
    newPlaylist.splice(index, 1);
    setPlaylist(newPlaylist);
  };

  const togglePlay = (id) => {
    setPlaylist(playlist.map(track => ({
      ...track,
      isPlaying: track.id === id ? !track.isPlaying : false
    })));
  };

  // Chat actions
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        user: 'You',
        text: message,
        icon: '😊'
      }]);
      setMessage('');
    }
  };

  const handleLike = () => {
    setLikes(likes + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-purple-600 to-blue-500 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <FiMusic className="text-white" /> 
          Vinyl & Veggie Night
        </h1>
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 rounded-full hover:bg-purple-700 transition-all duration-300"
        >
          {showMobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] lg:h-screen">
        {/* Playlist Column */}
        <div className={`
          fixed lg:static inset-0 z-40 lg:z-auto
          bg-gray-800 overflow-y-auto
          transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          transition-transform duration-300 ease-in-out
          lg:w-1/3 lg:block
        `}>
          <div className="p-4 relative h-full">
            <button 
              onClick={() => setShowMobileMenu(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700"
            >
              <FiX size={20} />
            </button>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab('playlist')}
                className={`px-4 py-2 ${activeTab === 'playlist' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
              >
                Playlist
              </button>
              <button
                onClick={() => setActiveTab('guests')}
                className={`px-4 py-2 ${activeTab === 'guests' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
              >
                Guests
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 ${activeTab === 'requests' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
              >
                Requests
              </button>
            </div>

            {activeTab === 'playlist' && (
              <>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FiMusic /> Playlist
                </h2>
                
                <div className="space-y-3 mb-6">
                  {playlist.map((track, index) => (
                    <div 
                      key={`${track.id}-${index}`} 
                      className={`flex items-center p-3 rounded-lg ${track.isPlaying ? 'bg-purple-900/50' : 'bg-gray-700/50 hover:bg-gray-700'}`}
                    >
                      <img 
                        src={track.albumArt} 
                        alt={track.name} 
                        className="w-12 h-12 rounded-md mr-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist} • {track.duration}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button 
                          onClick={() => togglePlay(track.id)}
                          className="p-2 rounded-full hover:bg-gray-600"
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
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    setShowSearchModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 font-medium"
                >
                  <FiPlus /> Add Music
                </button>
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
        </div>

        {/* Main Content Column */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 lg:w-1/3">
          {/* ... [Main content remains the same] ... */}
        </div>

        {/* Chat Column - Fixed positioning */}
        <div className="lg:w-1/3 bg-gray-800/50 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col" style={{
          height: 'calc(100vh - 64px)',
          position: 'fixed',
          right: 0,
          width: '100%',
          maxWidth: '33.333333%',
          display: showMobileMenu ? 'none' : 'flex'
        }}>
          {/* ... [Chat content remains the same] ... */}
        </div>
      </div>

      {/* Search Modal - Updated to stay open after adding tracks */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <FiMusic /> Add Music from Spotify
              </h3>
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-700">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search all of Spotify..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-4 bg-purple-600 hover:bg-purple-700 rounded-lg"
                >
                  Search
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="divide-y divide-gray-700">
                  {searchResults.map(track => (
                    <div key={track.id} className="flex items-center p-4 hover:bg-gray-700/50">
                      <img 
                        src={track.albumArt} 
                        alt={track.name} 
                        className="w-12 h-12 rounded-md mr-4"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.name}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist} • {track.duration}</p>
                      </div>
                      <button 
                        onClick={() => addToPlaylist(track)}
                        className="ml-4 p-2 bg-green-600 hover:bg-green-700 rounded-full"
                      >
                        <FiPlus size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <FiSearch size={48} className="mx-auto mb-4" />
                  <p>Search for songs to add to your playlist</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DjView;
