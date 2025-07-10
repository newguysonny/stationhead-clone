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

  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = {
    name: e.target.name.value,
    email: e.target.email.value,
    roomtype: e.target.roomType.value,
    artistname: e.target.artistName.value,
    roomname: e.target.roomName.value,
    description: e.target.description.value,
    tags,              // ✅ from state
    issyncenabled: e.target.isSyncEnabled.value === "true",
    foodpartner: e.target.foodPartner.value,
    privacy,           // ✅ from state
    cohosts: coHosts,  // ✅ from state (array)
    enabletips: e.target.enableTips.value === "true",
    sponsorroom: e.target.sponsorRoom.value,
    themecolor: e.target.themeColor.value
  };

  try {
    const res = await fetch('https://stationhead-clone-production.up.railway.app/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const result = await res.json();
    console.log('✅ Backend response:', result);
    alert('Room created successfully!');
  } catch (error) {
    console.error('❌ Submit failed:', error);
    alert('There was a problem creating the room.');
  }
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

          {/* Tags */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div 
                key={tag} 
                className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
              >
                #{tag}
                <button 
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-red-500"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="#R&B"
              className="flex-1 p-2 border border-gray-300 rounded-l"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-purple-500 text-white px-4 rounded-r hover:bg-purple-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Music Source */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <FiMusic className="text-gray-600" /> Music Source
          </label>
          <div className="flex items-center gap-4">
            <button 
              type="button"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FiMusic /> Connect Spotify
            </button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSyncEnabled}
                onChange={() => setIsSyncEnabled(!isSyncEnabled)}
                className="h-4 w-4 rounded text-purple-500 focus:ring-purple-500"
              />
              Sync Playback
            </label>
          </div>
        </div>

          {/* Privacy & Co-Hosts */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiLock className="text-gray-600" /> Privacy
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={privacy === 'public'}
                  onChange={() => setPrivacy('public')}
                  className="h-4 w-4 text-purple-500 focus:ring-purple-500"
                />
                Public
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={privacy === 'private'}
                  onChange={() => setPrivacy('private')}
                  className="h-4 w-4 text-purple-500 focus:ring-purple-500"
                />
                Private
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <FiUserPlus className="text-gray-600" /> Co-Hosts
            </label>
            <div className="flex">
              <input
                type="text"
                value={newCoHost}
                onChange={(e) => setNewCoHost(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCoHost()}
                placeholder="@username"
                className="flex-1 p-2 border border-gray-300 rounded-l"
              />
              <button
                type="button"
                onClick={handleAddCoHost}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 rounded-r"
              >
                Add
              </button>
            </div>
            {coHosts.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {coHosts.map((host) => (
                  <div 
                    key={host} 
                    className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
                  >
                    {host}
                    <button 
                      type="button"
                      onClick={() => handleRemoveCoHost(host)}
                      className="ml-1 text-gray-500 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monetization */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <FiDollarSign className="text-gray-600" /> Monetization
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableTips}
                onChange={() => setEnableTips(!enableTips)}
                className="h-4 w-4 rounded text-purple-500 focus:ring-purple-500"
              />
              Enable Tips
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sponsorRoom}
                onChange={() => setSponsorRoom(!sponsorRoom)}
                className="h-4 w-4 rounded text-purple-500 focus:ring-purple-500"
              />
              Sponsor Room
            </label>
          </div>
        </div>

        {/* Customization */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <FiImage className="text-gray-600" /> Customize
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              type="button"
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <FiImage /> Upload Cover
            </button>
            <div>
              <p className="text-sm text-gray-600 mb-2">Theme Color</p>
              <div className="flex gap-3">
                {['blue', 'red', 'green'].map((color) => (
                  <button
                    type="button"
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-8 h-8 rounded-full ${
                      color === 'blue' ? 'bg-blue-500' :
                      color === 'red' ? 'bg-red-500' : 'bg-green-500'
                    } hover:opacity-90 ${
                      themeColor === color ? 'ring-2 ring-offset-2 ring-purple-500' : ''
                    }`}
                    aria-label={`${color} theme`}
                  />
                ))}
              </div>
            </div>
          </div>
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
