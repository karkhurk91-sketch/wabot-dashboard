import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!user) return;
    // Super admin and partner don't have granular permissions
    if (user.role === 'super_admin' || user.role === 'partner') {
      setPermissions([]);
      return;
    }
    try {
      const res = await api.get('/api/auth/me/permissions');
      setPermissions(res.data.permissions || []);
    } catch (err) {
      console.error('Failed to fetch permissions', err);
      setPermissions([]);
    }
  }, [user]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Ensure decoded contains role, user_id, etc.
        setUser(decoded);
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      fetchPermissions();
    }
  }, [user, fetchPermissions]);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    const decoded = jwtDecode(access_token);
    setUser(decoded);
    // permissions will be fetched by the useEffect
    return decoded;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPermissions([]);
  };

  const userRole = user?.role || null;

  return (
    <AuthContext.Provider value={{ user, userRole, permissions, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};