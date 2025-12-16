import React, { createContext, useContext, useState, useEffect } from "react";
import { usersApi } from "../utils/api";
import { UserProfile } from "../types/user";
import { TokenManager } from "../utils/tokenManager";

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
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
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAccessToken = TokenManager.getAccessToken();
    const storedRefreshToken = TokenManager.getRefreshToken();
    const storedUser = localStorage.getItem("user");

    if (storedAccessToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Auto-refresh token before it expires
  // TokenManager.shouldRefreshToken() checks if token expires within 5 minutes
  useEffect(() => {
    if (!accessToken || !refreshToken) return;

    // Check every minute if we need to refresh
    const refreshCheckInterval = setInterval(async () => {
      if (TokenManager.shouldRefreshToken()) {
        try {
          console.log("🔄 Auto-refreshing token (expires soon)...");
          const response = await usersApi.refreshToken(refreshToken);

          if (response.success && response.data) {
            const newAccessToken = response.data.accessToken;
            const newRefreshToken = response.data.refreshToken;
            
            setAccessToken(newAccessToken);
            
            // Update refresh token if rotated
            if (newRefreshToken) {
              setRefreshToken(newRefreshToken);
            }
            
            console.log("✅ Token refreshed successfully");
          }
        } catch (error) {
          console.error("❌ Auto-refresh failed:", error);
          // Note: Don't logout here - the 401 interceptor will handle expired tokens
        }
      }
    }, 60 * 1000); // Check every minute

    return () => clearInterval(refreshCheckInterval);
  }, [accessToken, refreshToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = awa && response.data) {
        const { user, accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry } = response.data;

        // Store in state
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        // Store tokens using TokenManager (includes expiry tracking)
        TokenManager.saveTokens({
          accessToken,
          refreshToken,
          accessTokenExpiry,
          refreshTokenExpiry,
        });
        
        // Store user data
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
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
        await usersApi.logout(accessToken, refreshToken || undefined);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {tokens and user data using TokenManager
      TokenManager.clearTokens(
      setAccessToken(null);
      setRefreshToken(null);

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
    refreshToken,
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
