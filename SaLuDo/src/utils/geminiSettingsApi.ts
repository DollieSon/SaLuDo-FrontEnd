import apiClient from './apiClient';

interface GeminiSettingsResponse {
  mapping: Record<string, string>;
  allowedModels: string[];
}

export const fetchGeminiSettings = async () => {
  const resp = await apiClient.get<{ success: boolean; data: GeminiSettingsResponse }>(
    '/settings/gemini-models'
  );
  return resp.data.data;
};

export const updateGeminiSettings = async (updates: Record<string, string>) => {
  const resp = await apiClient.put<{ success: boolean; data: GeminiSettingsResponse }>(
    '/settings/gemini-models',
    updates
  );
  return resp.data.data;
};

export const resetGeminiSettings = async () => {
  const resp = await apiClient.post<{ success: boolean; data: GeminiSettingsResponse }>(
    '/settings/gemini-models/reset'
  );
  return resp.data.data;
};
