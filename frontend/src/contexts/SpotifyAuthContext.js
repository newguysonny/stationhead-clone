//src/contexts/SpotifyAuthContext.js
import { createContext, useContext, useState } from 'react';

const SpotifyAuthContext = createContext();

export const SpotifyAuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isConnected: false,
    token: null,
    user: null

  });

  const connect = (token) => {
    localStorage.setItem('spotify_token', token);
    setAuth({ isConnected: true, token });
  };

  const disconnect = () => {
    localStorage.removeItem('spotify_token');
    setAuth({ isConnected: false, token: null });
  };

  return (
    <SpotifyAuthContext.Provider value={{ ...auth, connect, disconnect }}>
      {children}
    </SpotifyAuthContext.Provider>
  );
};

export const useSpotifyAuth = () => {
  return useContext(SpotifyAuthContext);
};
