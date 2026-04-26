/**
 * useFocusBackgroundSync Hook
 * 
 * Simplified hook untuk menangani window focus events dengan smart caching.
 * Gunakan ini untuk mengganti window.addEventListener('focus', ...) pattern
 * 
 * Fitur:
 * - Skip refetch jika cache masih valid (< cacheDuration)
 * - Background refetch tanpa loading state jika cache invalid
 * - Auto cleanup event listener
 * - Support data refresh events
 * 
 * Usage:
 *   useFocusBackgroundSync({
 *     fetchFn: async () => { ... },
 *     cacheDuration: 5 * 60 * 1000, // 5 menit
 *   });
 */

import React from 'react';
import { onDataRefresh } from './dataRefresh';

export function useFocusBackgroundSync({
  fetchFn,
  cacheDuration = 5 * 60 * 1000, // default 5 menit
  forceRefreshEvent = null, // optional event name untuk force refresh
} = {}) {
  const cacheRef = React.useRef({
    lastFetchTime: null,
  });

  const isCacheValid = React.useCallback(() => {
    if (!cacheRef.current.lastFetchTime) return false;
    const elapsed = Date.now() - cacheRef.current.lastFetchTime;
    return elapsed < cacheDuration;
  }, [cacheDuration]);

  const updateCacheTime = React.useCallback(() => {
    cacheRef.current.lastFetchTime = Date.now();
  }, []);

  const backgroundSync = React.useCallback(async () => {
    // Skip jika cache masih valid
    if (isCacheValid()) {
      console.log('[useFocusBackgroundSync] Cache still valid, skipping background sync');
      return;
    }

    console.log('[useFocusBackgroundSync] Cache invalid, doing background sync');
    try {
      await fetchFn();
      updateCacheTime();
    } catch (error) {
      console.error('[useFocusBackgroundSync] Background sync error:', error);
    }
  }, [isCacheValid, fetchFn, updateCacheTime]);

  const forceSync = React.useCallback(async () => {
    console.log('[useFocusBackgroundSync] Force sync triggered');
    try {
      await fetchFn();
      updateCacheTime();
    } catch (error) {
      console.error('[useFocusBackgroundSync] Force sync error:', error);
    }
  }, [fetchFn, updateCacheTime]);

  React.useEffect(() => {
    // Initial fetch invalidates cache
    // (Component will do initial fetch separately with loading state)
    
    // Handle window focus
    const handleFocus = () => {
      console.log('[useFocusBackgroundSync] Window focused');
      backgroundSync();
    };
    window.addEventListener('focus', handleFocus);

    // Handle data refresh events
    const cleanup = onDataRefresh((eventName) => {
      // Jika specific event name didefinisikan, hanya respond untuk event itu
      if (forceRefreshEvent && eventName !== forceRefreshEvent) {
        return;
      }
      console.log('[useFocusBackgroundSync] Data refresh event received:', eventName);
      forceSync();
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      cleanup();
    };
  }, [backgroundSync, forceSync, forceRefreshEvent]);

  return {
    isCacheValid,
    backgroundSync,
    forceSync,
  };
}
