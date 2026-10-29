import { authFetch } from './authFetch';

/**
 * Download a protected API file. Plain links and window.open() can't send the
 * Authorization header, so the file is fetched with the token and saved from a
 * temporary blob URL.
 */
export const downloadAuthenticatedFile = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await authFetch(url);
    if (!response.ok) {
      throw new Error(`Download failed (${response.status})`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Give the browser time to start the download before releasing the blob
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    console.error('File download failed:', error);
    alert('Could not download the file. Please try again.');
  }
};
