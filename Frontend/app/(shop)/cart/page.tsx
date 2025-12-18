// app/(shop)/cart/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cartAPI } from '@/lib/api';
import { Cart, CartItem } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { setCart, totalPrice } = useCartStore();
  const [cart, setLocalCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      const cartData = response.data.data;
      setLocalCart(cartData);
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    if (item.product && newQuantity > item.product.stock) {
      toast.error(`Stok hanya tersedia ${item.product.stock} item`);
      return;
    }

    setUpdating(item.id);
    try {
      await cartAPI.updateItem(item.id, { quantity: newQuantity });
      await fetchCart();
      toast.success('Jumlah berhasil diupdate');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal update jumlah');
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!confirm('Hapus item dari keranjang?')) return;

    try {
      await cartAPI.removeItem(itemId);
      setSelectedItems(selectedItems.filter(id => id !== itemId));
      await fetchCart();
      toast.success('Item berhasil dihapus');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus item');
    }
  };

  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (!cart?.items) return;
    
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map(item => item.id));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateSubtotal = (item: CartItem) => {
    return (item.product?.price || 0) * item.quantity;
  };

  const calculateSelectedTotal = () => {
    if (!cart?.items) return 0;
    return cart.items
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih minimal 1 produk untuk checkout');
      return;
    }
    
    // Simpan selected items ke localStorage untuk digunakan di checkout
    const selectedCartItems = cart?.items?.filter(item => 
      selectedItems.includes(item.id)
    );
    localStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems));
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-6">
            Belum ada produk di keranjang belanja Anda
          </p>
          <Button onClick={() => router.push('/products')}>
            Mulai Belanja
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            <div className="bg-white rounded-lg shadow p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === cart.items.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="font-semibold">
                  Pilih Semua ({cart.items.length} Produk)
                </span>
              </label>
            </div>

            {/* Cart Items */}
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 flex gap-4"
              >
                {/* Checkbox */}
                <div className="flex items-start pt-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>

                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={
                      item.product?.media?.[0]?.url
                        ? `http://localhost:8000${item.product.media[0].url}`
                        : '/placeholder-product.jpg'
                    }
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {item.product?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.product?.brand?.name}
                  </p>
                  <div className="text-orange-600 font-bold text-lg">
                    {formatPrice(item.product?.price || 0)}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex flex-col items-end gap-4">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>

                  <div className="flex items-center gap-2 border rounded-lg">
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                      disabled={updating === item.id || item.quantity <= 1}
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                      disabled={
                        updating === item.id ||
                        (item.product && item.quantity >= item.product.stock)
                      }
                      className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600">Subtotal</div>
                    <div className="font-bold text-lg">
                      {formatPrice(calculateSubtotal(item))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Ringkasan Belanja</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Total ({selectedItems.length} item dipilih)
                  </span>
                  <span className="font-semibold">
                    {formatPrice(calculateSelectedTotal())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkir</span>
                  <span className="font-semibold text-green-600">GRATIS</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-orange-600 text-xl">
                    {formatPrice(calculateSelectedTotal())}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={selectedItems.length === 0}
                className="w-full"
                size="lg"
              >
                Checkout ({selectedItems.length})
              </Button>

              <button
                onClick={() => router.push('/products')}
                className="w-full mt-3 text-blue-600 hover:text-blue-700 text-center"
              >
                Lanjut Belanja
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}