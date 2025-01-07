import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
    user: JSON.parse(localStorage.getItem('user')) || null,
    is_authenticated: localStorage.getItem('access_token') ? true : false,
  });

  const login = (data) => {
    const userData = {
      id: data.id,
      role: data.is_superuser ? 'admin' : data.is_doctor ? 'doctor' : 'user',
    };
    setAuth({
      accessToken: data.access,
      refreshToken: data.refresh,
      user: userData,
      is_authenticated: true,
    });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setAuth({
      accessToken: null,
      refreshToken: null,
      user: null,
      is_authenticated: false,
    });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };

  const refreshAccessToken = async () => {
    console.log('called')
    try {
      const response = await api.post('token/refresh/', {
        refresh: auth.refreshToken,
      });
      console.log(response.data)
      setAuth((prev) => ({ ...prev, accessToken: response.data.access }));
      localStorage.setItem('access_token', response.data.access);
    } catch (error) {
      console.log(error)
      logout();
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshAccessToken, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [auth.refreshToken]);

  return (
    <AuthContext.Provider value={{ auth, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
