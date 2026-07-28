"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        const url = "https://api.magnateshop.uz/api/v1/products?page=1&limit=10&category=elektronika&minPrice=100000&maxPrice=9000000&sortBy=createdAt&order=DESC";
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || data); 
        }
      } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Elektronika <span className="text-red-600">Mahsulotlari</span>
          </h1>
          <span className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1 rounded-full border border-red-100">
            Jami: {products.length}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-500">Mahsulotlar topilmadi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-40 bg-gray-50 rounded-xl mb-4 flex items-center justify-center text-gray-400 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">Rasm mavjud emas</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 text-base line-clamp-2 mb-1">
                    {product.title || product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">{product.category}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-red-600 font-bold text-lg">
                    {Number(product.price).toLocaleString()} UZS
                  </span>
                  <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors active:scale-95">
                    Ko'rish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}