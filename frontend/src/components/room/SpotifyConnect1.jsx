import { useSpotifyAuth } from '../../contexts/SpotifyAuthContext';

export default function SpotifyConnect({ isHost }) {
  const { 
    isConnected, 
    status, 
    connect, 
    startAuth, 
    setAuthError 
  } = useSpotifyAuth();

  const handleConnect = async () => {
    try {
      startAuth(); // Set loading state
      
      const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
      const verifier = generateCodeVerifier(64);
      const challenge = await generateCodeChallenge(verifier);
      
      localStorage.setItem('spotify_verifier', verifier);

      const popup = window.open(
        `https://accounts.spotify.com/authorize?${/* ... */}`,
        'SpotifyAuth',
        `width=500,height=700,top=${(window.innerHeight - 700) / 2},left=${(window.innerWidth - 500) / 2}`
      );

      const checkPopup = setInterval(async () => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          if (status === 'loading') setAuthError(new Error('Popup closed'));
          return;
        }

        try {
          const url = new URL(popup.location.href);
          const code = url.searchParams.get('code');
          
          if (code) {
            clearInterval(checkPopup);
            popup.close();
            
            const response = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              body: new URLSearchParams({
                client_id: clientId,
                grant_type: 'authorization_code',
                code,
                redirect_uri: window.location.origin,
                code_verifier: localStorage.getItem('spotify_verifier')
              })
            });

            const data = await response.json();
            localStorage.removeItem('spotify_verifier');
            connect(data.access_token);
          }
        } catch (err) {
          // Cross-origin errors expected until auth completes
        }
      }, 500);
    } catch (err) {
      setAuthError(err);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={status === 'loading'}
      className={/* ... */}
    >
      {status === 'loading' ? 'Connecting...' : 'Connect Spotify'}
    </button>
  );
}
