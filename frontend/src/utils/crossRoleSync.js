/**
 * Cross-Role Data Synchronization Manager
 * Ensures all roles (Mentor, Candidate, SuperAdmin) stay synchronized with latest data
 * Supports data refresh across tabs and browser windows
 */

const SYNC_CHANNELS = {
  MENTOR_DATA: 'mentor_data_sync',
  CANDIDATE_DATA: 'candidate_data_sync',
  ADMIN_DATA: 'admin_data_sync',
  GENERAL: 'data_sync',
};

/**
 * Broadcasts data change event that all pages can listen to
 * @param {string} role - Role (mentor, candidate, admin)
 * @param {string} dataType - Type of data changed (scores, evaluation, certificate, profile)
 * @param {object} data - The updated data
 */
export const broadcastDataChange = (role, dataType, data = {}) => {
  const channel = SYNC_CHANNELS[`${role.toUpperCase()}_DATA`] || SYNC_CHANNELS.GENERAL;
  const event = {
    role,
    dataType,
    timestamp: new Date().getTime(),
    data,
  };

  // Store in localStorage for cross-tab communication
  localStorage.setItem(channel, JSON.stringify(event));

  // Dispatch custom event for same-tab listeners
  window.dispatchEvent(
    new CustomEvent('dataSync', { detail: event })
  );

  console.log(`[DataSync] Broadcast: ${role} - ${dataType}`, event);
};

/**
 * Setup listener for specific role data changes
 * @param {string} role - Role to listen for (mentor, candidate, admin)
 * @param {function} callback - Function to call when data changes
 * @returns {function} Cleanup function
 */
export const onRoleDataChange = (role, callback) => {
  const channel = SYNC_CHANNELS[`${role.toUpperCase()}_DATA`];

  const handleCustomEvent = (e) => {
    if (e.detail.role === role) {
      callback(e.detail);
    }
  };

  const handleStorageEvent = (e) => {
    if (e.key === channel && e.newValue) {
      try {
        const event = JSON.parse(e.newValue);
        if (event.role === role) {
          callback(event);
        }
      } catch (error) {
        console.error('Failed to parse data sync event:', error);
      }
    }
  };

  window.addEventListener('dataSync', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('dataSync', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Setup listener for any role data changes
 * @param {function} callback - Function to call on any data change
 * @returns {function} Cleanup function
 */
export const onAnyDataChange = (callback) => {
  const handleCustomEvent = (e) => {
    callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    const channels = Object.values(SYNC_CHANNELS);
    if (channels.includes(e.key) && e.newValue) {
      try {
        const event = JSON.parse(e.newValue);
        callback(event);
      } catch (error) {
        console.error('Failed to parse data sync event:', error);
      }
    }
  };

  window.addEventListener('dataSync', handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('dataSync', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Get last sync timestamp for a role
 * @param {string} role - Role name
 * @returns {number} Timestamp of last sync
 */
export const getLastSyncTime = (role) => {
  const channel = SYNC_CHANNELS[`${role.toUpperCase()}_DATA`];
  try {
    const stored = localStorage.getItem(channel);
    if (stored) {
      const event = JSON.parse(stored);
      return event.timestamp || 0;
    }
  } catch (error) {
    console.error('Failed to get last sync time:', error);
  }
  return 0;
};

/**
 * Clear all sync data (useful for logout)
 */
export const clearSyncData = () => {
  Object.values(SYNC_CHANNELS).forEach(channel => {
    localStorage.removeItem(channel);
  });
  console.log('[DataSync] All sync data cleared');
};
