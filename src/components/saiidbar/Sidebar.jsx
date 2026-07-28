'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="px-6 pt-8 pb-6 flex flex-col items-center gap-3 border-b border-gray-200">
        <svg width="58" height="58" viewBox="0 0 46 46" className="shrink-0">
          <circle cx="23" cy="23" r="19" fill="none" stroke="#d6293a" strokeWidth="2.5" opacity="0.35" />
          <circle cx="23" cy="23" r="12" fill="none" stroke="#d6293a" strokeWidth="3" opacity="0.6" />
          <circle cx="23" cy="23" r="6" fill="#d6293a" />
          <circle cx="23" cy="23" r="2" fill="#ffffff" />
        </svg>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">ControlPoint</p>
          <p className="text-sm text-gray-500 mt-0.5">Админ-панель</p>
        </div>
      </div>

      <nav className="flex-1 px-4 pt-6">
        <div className="space-y-1">
          <Link
            href="/dashboard" 
            className="block py-3 px-4 rounded-md text-base font-semibold text-gray-700 border-l-2 border-transparent hover:text-[#d6293a] hover:bg-gray-100 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/products"
            className="block py-3 px-4 rounded-md text-base font-semibold text-gray-700 border-l-2 border-transparent hover:text-[#d6293a] hover:bg-gray-100 transition-colors"
          >
            Products
          </Link>
          <Link
            href="/users"
            className="block py-3 px-4 rounded-md text-base font-semibold text-gray-700 border-l-2 border-transparent hover:text-[#d6293a] hover:bg-gray-100 transition-colors"
          >
            Users
          </Link>
          <Link
            href="/profile"
            className="block py-3 px-4 rounded-md text-base font-semibold text-gray-700 border-l-2 border-transparent hover:text-[#d6293a] hover:bg-gray-100 transition-colors"
          >
            Profile
          </Link>
        </div>
      </nav>

      <div className="px-4 pb-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          className="w-full text-left py-3 px-4 rounded-md text-base font-semibold text-gray-700 hover:bg-gray-100 hover:text-[#d6293a] transition-colors"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}