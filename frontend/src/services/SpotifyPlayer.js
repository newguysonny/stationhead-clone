export class SpotifyPlayerService {
  constructor(token, callbacks) {
    this.token = token;
    this.callbacks = callbacks; // { onTrackChanged, onPlaybackUpdated, etc. }
    this.player = null;
  }

  // Initialize SDK (called from DjView)
  async connect() {
    this.player = new window.Spotify.Player({
      name: 'Your App Name',
      getOAuthToken: cb => cb(this.token),
      volume: 0.8
    });

    // SDK Event Listeners
    this.player.addListener('ready', this._handleReady);
    this.player.addListener('player_state_changed', this._handleStateChange);
    
    await this.player.connect();
  }

  // Destructor
  disconnect() {
    this.player?.removeListener('ready', this._handleReady);
    this.player?.disconnect();
  }

  // Your existing method names as interface methods
  async togglePlay() {
    return this.player.togglePlay();
  }

  async playTrack(uri) {
    await this.player.activateElement();
    return this.player.play({ uris: [uri] });
  }

  async addToQueue(uri) {
    return this.player.addToQueue(uri);
  }

  // Private handlers
  _handleReady = ({ device_id }) => {
    this.callbacks.onDeviceReady?.(device_id);
  };

  _handleStateChange = (state) => {
    this.callbacks.onPlaybackUpdate?.({
      isPlaying: !state.paused,
      currentTrack: this._formatTrack(state.track_window.current_track)
    });
  };

  _formatTrack = (sdkTrack) => ({
    // Convert SDK track to match your existing schema
    id: sdkTrack.id,
    name: sdkTrack.name,
    artist: sdkTrack.artists.map(a => a.name).join(', '),
    albumArt: sdkTrack.album.images[0]?.url,
    uri: sdkTrack.uri,
    isPlaying: true // Managed by parent component
  });
}
