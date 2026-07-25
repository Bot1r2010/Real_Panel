"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API_URL =
  "https://api.magnateshop.uz/api/v1/auth/login";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("AccessToken");
    const refreshToken = localStorage.getItem("RefreshToken");
    const user = localStorage.getItem("User");

    if (accessToken && refreshToken && user) {
      router.replace("/");
    }
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(API_URL, {
        username,
        password,
      });

      localStorage.setItem(
        "AccessToken",
        response.data.accessToken
      );

      localStorage.setItem(
        "RefreshToken",
        response.data.refreshToken
      );

      localStorage.setItem(
        "User",
        JSON.stringify(response.data.user)
      );

      router.replace("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>ControlPoint</h1>

      <p>Вход в админ-панель</p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">
            UserName
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="name@company.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password">
            Пароль
          </label>

          <div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((value) => !value)
              }
            >
              {showPassword ? "скрыть" : "показать"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>

      <p>
        ControlPoint admin panel · v1.0
      </p>
    </div>
  );
}