// app/(shop)/orders/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Package,
  Truck,
  CheckCircle,
  CreditCard,
  MapPin,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { orderAPI } from '@/lib/api';
import { Order } from '@/types';
import { toast } from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      console.log("Fetching order:", params.id);
      const response = await orderAPI.getById(params.id as string);
      console.log("Order data:", response.data);
      setOrder(response.data.data);
    } catch (error: any) {
      console.error("Fetch order error:", error);
      toast.error(error.response?.data?.message || 'Pesanan tidak ditemukan');
      router.push('/orders');
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
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: 'PENDING', label: 'Pesanan Dibuat', icon: Package },
      { key: 'PAID', label: 'Pembayaran Dikonfirmasi', icon: CreditCard },
      { key: 'SHIPPED', label: 'Sedang Dikirim', icon: Truck },
      { key: 'DELIVERED', label: 'Pesanan Tiba', icon: CheckCircle },
      { key: 'COMPLETED', label: 'Selesai', icon: CheckCircle },
    ];

    const statusOrder = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(currentStatus);

    return steps.map((step, idx) => ({
      ...step,
      isActive: idx <= currentIndex,
      isCurrent: statusOrder[idx] === currentStatus,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
          <Button onClick={() => router.push('/orders')}>
            Kembali ke Daftar Pesanan
          </Button>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order #{order.id}</h1>
                <div className="text-sm text-gray-600">
                  Dibuat pada {formatDate(order.created_at)}
                </div>
              </div>
              {getStatusBadge(order.status)}
            </div>

            {/* Status Timeline */}
            {order.status !== 'CANCELED' && (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {statusSteps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="relative flex items-center gap-4">
                        <div
                          className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                            step.isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className={step.isActive ? 'text-gray-900' : 'text-gray-400'}>
                          <div className="font-medium">{step.label}</div>
                          {step.isCurrent && (
                            <div className="text-sm text-gray-600">Saat ini</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {order.status === 'CANCELED' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-red-600 font-semibold">Pesanan Dibatalkan</p>
              </div>
            )}
          </div>

          {/* Shipment Info */}
          {order.shipment && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Truck size={20} />
                Informasi Pengiriman
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Kurir</span>
                  <span className="font-semibold">{order.shipment.courier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No. Resi</span>
                  <span className="font-semibold">{order.shipment.tracking_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold">{order.shipment.status}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          {order.payment && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Informasi Pembayaran
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Metode</span>
                  <span className="font-semibold">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider</span>
                  <span className="font-semibold">{order.payment.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant={
                      order.payment.status === 'success' ? 'success' : 'warning'
                    }
                  >
                    {order.payment.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Produk Pesanan</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                    <div className="font-semibold mb-1">{item.product_name_snapshot}</div>
                    <div className="text-sm text-gray-600">
                      {item.quantity} x {formatPrice(item.price_snapshot)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {formatPrice(item.price_snapshot * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">
                  {formatPrice(order.total_amount - order.shipping_cost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ongkir</span>
                <span className="font-semibold">
                  {order.shipping_cost === 0
                    ? 'GRATIS'
                    : formatPrice(order.shipping_cost)}
                </span>
              </div>
              <div className="flex justify-between text-lg pt-2 border-t">
                <span className="font-bold">Total</span>
                <span className="font-bold text-orange-600">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={() => router.push('/orders')}
              variant="outline"
              className="flex-1"
            >
              Kembali ke Daftar Pesanan
            </Button>
            {order.status === 'DELIVERED' && (
              <Button className="flex-1">Pesanan Selesai</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}