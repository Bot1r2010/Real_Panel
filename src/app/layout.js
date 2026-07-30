"use client";

import "./globals.css";
import Sidebar from "@/components/saiidbar/Sidebar";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/" || pathname === "/login";

  return (
    <html lang="en">
      <body className="bg-slate-100">
        <AuthProvider>
          {isAuthRoute ? (
            children
          ) : (
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 min-w-0 p-8">{children}</main>
            </div>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}
