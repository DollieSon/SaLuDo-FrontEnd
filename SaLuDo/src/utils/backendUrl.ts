const DEFAULT_API_URL = 'http://localhost:3000/api/';

const ensureTrailingSlash = (value: string): string => {
  return value.endsWith('/') ? value : `${value}/`;
};

const normalizeApiPath = (path: string): string => {
  return path.replace(/^\/+/, '').replace(/^api\//, '');
};

export const getApiBaseUrl = (): string => {
  const envApiUrl = import.meta.env.VITE_API_URL?.trim();
  return ensureTrailingSlash(envApiUrl || DEFAULT_API_URL);
};

export const getSocketBaseUrl = (): string => {
  return getApiBaseUrl().replace(/\/api\/?$/, '/');
};

export const buildApiUrl = (path: string): string => {
  return `${getApiBaseUrl()}${normalizeApiPath(path)}`;
};