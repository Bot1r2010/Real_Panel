"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

const BASE_URL = "https://api.magnateshop.uz/api/v1/categories";
const TOKEN_STORAGE_KEY = "magnate_admin_token";

const api = axios.create();

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.categories)) return payload.categories;
  return [];
}

function extractItem(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.category) return payload.category;
  return payload;
}

function getCategoryId(category) {
  return category?.id ?? category?._id;
}

function extractErrorMessage(err) {
  if (err.response) {
    if (err.response.status === 401) {
      return "Avtorizatsiya talab qilinadi. Admin tokenni kiriting (yuqoridagi qulf belgisi).";
    }
    return (
      err.response.data?.message ||
      err.response.data?.error ||
      `Server xatoligi (${err.response.status})`
    );
  }
  if (err.request) {
    return "Serverga ulanib bo'lmadi. Internet aloqasini yoki CORS sozlamalarini tekshiring.";
  }
  return err.message || "Noma'lum xatolik yuz berdi";
}

function useAdminToken() {
  const [token, setTokenState] = useState("");

  useEffect(() => {
    setTokenState(localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  }, []);

  const setToken = useCallback((value) => {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setTokenState(trimmed);
  }, []);

  return { token, setToken, isSet: Boolean(token) };
}

function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);
    try {
      const { data } = await api.get(BASE_URL, { signal });
      setCategories(extractList(data));
      setError(null);
    } catch (err) {
      if (axios.isCancel(err) || err.name === "CanceledError") return;
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const addCategory = useCallback(async ({ name, description, image }) => {
    const { data } = await api.post(
      BASE_URL,
      { name, description, image },
      { headers: { "Content-Type": "application/json" } }
    );
    const created = extractItem(data);

    if (created && getCategoryId(created)) {
      setCategories((prev) => [...prev, created]);
    } else {
      await load();
    }
  }, [load]);

  return { categories, loading, error, addCategory };
}

function CategoryCard({ category }) {
  return (
    <div className="group relative flex h-64 flex-col overflow-hidden border-2 border-[#E11D2E] bg-white transition-transform duration-200 hover:-translate-y-1">
      <div className="relative h-28 w-full overflow-hidden bg-black/5">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="font-display text-xs uppercase tracking-widest text-black/20">Rasm yoʻq</span>
          </div>
        )}
        {typeof category.productsCount === "number" && (
          <span className="absolute right-2 top-2 border-2 border-black bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-black">
            {category.productsCount} ta
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3 className="font-display text-base font-bold uppercase tracking-tight text-black line-clamp-1">
            {category.name}
          </h3>
          <span className="mb-2 mt-1.5 block h-[3px] w-8 bg-[#E11D2E] transition-all duration-200 group-hover:w-14" />
          <p className="line-clamp-2 text-sm leading-relaxed text-black/60">
            {category.description || "Tavsif kiritilmagan"}
          </p>
        </div>
        {category.slug && (
          <span className="mt-2 font-mono text-[10px] uppercase tracking-widest text-black/30">
            /{category.slug}
          </span>
        )}
      </div>
    </div>
  );
}

