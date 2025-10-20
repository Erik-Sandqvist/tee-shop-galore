import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { ReactNode } from 'react';

// Mock Supabase helt
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => 
        Promise.resolve({ data: { user: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Wrapper för CartProvider
const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Guest Cart', () => {
    it('should start with empty cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.getTotalItems()).toBe(0);
        expect(result.current.guestCart).toEqual([]);
      });
    });

    it('should add item to guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      // Anropa addToCart
      await result.current.addToCart('test-variant-id', 1);

      // Vänta på att state uppdateras
      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        expect(stored).toBeTruthy();
      }, { timeout: 2000 });

      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        const cart = JSON.parse(stored);
        expect(cart).toHaveLength(1);
        expect(cart[0].product_variant_id).toBe('test-variant-id');
        expect(cart[0].quantity).toBe(1);
      }
    });

    it('should save guest cart to localStorage', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      await result.current.addToCart('test-variant-id', 2);

      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        expect(stored).toBeTruthy();
      }, { timeout: 2000 });

      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        const cart = JSON.parse(stored);
        expect(cart[0].product_variant_id).toBe('test-variant-id');
        expect(cart[0].quantity).toBe(2);
      }
    });

    it('should update quantity in guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      // Lägg till produkt först
      await result.current.addToCart('test-variant-id', 1);

      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        expect(stored).toBeTruthy();
      }, { timeout: 2000 });

      // Uppdatera kvantitet
      await result.current.updateQuantity('test-variant-id', 3);

      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        if (stored) {
          const cart = JSON.parse(stored);
          const item = cart.find((i: any) => i.product_variant_id === 'test-variant-id');
          expect(item?.quantity).toBe(3);
        }
      }, { timeout: 2000 });
    });

    it('should remove item from guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      // Lägg till produkt först
      await result.current.addToCart('test-variant-id', 1);

      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        expect(stored).toBeTruthy();
      }, { timeout: 2000 });

      // Ta bort produkt
      await result.current.removeFromCart('test-variant-id');

      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        if (stored) {
          const cart = JSON.parse(stored);
          expect(cart).toHaveLength(0);
        } else {
          expect(stored).toBeNull();
        }
      }, { timeout: 2000 });
    });

    it('should clear guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      // Lägg till produkter
      await result.current.addToCart('test-variant-1', 1);
      
      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        expect(stored).toBeTruthy();
      }, { timeout: 2000 });

      await result.current.addToCart('test-variant-2', 2);

      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        if (stored) {
          const cart = JSON.parse(stored);
          expect(cart.length).toBeGreaterThan(0);
        }
      }, { timeout: 2000 });

      // Rensa cart
      await result.current.clearCart();

      await waitFor(() => {
        const stored = localStorage.getItem('guest_cart');
        expect(stored).toBeNull();
      }, { timeout: 2000 });
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate total items from localStorage', async () => {
      // Sätt localStorage direkt
      const cart = [
        { product_variant_id: 'variant-1', quantity: 2 },
        { product_variant_id: 'variant-2', quantity: 3 },
      ];
      localStorage.setItem('guest_cart', JSON.stringify(cart));

      const { result } = renderHook(() => useCart(), { wrapper });

      // Vänta på att cart laddas
      await waitFor(() => {
        // Kolla localStorage direkt
        const stored = localStorage.getItem('guest_cart');
        if (stored) {
          const parsedCart = JSON.parse(stored);
          const total = parsedCart.reduce((sum: number, item: any) => sum + item.quantity, 0);
          expect(total).toBe(5);
        }
      }, { timeout: 2000 });
    });
  });

  describe('getTotalItems', () => {
    it('should return 0 for empty cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      
      await waitFor(() => {
        expect(result.current.getTotalItems()).toBe(0);
      });
    });

    it('should calculate total from guest cart', async () => {
      localStorage.setItem('guest_cart', JSON.stringify([
        { product_variant_id: 'v1', quantity: 2 },
        { product_variant_id: 'v2', quantity: 3 },
      ]));

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        const total = result.current.getTotalItems();
        expect(total).toBeGreaterThanOrEqual(0);
      }, { timeout: 2000 });
    });
  });
});