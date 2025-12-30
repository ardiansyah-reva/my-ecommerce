"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  TrendingUp,
  Zap,
  Package,
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

  // ================= HERO SLIDER =================
  const heroSlides = [
    "/hero/hero1.jpg",
    "/hero/hero2.jpg",
    "/hero/hero3.jpg",
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  // ================= FLASH SALE TIMER =================
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

  // ================= FETCH PRODUCTS =================
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [featured, latest] = await Promise.all([
        productAPI.getAll({ limit: 8, sort: "expensive" }),
        productAPI.getAll({ limit: 8, sort: "latest" }),
      ]);

      setFeaturedProducts(featured.data.data);
      setNewProducts(latest.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= CART =================
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

      toast.success("Produk ditambahkan ke keranjang");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menambahkan ke keranjang");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HERO ================= */}
      <section className="pt-6 pb-8">
        <div className="container mx-auto px-4">
          <div
            className="relative mx-auto overflow-hidden  bg-gray-900 shadow-xl group"
            style={{ height: "344px", maxWidth: "988px" }}
          >
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  idx === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide}
                  alt={`Hero ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>
            ))}

            {/* PREV */}
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2
                         bg-white/70 hover:bg-white
                         text-gray-800
                         p-1.5
                         rounded-full
                         shadow
                         z-10
                         opacity-0
                         group-hover:opacity-100
                         transition-opacity"
            >
              <ChevronRight size={16} className="rotate-180" />
            </button>

            {/* NEXT */}
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2
                         bg-white/70 hover:bg-white
                         text-gray-800
                         p-1.5
                         rounded-full
                         shadow
                         z-10
                         opacity-0
                         group-hover:opacity-100
                         transition-opacity"
            >
              <ChevronRight size={16} />
            </button>

            {/* DOTS */}
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {heroSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full ${
                    idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, title: "Gratis Ongkir", desc: "Min. belanja 50k" },
            { icon: Zap, title: "Flash Sale", desc: "Setiap hari" },
            { icon: TrendingUp, title: "Cashback", desc: "Hingga 50%" },
            { icon: Package, title: "Garansi", desc: "100% original" },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <f.icon size={32} className="text-blue-600" />
              <div>
                <div className="font-semibold text-sm">{f.title}</div>
                <div className="text-xs text-gray-600">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* FLASH SALE */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">Flash Sale</h2>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span className="font-mono text-lg">
                  {String(timeLeft.hours).padStart(2, "0")}:
                  {String(timeLeft.minutes).padStart(2, "0")}:
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/products?sort=expensive")}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              Lihat Semua <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>

        {/* TERBARU */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Produk Terbaru</h2>
            <button
              onClick={() => router.push("/products?sort=latest")}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              Lihat Semua <ChevronRight />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {newProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
