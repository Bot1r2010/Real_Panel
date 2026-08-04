"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts();
  }, []);

  const getProducts = async () => {
    try {
      const { data } = await axios.get(
        "https://api.magnateshop.uz/api/v1/products?page=1&limit=100"
      );

      setProducts(data.items);
    } catch (error) {
      console.log(error);
    }
  };

  // Statistics

  const totalProducts = products.length;

  const totalRevenue = products.reduce((sum, item) => sum + item.price, 0);

  const totalCategories = [
    ...new Set(products.map((item) => item.category?.name))
  ].length;

  const totalUsers = 42;

  // Pie Chart

  const categoryCount = {};

  products.forEach((item) => {
    const name = item.category?.name || "Unknown";

    categoryCount[name] = (categoryCount[name] || 0) + 1;
  });

  const pieData = {
    labels: Object.keys(categoryCount),

    datasets: [
      {
        data: Object.values(categoryCount),
        backgroundColor: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]
      }
    ]
  };

  // Bar Chart

  const barData = {
    labels: products.map((item) => item.title),

    datasets: [
      {
        label: "Stock",

        data: products.map((item) => item.stock),

        backgroundColor: "#dc2626"
      }
    ]
  };

  return (
    <div className="p-8 bg-slate-100 h-100vh">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-red-600">Dashboard</h1>

        <div className="font-semibold text-lg">Admin</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Products</p>

          <h2 className="text-4xl font-bold mt-2">
            <CountUp end={totalProducts} duration={4} />
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Users</p>

          <h2 className="text-4xl font-bold mt-2">
            <CountUp end={totalUsers} duration={4} />
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Categories</p>

          <h2 className="text-4xl font-bold mt-2">
            <CountUp end={totalCategories} duration={4} />
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-gray-500">Revenue</p>

          <h2 className="text-3xl font-bold mt-2 text-red-600">
            <CountUp end={totalRevenue} duration={4.5} separator=" " /> so'm
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Products by Category</h2>

          <div className="h-[380px]">
            <Pie
              data={pieData}
              options={{
                maintainAspectRatio: false
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-6">Stock Statistics</h2>

          <div className="h-[380px]">
            <Bar
              data={barData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
