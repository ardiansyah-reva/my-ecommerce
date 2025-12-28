// app/(shop)/page.tsx - Homepage
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  TrendingUp,
  Zap,
  Package,
  Upload,
  X,
  Clock,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { productAPI, cartAPI } from "@/lib/api";
import { Product } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Hero Slider State
  const DEFAULT_SLIDES = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"];
  const [heroSlides, setHeroSlides] = useState<string[]>(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Flash Sale Countdown State
  const [flashSaleEndTime, setFlashSaleEndTime] = useState<Date>(
    new Date(Date.now() + 3 * 60 * 60 * 1000 + 30 * 60 * 1000) // Default: 3 jam 30 menit dari sekarang
  );
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Auto-slide setiap 4 detik
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Countdown Timer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = flashSaleEndTime.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSaleEndTime]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featured, newItems] = await Promise.all([
        productAPI.getAll({ limit: 8, sort: "expensive" }),
        productAPI.getAll({ limit: 8, sort: "latest" }),
      ]);

      setFeaturedProducts(featured.data.data);
      setNewProducts(newItems.data.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideUpload = (slideIndex: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setHeroSlides((prev) => {
      const newSlides = [...prev];
      newSlides[slideIndex] = url;
      return newSlides;
    });

    toast.success(`Slide ${slideIndex + 1} berhasil diubah!`);
  };

  const resetSlide = (slideIndex: number) => {
    setHeroSlides((prev) => {
      const newSlides = [...prev];
      newSlides[slideIndex] = DEFAULT_SLIDES[slideIndex];
      return newSlides;
    });
    toast.success(`Slide ${slideIndex + 1} dikembalikan ke default`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu");
      router.push("/login");
      return;
    }

    try {
      await cartAPI.addItem({
        product_id: product.id,
        quantity: 1,
      });

      const cartRes = await cartAPI.get();
      setCart(cartRes.data.data);

      toast.success("Produk berhasil ditambahkan ke keranjang");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan ke keranjang"
      );
    }
  };

  // Fungsi untuk custom waktu flash sale
  const setCustomFlashSaleTime = (hours: number, minutes: number) => {
    const newEndTime = new Date(Date.now() + hours * 60 * 60 * 1000 + minutes * 60 * 1000);
    setFlashSaleEndTime(newEndTime);
    toast.success(`Flash sale diatur berakhir dalam ${hours} jam ${minutes} menit`);
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
      {/* Hero Slider */}
      <section className="pt-6 pb-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div 
            className="relative overflow-hidden bg-gray-900 rounded-xl shadow-xl mx-auto" 
            style={{ height: '344px', maxWidth: '988px' }}
          >
            <div className="relative w-full h-full">
              {heroSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    idx === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img
                    src={slide}
                    alt={`Hero slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              ))}

              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all z-10 hover:scale-110"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all z-10 hover:scale-110"
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute top-3 right-3 flex gap-2 z-20">
                {heroSlides.map((slide, idx) => (
                  <div key={idx} className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id={`slideInput-${idx}`}
                      onChange={handleSlideUpload(idx)}
                    />

                    <button
                      onClick={() => document.getElementById(`slideInput-${idx}`)?.click()}
                      className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110"
                    >
                      <Upload size={16} />
                    </button>

                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Slide {idx + 1}
                    </span>

                    {slide !== DEFAULT_SLIDES[idx] && (
                      <button
                        onClick={() => resetSlide(idx)}
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-all hover:scale-110"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package, title: "Gratis Ongkir", desc: "Min. belanja 50k" },
              { icon: Zap, title: "Flash Sale", desc: "Setiap hari jam 12" },
              { icon: TrendingUp, title: "Cashback", desc: "Hingga 50%" },
              { icon: Package, title: "Garansi", desc: "100% original" },
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

      {/* Products Sections */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Flash Sale with Countdown */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                
                <h2 className="text-2xl font-bold">Flash Sale</h2>
              </div>
              
              {/* Countdown Timer */}
              <div className="flex items-center gap-2  text-white px-4 py-2 rounded-lg">
                <Clock size={20} />
                <span className="font-semibold text-black">Berakhir dalam:</span>
                <div className="flex items-center gap-1 font-mono text-lg">
                  <div className="bg-red-500 px-2 py-1 rounded">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </div>
                  <span>:</span>
                  <div className="bg-red-500 px-2 py-1 rounded">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </div>
                  <span>:</span>
                  <div className="bg-red-500 px-2 py-1 rounded">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Custom Time Setter (untuk demo) */}
              <div className="flex gap-2">
                <button
                  onClick={() => setCustomFlashSaleTime(1, 0)}
                  className="text-xs px-3 py-1 rounded"
                  title="Set 1 jam"
                >
                  
                </button>
                <button
                  onClick={() => setCustomFlashSaleTime(3, 30)}
                  className="text-xs  px-3 py-1 rounded"
                  title="Set 3 jam 30 menit"
                >
                  
                </button>
                <button
                  onClick={() => setCustomFlashSaleTime(6, 0)}
                  className="text-xs px-3 py-1 rounded"
                  title="Set 6 jam"
                >
                
                </button>
              </div>
            </div>
            
            <button
              onClick={() => router.push("/products?sort=expensive")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
              onClick={() => router.push("/products?sort=latest")}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
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
  );
}