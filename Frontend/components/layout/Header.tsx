// components/layout/Header.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, LogOut, Package } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow sticky top-0 z-40 border-b">
  {/* Top Bar */}
  <div className="bg-gray-100 py-1 border-b">
    <div className="container mx-auto px-4 flex justify-between text-xs text-gray-700">
      <div className="flex gap-4">
        <Link href="/seller" className="hover:text-blue-600">Menjadi Seller</Link>
        <Link href="/help" className="hover:text-blue-600">Customer Care</Link>
      </div>

      <div className="flex gap-4">
        {isAuthenticated ? (
          <>
            <span>Hi, {user?.nickname}!</span>
            <button onClick={handleLogout} className="hover:text-blue-600">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/register" className="hover:text-blue-600">Daftar</Link>
            <Link href="/login" className="hover:text-blue-600">Login</Link>
          </>
        )}
      </div>
    </div>
  </div>

  {/* Main Header */}
  <div className="container mx-auto px-4 py-3">
    <div className="flex items-center gap-6">
      
      {/* Logo */}
      <Link href="/" className="font-bold text-2xl text-blue-600">
        Lazada
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <Search size={20} className="text-gray-600" />
          </button>
        </div>
      </form>

      {/* Cart & User */}
      <div className="flex items-center gap-4">
        
        {/* Cart */}
        <Link href="/cart" className="relative">
          <ShoppingCart size={26} className="text-gray-700 hover:text-blue-600" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <User size={26} className="text-gray-700" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md py-2 text-sm">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Pesanan Saya
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>

  {/* Navigation */}
  <nav className="border-t bg-white">
    <div className="container mx-auto px-4">
      <div className="flex gap-6 py-2 text-sm text-gray-700">
        <Link href="/products" className="hover:text-blue-600">
          Semua Produk
        </Link>
        <Link href="/collections/llug=1" className="hover:text-blue-600">
          Laptop
        </Link>
        <Link href="/products?category=2" className="hover:text-blue-600">
          Smartphone
        </Link>
        <Link href="/products?category=3" className="hover:text-blue-600">
          Gaming Gear
        </Link>
        <Link href="/flash-sale" className="text-blue-600 font-semibold">
          ⚡ Flash Sale
        </Link>
      </div>
    </div>
  </nav>
</header>

  );
};