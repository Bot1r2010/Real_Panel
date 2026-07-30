"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
   <aside className="w-64 shrink-0 h-screen overflow-hidden bg-white border-r shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center py-6 border-b">
          <svg width="58" height="58" viewBox="0 0 46 46">
            <circle
              cx="23"
              cy="23"
              r="19"
              fill="none"
              stroke="#2d2a2a"
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
            <circle cx="23" cy="23" r="6" fill="#d6293a" />
            <circle cx="23" cy="23" r="2" fill="#fff" />
          </svg>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/dashboard"
            className="block rounded-xl px-4 py-3 font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
             Dashboard
          </Link>

          <Link
            href="/product"
            className="block py-2.5 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
             Products
          </Link>

          <Link
            href="/users"
            className="block rounded-xl px-4 py-3 font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
             Users
          </Link>

          <Link
            href="/profile"
            className="block rounded-xl px-4 py-3 font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
          >
             Categories
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-50 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}