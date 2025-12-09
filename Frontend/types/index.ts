// types/index.ts

export interface User {
  id: number;
  nickname: string;
  email: string;
  full_name?: string;
  phone?: string;
  profile_image?: string;
  birthday?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface ProductMedia {
  id: number;
  product_id: number;
  media_type: string;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  rating?: number;
  category_id?: number;
  brand_id?: number;
  category?: Category;
  brand?: Brand;
  media?: ProductMedia[];
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: number;
  user_id: number;
  created_at: string;
  items?: CartItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name_snapshot: string;
  price_snapshot: number;
  quantity: number;
  product?: Product;
}

export type OrderStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELED';

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_cost: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  payment?: Payment;
  shipment?: Shipment;
  user?: User;
}

export interface Payment {
  id: number;
  order_id: number;
  provider: string;
  status: string;
  transaction_id: string;
  amount: number;
  paid_at: string;
}

export interface Shipment {
  id: number;
  order_id: number;
  courier: string;
  tracking_number: string;
  status: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  status: 'success' | 'error';
  message: string;
  data?: T;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  sort?: 'latest' | 'oldest' | 'expensive' | 'cheap';
}