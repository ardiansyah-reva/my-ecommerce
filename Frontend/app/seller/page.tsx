'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

/* =======================
   TYPES
======================= */

interface SellerInfo {
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  seller: SellerInfo;
}

interface ProductMedia {
  url: string;
}

interface ProductCategory {
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  media?: ProductMedia[];
  category?: ProductCategory;
}

/* =======================
   COMPONENT
======================= */

export default function SellerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    seller: { name: '', status: 'pending' },
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH DATA
  ======================= */

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [statsRes, productsRes] = await Promise.all([
        fetch('http://localhost:8000/api/seller/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch('http://localhost:8000/api/seller/products?limit=5', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const statsData = await statsRes.json();
      const productsData = await productsRes.json();

      if (statsData.status === 'success') {
        setStats(statsData.data);
      }

      if (productsData.status === 'success') {
        setProducts(productsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* =======================
     HELPERS
  ======================= */

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const getStatusColor = (status: SellerInfo['status']) => {
    const colors: Record<SellerInfo['status'], string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };

    return colors[status];
  };

  /* =======================
     LOADING
  ======================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Seller Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Kelola toko: {stats.seller.name}
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
              stats.seller.status
            )}`}
          >
            Status: {stats.seller.status}
          </span>
        </div>

        {/* Status Alerts */}
        {stats.seller.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-yellow-800">
              ⏳ Akun seller Anda sedang direview admin
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Anda bisa menambah produk, tapi belum bisa menjual
            </p>
          </div>
        )}

        {stats.seller.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="font-semibold text-red-800">
              ❌ Akun seller Anda ditolak
            </p>
            <p className="text-sm text-red-700 mt-1">
              Silakan hubungi admin
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Products"
            value={stats.totalProducts}
            icon={<Package size={24} className="text-purple-600" />}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCart size={24} className="text-orange-600" />}
          />
          <StatCard
            title="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            icon={<DollarSign size={24} className="text-green-600" />}
          />
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">My Products</h2>
            <a
              href="/seller/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add Product
            </a>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <Th>Product</Th>
                <Th>Category</Th>
                <Th>Price</Th>
                <Th>Stock</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No products yet
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <Td>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.media?.[0]?.url
                              ? `http://localhost:8000${product.media[0].url}`
                              : '/placeholder-product.jpg'
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        {product.name}
                      </div>
                    </Td>
                    <Td>{product.category?.name || '-'}</Td>
                    <Td>{formatPrice(product.price)}</Td>
                    <Td>
                      <span
                        className={`font-medium ${
                          product.stock > 10
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <a
                          href={`/seller/products/${product.id}/edit`}
                          className="text-blue-600"
                        >
                          <Edit size={18} />
                        </a>
                        <button className="text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {products.length > 0 && (
            <div className="p-4 border-t">
              <a
                href="/seller/products"
                className="text-blue-600 font-medium text-sm"
              >
                View All Products →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =======================
   SMALL COMPONENTS
======================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-6 py-4 text-sm text-gray-700">{children}</td>
  );
}
