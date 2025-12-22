'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Clock,
} from 'lucide-react';

/* =======================
   TYPES
======================= */

interface UserStats {
  total: number;
  sellers: number;
  pendingSellers: number;
}

interface OrderUser {
  nickname?: string;
  email?: string;
}

interface Order {
  id: number;
  status: string;
  created_at: string;
  total_amount: number;
  user?: OrderUser;
}

interface DashboardStats {
  users: UserStats;
  products: number;
  orders: number;
  revenue: number;
  recentOrders: Order[];
}

/* =======================
   COMPONENT
======================= */

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, sellers: 0, pendingSellers: 0 },
    products: 0,
    orders: 0,
    revenue: 0,
    recentOrders: [],
  });

  const [loading, setLoading] = useState(true);

  /* =======================
     FETCH DATA
  ======================= */

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:8000/api/admin/dashboard/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELED: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          colors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status}
      </span>
    );
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Kelola platform bursa</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.users.total}
            subtitle={`${stats.users.sellers} Sellers`}
            icon={<Users size={24} className="text-blue-600" />}
            color="blue"
          />

          <StatCard
            title="Total Products"
            value={stats.products}
            icon={<Package size={24} className="text-purple-600" />}
            color="purple"
          />

          <StatCard
            title="Total Orders"
            value={stats.orders}
            icon={<ShoppingCart size={24} className="text-orange-600" />}
            color="orange"
          />

          <StatCard
            title="Total Revenue"
            value={formatPrice(stats.revenue)}
            icon={<DollarSign size={24} className="text-green-600" />}
            color="green"
          />
        </div>

        {/* Pending Sellers */}
        {stats.users.pendingSellers > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Clock size={20} className="text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">
                {stats.users.pendingSellers} Seller Pending Approval
              </p>
              <p className="text-sm text-yellow-700">
                Ada seller yang menunggu persetujuan Anda
              </p>
            </div>
            <a
              href="/admin/users?status=pending"
              className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Review Now
            </a>
          </div>
        )}

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No recent orders
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <Td>#{order.id}</Td>
                    <Td>
                      <div>{order.user?.nickname || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">
                        {order.user?.email || '-'}
                      </div>
                    </Td>
                    <Td>{formatDate(order.created_at)}</Td>
                    <Td>{formatPrice(order.total_amount)}</Td>
                    <Td>{getStatusBadge(order.status)}</Td>
                    <Td>
                      <a
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-sm mt-1 text-blue-600">{subtitle}</p>}
      </div>
      <div className={`bg-${color}-100 p-3 rounded-full`}>
        {icon}
      </div>
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
    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
      {children}
    </td>
  );
}