function AddCategoryModal({ onClose, onSubmit, hasToken, onOpenToken }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError("Kategoriya nomini kiriting.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name: trimmedName, description: description.trim(), image: image.trim() });
      onClose();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border-2 border-[#E11D2E] bg-white p-7">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#E11D2E]">
          Yangi yozuv
        </p>
        <h3 className="mb-5 font-display text-xl font-bold uppercase tracking-tight text-black">
          Kategoriya qoʻshish
        </h3>

        {!hasToken && (
          <button
            type="button"
            onClick={onOpenToken}
            className="mb-4 flex w-full items-center justify-between border-2 border-black bg-black/5 px-3 py-2.5 text-left text-sm text-black transition-colors hover:bg-black hover:text-white"
          >
            <span>Admin token oʻrnatilmagan — bosing</span>
            <span className="font-mono text-xs">→</span>
          </button>
        )}

        {formError && (
          <div className="mb-4 border-2 border-[#E11D2E] bg-[#E11D2E]/5 px-3 py-2.5 text-sm font-medium text-[#E11D2E]">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-black/50">
              Nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Elektronika"
              className="w-full border-2 border-[#E11D2E]/60 bg-white px-3 py-2.5 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-[#E11D2E]"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-black/50">
              Tavsif
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Telefon, noutbuk va boshqa texnika"
              className="h-20 w-full resize-none border-2 border-[#E11D2E]/60 bg-white px-3 py-2.5 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-[#E11D2E]"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-black/50">
              Rasm (URL)
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
              className="w-full border-2 border-[#E11D2E]/60 bg-white px-3 py-2.5 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-[#E11D2E]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-black/50 transition-colors hover:text-black disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 border-2 border-[#E11D2E] bg-[#E11D2E] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-black hover:bg-black disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-b-transparent" />
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
  );
}

function TokenModal({ initialToken, onClose, onSave }) {
  const [value, setValue] = useState(initialToken);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md border-2 border-[#E11D2E] bg-white p-7">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#E11D2E]">
          Admin sozlamasi
        </p>
        <h3 className="mb-2 font-display text-xl font-bold uppercase tracking-tight text-black">
          Bearer token
        </h3>
        <p className="mb-4 text-sm text-black/60">
          Kategoriya qoʻshish / oʻchirish faqat admin uchun. Swagger orqali olingan
          <code className="mx-1 font-mono text-xs">accessToken</code>ni shu yerga joylashtiring.
          Token shu brauzerda saqlanadi.
        </p>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIs..."
          className="h-28 w-full resize-none border-2 border-[#E11D2E]/60 bg-white px-3 py-2.5 font-mono text-xs text-black placeholder-black/30 outline-none transition-colors focus:border-[#E11D2E]"
        />
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold uppercase tracking-wide text-black/50 transition-colors hover:text-black"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() => { onSave(value); onClose(); }}
            className="border-2 border-[#E11D2E] bg-[#E11D2E] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-black hover:bg-black"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { categories, loading, error, addCategory } = useCategories();
  const { token, setToken, isSet } = useAdminToken();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-black antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Archivo Black', ui-sans-serif, sans-serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      `}</style>

      <header className="border-b-2 border-[#E11D2E] bg-[#E11D2E]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 bg-white" />
            <h1 className="font-display text-xl uppercase tracking-tight text-white">
              Magnate
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTokenModalOpen(true)}
              title={isSet ? "Admin token oʻrnatilgan" : "Admin token oʻrnatilmagan"}
              className="flex h-10 w-10 items-center justify-center border-2 border-white text-white transition-colors hover:bg-white hover:text-[#E11D2E]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isSet ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm2-10V7a4 4 0 118 0v4" />
                )}
              </svg>
            </button>
            <div className="flex h-10 w-10 items-center justify-center border-2 border-white font-display text-sm text-white">
              U
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b-2 border-[#E11D2E] pb-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-tight text-black">
              Mahsulot kategoriyalari
            </h2>
            <p className="mt-1.5 flex items-center gap-2 font-mono text-xs tracking-wide text-black/50">
              Jami — {String(categories.length).padStart(2, "0")}
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${isSet ? "bg-green-500" : "bg-black/20"}`} />
              {isSet ? "Admin ulangan" : "Faqat oʻqish"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 border-2 border-[#E11D2E] bg-[#E11D2E] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-black hover:bg-black active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
            Qoʻshish
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#E11D2E]/15 border-t-[#E11D2E]" />
            <p className="mt-4 font-mono text-xs tracking-wide text-black/50">
              Yuklanmoqda...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="border-2 border-[#E11D2E] bg-[#E11D2E]/5 px-4 py-3.5 text-sm font-medium text-[#E11D2E]">
            Xatolik yuz berdi: {error}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="border-2 border-dashed border-[#E11D2E]/40 py-24 text-center">
            <p className="font-display text-lg uppercase text-black">Katalog boʻsh</p>
            <p className="mt-1 text-sm text-black/50">
              Birinchi kategoriyani qoʻshib, katalogni boshlang.
            </p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={getCategoryId(category)} category={category} />
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <AddCategoryModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={addCategory}
          hasToken={isSet}
          onOpenToken={() => { setIsModalOpen(false); setIsTokenModalOpen(true); }}
        />
      )}

      {isTokenModalOpen && (
        <TokenModal
          initialToken={token}
          onClose={() => setIsTokenModalOpen(false)}
          onSave={setToken}
        />
      )}
    </div>
  );
}