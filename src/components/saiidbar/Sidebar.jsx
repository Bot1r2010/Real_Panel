'use client';

import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4 min-h-screen text-gray-800 shadow-xs">
      <nav className="space-y-1">
        <Link href="/dashboard" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
          Dashboard
        </Link>
        <Link href="/products" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
          Products
        </Link>
        <Link href="/users" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
          Users
        </Link>
        <Link href="/profile" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
          Profile
        </Link>
        <Link href="/doc" className="block py-2.5 px-3 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition">
          Documentation
        </Link>
      </nav>
    </aside>
  );
}
