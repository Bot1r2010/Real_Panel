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
          {isAuthRoute ? (
            <main className="min-h-screen">
              {children}
            </main>
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />

              <main className="flex-1 p-6 overflow-auto">
                {children}
              </main>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}