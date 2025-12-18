// app/(shop)/checkout/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, MapPin, Building2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cartAPI, orderAPI } from '@/lib/api';
import { Cart, CartItem } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

const BANKS = [
  { id: 'bca', name: 'Bank BCA', logo: '🏦' },
  { id: 'mandiri', name: 'Bank Mandiri', logo: '🏦' },
  { id: 'bni', name: 'Bank BNI', logo: '🏦' },
  { id: 'bri', name: 'Bank BRI', logo: '🏦' },
  { id: 'seabank', name: 'SeaBank', logo: '🏦' },
  { id: 'permata', name: 'Bank Permata', logo: '🏦' },
  { id: 'cimb', name: 'Bank CIMB Niaga', logo: '🏦' },
];

const EWALLETS = [
  { id: 'gopay', name: 'GoPay', logo: '💚' },
  { id: 'ovo', name: 'OVO', logo: '💜' },
  { id: 'dana', name: 'DANA', logo: '💙' },
  { id: 'shopeepay', name: 'ShopeePay', logo: '🧡' },
  { id: 'linkaja', name: 'LinkAja', logo: '❤️' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [cart, setCart] = useState<Cart | null>(null);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [selectedBank, setSelectedBank] = useState('bca');
  const [selectedEwallet, setSelectedEwallet] = useState('gopay');
  const [courier, setCourier] = useState('JNE');

  useEffect(() => {
    fetchCart();
    loadCheckoutItems();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data.data);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCheckoutItems = () => {
    const items = localStorage.getItem('checkoutItems');
    if (items) {
      const parsedItems = JSON.parse(items);
      setCheckoutItems(parsedItems);
      
      if (parsedItems.length === 0) {
        toast.error('Tidak ada produk dipilih');
        router.push('/cart');
      }
    } else {
      toast.error('Tidak ada produk dipilih');
      router.push('/cart');
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
    return checkoutItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
  };

  const shippingCost = 0;

  const handlePlaceOrder = async () => {
    if (checkoutItems.length === 0) {
      toast.error('Tidak ada produk dipilih');
      return;
    }

    setProcessing(true);
    try {
      let paymentProvider = paymentMethod;
      
      // Set provider berdasarkan pilihan
      if (paymentMethod === 'bank_transfer') {
        paymentProvider = selectedBank;
      } else if (paymentMethod === 'ewallet') {
        paymentProvider = selectedEwallet;
      }

      const orderData = {
        items: checkoutItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        paymentData: {
          method: paymentMethod,
          provider: paymentProvider,
        },
        shipmentData: {
          courier: courier,
          shipping_cost: shippingCost,
          tracking_number: `TRK-${Date.now()}`
        },
      };

      console.log("Sending order data:", orderData);

      const response = await orderAPI.create(orderData);
      
      if (response.data.status === 'success') {
        const orderId = response.data.data.order.id;

        // Clear selected items dari localStorage
        localStorage.removeItem('checkoutItems');

        // Hapus item yang sudah dicheckout dari cart
        for (const item of checkoutItems) {
          try {
            await cartAPI.removeItem(item.id);
          } catch (e) {
            console.log("Item already removed");
          }
        }

        toast.success('Pesanan berhasil dibuat!');
        
        setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 500);
      }
    } catch (error: any) {
      console.error("Create order error:", error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Gagal membuat pesanan';
      
      toast.error(errorMessage);
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

  if (checkoutItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">Tidak Ada Produk Dipilih</h2>
          <p className="text-gray-600 mb-6">
            Silakan pilih produk dari keranjang terlebih dahulu
          </p>
          <Button onClick={() => router.push('/cart')}>
            Kembali ke Keranjang
          </Button>
        </div>
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
              
              <div className="space-y-4">
                {/* Bank Transfer */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <Building2 size={20} className="text-blue-600" />
                    <span className="font-medium">Transfer Bank</span>
                  </label>
                  
                  {paymentMethod === 'bank_transfer' && (
                    <div className="mt-4 ml-7 grid grid-cols-2 gap-2">
                      {BANKS.map((bank) => (
                        <label
                          key={bank.id}
                          className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedBank === bank.id ? 'border-blue-600 bg-blue-50' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="bank"
                            value={bank.id}
                            checked={selectedBank === bank.id}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-2xl">{bank.logo}</span>
                          <span className="text-sm font-medium">{bank.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* E-Wallet */}
                <div className="border rounded-lg p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="ewallet"
                      checked={paymentMethod === 'ewallet'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4"
                    />
                    <Wallet size={20} className="text-blue-600" />
                    <span className="font-medium">E-Wallet</span>
                  </label>
                  
                  {paymentMethod === 'ewallet' && (
                    <div className="mt-4 ml-7 grid grid-cols-2 gap-2">
                      {EWALLETS.map((ewallet) => (
                        <label
                          key={ewallet.id}
                          className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedEwallet === ewallet.id ? 'border-blue-600 bg-blue-50' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name="ewallet"
                            value={ewallet.id}
                            checked={selectedEwallet === ewallet.id}
                            onChange={(e) => setSelectedEwallet(e.target.value)}
                            className="w-4 h-4"
                          />
                          <span className="text-2xl">{ewallet.logo}</span>
                          <span className="text-sm font-medium">{ewallet.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* COD */}
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium">Bayar di Tempat (COD)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>

              <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
                {checkoutItems.map((item) => (
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
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? 'Memproses...' : 'Buat Pesanan'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}