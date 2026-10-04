import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Location, NotificationSettings } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  primaryLocation: Location | null;
  notificationSettings: NotificationSettings | null;
  loading: boolean;
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    userType: string;
    cropType?: string;
    farmArea?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setPrimaryLocationState: (location: Location) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [primaryLocation, setPrimaryLocation] = useState<Location | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem('climateshield_demo_mode') === 'true';
  });

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem('climateshield_demo_mode', next ? 'true' : 'false');
      return next;
    });
  };

  const updatePrimaryLocationSafe = (newLoc: Location | null) => {
    setPrimaryLocation((prev) => {
      if (!prev && !newLoc) return null;
      if (
        prev &&
        newLoc &&
        prev.id === newLoc.id &&
        prev.latitude === newLoc.latitude &&
        prev.longitude === newLoc.longitude &&
        prev.name === newLoc.name
      ) {
        return prev;
      }
      return newLoc;
    });
  };

  const refreshUser = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      if (data.primaryLocation) {
        updatePrimaryLocationSafe(data.primaryLocation);
      }
      if (data.notificationSettings) {
        setNotificationSettings(data.notificationSettings);
      }
    } catch (err) {
      console.warn('Session expired or unauthorized');
      setUser(null);
      setPrimaryLocation(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('climateshield_token');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    try {
      const data = await api.getMe();
      if (data.primaryLocation) {
        updatePrimaryLocationSafe(data.primaryLocation);
      }
      if (data.notificationSettings) {
        setNotificationSettings(data.notificationSettings);
      }
      setUser(data.user);
    } catch {
      setUser(res.user);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    userType: string;
    cropType?: string;
    farmArea?: string;
  }) => {
    const res = await api.register(data);
    try {
      const me = await api.getMe();
      if (me.primaryLocation) {
        updatePrimaryLocationSafe(me.primaryLocation);
      }
      if (me.notificationSettings) {
        setNotificationSettings(me.notificationSettings);
      }
      setUser(me.user);
    } catch {
      setUser(res.user);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setPrimaryLocation(null);
    setNotificationSettings(null);
  };

  const setPrimaryLocationState = (location: Location) => {
    updatePrimaryLocationSafe(location);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        primaryLocation,
        notificationSettings,
        loading,
        isDemoMode,
        toggleDemoMode,
        login,
        register,
        logout,
        refreshUser,
        setPrimaryLocationState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
