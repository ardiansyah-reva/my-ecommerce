// app/(shop)/products/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ShoppingCart, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { productAPI, cartAPI } from '@/lib/api';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(params.id as string);
      setProduct(response.data.data);
    } catch (error) {
      toast.error('Produk tidak ditemukan');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    if (!product) return;

    try {
      await cartAPI.addItem({
        product_id: product.id,
        quantity,
      });

      const cartRes = await cartAPI.get();
      setCart(cartRes.data.data);

      toast.success('Produk berhasil ditambahkan ke keranjang');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/cart');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.media?.map((m) => `http://localhost:8000${m.url}`) || [
    '/placeholder-product.jpg',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === idx ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={16} fill="currentColor" className="text-yellow-500" />
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-gray-600">(120 ulasan)</span>
                    </div>
                  )}
                  <span className="text-gray-600">
                    Terjual {Math.floor(Math.random() * 500)}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">
                  {formatPrice(product.price)}
                </div>
                {product.brand && (
                  <div className="text-gray-600 mt-1">Brand: {product.brand.name}</div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-gray-600">
                  {product.description || 'Tidak ada deskripsi'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Stok</h3>
                {product.stock > 0 ? (
                  <Badge variant="success">{product.stock} tersedia</Badge>
                ) : (
                  <Badge variant="danger">Habis</Badge>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Jumlah</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-2 border rounded-lg font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  variant="outline"
                  className="flex-1"
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Tambah ke Keranjang
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1"
                >
                  Beli Sekarang
                </Button>
              </div>

              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100">
                  <Heart size={20} />
                  Wishlist
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100">
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}