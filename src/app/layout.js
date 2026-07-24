'use client';

import './globals.css';
import Sidebar from '@/components/saiidbar/Sidebar';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === '/' || pathname === '/login';

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AuthProvider>
          {!isAuthRoute && <Sidebar />}
          <main className={isAuthRoute ? 'min-h-screen bg-slate-50' : 'flex-1 p-6 bg-white'}>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
