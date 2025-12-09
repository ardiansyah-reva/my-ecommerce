// lib/api.ts - API Service Layer
import api from './axios';

export const authAPI = {
  register: (data: { nickname: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  me: () => api.get('/auth/me'),
  
  logout: () => api.post('/auth/logout'),
};

export const productAPI = {
  getAll: (params?: any) => api.get('/products', { params }),
  
  getById: (id: string | number) => api.get(`/products/${id}`),
  
  create: (data: any) => api.post('/products', data),
  
  update: (id: string | number, data: any) =>
    api.put(`/products/${id}`, data),
  
  delete: (id: string | number) => api.delete(`/products/${id}`),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  
  addItem: (data: { product_id: number; quantity: number }) =>
    api.post('/cart/items', data),
  
  updateItem: (id: string | number, data: { quantity: number }) =>
    api.put(`/cart/items/${id}`, data),
  
  removeItem: (id: string | number) => api.delete(`/cart/items/${id}`),
};

export const orderAPI = {
  getAll: () => api.get('/orders'),
  
  getById: (id: string | number) => api.get(`/orders/${id}`),
  
  create: (data: any) => api.post('/orders', data),
  
  updateStatus: (id: string | number, status: string) =>
    api.put(`/orders/${id}`, { status }),
};

export const paymentAPI = {
  getAll: () => api.get('/payment'),
  
  getById: (id: string | number) => api.get(`/payment/${id}`),
  
  create: (data: any) => api.post('/payment', data),
};

export const userAPI = {
  getProfile: () => api.get('/users'),
  
  update: (id: string | number, data: any) =>
    api.put(`/users/${id}`, data),
};
