'use client';

import { useState, useEffect } from 'react';
import { Zap, Plus, Edit, Trash2, Calendar, DollarSign, Package, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  media?: { url: string }[];
}

interface FlashSale {
  id: number;
  name: string;
  product_id: number;
  original_price: number;
  flash_price: number;
  discount_percentage: number;
  stock: number;
  max_per_user: number;
  start_at: string;
  end_at: string;
  status: 'scheduled' | 'active' | 'ended';
  product?: Product;
}

export default function AdminFlashSalePage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    product_id: '',
    flash_price: '',
    discount_percentage: '',
    stock: '',
    max_per_user: '1',
    start_at: '',
    end_at: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');

      const [salesRes, productsRes] = await Promise.all([
        fetch('http://localhost:8000/api/flash-sales?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/products?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const salesData = await salesRes.json();
      const productsData = await productsRes.json();

      if (salesData.status === 'success') {
        setFlashSales(salesData.data);
      }

      if (productsData.status === 'success') {
        setProducts(productsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === Number(productId));
    if (product) {
      setFormData({
        ...formData,
        product_id: productId,
      });
    }
  };

  const calculateDiscount = (original: number, flash: number) => {
    if (!original || !flash) return 0;
    return Math.round(((original - flash) / original) * 100);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.product_id || !formData.flash_price || !formData.stock) {
      toast.error('Semua field wajib diisi');
      return;
    }

    const product = products.find(p => p.id === Number(formData.product_id));
    if (!product) {
      toast.error('Produk tidak ditemukan');
      return;
    }

    const discount = calculateDiscount(product.price, Number(formData.flash_price));

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:8000/api/flash-sales/${editingId}`
        : 'http://localhost:8000/api/flash-sales';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          product_id: Number(formData.product_id),
          flash_price: Number(formData.flash_price),
          discount_percentage: discount,
          stock: Number(formData.stock),
          max_per_user: Number(formData.max_per_user),
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success(editingId ? 'Flash sale berhasil diupdate' : 'Flash sale berhasil dibuat');
        setShowModal(false);
        setEditingId(null);
        resetForm();
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menyimpan flash sale');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Gagal menyimpan flash sale');
    }
  };

  const handleEdit = (sale: FlashSale) => {
    setEditingId(sale.id);
    setFormData({
      name: sale.name,
      product_id: String(sale.product_id),
      flash_price: String(sale.flash_price),
      discount_percentage: String(sale.discount_percentage),
      stock: String(sale.stock),
      max_per_user: String(sale.max_per_user),
      start_at: new Date(sale.start_at).toISOString().slice(0, 16),
      end_at: new Date(sale.end_at).toISOString().slice(0, 16),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus flash sale ini?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/flash-sales/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success('Flash sale berhasil dihapus');
        fetchData();
      } else {
        toast.error('Gagal menghapus flash sale');
      }
    } catch (error) {
      toast.error('Gagal menghapus flash sale');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      product_id: '',
      flash_price: '',
      discount_percentage: '',
      stock: '',
      max_per_user: '1',
      start_at: '',
      end_at: '',
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusBadge = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const selectedProduct = products.find(p => p.id === Number(formData.product_id));
  const calculatedDiscount = selectedProduct 
    ? calculateDiscount(selectedProduct.price, Number(formData.flash_price))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="text-orange-500" size={32} />
            <div>
              <h1 className="text-3xl font-bold">Flash Sale Management</h1>
              <p className="text-gray-600 mt-1">Kelola promo flash sale</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setEditingId(null);
              resetForm();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus size={20} />
            Buat Flash Sale
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {flashSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Belum ada flash sale
                  </td>
                </tr>
              ) : (
                flashSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            sale.product?.media?.[0]?.url
                              ? `http://localhost:8000${sale.product.media[0].url}`
                              : '/placeholder-product.jpg'
                          }
                          alt={sale.product?.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <div className="font-medium">{sale.name}</div>
                          <div className="text-sm text-gray-500">{sale.product?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-orange-600 font-bold">{formatPrice(sale.flash_price)}</div>
                      <div className="text-sm line-through text-gray-400">{formatPrice(sale.original_price)}</div>
                      <div className="text-xs text-green-600">{sale.discount_percentage}% OFF</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{formatDate(sale.start_at)}</div>
                      <div className="text-gray-500">{formatDate(sale.end_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{sale.stock} unit</div>
                      <div className="text-gray-500">Max: {sale.max_per_user}/user</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(sale)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sale.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {editingId ? 'Edit Flash Sale' : 'Buat Flash Sale Baru'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingId(null); }}>
                  <X size={24} className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Flash Sale *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Flash Sale Laptop Gaming"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Produk *
                  </label>
                  <select
                    value={formData.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {formatPrice(product.price)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600">Harga Normal:</div>
                    <div className="text-lg font-bold">{formatPrice(selectedProduct.price)}</div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Harga Flash Sale (Rp) *
                    </label>
                    <input
                      type="number"
                      value={formData.flash_price}
                      onChange={(e) => setFormData({ ...formData, flash_price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diskon (Auto)
                    </label>
                    <div className="px-4 py-2 border rounded-lg bg-gray-50 text-green-600 font-bold">
                      {calculatedDiscount}% OFF
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stok Flash Sale *
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Per User
                    </label>
                    <input
                      type="number"
                      value={formData.max_per_user}
                      onChange={(e) => setFormData({ ...formData, max_per_user: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mulai *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.start_at}
                      onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Berakhir *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.end_at}
                      onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => { setShowModal(false); setEditingId(null); }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    {editingId ? 'Update' : 'Buat'} Flash Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}