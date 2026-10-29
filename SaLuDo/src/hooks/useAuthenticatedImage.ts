import { useEffect, useState } from 'react';
import { authFetch } from '../utils/authFetch';

/**
 * Load a protected image (e.g. a staff profile photo) with the access token.
 * <img src> can't send an Authorization header, so the image is fetched and
 * exposed as a blob: URL. Returns null while loading or if loading failed.
 */
export const useAuthenticatedImage = (url: string | null | undefined) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setObjectUrl(null);
    setFailed(false);
    if (!url) return;

    let cancelled = false;
    let createdUrl: string | null = null;

    authFetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Image request failed (${response.status})`);
        const blob = await response.blob();
        if (cancelled) return;
        createdUrl = URL.createObjectURL(blob);
        setObjectUrl(createdUrl);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [url]);

  return { src: objectUrl, failed };
};
