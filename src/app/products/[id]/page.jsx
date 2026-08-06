"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const BASE_URL = "https://api.magnateshop.uz/api/v1/products";
const getToken = () => localStorage.getItem("AccessToken");
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${BASE_URL}/${id}`);
      setProduct(data);
      setSelectedImage(data.image || data.images?.[0] || "");
      setEditForm({ ...data });
    } catch (err) {
      setError(err.response?.data?.message || "Mahsulot topilmadi");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editModal === "full") {
        await axios.put(`${BASE_URL}/${id}`, {
          title: editForm.title, description: editForm.description,
          price: Number(editForm.price), image: editForm.image,
          images: editForm.images || [editForm.image], stock: Number(editForm.stock),
          rating: Number(editForm.rating), categoryId: editForm.categoryId || editForm.category?.id,
          isActive: editForm.isActive ?? true,
        }, authHeader());
        toast.success("Mahsulot to'liq yangilandi!");
      } else {
        await axios.patch(`${BASE_URL}/${id}`, {
          title: editForm.title, price: Number(editForm.price),
          stock: Number(editForm.stock), isActive: editForm.isActive,
        }, authHeader());
        toast.success("Mahsulot qisman yangilandi!");
      }
      setEditModal(null);
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Yangilashda xatolik");
    } finally { setIsSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, authHeader());
      toast.success("Mahsulot o'chirildi");
      router.push("/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-red-600 border-t-transparent" />
        <p className="mt-3 text-sm font-medium text-slate-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/60 shadow-sm max-w-lg mx-auto my-12">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Mahsulot Topilmadi</h2>
        <p className="text-slate-400 text-sm mb-6">{error || "Mahsulot tizimda mavjud emas."}</p>
        <Link href="/products" className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition">
          Katalogga qaytish
        </Link>
      </div>
    );
  }

  const allImages = product.images?.length > 0 ? product.images : [product.image || "https://picsum.photos/seed/product/600/600"];
  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-5 pb-12">
      <div className="flex items-center justify-between bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/products" className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center justify-center text-lg">
            ←
          </Link>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Mahsulot</p>
            <h1 className="text-xl font-bold text-slate-800">{product.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setEditModal("full")} className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold transition active:scale-95">
            Edit
          </button>
          <button onClick={() => setEditModal("partial")} className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold transition active:scale-95">
            Tez edit
          </button>
          <button onClick={handleDelete} className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition active:scale-95">
            O'chirish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/60 shadow-sm">
            <img src={selectedImage || allImages[0]} alt={product.title}
              className="w-full h-80 object-cover rounded-xl border border-slate-100"
              onError={e => { e.target.src = "https://picsum.photos/seed/fallback/600/600"; }} />
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {allImages.map((url, i) => (
                <button key={i} onClick={() => setSelectedImage(url)}
                  className={`shrink-0 rounded-lg overflow-hidden border-2 transition ${selectedImage === url ? "border-red-500" : "border-slate-200"}`}>
                  <img src={url} alt="" className="w-14 h-14 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-5">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-block bg-red-50 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-md border border-red-100 mb-2">
                  {product.category?.name || "—"}
                </span>
                <h2 className="text-2xl font-bold text-slate-800">{product.title}</h2>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">ID: {product.id}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Narx</p>
                <p className="text-2xl font-bold text-red-600">{Number(product.price).toLocaleString()} so'm</p>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Reyting", value: product.rating || "—" },
                { label: "Zaxira", value: `${product.stock} ta` },
                { label: "Holat", value: product.isActive ? "Faol" : "Nofaol", color: product.isActive ? "text-emerald-600" : "text-rose-600" },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">{s.label}</span>
                  <span className={`text-base font-bold ${s.color || "text-slate-800"}`}>{s.value}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tavsifi</h3>
              <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                {product.description || "Tavsif kiritilmagan."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-400 border-t border-slate-100 pt-3 font-mono">
              <div>Yaratilgan: {new Date(product.createdAt).toLocaleString()}</div>
              <div>Yangilangan: {new Date(product.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setEditModal(null)}>
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editModal === "full" ? "Tahrirlash" : "Tez tahrirlash"}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className={labelClass}>Nomi</label>
                <input type="text" value={editForm.title || ""} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className={inputClass} required={editModal === "full"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Narxi</label>
                  <input type="number" value={editForm.price || ""} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className={inputClass} required={editModal === "full"} />
                </div>
                <div>
                  <label className={labelClass}>Zaxira</label>
                  <input type="number" value={editForm.stock || ""} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className={inputClass} required={editModal === "full"} />
                </div>
              </div>
              {editModal === "full" && (
                <div>
                  <label className={labelClass}>Tavsif</label>
                  <textarea rows="2" value={editForm.description || ""} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className={inputClass + " resize-none"} />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditModal(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-600 transition">Bekor</button>
                <button type="submit" disabled={isSubmitting}
                  className={`px-5 py-2 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 ${editModal === "full" ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-500 hover:bg-amber-600"}`}>
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
