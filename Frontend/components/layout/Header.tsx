// components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { categoryAPI } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search/${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white ">
      
      {/* TOP BAR */}
      <div className="text-xs text-gray-400 bg-gray-100">
        <div className="container mx-auto px-4 flex justify-end gap-10 py-1">
          <Link href="/help" className="text-pink-500 hover:text-orange-500">MASUKAN</Link>
          <Link href="/help" className="text-gray-700 hover:text-orange-500">LEBIH MURAH DI APP</Link>
          <Link href="/help" className="text-gray-700 hover:text-orange-500">MENJADI SELLER</Link>
          <Link href="/help" className="hover:text-orange-500">CUSTOMER CARE</Link>
          <Link href="/help" className="hover:text-orange-500">LACAK PESANAN</Link>
          {/* <Link href="/help" className="hover:text-orange-500">CUSTOMER CARE</Link> */}
          <Link href="/login" className="hover:text-orange-500">LOGIN</Link>
          <Link href="/register" className="hover:text-orange-500">DAFTAR</Link>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="container mx-auto px-6 py-3 flex items-center gap-6">
        
        {/* LOGO */}
        <Link href="/" className="text-3xl pr-12 font-bold text-blue-700">
          Lazada
        </Link>

        {/* SEARCH */}
        <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
          <div className="flex">
            <input
              type="text"
              placeholder="Cari di Lazada"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 px-4 py-4 text-sm focus:outline-none"
            />
            <button className="bg-orange-500 px-4 flex items-center justify-center">
              <Search size={18} className="text-white" />
            </button>
          </div>
        </form>

        {/* CART + USER */}
        <div className="flex items-center gap-5">
          
          <Link href="/cart" className="relative">
            <ShoppingCart size={26} className="text-blue-900" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)}>
              <User size={24} className="text-gray-700" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow text-sm">
                {isAuthenticated ? (
                  <>
                    <Link href="/profile" className="block px-4 py-2 hover:bg-gray-100">Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-4 py-2 hover:bg-gray-100">Masuk</Link>
                    <Link href="/register" className="block px-4 py-2 hover:bg-gray-100">Daftar</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="">
        <div className="container mx-auto px-4 flex gap-6 text-sm py-2 text-gray-700">
          <Link href="/products" className="hover:text-blue-600">Semua Produk</Link>

          <div className="relative">
            <button
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              Kategori <ChevronDown size={14} />
            </button>

            {showCategoryMenu && (
              <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => router.push(`/collections/${cat.slug}`)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/flash-sale" className="font-semibold text-blue-600">
            ⚡ Flash Sale
          </Link>
        </div>
      </nav>
    </header>
  );
};
