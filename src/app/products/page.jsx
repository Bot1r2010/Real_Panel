"use client";

import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

const BASE_URL = "https://api.magnateshop.uz/api/v1/products";
const CATEGORIES_URL = "https://api.magnateshop.uz/api/v1/categories";
const PER_PAGE = 8;

const getToken = () => localStorage.getItem("AccessToken");
const authHeader = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("DESC");
  const [page, setPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emptyProduct = { title: "", description: "", price: "", image: "", stock: "", rating: "4.5", categoryId: "", isActive: true };
  const [newProduct, setNewProduct] = useState(emptyProduct);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(BASE_URL, { params: { limit: 100 } }),
        axios.get(CATEGORIES_URL),
      ]);

      const items = prodRes.data?.items || prodRes.data?.data || (Array.isArray(prodRes.data) ? prodRes.data : []);
      const cats = catRes.data?.categories || catRes.data?.data || (Array.isArray(catRes.data) ? catRes.data : []);

      setProducts(items);
      setCategories(cats);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [search, selectedCategory, sortBy, order]);

  const processed = useMemo(() => {
    let r = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(i => (i.title || "").toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
    }

    if (selectedCategory) {
      r = r.filter(i => i.category?.slug === selectedCategory || i.category?.name === selectedCategory || i.categoryId === selectedCategory);
    }

    r.sort((a, b) => {
      let vA = a[sortBy], vB = b[sortBy];
      if (sortBy === "price" || sortBy === "stock") { vA = Number(vA) || 0; vB = Number(vB) || 0; }
      else if (sortBy === "createdAt") { vA = new Date(vA || 0).getTime(); vB = new Date(vB || 0).getTime(); }
      else { vA = String(vA || "").toLowerCase(); vB = String(vB || "").toLowerCase(); }
      return vA < vB ? (order === "ASC" ? -1 : 1) : vA > vB ? (order === "ASC" ? 1 : -1) : 0;
    });

    return r;
  }, [products, search, selectedCategory, sortBy, order]);

  const totalItems = processed.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
  const pageItems = processed.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openEdit = (item, mode) => {
    setEditProduct({ ...item, categoryId: item.categoryId || item.category?.id });
    setEditMode(mode);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.categoryId) return toast.warning("Majburiy maydonlarni to'ldiring!");
    setIsSubmitting(true);
    try {
      const img = newProduct.image.trim() || "https://picsum.photos/seed/product/600/600";
      await axios.post(BASE_URL, {
        title: newProduct.title.trim(), description: newProduct.description.trim(),
        price: Number(newProduct.price), image: img, images: [img],
        stock: Number(newProduct.stock) || 10, rating: Number(newProduct.rating) || 4.5,
        categoryId: newProduct.categoryId, isActive: newProduct.isActive,
      }, authHeader());
      toast.success("Mahsulot qo'shildi!");
      setShowAddModal(false);
      setNewProduct({ ...emptyProduct, categoryId: categories[0]?.id || "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Qo'shishda xatolik!");
    } finally { setIsSubmitting(false); }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editProduct) return;
    setIsSubmitting(true);
    try {
      const p = editProduct;
      if (editMode === "full") {
        await axios.put(`${BASE_URL}/${p.id}`, {
          title: p.title, description: p.description, price: Number(p.price),
          image: p.image, images: p.images || [p.image], stock: Number(p.stock),
          rating: Number(p.rating), categoryId: p.categoryId, isActive: p.isActive ?? true,
        }, authHeader());
        toast.success("Mahsulot to'liq yangilandi!");
      } else {
        const payload = {};
        if (p.title !== undefined) payload.title = p.title;
        if (p.price !== undefined) payload.price = Number(p.price);
        if (p.stock !== undefined) payload.stock = Number(p.stock);
        if (p.isActive !== undefined) payload.isActive = p.isActive;
        await axios.patch(`${BASE_URL}/${p.id}`, payload, authHeader());
        toast.success("Mahsulot qisman yangilandi!");
      }
      setEditProduct(null);
      setEditMode(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Yangilashda xatolik!");
    } finally { setIsSubmitting(false); }
  };

  const handleToggle = async (item) => {
    try {
      await axios.patch(`${BASE_URL}/${item.id}`, { isActive: !item.isActive }, authHeader());
      setProducts(prev => prev.map(p => p.id === item.id ? { ...p, isActive: !p.isActive } : p));
      toast.info(`Holat: ${!item.isActive ? "Faol" : "Nofaol"}`);
    } catch { toast.error("Holatni o'zgartirishda xatolik!"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`, authHeader());
      setProducts(prev => prev.filter(i => i.id !== id));
      toast.success("Mahsulot o'chirildi");
    } catch (err) {
      toast.error(err.response?.data?.message || "O'chirishda xatolik");
    }
  };

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 transition-all";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5";
  const btnClass = (color) => `px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${color}`;

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Mahsulotlar
            <span className="ml-3 bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-lg border border-red-100">{totalItems}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">Barcha mahsulotlarni boshqarish</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all active:scale-95">
          + Qo'shish
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className={labelClass}>Qidiruv</label>
          <input type="text" placeholder="Nomi yoki tavsifi..." value={search} onChange={e => setSearch(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Kategoriya</label>
          <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); }} className={inputClass}>
            <option value="">Barchasi</option>
            {categories.map(c => <option key={c.id} value={c.slug || c.name}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Saralash</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputClass}>
            <option value="createdAt">Sana</option>
            <option value="price">Narx</option>
            <option value="title">Nomi</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Tartib</label>
          <select value={order} onChange={e => setOrder(e.target.value)} className={inputClass}>
            <option value="DESC">Yangi → Eski</option>
            <option value="ASC">Eski → Yangi</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/60 shadow-sm flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-red-600 border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-slate-500">Yuklanmoqda...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pageItems.map(item => (
            <div key={item.id} className="group bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="relative shrink-0">
                  <img src={item.image || "https://picsum.photos/seed/product/600/600"} alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100 group-hover:scale-[1.03] transition-transform"
                    onError={e => { e.target.src = "https://picsum.photos/seed/fallback/600/600"; }} />
                  {item.rating > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">{item.rating}</span>
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/products/${item.id}`} className="font-bold text-slate-800 hover:text-red-600 transition truncate">
                      {item.title}
                    </Link>
                    <button onClick={() => handleToggle(item)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition ${item.isActive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {item.isActive ? "Faol" : "Nofaol"}
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs line-clamp-1">{item.description || "Tavsif yo'q"}</p>

                  <div className="flex gap-1.5 flex-wrap">
                    <span className="bg-red-50 text-red-500 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-red-100">
                      {item.category?.name || "—"}
                    </span>
                    <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                      Stock: {item.stock}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                <p className="text-lg font-bold text-red-600 whitespace-nowrap">{Number(item.price).toLocaleString()} so'm</p>

                <div className="flex items-center gap-1.5">
                  <Link href={`/products/${item.id}`} className={btnClass("bg-slate-100 hover:bg-slate-200 text-slate-600")}>Batafsil</Link>
                  <button onClick={() => openEdit(item, "full")} className={btnClass("bg-blue-50 hover:bg-blue-100 text-blue-600")}>Edit</button>
                  <button onClick={() => openEdit(item, "partial")} className={btnClass("bg-amber-50 hover:bg-amber-100 text-amber-600")}>Tez edit</button>
                  <button onClick={() => handleDelete(item.id)} className={btnClass("bg-red-50 hover:bg-red-100 text-red-600")}>O'chirish</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-2xl w-[450px]">
              <h2 className="text-2xl font-bold mb-4">Add Product</h2>

              <input
                placeholder="Title"
                className="w-full border p-3 rounded-lg mb-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, title: e.target.value })
                }
              />

              <input
                placeholder="Description"
                className="w-full border p-3 rounded-lg mb-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />

              <input
                placeholder="Price"
                type="number"
                className="w-full border p-3 rounded-lg mb-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />

              <input
                type="url"
                placeholder="Image URL"
                className="w-full border p-3 rounded-lg mb-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
              />

              <input
                placeholder="Stock"
                type="number"
                className="w-full border p-3 rounded-lg mb-3"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: e.target.value })
                }
              />

              <input
                placeholder="Rating"
                type="number"
                step="0.1"
                className="w-full border p-3 rounded-lg mb-5"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, rating: e.target.value })
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={addProduct}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Yangi Mahsulot</h2>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className={labelClass}>Nomi *</label>
                <input type="text" required placeholder="Mahsulot nomi" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Kategoriya *</label>
                <select required value={newProduct.categoryId} onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value })} className={inputClass}>
                  <option value="">Tanlang</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Narxi *</label>
                  <input type="number" required placeholder="100000" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Zaxira</label>
                  <input type="number" placeholder="10" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Rasm URL</label>
                <input type="url" placeholder="https://..." value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tavsifi</label>
                <textarea rows="2" placeholder="Tavsif..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} className={inputClass + " resize-none"} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-600 transition">Bekor</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50">
                  {isSubmitting ? "Saqlanmoqda..." : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => { setEditProduct(null); setEditMode(null); }}>
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              {editMode === "full" ? "Tahrirlash" : "Tez tahrirlash"}
            </h2>
            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className={labelClass}>Nomi</label>
                <input type="text" value={editProduct.title || ""} onChange={e => setEditProduct({ ...editProduct, title: e.target.value })} className={inputClass} required={editMode === "full"} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Narxi</label>
                  <input type="number" value={editProduct.price || ""} onChange={e => setEditProduct({ ...editProduct, price: e.target.value })} className={inputClass} required={editMode === "full"} />
                </div>
                <div>
                  <label className={labelClass}>Zaxira</label>
                  <input type="number" value={editProduct.stock || ""} onChange={e => setEditProduct({ ...editProduct, stock: e.target.value })} className={inputClass} required={editMode === "full"} />
                </div>
              </div>
              {editMode === "full" && (
                <>
                  <div>
                    <label className={labelClass}>Kategoriya</label>
                    <select value={editProduct.categoryId} onChange={e => setEditProduct({ ...editProduct, categoryId: e.target.value })} className={inputClass}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tavsif</label>
                    <textarea rows="2" value={editProduct.description || ""} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} className={inputClass + " resize-none"} />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => { setEditProduct(null); setEditMode(null); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-600 transition">Bekor</button>
                <button type="submit" disabled={isSubmitting}
                  className={`px-5 py-2 text-white rounded-xl text-sm font-bold shadow-sm transition disabled:opacity-50 ${editMode === "full" ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-500 hover:bg-amber-600"}`}>
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
