'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Clock, ShoppingCart, ChevronRight } from 'lucide-react';

/* ================= TYPES ================= */
type FlashSale = {
  id: number;
  product_id: number;
  discount_percentage: number;
  flash_price: number;
  original_price: number;
  stock: number;
  start_at: string;
  end_at: string;
  product?: {
    name: string;
    media?: { url: string }[];
  };
};

type TimerType = {
  type: 'active' | 'upcoming' | 'ended';
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export default function FlashSalePage() {
  const router = useRouter();

  const [activeFlashSales, setActiveFlashSales] = useState<FlashSale[]>([]);
  const [upcomingFlashSales, setUpcomingFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timers, setTimers] = useState<Record<number, TimerType>>({});

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchFlashSales();
  }, []);

  useEffect(() => {
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [activeFlashSales, upcomingFlashSales]);

  const fetchFlashSales = async () => {
    try {
      const [activeRes, upcomingRes] = await Promise.all([
        fetch('http://localhost:8000/api/flash-sales/active'),
        fetch('http://localhost:8000/api/flash-sales/upcoming'),
      ]);

      const activeData = await activeRes.json();
      const upcomingData = await upcomingRes.json();

      if (activeData.status === 'success') {
        setActiveFlashSales(activeData.data);
      }
      if (upcomingData.status === 'success') {
        setUpcomingFlashSales(upcomingData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= TIMER ================= */
  const updateTimers = () => {
    const now = Date.now();
    const newTimers: Record<number, TimerType> = {};

    [...activeFlashSales, ...upcomingFlashSales].forEach((sale) => {
      const start = new Date(sale.start_at).getTime();
      const end = new Date(sale.end_at).getTime();

      const target =
        now < start ? start - now :
        now < end ? end - now : 0;

      if (target <= 0) {
        newTimers[sale.id] = { type: 'ended' };
        return;
      }

      newTimers[sale.id] = {
        type: now < start ? 'upcoming' : 'active',
        hours: Math.floor(target / (1000 * 60 * 60)),
        minutes: Math.floor((target / (1000 * 60)) % 60),
        seconds: Math.floor((target / 1000) % 60),
      };
    });

    setTimers(newTimers);
  };

  /* ================= UTILS ================= */
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    await fetch('http://localhost:8000/api/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    });

    alert('Produk ditambahkan ke keranjang');
  };

  const renderTimer = (id: number) => {
    const timer = timers[id];
    if (!timer || timer.type === 'ended') {
      return <span className="text-red-600 text-sm">Ended</span>;
    }

    return (
      <div className="flex gap-1 bg-red-500 text-white px-2 py-1 rounded text-xs">
        <Clock size={14} />
        {String(timer.hours).padStart(2, '0')}:
        {String(timer.minutes).padStart(2, '0')}:
        {String(timer.seconds).padStart(2, '0')}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Zap className="text-orange-500" /> Flash Sale
      </h1>

      {activeFlashSales.length === 0 && upcomingFlashSales.length === 0 && (
        <div className="text-center py-20">
          <p className="mb-4">Tidak ada flash sale</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Lihat Produk
          </button>
        </div>
      )}
    </div>
  );
}
