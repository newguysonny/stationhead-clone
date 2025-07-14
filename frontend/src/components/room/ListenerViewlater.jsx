


import { useState, useEffect, useRef } from 'react';
import { FiHeart, FiShare2, FiShoppingCart, FiMessageSquare, FiMusic, FiUser } from 'react-icons/fi';

const ListenerView = () => {
  // Room state
  const [isConnected, setIsConnected] = useState(false);
  const [likes, setLikes] = useState(1200);
  const [listeners, setListeners] = useState(24);
  const [plays, setPlays] = useState(5800);
  const [message, setMessage] = useState('');
  const chatEndRef = useRef(null);

  // Mock data
  const [messages, setMessages] = useState([
    { id: 1, user: 'MusicLover42', text: 'These tacos go hard with this beat!', icon: '👤' },
    { id: 2, user: 'FoodieDJ', text: 'Try the new spicy mayo dip!', icon: '🦄' },
    { id: 3, user: 'KpopStan99', text: 'OMG this remix 🔥', icon: '👒' }
  ]);

  const currentSong = {
    title: 'Calm Down',
    artist: 'Rema',
    fanbase: 'ARMY'
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 max-w-2xl mx-auto">
      {/* Room Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <FiMusic className="text-purple-400" /> 
          Vinyl & Veggie Night
        </h1>
        <p className="text-purple-300">By BTS</p>
      </div>

      {/* Sync Status */}
      <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-3 text-center mb-6 animate-pulse">
        <p className="font-medium">Syncing as {currentSong.fanbase}</p>
      </div>

      {/* Host Info */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl mb-2">
          🦄
        </div>
        <p className="flex items-center gap-2">
          @FoodieDJ 
          <button onClick={handleLike} className="flex items-center text-pink-500">
            <FiHeart className="mr-1" /> {likes.toLocaleString()}
          </button>
        </p>
      </div>

      {/* Now Playing */}
      <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-center">Now Playing</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="text-4xl">🎧</div>
          <div>
            <h3 className="font-bold text-xl">{currentSong.title}</h3>
            <p className="text-purple-300">{currentSong.artist}</p>
          </div>
        </div>
      </div>

      {/* Connect Button */}
      <button 
        onClick={() => setIsConnected(true)}
        className={`w-full py-3 rounded-full mb-6 flex items-center justify-center gap-2 font-medium ${
          isConnected ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        <FiMusic />
        {isConnected ? 'Connected to Spotify' : 'Connect Spotify'}
      </button>

      {/* Stats */}
      <div className="flex justify-center gap-6 mb-8 text-gray-300">
        <span className="flex items-center gap-1">
          ▶️ {plays.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          👥 {listeners.toLocaleString()}
        </span>
      </div>

      {/* Chat Area */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <FiMessageSquare /> Chat
        </h3>
        <div className="bg-gray-800/50 rounded-lg p-4 h-64 overflow-y-auto">
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
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="mb-6">
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

      {/* Action Buttons */}
      <div className="flex justify-around">
        <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700">
          <FiMessageSquare size={20} />
        </button>
        <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700">
          <FiShoppingCart size={20} />
        </button>
        <button 
          onClick={handleLike}
          className="p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-pink-500"
        >
          <FiHeart size={20} />
        </button>
        <button className="p-3 rounded-full bg-gray-800 hover:bg-gray-700">
          <FiShare2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default ListenerView;
