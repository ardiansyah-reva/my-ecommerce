// app/(shop)/collections/flash-sale/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { productAPI, cartAPI } from '@/lib/api';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function FlashSaleCollectionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('expensive');

  const [flashSaleEndTime] = useState<Date>(
    new Date(Date.now() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000)
  );

  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const distance = flashSaleEndTime.getTime() - Date.now();

      if (distance <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSaleEndTime]);

  useEffect(() => {
    fetchProducts();
  }, [page, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productAPI.getAll({
        page,
        limit: 12,
        sort: sortBy,
      });

      setProducts(response.data?.data || []);
      setTotal(response.data?.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    try {
      await cartAPI.addItem({
        product_id: product.id,
        quantity: 1,
      });

      const cartRes = await cartAPI.get();
      setCart(cartRes.data?.data);

      toast.success('Produk berhasil ditambahkan ke keranjang');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <Zap className="text-orange-500" size={32} />
            <h1 className="text-3xl font-bold">Flash Sale Hari Ini</h1>
            <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-mono">
              <Clock size={18} />
              {String(timeLeft.hours).padStart(2, "0")}:
              {String(timeLeft.minutes).padStart(2, "0")}:
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
          </div>
          {total > 0 && (
            <p className="text-gray-600">
              {total} produk tersedia
            </p>
          )}
        </div>

        {/* Sort Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expensive">Termahal</option>
              <option value="cheap">Termurah</option>
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              Tidak ada produk flash sale
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="px-4 py-2">
                  Page {page} of {Math.ceil(total / 12)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}