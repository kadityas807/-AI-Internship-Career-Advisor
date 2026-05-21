'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  isGuest: boolean;
  signIn: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
  signIn: async () => {},
  signInAsGuest: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>({ uid: 'mock-user', email: 'mock@example.com', displayName: 'Mock User' });
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(true);

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, signIn: async () => {}, signInAsGuest: async () => {}, logOut: async () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
