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
    <aside className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen text-gray-800 shadow-sm flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center justify-center py-2">
          <svg width="58" height="58" viewBox="0 0 46 46" className="shrink-0">
            <circle cx="23" cy="23" r="19" fill="none" stroke="#2d2a2a" strokeWidth="2.5" opacity="0.35" />
            <circle cx="23" cy="23" r="12" fill="none" stroke="#d6293a" strokeWidth="3" opacity="0.6" />
            <circle cx="23" cy="23" r="6" fill="#d6293a" />
            <circle cx="23" cy="23" r="2" fill="#ffffff" />
          </svg>
        </div>
        <nav className="space-y-1">
          <Link
            href="/dashboard"
            className="block py-2.5 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/products"
            className="block py-2.5 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
            Products
          </Link>
          <Link
            href="/users"
            className="block py-2.5 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
            Users
          </Link>
          <Link
            href="/profile"
            className="block py-2.5 px-4 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
          >
            Profile
          </Link>
        </nav>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl transition-all duration-200 font-semibold text-sm active:scale-[0.98]"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}