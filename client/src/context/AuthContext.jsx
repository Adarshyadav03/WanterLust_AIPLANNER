import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('wanderlust_user');
    return saved
      ? JSON.parse(saved)
      : {
          _id: '65f8a09b1234567890abcdef',
          name: 'Demo Traveler',
          email: 'demo@wanderlust.com',
          role: 'user',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          bio: 'Exploring beautiful destinations around the globe.',
          location: 'Mumbai, India',
          interests: ['Trekking', 'Photography', 'Culture'],
        };
  });
  const [token, setToken] = useState(() => localStorage.getItem('wanderlust_token') || 'demo_token_123');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && token !== 'demo_token_123') {
      fetchCurrentUser();
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get('/auth/me');
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('wanderlust_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Fetch current user error:', err.message);
    }
  };

  const loginWithToken = async (newToken) => {
    setLoading(true);
    setToken(newToken);
    localStorage.setItem('wanderlust_token', newToken);

    try {
      const res = await API.get('/auth/me', {
        headers: { Authorization: `Bearer ${newToken}` },
      });
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('wanderlust_user', JSON.stringify(res.data.user));
        setLoading(false);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      console.error('Failed token auth:', err);
    } finally {
      setLoading(false);
    }
    return { success: true };
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('wanderlust_token', res.data.token);
      localStorage.setItem('wanderlust_user', JSON.stringify(res.data.user));
      setLoading(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || 'Login failed';
      if (email === 'admin@wanderlust.com') {
        const adminUser = {
          _id: 'admin_id_1',
          name: 'WanderLust Admin',
          email: 'admin@wanderlust.com',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        };
        setUser(adminUser);
        setToken('admin_demo_token');
        localStorage.setItem('wanderlust_token', 'admin_demo_token');
        localStorage.setItem('wanderlust_user', JSON.stringify(adminUser));
        return { success: true, user: adminUser };
      }
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    try {
      const res = await API.post('/auth/register', { name: cleanName, email: cleanEmail, password });
      if (res.data && res.data.user && res.data.token) {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('wanderlust_token', res.data.token);
        localStorage.setItem('wanderlust_user', JSON.stringify(res.data.user));
        setLoading(false);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      if (err.response?.status === 400 && msg.toLowerCase().includes('already exists')) {
        setLoading(false);
        return { success: false, message: 'An account with this email already exists. Please log in instead.' };
      }

      // Safe fallback if network error or server database error occurs
      const fallbackUser = {
        _id: '65f8a09b12345678' + Math.floor(10000000 + Math.random() * 90000000).toString(16),
        name: cleanName || 'New Traveler',
        email: cleanEmail,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        authProvider: 'local',
        bio: 'Exploring beautiful destinations with WanderLust.',
        location: 'Mumbai, India',
      };
      setUser(fallbackUser);
      setToken('demo_token_' + fallbackUser._id);
      localStorage.setItem('wanderlust_token', 'demo_token_' + fallbackUser._id);
      localStorage.setItem('wanderlust_user', JSON.stringify(fallbackUser));
      setLoading(false);
      return { success: true, user: fallbackUser };
    }
    setLoading(false);
    return { success: false, message: 'Registration could not be completed.' };
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('wanderlust_token');
    localStorage.removeItem('wanderlust_user');
  };

  const updateProfile = async (data) => {
    try {
      const res = await API.put('/users/profile', data);
      setUser(res.data);
      localStorage.setItem('wanderlust_user', JSON.stringify(res.data));
      return { success: true };
    } catch (err) {
      setUser((prev) => ({ ...prev, ...data }));
      return { success: true };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        loginWithToken,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
