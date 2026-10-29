import React, { createContext, useContext, useState, useEffect } from "react";
import { usersApi } from "../utils/api";
import { UserProfile } from "../types/user";

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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedAccessToken && storedUser) {
      setAccessToken(storedAccessToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Auto-refresh token before it expires (every 7 hours, token expires in 8 hours).
  // The refresh token itself is an HttpOnly cookie that scripts never see.
  useEffect(() => {
    if (!accessToken) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log("🔄 Auto-refreshing token...");
        const response = await usersApi.refreshToken();
        setAccessToken(response.data.accessToken);
        console.log("✅ Token refreshed successfully");
      } catch (error) {
        console.error("❌ Auto-refresh failed:", error);
        // Note: Don't logout here - the 401 interceptor will handle expired tokens
      }
    }, 7 * 60 * 60 * 1000); // Refresh every 7 hours (token expires in 8 hours)

    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await usersApi.login(email, password);

      if (response.success) {
        const { user, accessToken } = response.data;

        // Store in state
        setUser(user);
        setAccessToken(accessToken);

        // Store in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.removeItem("refreshToken"); // now an HttpOnly cookie
        localStorage.setItem("user", JSON.stringify(user));
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
      // Clear state
      setUser(null);
      setAccessToken(null);

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
  };

  const refreshUser = async () => {
    if (!accessToken || !user?.userId) return;
    
    try {
      console.log('Refreshing user data for sidebar...');
      const response = await usersApi.getUserById(accessToken, user.userId);
      if (response.success) {
        console.log('User data refreshed:', response.data);
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
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
