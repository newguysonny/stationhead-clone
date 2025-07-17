// SpotifyAuthContext.js
import { createContext } from 'react';

export const SpotifyAuthContext = createContext({
  connect: () => {},
  disconnect: () => {},
  isConnected: false
});
