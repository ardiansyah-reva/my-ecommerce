// lib/api.ts
import api from './axios';

/* ================= AUTH ================= */
export const authAPI = {
  register: (data: { nickname: string; email: string; password: string }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  me: () => api.get('/auth/me'),

  logout: () => api.post('/auth/logout'),
};

/* ================= CATEGORY ================= */
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
  getById: (id: string | number) => api.get(`/categories/${id}`),
};

/* ================= PRODUCT ================= */
export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: string | number) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string | number, data: any) =>
    api.put(`/products/${id}`, data),
  delete: (id: string | number) =>
    api.delete(`/products/${id}`),
};

/* ================= CART ================= */
export const cartAPI = {
  get: () => api.get('/cart'),

  addItem: (data: { product_id: number; quantity: number }) =>
    api.post('/cart/items', data),

  updateItem: (id: string | number, data: { quantity: number }) =>
    api.put(`/cart/items/${id}`, data),

  removeItem: (id: string | number) =>
    api.delete(`/cart/items/${id}`),
};

/* ================= ORDER ================= */
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: string | number) =>
    api.get(`/orders/${id}`),
  create: (data: any) =>
    api.post('/orders', data),
  updateStatus: (id: string | number, status: string) =>
    api.put(`/orders/${id}`, { status }),
  cancel: (id: string | number) =>
    api.delete(`/orders/${id}`),
};

/* ================= PAYMENT ================= */
export const paymentAPI = {
  getAll: () => api.get('/payment'),
  getById: (id: string | number) =>
    api.get(`/payment/${id}`),
  create: (data: any) =>
    api.post('/payment', data),
};

/* ================= USER ================= */
export const userAPI = {
  getProfile: () => api.get('/users'),
  update: (id: string | number, data: any) =>
    api.put(`/users/${id}`, data),
};

/* ================= FLASH SALE ================= */
export const flashSaleAPI = {
  getActive: () => api.get('/flash-sales/active'),
  getUpcoming: () => api.get('/flash-sales/upcoming'),
  getById: (id: string | number) =>
    api.get(`/flash-sales/${id}`),

  // Admin
  getAll: (params?: any) =>
    api.get('/flash-sales', { params }),
  create: (data: any) =>
    api.post('/flash-sales', data),
  update: (id: string | number, data: any) =>
    api.put(`/flash-sales/${id}`, data),
  delete: (id: string | number) =>
    api.delete(`/flash-sales/${id}`),
};

/* ================= ADMIN ================= */
export const adminAPI = {
  getDashboardStats: () =>
    api.get('/admin/dashboard/stats'),

  getAllUsers: (params?: any) =>
    api.get('/admin/users', { params }),
  getUserById: (id: string | number) =>
    api.get(`/admin/users/${id}`),

  updateUserRole: (id: string | number, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),

  approveSellerStatus: (id: string | number, status: string) =>
    api.put(`/admin/users/${id}/seller-status`, { status }),

  deleteUser: (id: string | number) =>
    api.delete(`/admin/users/${id}`),

  getAllProducts: (params?: any) =>
    api.get('/admin/products', { params }),

  deleteProduct: (id: string | number) =>
    api.delete(`/admin/products/${id}`),

  getAllOrders: (params?: any) =>
    api.get('/admin/orders', { params }),

  updateOrderStatus: (id: string | number, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
};

/* ================= SELLER ================= */
export const sellerAPI = {
  getProfile: () =>
    api.get('/seller/profile'),

  updateProfile: (data: any) =>
    api.put('/seller/profile', data),

  getMyProducts: (params?: any) =>
    api.get('/seller/products', { params }),

  createProduct: (data: any) =>
    api.post('/seller/products', data),

  updateProduct: (id: string | number, data: any) =>
    api.put(`/seller/products/${id}`, data),

  deleteProduct: (id: string | number) =>
    api.delete(`/seller/products/${id}`),

  getMyOrders: (params?: any) =>
    api.get('/seller/orders', { params }),

  getOrderById: (id: string | number) =>
    api.get(`/seller/orders/${id}`),

  getDashboardStats: () =>
    api.get('/seller/dashboard/stats'),
};
