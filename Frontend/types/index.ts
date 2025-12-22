// Frontend/types/index.ts

export type UserRole = 'customer' | 'seller' | 'admin';
export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | null;

export interface User {
  id: number;
  nickname: string;
  email: string;
  full_name?: string;
  phone?: string;
  profile_image?: string;
  birthday?: string;
  role: UserRole; // ✅ NEW
  seller_status?: SellerStatus; // ✅ NEW
  shop_name?: string; // ✅ NEW
  shop_description?: string; // ✅ NEW
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

// ✅ NEW: Flash Sale Types
export type FlashSaleStatus = 'scheduled' | 'active' | 'ended';

export interface FlashSale {
  id: number;
  name: string;
  product_id: number;
  product?: Product;
  original_price: number;
  flash_price: number;
  discount_percentage: number;
  stock: number;
  max_per_user: number;
  start_at: string;
  end_at: string;
  status: FlashSaleStatus;
  created_at: string;
  updated_at: string;
  // Runtime properties
  isActive?: boolean;
  isUpcoming?: boolean;
  isEnded?: boolean;
  timeLeft?: number;
  timeUntilStart?: number;
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

// ✅ NEW: Seller Dashboard Stats
export interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  seller: {
    name: string;
    status: SellerStatus;
  };
}

// ✅ NEW: Admin Dashboard Stats
export interface AdminStats {
  users: {
    total: number;
    sellers: number;
    pendingSellers: number;
  };
  products: number;
  orders: number;
  revenue: number;
  recentOrders: Order[];
}