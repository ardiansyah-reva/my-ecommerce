
// app/(shop)/checkout/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cartAPI, orderAPI } from '@/lib/api';
import { Cart } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [courier, setCourier] = useState('JNE');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      const cartData = response.data.data;
      
      if (!cartData.items || cartData.items.length === 0) {
        toast.error('Keranjang kosong');
        router.push('/cart');
        return;
      }
      
      setCart(cartData);
    } catch (error) {
      toast.error('Gagal memuat keranjang');
      router.push('/cart');
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

  const calculateTotal = () => {
    return cart?.items?.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    ) || 0;
  };

  const shippingCost = 0; // Free shipping

  const handlePlaceOrder = async () => {
    if (!cart || !cart.items) return;

    setProcessing(true);
    try {
      const orderData = {
        items: cart.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        paymentData: {
          method: paymentMethod,
          provider: paymentMethod,
        },
        shipmentData: {
          courier: courier,
          shipping_cost: shippingCost,
        },
      };

      const response = await orderAPI.create(orderData);
      const orderId = response.data.data.order.id;

      clearCart();
      toast.success('Pesanan berhasil dibuat!');
      router.push(`/orders/${orderId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold">Alamat Pengiriman</h2>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Alamat Utama</p>
                <p className="text-gray-600 mt-1">
                  Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12345
                </p>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold">Metode Pengiriman</h2>
              </div>
              <div className="space-y-3">
                {['JNE', 'JNT', 'SiCepat'].map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="courier"
                      value={c}
                      checked={courier === c}
                      onChange={(e) => setCourier(e.target.value)}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{c} Reguler</div>
                      <div className="text-sm text-gray-600">2-3 hari</div>
                    </div>
                    <div className="text-green-600 font-semibold">GRATIS</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold">Metode Pembayaran</h2>
              </div>
              <div className="space-y-3">
                {[
                  { value: 'bank_transfer', label: 'Transfer Bank' },
                  { value: 'ewallet', label: 'E-Wallet' },
                  { value: 'cod', label: 'Bayar di Tempat (COD)' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>

              <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
                {cart?.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.product?.name} x{item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatPrice((item.product?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(calculateTotal())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkir</span>
                  <span className="font-semibold text-green-600">GRATIS</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total Bayar</span>
                  <span className="font-bold text-orange-600 text-xl">
                    {formatPrice(calculateTotal() + shippingCost)}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePlaceOrder}
                isLoading={processing}
                className="w-full"
                size="lg"
              >
                Buat Pesanan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}