/**
 * Data refresh utility - broadcasts data update events across tabs/pages
 * Allows pages that save data to notify other pages (like dashboard) to refresh
 */

const DATA_REFRESH_EVENT = 'mentor_data_refresh';

/**
 * Broadcast a data refresh event to all pages
 * @param {string} type - Type of refresh (e.g., 'scores', 'evaluation', 'certificate')
 */
export const broadcastDataRefresh = (type = 'general') => {
  const timestamp = new Date().getTime();
  const event = {
    type,
    timestamp,
  };
  
  // Store in localStorage to trigger storage events in other tabs
  localStorage.setItem(DATA_REFRESH_EVENT, JSON.stringify(event));
  
  // Also dispatch a custom event for same-tab listeners
  window.dispatchEvent(new CustomEvent('mentorDataRefresh', { detail: event }));
};

/**
 * Setup listener for data refresh events
 * @param {function} callback - Function to call when refresh event occurs
 * @returns {function} Cleanup function to remove listener
 */
export const onDataRefresh = (callback) => {
  const handleCustomEvent = (e) => {
    callback(e.detail);
  };
  
  const handleStorageEvent = (e) => {
    if (e.key === DATA_REFRESH_EVENT && e.newValue) {
      try {
        const event = JSON.parse(e.newValue);
        callback(event);
      } catch (error) {
        console.error('Failed to parse data refresh event:', error);
      }
    }
  };
  
  // Listen for custom events (same tab)
  window.addEventListener('mentorDataRefresh', handleCustomEvent);
  
  // Listen for storage events (different tabs)
  window.addEventListener('storage', handleStorageEvent);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('mentorDataRefresh', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
