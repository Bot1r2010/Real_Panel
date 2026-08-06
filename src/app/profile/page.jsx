"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
  const [newImage, setNewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const trimmedName = newName.trim();
    if (!trimmedName) {
      toast.warning("Kategoriya nomini kiriting!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("AccessToken");
      await axios.post(
        BASE_URL,
        {
          name: trimmedName,
          description: newDescription.trim(),
          image: newImage.trim() || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Kategoriya muvaffaqiyatli yaratildi!");
      await loadCategories();

      setIsModalOpen(false);
      setNewName("");
      setNewDescription("");
      setNewImage("");
    } catch (err) {
      console.error("Qo'shishda xatolik:", err.response || err);
      toast.error("Xatolik yuz berdi: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id, e) => {
    e.stopPropagation();

    if (!id) {
      toast.error("Xatolik: Kategoriyaning ID si topilmadi!");
      return;
    }

    if (!confirm("Haqiqatan ham ushbu kategoriyani oʻchirmoqchimisiz?")) return;

    const previousCategories = categories;
    setCategories((prev) => prev.filter((item) => getCategoryId(item) !== id));

    try {
      const token = localStorage.getItem("AccessToken");
      await axios.delete(`${BASE_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Kategoriya o'chirildi");
    } catch (err) {
      console.error("O'chirishda xatolik:", err.response || err);
      toast.error("Oʻchirishda xatolik yuz berdi: " + (err.response?.data?.message || err.message));
      setCategories(previousCategories);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            Kategoriyalar Boshqaruvi
            <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
              Jami: {categories.length}
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Mahsulot kategoriyalarini ko'rish va yangi kategoriya yaratish
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-red-600/30 transition-all duration-200 text-sm active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Yangi Kategoriya
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
            <p className="text-slate-600 font-semibold mt-4 text-sm">Kategoriyalar yuklanmoqda...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl my-4">
            <p className="text-red-800 font-medium text-sm">Xatolik yuz berdi: {error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <svg className="w-14 h-14 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-500 font-medium">Kategoriyalar hali yaratilmagan</p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const categoryId = getCategoryId(category);
              return (
                <div
                  key={categoryId}
                  className="group relative bg-white border border-slate-200/90 rounded-3xl p-5 hover:border-red-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between h-56"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border border-red-100">
                        CAT
                      </div>
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                        {category.productsCount ?? 0} ta mahsulot
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800 text-lg group-hover:text-red-600 transition-colors line-clamp-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">slug: {category.slug || "n/a"}</p>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {category.description || "Tavsif berilmagan."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={(e) => handleDeleteCategory(categoryId, e)}
                      className="inline-flex items-center gap-1.5 text-slate-400 hover:text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Oʻchirish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-extrabold text-slate-800 mb-4">Yangi Kategoriya Yaratish</h3>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Kategoriya nomi *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Masalan: Elektronika"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Rasm URL (Ixtiyoriy)
                </label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Tavsif (Description)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-500 transition-colors h-24 resize-none"
                  placeholder="Kategoriya haqida qisqacha maʼlumot..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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