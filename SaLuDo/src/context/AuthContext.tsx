import React, { createContext, useContext, useState, useEffect } from "react";
import { usersApi } from "../utils/api";
import { UserProfile } from "../types/user";

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearMustChangePassword: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");
    const storedMustChange = localStorage.getItem("mustChangePassword");

    if (storedAccessToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
      setMustChangePassword(storedMustChange === "true");
    }
    setIsLoading(false);
  }, []);

  // Auto-refresh token before it expires (every 7 hours, token expires in 8 hours)
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    const refreshInterval = setInterval(async () => {
      try {
        console.log("🔄 Auto-refreshing token...");
        const response = await usersApi.refreshToken(refreshToken);

        if (response.success) {
          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;
          
          setAccessToken(newAccessToken);
          localStorage.setItem("accessToken", newAccessToken);
          
          // Update refresh token if rotated
          if (newRefreshToken) {
            setRefreshToken(newRefreshToken);
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          
          console.log("✅ Token refreshed successfully");
        }
      } catch (error) {
        console.error("❌ Auto-refresh failed:", error);
        // Note: Don't logout here - the 401 interceptor will handle expired tokens
      }
    }, 7 * 60 * 60 * 1000); // Refresh every 7 hours (token expires in 8 hours)

    return () => clearInterval(refreshInterval);
  }, [accessToken, refreshToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await usersApi.login(email, password);

      if (response.success) {
        const { user, accessToken, refreshToken, mustChangePassword } = response.data;

        // Store in state
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setMustChangePassword(mustChangePassword || false);

        // Store in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        
        if (mustChangePassword) {
          localStorage.setItem("mustChangePassword", "true");
        }
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
        await usersApi.logout(accessToken, refreshToken || undefined);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear state
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setMustChangePassword(false);

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("mustChangePassword");
    }
  };

  const clearMustChangePassword = () => {
    setMustChangePassword(false);
    localStorage.removeItem("mustChangePassword");
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    mustChangePassword,
    login,
    logout,
    clearMustChangePassword,
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
