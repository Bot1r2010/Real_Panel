'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'authUser';
const LOGIN_URL = 'https://api.magnateshop.uz/api/v1/auth/login';
const LOGOUT_URL = 'https://api.magnateshop.uz/api/v1/auth/logout';
const VERIFY_URL = 'https://api.magnateshop.uz/api/v1/auth/me';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
  if (typeof window === 'undefined') return null;

  const savedUser = localStorage.getItem(USER_KEY);
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearSession = () => {
    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

  const checkToken = async () => {
    const token = getToken();

    if (!token) {
      clearSession();
      return false;
    }

    try {
      const response = await fetch(VERIFY_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        clearSession();
        return false;
      }

      const savedUser = getStoredUser();
      setUser(savedUser);
      setIsAuthenticated(true);
      return true;
    } catch {
      const savedUser = getStoredUser();
      setUser(savedUser);
      setIsAuthenticated(true);
      return true;
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  const login = async ({ email, password, remember = false }) => {
    if (!email || !password) {
      return { ok: false, message: 'Email и пароль обязательны' };
    }

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          ok: false,
          message: data?.message || data?.error || 'Ошибка входа',
        };
      }

      const token = data?.token || data?.access_token || data?.accessToken || data?.data?.token;

      if (!token) {
        return { ok: false, message: 'Токен не пришёл с сервера' };
      }

      const userData = {
        email,
        name: email.split('@')[0],
        remember,
      };

      setUser(userData);
      setIsAuthenticated(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
      }

      return { ok: true, message: 'Успешный вход' };
    } catch (error) {
      return {
        ok: false,
        message: error?.message || 'Не удалось выполнить запрос',
      };
    }
  };

  const logout = async () => {
    const token = getToken();

    if (token) {
      try {
        await fetch(LOGOUT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // игнорируем ошибку logout, чтобы всё равно очистить локальную сессию
      }
    }

    clearSession();
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);