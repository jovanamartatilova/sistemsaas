/**
 * useSmartFetch Hook
 * 
 * Provides smart caching + background fetch untuk pages di Mentor section.
 * Menghilangkan loading saat user switch tab jika data masih "fresh".
 * 
 * Features:
 * - Automatic caching dengan configurable duration (default 5 menit)
 * - Skip fetch jika cache masih valid
 * - Background fetch jika cache invalid (tanpa set loading=true)
 * - Smart window focus handling
 * - Data refresh event support
 */

import React from 'react';

export function useSmartFetch({
  fetchFn,           // Async function yang fetch data (return promise)
  onSuccess,         // Callback saat fetch success: (data) => {}
  onError,           // Callback saat fetch error: (error) => {}
  cacheDuration = 5 * 60 * 1000, // Default 5 menit
  enableLoading = true, // Set loading=true saat initial fetch
  dependencyArray = [], // Re-run initial fetch jika dependencies berubah
} = {}) {
  const [loading, setLoading] = React.useState(enableLoading);
  const [error, setError] = React.useState(null);
  const cacheRef = React.useRef({
    lastFetchTime: null,
    data: null,
  });

  // Check apakah cache masih valid
  const isCacheValid = React.useCallback(() => {
    if (!cacheRef.current.lastFetchTime) return false;
    const elapsed = Date.now() - cacheRef.current.lastFetchTime;
    return elapsed < cacheDuration;
  }, [cacheDuration]);

  // Fetch data (dengan loading state)
  const fetch = React.useCallback(async (skipLoading = false) => {
    // Jika cache masih valid, pakai cache
    if (isCacheValid() && cacheRef.current.data) {
      console.log('[useSmartFetch] Using cached data');
      return;
    }

    if (!skipLoading) setLoading(true);
    setError(null);

    try {
      const data = await fetchFn();
      cacheRef.current.data = data;
      cacheRef.current.lastFetchTime = Date.now();
      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error('[useSmartFetch] Fetch error:', err);
      setError(err);
      if (onError) onError(err);
    } finally {
      if (!skipLoading) setLoading(false);
    }
  }, [fetchFn, isCacheValid, onSuccess, onError]);

  // Background fetch (tanpa set loading state)
  const backgroundFetch = React.useCallback(async () => {
    // Skip jika cache masih valid
    if (isCacheValid()) {
      console.log('[useSmartFetch] Cache still valid, skipping background fetch');
      return;
    }

    console.log('[useSmartFetch] Cache invalid, doing background fetch');
    await fetch(true); // skipLoading = true
  }, [isCacheValid, fetch]);

  // Initial fetch saat mount atau dependency berubah
  React.useEffect(() => {
    fetch();
  }, dependencyArray); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    loading,
    error,
    fetch,
    backgroundFetch,
    isCacheValid,
  };
}
