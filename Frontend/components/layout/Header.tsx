// components/layout/Header.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, LogOut, Package, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { categoryAPI } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
}

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single hyphen
};

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

 
  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      const cats = response.data.data || [];
      
      // Generate slug for each category if slug is empty
      const categoriesWithSlug = cats.map((cat: Category) => ({
        ...cat,
        slug: cat.slug || generateSlug(cat.name)
      }));
      
      setCategories(categoriesWithSlug);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };
   useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search/${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleCategoryClick = (category: Category) => {
    setShowCategoryMenu(false);
    // Use category ID instead of slug for navigation
    router.push(`/products?category=${category.id}`);
  };

  return (
    <header className="bg-white shadow sticky top-0 z-40 border-b">
      {/* Top Bar */}
      <div className="bg-gray-200 py-1 ">
        <div className="container mx-auto px-4 flex justify-between text-xs  text-gray-700">
          <div className="flex gap-4">
            {/* <Link href="/seller" className="hover:text-amber-400">Menjadi Seller</Link> */}
            <Link href="/help" className="hover:text-amber-400">Customer Care</Link>
          </div>

          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <span>Hi, {user?.nickname}!</span>
                <button onClick={handleLogout} className="hover:text-amber-400">
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
          <Link href="/" className="font-bold px-18 text-2xl  text-blue-800">
            Lazada
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari di Lazada"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=" bg-gray-200 w-full px-4 py-3 pr-12 border border-none focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-amber-500 p-3 "
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
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-lg shadow-md py-2 text-sm z-50">
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
            <Link href="/products" className="hover:text-blue-600 py-1">
              Semua Produk
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center gap-1 hover:text-blue-600 py-1"
              >
                Kategori
                <ChevronDown size={16} />
              </button>
              
              {showCategoryMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
                  {categories.length === 0 ? (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      Tidak ada kategori
                    </div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                      >
                        {category.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Quick Access to Popular Categories */}
            {categories.slice(0, 4).map((category) => (
              <button 
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="hover:text-blue-600 py-1"
              >
                {category.name}
              </button>
            ))}
            
            <Link href="/flash-sale" className="text-blue-600 font-semibold py-1">
              ⚡ Flash Sale
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};