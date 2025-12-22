"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, ShoppingCart, ChevronRight } from "lucide-react";
import { flashSaleAPI } from "@/lib/api";

type FlashSale = {
  id: number;
  product_id: number;
  discount_percentage: number;
  flash_price: number;
  original_price: number;
  stock: number;
  end_at: string;
  product?: {
    name: string;
    media?: { url: string }[];
  };
};

export default function FlashSaleSection({
  onAddToCart,
}: {
  onAddToCart?: (product: any) => void;
}) {
  const router = useRouter();

  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [timers, setTimers] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  useEffect(() => {
    if (!flashSales.length) return;

    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [flashSales]);

  const fetchFlashSales = async () => {
    try {
      const res = await flashSaleAPI.getActive();

      if (res.data.status === "success") {
        setFlashSales(res.data.data.slice(0, 6));
      }
    } catch (err) {
      console.error("Failed to fetch flash sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateTimers = () => {
    const now = Date.now();
    const nextTimers: Record<number, any> = {};

    flashSales.forEach((sale) => {
      const distance = new Date(sale.end_at).getTime() - now;

      if (distance > 0) {
        nextTimers[sale.id] = {
          hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((distance / (1000 * 60)) % 60),
          seconds: Math.floor((distance / 1000) % 60),
        };
      }
    });

    setTimers(nextTimers);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  if (loading || flashSales.length === 0) return null;

  const overallTimer = timers[flashSales[0].id];

  return (
    <section className="mb-12">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Zap className="text-orange-500" size={32} />
          <h2 className="text-2xl font-bold">Flash Sale Hari Ini</h2>

          {overallTimer && (
            <div className="flex gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-mono">
              <Clock size={18} />
              {String(overallTimer.hours).padStart(2, "0")}:
              {String(overallTimer.minutes).padStart(2, "0")}:
              {String(overallTimer.seconds).padStart(2, "0")}
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/flash-sale")}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          Lihat Semua <ChevronRight size={18} />
        </button>
      </div>

      {/* ITEMS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {flashSales.map((sale) => (
          <div key={sale.id} className="bg-white rounded-lg shadow">
            <div
              className="aspect-square bg-gray-100 cursor-pointer"
              onClick={() => router.push(`/products/${sale.product_id}`)}
            >
              <img
                src={
                  sale.product?.media?.[0]?.url
                    ? `http://localhost:8000${sale.product.media[0].url}`
                    : "/placeholder-product.jpg"
                }
                className="w-full h-full object-cover"
                alt={sale.product?.name}
              />
            </div>

            <div className="p-4">
              <h3 className="text-sm font-medium line-clamp-2">
                {sale.product?.name}
              </h3>

              <div className="mt-2">
                <div className="text-red-600 font-bold">
                  {formatPrice(sale.flash_price)}
                </div>
                <div className="text-xs line-through text-gray-400">
                  {formatPrice(sale.original_price)}
                </div>
              </div>

              <button
                disabled={sale.stock === 0}
                onClick={() => onAddToCart?.(sale.product)}
                className="mt-3 w-full bg-orange-600 text-white py-2 rounded disabled:bg-gray-300"
              >
                {sale.stock === 0 ? "Habis" : "Beli"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
