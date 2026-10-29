import React, { createContext, useContext, useState, useEffect } from "react";
import { usersApi } from "../utils/api";
import { UserProfile } from "../types/user";
import { clearStoredAuth, refreshAccessToken, refreshSession } from "../utils/authFetch";
import {
  getAccessToken,
  setAccessToken as storeAccessToken,
  subscribeToAccessToken,
} from "../utils/tokenStore";

// Access tokens last 15 minutes; refresh a little early so open sockets and
// long-lived pages always hold a valid one
const PROACTIVE_REFRESH_MS = 12 * 60 * 1000;

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getAccessToken);
  const [isLoading, setIsLoading] = useState(true);

  // Mirror the in-memory token, which changes whenever a request refreshes it
  useEffect(() => subscribeToAccessToken(setAccessToken), []);

  // Restore the session on page load. Nothing is kept in browser storage: the
  // HttpOnly refresh cookie yields a fresh access token and the user's profile.
  useEffect(() => {
    let cancelled = false;

    refreshSession().then((session) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
      } else {
        clearStoredAuth();
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh before the 15-minute access token expires.
  // The refresh token itself is an HttpOnly cookie that scripts never see.
  useEffect(() => {
    if (!accessToken) return;

    const refreshTimer = setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        // Session ended (revoked, expired or signed out elsewhere)
        clearStoredAuth();
        setUser(null);
      }
    }, PROACTIVE_REFRESH_MS);

    return () => clearTimeout(refreshTimer);
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await usersApi.login(email, password);

      if (response.success) {
        const { user, accessToken } = response.data;

        // Kept in memory only
        clearStoredAuth();
        storeAccessToken(accessToken);
        setUser(user);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await usersApi.logout(accessToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearStoredAuth();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!accessToken || !user?.userId) return;

    try {
      const response = await usersApi.getUserById(accessToken, user.userId);
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const value = {
    user,
    accessToken,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
