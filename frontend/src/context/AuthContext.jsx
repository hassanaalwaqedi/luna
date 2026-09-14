import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi, clearAuthStorage } from '../api/client';

const AuthContext = createContext(null);

const USER_KEY = 'luna_auth_user';
const LEGACY_USER_KEY = 'genx_auth_user';

function loadUserFromStorage() {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUserToStorage(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local storage records only the previous login. Verify the JWT before
  // rendering protected screens, so an expired session returns to login
  // instead of causing repeated 401 errors in the application.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const storedUser = loadUserFromStorage();
      try {
        const session = await authApi.me();
        if (!cancelled && session.authenticated) {
          const restoredUser = {
            username: session.username || storedUser?.username,
            expires_at: session.expires_at || storedUser?.expires_at,
          };
          setUser(restoredUser);
          saveUserToStorage(restoredUser);
          return;
        }
      } catch {
        // An invalid or unavailable session should use the normal login path.
      }

      if (!cancelled) {
        clearAuthStorage();
        setUser(null);
      }
    };

    restoreSession().finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);


  const loginWithGoogle = useCallback(async () => {
    try {
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('../firebase');
      
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const data = await authApi.firebaseLogin(idToken);
      const u = { username: data.username, expires_at: data.expires_at };
      setUser(u);
      saveUserToStorage(u);
      return data;
    } catch (err) {
      console.error("Failed to start Google login via Firebase", err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    clearAuthStorage();
    setUser(null);
    saveUserToStorage(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// This module intentionally exports both the provider and its consumer hook.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
