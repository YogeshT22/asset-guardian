/**
 * AuthContext.jsx
 *
 * Production practices applied:
 * 1. sessionStorage instead of localStorage — session dies when tab closes (safer)
 * 2. Simulated token — in real apps this comes from your API (JWT, OAuth, etc.)
 * 3. Credential validation — never accept any username/password blindly
 * 4. Separate "token" from "user display name" — same pattern as real JWT auth
 *
 * NOTE: In a real production app, authentication is handled by a backend
 * (e.g. POST /auth/login → receives JWT → stored in httpOnly cookie or memory).
 * For this local project, we simulate that pattern without a real auth server.
 */
import { createContext, useState, useContext, useCallback } from 'react';

// ── Simulated credential store ────────────────────────────────────────────────
// In production: this check happens ON THE SERVER, never on the client.
// We do it here only because this is a local demo project.
const VALID_CREDENTIALS = {
  admin: 'admin123',
  operator: 'operator123',
};

// ── Simple token generator (simulates a server-issued session token) ──────────
const generateSessionToken = (username) => {
  const payload = btoa(JSON.stringify({ sub: username, iat: Date.now() }));
  return `local.${payload}`;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Read initial state from sessionStorage (survives page refresh, not tab close)
  const [user, setUser] = useState(() => sessionStorage.getItem('auth_user'));
  /**
   * login — validates credentials and issues a session token.
   * Returns { success, error } so the UI can show the right feedback.
   */
  const login = useCallback((username, password) => {
    const key = username.toLowerCase();
    const validPassword = VALID_CREDENTIALS[key];

    if (!validPassword || validPassword !== password) {
      return { success: false, error: 'Invalid username or password.' };
    }

    const token = generateSessionToken(username);
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('auth_user', username);
    setUser(username);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
};
