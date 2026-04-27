'use client';
import { createContext, useContext } from 'react';
const AuthContext = createContext<any>({
  user: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
  loading: false,
  isGuest: true,
});
export const AuthProvider = ({ children }: any) => (
  <AuthContext.Provider value={{
    user: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
    loading: false,
    isGuest: true
  }}>
    {children}
  </AuthContext.Provider>
);
export const useAuth = () => useContext(AuthContext);
