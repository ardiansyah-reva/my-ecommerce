// app/(shop)/layout.tsx
'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { cartAPI } from '@/lib/api';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get();
      setCart(response.data.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">ShopHub</h3>
              <p className="text-gray-400 text-sm">
                Platform belanja online terpercaya dengan produk berkualitas dan harga terbaik.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Kategori</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/products?category=1">Laptop</a></li>
                <li><a href="/products?category=2">Smartphone</a></li>
                <li><a href="/products?category=3">Gaming</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Bantuan</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/help">Pusat Bantuan</a></li>
                <li><a href="/contact">Hubungi Kami</a></li>
                <li><a href="/terms">Syarat & Ketentuan</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Ikuti Kami</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white">FB</a>
                <a href="#" className="text-gray-400 hover:text-white">IG</a>
                <a href="#" className="text-gray-400 hover:text-white">TW</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 ShopHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
