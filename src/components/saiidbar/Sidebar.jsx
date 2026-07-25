'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen text-gray-800 shadow-xs">
      <div className=' mb-4'>
        <svg width="58" height="58" viewBox="0 0 46 46" className="shrink-0">
            <circle cx="23" cy="23" r="19" fill="none" stroke="#d6293a" strokeWidth="2.5" opacity="0.35" />
            <circle cx="23" cy="23" r="12" fill="none" stroke="#d6293a" strokeWidth="3" opacity="0.6" />
            <circle cx="23" cy="23" r="6" fill="#d6293a" />
            <circle cx="23" cy="23" r="2" fill="#ffffff" />
          </svg>
      </div>
      <nav className="space-y-1 ">
        <Link href="/dashboard" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 border-b-red-400 hover:bg-gray-100 hover:text-gray-950 transition">
          Dashboard
        </Link>
        <Link href="/products" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 border-b-red-400 hover:bg-gray-100 hover:text-gray-950 transition">
          Products
        </Link>
        <Link href="/users" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 border-b-red-400 hover:bg-gray-100 hover:text-gray-950 transition">
          Users
        </Link>
        <Link href="/profile" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 border-b-red-400 hover:bg-gray-100 hover:text-gray-950 transition">
          Profile
        </Link>
      </nav>
    </aside>
  );
}
