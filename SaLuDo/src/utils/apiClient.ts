import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - automatically add Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 and refresh token
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success response, return as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is not 401 or request is to refresh endpoint, reject immediately
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    // If this is a retry attempt, don't retry again
    if (originalRequest._retry) {
      console.log('[apiClient] Token refresh failed on retry, logging out');
      
      // Clear auth state and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    // If we're already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // Mark request as retry and start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.log('[apiClient] No refresh token available, logging out');
      isRefreshing = false;
      
      // Clear auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }

    try {
      console.log('[apiClient] Access token expired, refreshing...');
      
      // Call refresh endpoint
      const response = await axios.post(
        `${API_BASE_URL}users/auth/refresh`,
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.data.success) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens in localStorage
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        console.log('[apiClient] ✅ Token refreshed successfully');

        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // Process queued requests
        processQueue(null, newAccessToken);

        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (refreshError) {
      console.error('[apiClient] ❌ Token refresh failed:', refreshError);
      
      processQueue(refreshError, null);
      isRefreshing = false;

      // Clear auth state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;

// Helper function to set token (useful for login)
export const setAuthToken = (token: string) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Helper function to clear token (useful for logout)
export const clearAuthToken = () => {
  delete apiClient.defaults.headers.common['Authorization'];
};
