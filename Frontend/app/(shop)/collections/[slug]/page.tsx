// app/(shop)/collections/[slug]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductCard } from '@/components/product/ProductCard';
import { productAPI, categoryAPI, cartAPI } from '@/lib/api';
import { Product, Category } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    if (params.slug) {
      fetchCategoryAndProducts();
    }
  }, [params.slug, page, sortBy]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch category by slug
      const categoryRes = await categoryAPI.getBySlug(params.slug as string);
      const categoryData = categoryRes.data?.data;
      
      if (!categoryData) {
        throw new Error('Category not found');
      }
      
      setCategory(categoryData);

      // Fetch products by category
      const productsRes = await productAPI.getAll({
        page,
        limit: 12,
        category_id: categoryData.id,
        sort: sortBy,
      });

      setProducts(productsRes.data?.data || []);
      setTotal(productsRes.data?.total || 0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Kategori tidak ditemukan');
      router.push('/products');
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
        {/* Category Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {category?.name}
          </h1>
          {total > 0 && (
            <p className="text-gray-600">
              {total} produk ditemukan
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
              <option value="latest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="expensive">Termahal</option>
              <option value="cheap">Termurah</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">
              Tidak ada produk dalam kategori ini
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