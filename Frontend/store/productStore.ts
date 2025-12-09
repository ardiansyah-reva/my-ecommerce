// store/productStore.ts
import { create } from 'zustand';
import { Product, Category, Brand } from '@/types';

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  selectedCategory: number | null;
  selectedBrand: number | null;
  searchQuery: string;
  sortBy: string;
  
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;
  setBrands: (brands: Brand[]) => void;
  setSelectedCategory: (id: number | null) => void;
  setSelectedBrand: (id: number | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  brands: [],
  selectedCategory: null,
  selectedBrand: null,
  searchQuery: '',
  sortBy: 'latest',
  
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setBrands: (brands) => set({ brands }),
  setSelectedCategory: (id) => set({ selectedCategory: id }),
  setSelectedBrand: (id) => set({ selectedBrand: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  
  resetFilters: () =>
    set({
      selectedCategory: null,
      selectedBrand: null,
      searchQuery: '',
      sortBy: 'latest',
    }),
}));