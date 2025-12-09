// store/cartStore.ts
import { create } from 'zustand';
import { Cart, CartItem, Product } from '@/types';

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: [],
  totalItems: 0,
  totalPrice: 0,
  
  setCart: (cart) => {
    set({ cart, items: cart.items || [] });
    get().calculateTotals();
  },
  
  addItem: (item) => {
    const items = [...get().items];
    const existingIndex = items.findIndex(
      (i) => i.product_id === item.product_id
    );
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity;
    } else {
      items.push(item);
    }
    
    set({ items });
    get().calculateTotals();
  },
  
  updateItem: (id, quantity) => {
    const items = get().items.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    set({ items });
    get().calculateTotals();
  },
  
  removeItem: (id) => {
    const items = get().items.filter((item) => item.id !== id);
    set({ items });
    get().calculateTotals();
  },
  
  clearCart: () => {
    set({ items: [], totalItems: 0, totalPrice: 0 });
  },
  
  calculateTotals: () => {
    const items = get().items;
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
      0
    );
    set({ totalItems, totalPrice });
  },
}));