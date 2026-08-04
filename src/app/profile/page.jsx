"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = "https://api.magnateshop.uz/api/v1/categories";

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  return [];
}

function getCategoryId(category) {
  return category.id ?? category._id;
}

export default function ProfilePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const loadCategories = useCallback(async (signal) => {
    try {
      const response = await axios.get(BASE_URL, { signal });
      setCategories(extractList(response.data));
      setError(null);
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") return;
      setError(err.message || "Kategoriyalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadCategories(controller.signal);
    return () => controller.abort();
  }, [loadCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = newName.trim();
    if (!trimmedName) {
      setFormError("Kategoriya nomini kiriting!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        BASE_URL,
        {
          name: trimmedName,
          description: newDescription.trim(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Optimistically add the new category if the API returns it,
      // then re-sync with the server to stay consistent.
      const created = response?.data?.data ?? response?.data;
      if (created && (created.id || created._id)) {
        setCategories((prev) => [...prev, created]);
      }

      await loadCategories();

      setIsModalOpen(false);
      setNewName("");
      setNewDescription("");
    } catch (err) {
      console.error("Qo'shishda xatolik:", err);

      let message;
      if (err.response) {
        // Server responded with an error status
        message =
          err.response.data?.message ||
          err.response.data?.error ||
          `Server xatoligi (${err.response.status})`;
      } else if (err.request) {
        // Request was made but no response received (network/CORS issue)
        message =
          "Serverga ulanib bo'lmadi. Internet aloqasini yoki CORS sozlamalarini tekshiring.";
      } else {
        message = err.message || "Noma'lum xatolik yuz berdi";
      }

      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setFormError(null);
    setNewName("");
    setNewDescription("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <header className="bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Foydalanuvchi profili</h1>
            <p className="text-red-100 text-sm mt-1">Hisobni boshqarish va katalog sharhi</p>
          </div>
          <div className="h-11 w-11 rounded-full bg-white text-red-600 font-bold flex items-center justify-center border-2 border-red-200 shadow-sm text-lg">
            U
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                Mahsulot kategoriyalari
                <span className="bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-red-100">
                  Jami: {categories.length}
                </span>
              </h2>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all duration-200 text-sm active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Qoʻshish
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
              <p className="text-slate-500 font-medium mt-4 text-sm">Kategoriyalar yuklanmoqda...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl my-4">
              <p className="text-red-800 font-medium text-sm">Xatolik yuz berdi: {error}</p>
            </div>
          )}

          {!loading && !error && categories.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <svg className="w-14 h-14 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-500 font-medium">Kategoriyalar hali yaratilmagan yoki maʼlumot yoʻq</p>
            </div>
          )}

          {!loading && !error && categories.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {categories.map((category) => {
                const categoryId = getCategoryId(category);
                return (
                  <div
                    key={categoryId}
                    className="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-red-400 hover:shadow-lg hover:shadow-slate-100 transition-all duration-200 flex flex-col justify-between h-44"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-800 group-hover:text-red-600 transition-colors duration-150 line-clamp-1">
                          {category.name}
                        </h3>
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {category.description || "Tavsif mavjud emas"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Yangi kategoriya qoʻshish</h3>

            {formError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg mb-4">
                <p className="text-red-800 text-sm font-medium">{formError}</p>
              </div>
            )}

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Kategoriya nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Masalan: Kiyimlar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Tavsif (Description)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors h-24 resize-none"
                  placeholder="Kategoriya haqida qisqacha maʼlumot..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saqlanmoqda...
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}