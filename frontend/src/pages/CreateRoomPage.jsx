import { useState } from 'react';
import { FiMusic, FiLock, FiUserPlus, FiDollarSign, FiImage, FiCheck, FiX } from 'react-icons/fi';

const CreateRoomPage = () => {
  // Form state
  const [roomType, setRoomType] = useState('fan');
  const [artistName, setArtistName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isSyncEnabled, setIsSyncEnabled] = useState(true);
  const [foodPartner, setFoodPartner] = useState('none');
  const [privacy, setPrivacy] = useState('public');
  const [coHosts, setCoHosts] = useState([]);
  const [newCoHost, setNewCoHost] = useState('');
  const [enableTips, setEnableTips] = useState(false);
  const [sponsorRoom, setSponsorRoom] = useState(false);
  const [themeColor, setThemeColor] = useState('blue');

  // Mock data
  const mockArtists = ['BTS', 'Taylor Swift', 'Drake', 'Sabrina Carpenter'];
  const foodPartners = ['McDonald\'s', 'Mr Biggs', 'Taco Bell', 'Pizza Hut'];

  // Form handlers
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleAddCoHost = () => {
    if (newCoHost && !coHosts.includes(newCoHost)) {
      setCoHosts([...coHosts, newCoHost]);
      setNewCoHost('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleRemoveCoHost = (hostToRemove) => {
    setCoHosts(coHosts.filter(host => host !== hostToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send data to your backend
    console.log({
      roomType,
      artistName,
      roomName,
      description,
      tags,
      isSyncEnabled,
      foodPartner,
      privacy,
      coHosts,
      enableTips,
      sponsorRoom,
      themeColor
    });
    alert('Room created successfully!');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-6 text-white">
          <h1 className="text-2xl font-bold">Create Listening Party Room</h1>
          <p className="text-purple-100">Set up your perfect sync-listening experience</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Room Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Room Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRoomType('fan')}
                className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                  roomType === 'fan'
                    ? 'bg-purple-100 border-purple-500 text-purple-700 shadow-md'
                    : 'bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                Fan Room
              </button>
              <button
                type="button"
                onClick={() => setRoomType('verified')}
                disabled
                className="flex-1 py-3 px-4 rounded-lg border bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
              >
                Artist-Verified (Coming Soon)
              </button>
            </div>
          </div>

          {/* Artist Selection */}
          {roomType === 'fan' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Artist Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Search artists..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  list="artists"
                  required
                />
                <datalist id="artists">
                  {mockArtists.map((artist) => (
                    <option key={artist} value={artist} />
                  ))}
                </datalist>
              </div>
              <p className="text-xs text-gray-500">This is a fan-led room. Not official.</p>
            </div>
          )}

          {/* Room Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Vinyl & Veggie Night"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Food Partner</label>
              <select
                value={foodPartner}
                onChange={(e) => setFoodPartner(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="none">No Food</option>
                {foodPartners.map((partner) => (
                  <option key={partner} value={partner}>{partner}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your listening party vibe..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
            />
          </div>

          {/* ... (keep all other sections with similar styling improvements) ... */}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow-md transition-colors duration-300 flex items-center justify-center gap-2"
            >
              <FiCheck size={18} />
              Launch Listening Party
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};

export default CreateRoomPage;
