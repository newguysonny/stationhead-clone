// components/room/DJView.jsx
/*export default function DJView({ spotifyToken }) {
  return (
    <div>
      <h1>DJ Controls</h1>
      <p>Spotify Connected: {spotifyToken ? '✅' : '❌'}</p>
      <button>Play/Pause</button>
    </div>
  );
}
*/

import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiSearch, FiPlay, FiPause, FiSkipForward, FiMusic } from 'react-icons/fi';

const DjView = () => {
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
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeTab, setActiveTab] = useState('playlist');

  // Mock search results - replace with actual Spotify API call
  const mockSearch = () => {
    return [
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
    ];
  };

  const handleSearch = () => {
    // In a real app, this would call the Spotify API
    setSearchResults(mockSearch());
  };

  const addToPlaylist = (track) => {
    setPlaylist([...playlist, {...track, isPlaying: false}]);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Main Container */}
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiMusic className="text-white" /> 
            Host Controls - Vinyl & Veggie Night
          </h1>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('playlist')}
            className={`px-6 py-3 font-medium ${activeTab === 'playlist' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          >
            Playlist
          </button>
          <button
            onClick={() => setActiveTab('guests')}
            className={`px-6 py-3 font-medium ${activeTab === 'guests' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          >
            Manage Guests
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium ${activeTab === 'requests' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
          >
            Song Requests
          </button>
        </div>
        
        {/* Playlist Tab Content */}
        {activeTab === 'playlist' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Playlist</h2>
            
            {/* Playlist Items */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
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
            
            {/* Add Music Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              <FiPlus /> Add Music
            </button>
          </div>
        )}
        
        {/* Other Tabs (Placeholder) */}
        {activeTab === 'guests' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Guest Management</h2>
            <p className="text-gray-400">Guest management UI would go here</p>
          </div>
        )}
        
        {activeTab === 'requests' && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Song Requests</h2>
            <p className="text-gray-400">Song request UI would go here</p>
          </div>
        )}
      </div>
      
      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
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
            
            {/* Search Results */}
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
                        onClick={() => {
                          addToPlaylist(track);
                          setShowSearchModal(false);
                        }}
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
      
      {/* Player Controls (Fixed at bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={playlist.find(t => t.isPlaying)?.albumArt || ''} 
              alt="Now Playing" 
              className="w-10 h-10 rounded-md"
            />
            <div>
              <p className="font-medium text-sm">
                {playlist.find(t => t.isPlaying)?.name || 'No track playing'}
              </p>
              <p className="text-xs text-gray-400">
                {playlist.find(t => t.isPlaying)?.artist || 'Select a track'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-700">
              <FiSkipForward className="transform rotate-180" />
            </button>
            <button className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full">
              {playlist.some(t => t.isPlaying) ? <FiPause /> : <FiPlay />}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-700">
              <FiSkipForward />
            </button>
          </div>
          
          <div className="w-1/4">
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DjView;
