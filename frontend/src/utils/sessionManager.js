const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 menit
const LAST_ACTIVITY_KEY = 'last_activity';
const SESSION_KEY = 'session_active';

let idleTimer = null;

// Panggil ini saat app mount
export function initSession(logoutFn) {
  // Tandai session aktif di sessionStorage
  // sessionStorage otomatis hilang saat browser/tab ditutup
  sessionStorage.setItem(SESSION_KEY, 'true');
  
  // Simpan last activity di sessionStorage juga
  updateActivity();
  
  // Listen aktivitas user
  const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach(e => window.addEventListener(e, updateActivity, { passive: true }));
  
  // Cek idle setiap menit
  startIdleCheck(logoutFn);
  
  // Cleanup saat tab/window ditutup
  window.addEventListener('beforeunload', () => {
    // Tandai session ini sudah tidak aktif
    sessionStorage.removeItem(SESSION_KEY);
  });
  
  return () => {
    events.forEach(e => window.removeEventListener(e, updateActivity));
    if (idleTimer) clearInterval(idleTimer);
  };
}

export function updateActivity() {
  sessionStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

function startIdleCheck(logoutFn) {
  if (idleTimer) clearInterval(idleTimer);
  
  idleTimer = setInterval(() => {
    const lastActivity = parseInt(sessionStorage.getItem(LAST_ACTIVITY_KEY) || '0');
    const now = Date.now();
    
    if (lastActivity && (now - lastActivity) > IDLE_TIMEOUT) {
      clearInterval(idleTimer);
      logoutFn();
    }
  }, 60 * 1000); // cek tiap 1 menit
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
  if (idleTimer) clearInterval(idleTimer);
}

// Cek apakah session masih valid (untuk cek saat app reload)
export function isSessionValid() {
  return sessionStorage.getItem(SESSION_KEY) === 'true';
}