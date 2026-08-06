"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "react-toastify";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      toast.info("Tizimdan chiqildi", { position: "top-right", autoClose: 2000 });
      router.replace("/login");
    } catch (err) {
      console.error(err);
      router.replace("/login");
    }
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Products", href: "/products" },
    { label: "Users", href: "/users" },
    { label: "Categories", href: "/profile" },
  ];

  return (
    <aside className="w-64 shrink-0 h-screen overflow-hidden bg-white border-r border-slate-200 shadow-md flex flex-col justify-between sticky top-0">
      <div>
        <div className="flex flex-col items-center justify-center py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <svg width="42" height="42" viewBox="0 0 46 46" className="shrink-0">
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
            <span className="font-extrabold text-xl text-slate-800 tracking-tight">
              Control<span className="text-red-600">Point</span>
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition active:scale-95 border border-red-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Chiqish (Logout)
        </button>
      </div>
    </aside>
  );
}