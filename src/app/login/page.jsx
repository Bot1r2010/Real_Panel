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
      router.replace("/RootPage");
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
  <div
    className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center"
    style={{
      backgroundImage: "url('/image.png')",
    }}
  >



    {/* Card */}
    <div className="relative z-10 w-[430px] rounded-3xl border border-white/10 bg-[#2d2b29]/90 p-10 shadow-2xl backdrop-blur-2xl">




      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">

        <div className="relative mb-5">
          <div className="absolute inset-0 rounded-full bg-red-600/40 blur-2xl"></div>

          <svg
            width="58"
            height="58"
            viewBox="0 0 46 46"
            className="relative shrink-0"
          >
            <circle
              cx="23"
              cy="23"
              r="19"
              fill="none"
              stroke="#d6293a"
              strokeWidth="2.5"
              opacity="0.35"
            />
            <circle
              cx="23"
              cy="23"
              r="12"
              fill="none"
              stroke="#d6293a"
              strokeWidth="3"
              opacity="0.6"
            />
            <circle
              cx="23"
              cy="23"
              r="6"
              fill="#d6293a"
            />
            <circle
              cx="23"
              cy="23"
              r="2"
              fill="#ffffff"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white">
          ControlPoint
        </h1>

        <p className="mt-2 text-center text-gray-400">
          Вход в админ-панель
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-gray-300"
          >
            Username
          </label>

          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="name@company.com"
            required
            className="h-14 w-full rounded-xl border border-[#4a4a4a] bg-[#343230] px-5 text-white placeholder:text-gray-500 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-gray-300"
          >
            Пароль
          </label>

          <div className="relative">

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-14 w-full rounded-xl border border-[#4a4a4a] bg-[#343230] px-5 pr-24 text-white placeholder:text-gray-500 outline-none transition focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
            >
              {showPassword ? "Скрыть" : "Показать"}
            </button>

          </div>
        </div>

        <div className="flex items-center justify-between text-sm">

          <label className="flex items-center gap-2 text-gray-400">

            <input
              type="checkbox"
              className="h-4 w-4 accent-red-600"
            />

            Запомнить

          </label>

          <button
            type="button"
            className="text-red-500 hover:text-red-400"
          >
            Забыли пароль?
          </button>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-xl bg-red-600 text-lg font-semibold text-white transition hover:bg-red-700 hover:shadow-lg hover:shadow-red-700/40 active:scale-95 disabled:opacity-60"
        >
          {loading ? "Вход..." : "Войти"}
        </button>

      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        ControlPoint Admin Panel · v1.0
      </p>

    </div>
  </div>
);
}
