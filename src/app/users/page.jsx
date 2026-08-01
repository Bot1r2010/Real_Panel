"use client";

import React from 'react';
import Link from 'next/link';
import { Trash2, Edit3, Search, RefreshCw, UserPlus, Eye } from 'lucide-react';

const SAMPLE_USERS = [
  { id: 1, name: "Asilbek Olimov", email: "asilbek@example.com", role: "Admin" },
  { id: 2, name: "Malika Toshpulatova", email: "malika@example.com", role: "User" },
  { id: 3, name: "Jasur Rahimov", email: "jasur@example.com", role: "Editor" }
];

export default function UsersTableOnly() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-neutral-50 min-h-screen">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Foydalanuvchilar Ro'yxati</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Tizim foydalanuvchilarini boshqarish va tahrirlash</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button className="p-2.5 text-neutral-500 hover:text-red-600 bg-white border border-neutral-200 rounded-xl transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          
          <button className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            <UserPlus className="w-4 h-4" />
            Qo'shish
          </button>
        </div>
      </div>

      {/* Qidiruv Paneli */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Qidirish..." 
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
          />
        </div>
        <div className="text-xs text-neutral-500 font-medium">
          Jami: <span className="text-red-600 font-bold">{SAMPLE_USERS.length} ta</span> element
        </div>
      </div>

      {/* Jadval Qismi */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-4 px-6">Foydalanuvchi</th>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Ma'lumot</th>
                <th className="py-4 px-6 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
              {SAMPLE_USERS.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/30 transition-colors group">
                  <td className="py-4 px-6 font-medium text-neutral-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-50 text-red-600 font-bold rounded-lg flex items-center justify-center text-xs border border-red-100">
                        {item.name ? item.name.substring(0, 2).toUpperCase() : 'US'}
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-800">{item.name}</div>
                        <div className="text-[10px] text-neutral-400">{item.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-4 px-6 text-neutral-400 font-mono">#{item.id}</td>
                  
                  <td className="py-4 px-6 font-medium text-neutral-600">{item.role}</td>
                  
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/user/${item.id}`}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Ma'lumotlarni ko'rish"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}