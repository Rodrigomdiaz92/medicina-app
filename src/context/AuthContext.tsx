import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService, UserProfile } from '../services/userService';

interface AuthContextData {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, nombreFallback?: string) => Promise<void>;
  register: (nombre: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getUser().then((savedUser) => {
      setUser(savedUser);
      setLoading(false);
    });
  }, []);

  const login = async (email: string, nombreFallback: string = 'Usuario') => {
    const existing = await userService.getUser();
    const newUser: UserProfile = {
      nombre: existing?.nombre || nombreFallback,
      email: email,
      fotoUrl: existing?.fotoUrl || 'https://i.pravatar.cc/300?img=12',
    };
    await userService.saveUser(newUser);
    setUser(newUser);
  };

  const register = async (nombre: string, email: string) => {
    const newUser: UserProfile = {
      nombre,
      email,
      fotoUrl: 'https://i.pravatar.cc/300?img=12',
    };
    await userService.saveUser(newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await userService.clearUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);