"use client";

import { createContext, useContext, useEffect, useState } from "react";

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

    if (access && refresh && userData) {
      setAccessToken(access);
      setRefreshToken(refresh);
      setUser(JSON.parse(userData));
    }

    setLoading(false);
  }, []);

  function login(access, refresh, userData) {
    localStorage.setItem("AccessToken", access);
    localStorage.setItem("RefreshToken", refresh);
    localStorage.setItem("User", JSON.stringify(userData));

    setAccessToken(access);
    setRefreshToken(refresh);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("AccessToken");
    localStorage.removeItem("RefreshToken");
    localStorage.removeItem("User");

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
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