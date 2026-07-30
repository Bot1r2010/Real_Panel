"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export default function Products() {
  const [products, setProducts] = useState({ items: [] });
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  //state adduchun
  const [showModal, setShowModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    image: "",
    stock: "",
    rating: ""
  });

  // uppdate
  const updateProduct = async () => {
    try {
      await axios.put(
        `https://api.magnateshop.uz/api/v1/products/${selectedProduct.id}`,
        selectedProduct
      );

      const { data } = await axios.get(
        "https://api.magnateshop.uz/api/v1/products?page=1&limit=12&category=elektronika&minPrice=100000&maxPrice=9000000&sortBy=createdAt&order=DESC"
      );

      setProducts(data);
      setSelectedProduct(null);
    } catch (err) {
      console.log(err);
    }
  };
  // getProducts

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data } = await axios.get(
          "https://api.magnateshop.uz/api/v1/products?page=1&limit=12&category=elektronika&minPrice=100000&maxPrice=9000000&sortBy=createdAt&order=DESC"
        );

        setProducts(data);
      } catch (error) {
        console.log(error);
      }
    };

    getProducts();
  }, []);

  //add

  const addProduct = async () => {
    try {
      const token = localStorage.getItem("AccessToken");

      await axios.post(
        "https://api.magnateshop.uz/api/v1/products",
        {
          ...newProduct,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          rating: Number(newProduct.rating),
          categoryId: "09306044-28d6-42de-9824-a4e2eb603b0d",
          images: [],
          isActive: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // UI ni yangilash
      const { data } = await axios.get(
        "https://api.magnateshop.uz/api/v1/products?page=1&limit=20"
      );

      setProducts(data);

       setShowModal(false);

      setNewProduct({
        title: "",
        description: "",
        price: "",
        image: "",
        stock: "",
        rating: ""
      });

      alert("Mahsulot muvaffaqiyatli qo'shildi ");
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  //delete
  const deleteProduct = async (id) => {
    const confirmDelete = confirm("Rostdan ham mahsulotni o'chirmoqchimisiz?");

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("AccessToken");

      await axios.delete(`https://api.magnateshop.uz/api/v1/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setProducts((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id)
      }));

      alert("Mahsulot o'chirildi ");
    } catch (error) {
      console.log(error);
      console.log(error.response);
      console.log(error.response?.data);
    }
  };

  // filter

  const filteredProducts = products.items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-5 mb-8">
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-red-500"
          />

          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold"
          >
            + Add Product
          </button>
        </div>

        <div className="space-y-5">
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white border border-gray-200 rounded-3xl p-5 hover:border-red-400 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-5 w-full lg:w-auto">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-28 h-28 rounded-2xl object-cover shadow-lg"
                  />

                  <span className="absolute -top-2 -right-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-bold shadow">
                    {item.rating}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {item.title}
                  </h2>

                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 max-w-md">
                    {item.description}
                  </p>

                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                      {item.category.name}
                    </span>

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Stock: {item.stock}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center lg:items-end gap-4">
                <div className="text-center lg:text-right">
                  <p className="text-gray-400 text-sm">Price</p>

                  <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                    {item.price.toLocaleString()} so'm
                  </h2>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(item)}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteProduct(item.id)}
                    className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
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
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-lg">
            Product topilmadi
          </div>
        )}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-[500px] space-y-3">
              <input
                className="w-full border p-3 rounded-xl"
                value={selectedProduct.title}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    title: e.target.value
                  })
                }
              />

              <input
                className="w-full border p-3 rounded-xl"
                value={selectedProduct.price}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    price: e.target.value
                  })
                }
              />

              <textarea
                className="w-full border p-3 rounded-xl"
                value={selectedProduct.description}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    description: e.target.value
                  })
                }
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2 rounded-xl bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={updateProduct}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
