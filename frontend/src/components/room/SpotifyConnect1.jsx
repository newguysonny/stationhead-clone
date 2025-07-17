import { useSpotifyAuth } from '../../contexts/SpotifyAuthContext';

export default function SpotifyConnect({ isHost }) {
  const { 
    isConnected, 
    status, 
    connect, 
    startAuth, 
    setAuthError 
  } = useSpotifyAuth();

  // PKCE Code Verifier (fixed syntax)
  const generateCodeVerifier = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((byte) => possible[byte % possible.length])
      .join('');
  };

  // PKCE Code Challenge (fixed syntax)
  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const handleConnect = async () => {
    try {
      startAuth();
      const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
      const verifier = generateCodeVerifier(64);
      const challenge = await generateCodeChallenge(verifier);
      
      localStorage.setItem('spotify_verifier', verifier);

      const popup = window.open(
        `https://accounts.spotify.com/authorize?${new URLSearchParams({
          client_id: clientId,
          response_type: 'code',
          redirect_uri: window.location.origin,
          scope: [
            'streaming',
            'user-read-email',
            ...(isHost ? ['user-modify-playback-state'] : [])
          ].join(' '),
          code_challenge_method: 'S256',
          code_challenge: challenge,
        })}`,
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
      className={`bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium ${
        status === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {status === 'loading' ? 'Connecting...' : 'Connect Spotify'}
    </button>
  );
}
