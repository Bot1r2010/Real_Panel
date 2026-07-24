'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await login({ email, password, remember });

    if (result.ok) {
      router.push("/dashboard");
    } else {
      console.error(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <svg width="48" height="48" viewBox="0 0 46 46" className="shrink-0">
            <circle cx="23" cy="23" r="19" fill="none" stroke="#d6293a" strokeWidth="2.5" opacity="0.35" />
            <circle cx="23" cy="23" r="12" fill="none" stroke="#d6293a" strokeWidth="3" opacity="0.6" />
            <circle cx="23" cy="23" r="6" fill="#d6293a" />
            <circle cx="23" cy="23" r="2" fill="#ffffff" />
          </svg>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-medium text-gray-900">ControlPoint</h1>
            <p className="text-sm text-gray-500">Вход в админ-панель</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm
                         focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500
                         transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
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
                className="w-full h-11 px-3 pr-10 rounded-lg border border-gray-300 text-sm
                           focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500
                           transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                {showPassword ? "скрыть" : "показать"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500/30"
              />
              Запомнить
            </label>
            <a href="#" className="text-red-600 hover:text-red-700 font-medium">
              Забыли пароль?
            </a>
          </div>

          <button
            type="submit"
            className="w-full h-11 mt-2 rounded-lg bg-red-600 text-white text-sm font-medium
                       hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            Войти
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          ControlPoint admin panel &middot; v1.0
        </p>
      </div>
    </div>
  );
}