// Minhaj Digital Library — Auth Context
// Manages authentication state, token storage, and session validation.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginRequest } from '../types/auth';
import { authApi } from '../api/authApi';
import { setAuthToken, setOnUnauthorized } from '../api/client';

// ─── Context Types ────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Storage Keys ─────────────────────────────────────────────
const TOKEN_KEY = '@minhaj_library_token';
const USER_KEY = '@minhaj_library_user';

// ─── Provider Component ──────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Clear session helper
  const clearSession = useCallback(async () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    try {
      if (AsyncStorage?.removeItem) {
        await Promise.all([
          AsyncStorage.removeItem(TOKEN_KEY),
          AsyncStorage.removeItem(USER_KEY),
        ]);
      }
    } catch {
      // Ignore storage errors during cleanup
    }
  }, []);

  // Set up 401 handler
  useEffect(() => {
    setOnUnauthorized(() => {
      clearSession();
    });
  }, [clearSession]);

  // Restore session on app launch
  useEffect(() => {
    const restoreSession = async () => {
      try {
        if (!AsyncStorage?.getItem) {
          setIsLoading(false);
          return;
        }

        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (storedToken && storedUser) {
          setAuthToken(storedToken);

          // Validate token with /api/me
          try {
            const profile = await authApi.getProfile();
            setUser(profile);
            setToken(storedToken);
          } catch {
            // Token invalid/expired — clear
            await clearSession();
          }
        }
      } catch {
        await clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [clearSession]);

  // Login
  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);

    if (!response || !response.token || !response.user) {
      throw new Error('Invalid response structure received from server');
    }

    // Set token in API client
    setAuthToken(response.token);

    // Persist to storage
    try {
      if (AsyncStorage?.setItem) {
        await Promise.all([
          AsyncStorage.setItem(TOKEN_KEY, response.token),
          AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user)),
        ]);
      }
    } catch (storageErr) {
      console.warn('[AuthContext] AsyncStorage warning (non-fatal):', storageErr);
    }

    setUser(response.user);
    setToken(response.token);
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors (token might already be invalid)
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      isAdmin: user?.role === 'admin',
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ─────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
