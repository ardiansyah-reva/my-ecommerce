// import Image from "next/image";

// export default function Home() {
//   return (
//     <h1>tes</h1>
//   );
// }

// app/(shop)/page.tsx - Homepage
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, TrendingUp, Zap, Package } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { productAPI, cartAPI } from '@/lib/api';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featured, newItems] = await Promise.all([
        productAPI.getAll({ limit: 8, sort: 'expensive' }),
        productAPI.getAll({ limit: 8, sort: 'latest' }),
      ]);

      setFeaturedProducts(featured.data.data);
      setNewProducts(newItems.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
      setCart(cartRes.data.data);
      
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
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-4">
                Belanja Lebih Mudah, Harga Lebih Hemat!
              </h1>
              <p className="text-xl mb-6">
                Temukan produk terbaik dengan harga spesial setiap hari
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/products')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Mulai Belanja
                </button>
                <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Lihat Promo
                </button>
              </div>
            </div>
            <div className="relative h-64 md:h-96">
              <img
                src="/hero-shopping.png"
                alt="Shopping"
                className="object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/600x400?text=Shopping+Hero';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, title: 'Gratis Ongkir', desc: 'Min. belanja 50k' },
              { icon: Zap, title: 'Flash Sale', desc: 'Setiap hari jam 12' },
              { icon: TrendingUp, title: 'Cashback', desc: 'Hingga 50%' },
              { icon: Package, title: 'Garansi', desc: '100% original' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4">
                <feature.icon size={32} className="text-blue-600" />
                <div>
                  <div className="font-semibold text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-600">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Flash Sale */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Zap className="text-orange-500" size={32} fill="currentColor" />
              <h2 className="text-2xl font-bold">Flash Sale Hari Ini</h2>
            </div>
            <button
              onClick={() => router.push('/products?sort=expensive')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Produk Terbaru</h2>
            <button
              onClick={() => router.push('/products?sort=latest')}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
)};