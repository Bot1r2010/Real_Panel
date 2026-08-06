"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("AccessToken");
    const refresh = localStorage.getItem("RefreshToken");
    const userData = localStorage.getItem("User");

    if (access && userData) {
      setAccessToken(access);
      if (refresh) setRefreshToken(refresh);
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  function login(access, refresh, userData) {
    if (access) localStorage.setItem("AccessToken", access);
    if (refresh) localStorage.setItem("RefreshToken", refresh);
    if (userData) localStorage.setItem("User", JSON.stringify(userData));

    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);
  }

  async function logout() {
    try {
      const token = localStorage.getItem("AccessToken");
      if (token) {
        await axios.post(
          "https://api.magnateshop.uz/api/v1/auth/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (e) {
      console.error("Logout API error:", e);
    } finally {
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("RefreshToken");
      localStorage.removeItem("User");

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}