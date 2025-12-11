// app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data.data;

      setAuth(user, token);
      toast.success('Login berhasil!');
      router.push('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
return (
  <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl w-full max-w-md overflow-hidden">

      {/* Header Tanpa ShopHub */}
      <div className="bg-white/10 backdrop-blur-xl p-8 text-center border-b border-white/20">
        <p className="text-white/80 text-sm">Selamat Datang Kembali!</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type="email"
              placeholder="nama@email.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 backdrop-blur-sm border ${
                errors.email ? 'border-red-500' : 'border-white/30'
              } focus:outline-none focus:ring-2 focus:ring-white/50`}
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className={`w-full pl-10 pr-12 py-3 rounded-xl bg-white/10 text-white placeholder-white/60 backdrop-blur-sm border ${
                errors.password ? 'border-red-500' : 'border-white/30'
              } focus:outline-none focus:ring-2 focus:ring-white/50`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between text-sm text-white/80">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 rounded" />
            Ingat Saya
          </label>
          <Link href="/forgot-password" className="text-white font-medium hover:underline">
            Lupa Password?
          </Link>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          className="w-full bg-white text-indigo-600 hover:bg-white/80 font-semibold py-3 rounded-xl"
          size="lg"
        >
          Login
        </Button>

        <div className="text-center text-sm text-white/90">
          Belum punya akun?{" "}
          <Link href="/register" className="text-white font-semibold underline">
            Daftar Sekarang
          </Link>
        </div>
      </form>
    </div>
  </div>
);

}