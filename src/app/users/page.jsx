"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const USERS_URL = "https://api.magnateshop.uz/api/v1/users";
const getToken = () => localStorage.getItem("AccessToken");

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "" });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${USERS_URL}?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setUsers(data?.items || data?.users || (Array.isArray(data) ? data : []));
    } catch (err) {
      toast.error(err.response?.data?.message || "Foydalanuvchilarni yuklashda xatolik!");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "" });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
    toast.success("Ma'lumotlar yangilandi!");
    setEditUser(null);
  };

  const filtered = users.filter(u =>
    `${u.firstName || ""} ${u.lastName || ""} ${u.email || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Foydalanuvchilar
            <span className="ml-3 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-100">{filtered.length}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Barcha foydalanuvchilar ro'yxati</p>
        </div>

        <div className="w-full sm:w-72 relative">
          <input type="text" placeholder="Qidiruv..." className={inputClass + " pl-9"} value={search} onChange={e => setSearch(e.target.value)} />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/60 shadow-sm flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-red-600 border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-slate-500">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-semibold tracking-wider">
                  <th className="p-4 pl-5">Foydalanuvchi</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Roli</th>
                  <th className="p-4 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 font-bold flex items-center justify-center border border-red-100 text-sm">
                          {(user.firstName || user.email || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm">{user.firstName || "Noma'lum"} {user.lastName || ""}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500">{user.email || "—"}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${user.role === "ADMIN" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}>
                        {user.role || "USER"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => openEdit(user)} className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition active:scale-95">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-400 text-sm">Foydalanuvchi topilmadi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditUser(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Foydalanuvchini tahrirlash</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Ism</label>
                <input className={inputClass} value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Familiya</label>
                <input className={inputClass} value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input className={inputClass} value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-medium text-slate-600 text-sm transition">
                  Bekor
                </button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
