/*
 * handles who's logged in across the whole app
 * wraps everything so any page can check if there's a user or admin session
 */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * on first load, check if there's already an active session on the server
   */
  useEffect(() => {
    api.get('/api/auth/me')
      .then(res => {
        if (res.data.role === 'user') setUser(res.data.data);
        if (res.data.role === 'admin') setAdmin(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /*
   * logs in a regular user by email
   */
  const loginUser = async (email) => {
    const res = await api.post('/api/auth/login', { email });
    setUser(res.data);
    setAdmin(null);
    return res.data;
  };

  /*
   * registers a new user and auto-logs them in
   */
  const registerUser = async (name, email, home_city) => {
    const res = await api.post('/api/auth/register', { name, email, home_city });
    setUser(res.data);
    setAdmin(null);
    return res.data;
  };

  /*
   * logs in an admin by email
   */
  const loginAdmin = async (email) => {
    const res = await api.post('/api/auth/admin-login', { email });
    setAdmin(res.data);
    setUser(null);
    return res.data;
  };

  /*
   * destroys the session on the server and clears local state
   */
  const logout = async () => {
    await api.post('/api/auth/logout');
    setUser(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ user, admin, loading, loginUser, registerUser, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
