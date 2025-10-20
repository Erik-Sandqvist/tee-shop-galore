export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  stock_quantity: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product_variants?: ProductVariant & {
    products?: Product;
  };
}

export interface GuestCartItem {
  product_variant_id: string;
  quantity: number;
  product_variants?: ProductVariant & {
    products?: Product;
  };
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  shipping_address?: any;
  created_at: string;
  updated_at: string;
}

// src/types/index.ts
export interface CartContextType {
  cartItems: CartItem[];
  guestCart: GuestCartItem[];
  addToCart: (variantId: string, quantity?: number, product?: Product, variant?: ProductVariant) => Promise<boolean>; // Changed to return boolean and quantity is optional
  removeFromCart: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<boolean>; // Changed to return boolean
  getTotalPrice: () => number;
  getTotalItems: () => number;
  loading: boolean;
  clearCart: () => Promise<void>;
  getAvailableStock: (variantId: string) => Promise<number>; // Add this
  getCurrentCartQuantity: (variantId: string) => number; // Add this
}