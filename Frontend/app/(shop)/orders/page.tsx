// app/(shop)/orders/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { orderAPI } from '@/lib/api';
import { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      PENDING: 'warning',
      PAID: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      COMPLETED: 'success',
      CANCELED: 'danger',
    };

    return <Badge variant={variants[status] || 'info'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Belum Ada Pesanan</h2>
          <p className="text-gray-600 mb-6">
            Anda belum memiliki pesanan. Mulai belanja sekarang!
          </p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
          >
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Pesanan Saya</h1>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {formatDate(order.created_at)}
                    </div>
                    <div className="font-semibold">Order #{order.id}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-3 mb-4">
                  {order.items?.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={
                            item.product?.media?.[0]?.url
                              ? `http://localhost:8000${item.product.media[0].url}`
                              : '/placeholder-product.jpg'
                          }
                          alt={item.product_name_snapshot}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium line-clamp-1">
                          {item.product_name_snapshot}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.quantity} x {formatPrice(item.price_snapshot)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.items && order.items.length > 2 && (
                    <div className="text-sm text-gray-600">
                      +{order.items.length - 2} produk lainnya
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-gray-600">Total Belanja</div>
                  <div className="text-xl font-bold text-orange-600">
                    {formatPrice(order.total_amount)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
