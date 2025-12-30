// app/(shop)/products/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { productAPI, cartAPI, categoryAPI } from '@/lib/api';
import { Product, Category } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'latest',
    category_id: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters, page]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
        ...filters,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (params[key] === '') delete params[key];
      });

      const response = await productAPI.getAll(params);
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            Semua Produk
            {total > 0 && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({total} produk)
              </span>
            )}
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Cari produk..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="expensive">Termahal</option>
                <option value="cheap">Termurah</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Tidak ada produk ditemukan</p>
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