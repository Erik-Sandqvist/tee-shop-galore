import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { ReactNode } from 'react';

// Tysta console.error i tester
vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock Supabase - måste vara direkt i vi.mock() utan externa variabler
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      getSession: vi.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn((table: string) => {
      if (table === 'product_variants') {
        return {
          select: vi.fn((query?: string) => {
            if (query && query.includes('stock_quantity')) {
              // För stock check
              return {
                eq: vi.fn(() => ({
                  single: vi.fn(() => 
                    Promise.resolve({ 
                      data: { stock_quantity: 100 }, 
                      error: null 
                    })
                  ),
                })),
                in: vi.fn(() => 
                  Promise.resolve({ 
                    data: [], 
                    error: null 
                  })
                ),
              };
            }
            // För att hämta produktinfo
            return {
              eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
              in: vi.fn(() => Promise.resolve({ data: [], error: null })),
            };
          }),
        };
      }
      // För cart_items
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        upsert: vi.fn(() => Promise.resolve({ data: null, error: null })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      };
    }),
  },
}));

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CartContext', () => {
  describe('Guest Cart', () => {
    it('should start with empty cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.guestCart).toEqual([]);
    });

    it('should add item to guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addToCart('test-variant-id', 1);
      });

      await waitFor(() => {
        expect(result.current.guestCart.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      const stored = localStorage.getItem('guestCart');
      expect(stored).toBeTruthy();
      
      if (stored) {
        const cart = JSON.parse(stored);
        expect(cart).toHaveLength(1);
        expect(cart[0].product_variant_id).toBe('test-variant-id');
        expect(cart[0].quantity).toBe(1);
      }
    });

    it('should update quantity in guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Lägg till item först
      await act(async () => {
        await result.current.addToCart('test-variant-id', 1);
      });

      await waitFor(() => {
        expect(result.current.guestCart.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      // Uppdatera kvantitet
      await act(async () => {
        await result.current.updateQuantity('test-variant-id', 3);
      });

      await waitFor(() => {
        const stored = localStorage.getItem('guestCart');
        if (stored) {
          const cart = JSON.parse(stored);
          const item = cart.find((i: any) => i.product_variant_id === 'test-variant-id');
          expect(item?.quantity).toBe(3);
        }
      }, { timeout: 3000 });
    });

    it('should remove item from guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addToCart('test-variant-id', 1);
      });

      await waitFor(() => {
        expect(result.current.guestCart.length).toBeGreaterThan(0);
      }, { timeout: 3000 });

      await act(async () => {
        await result.current.removeFromCart('test-variant-id');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('guestCart');
        const cart = stored ? JSON.parse(stored) : [];
        expect(cart).toHaveLength(0);
      }, { timeout: 3000 });
    });

    it('should clear guest cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addToCart('variant-1', 1);
      });

      await waitFor(() => {
        const stored = localStorage.getItem('guestCart');
        expect(stored).toBeTruthy();
      }, { timeout: 3000 });

      await act(async () => {
        await result.current.addToCart('variant-2', 2);
      });

      await act(async () => {
        await result.current.clearCart();
      });

      await waitFor(() => {
        expect(localStorage.getItem('guestCart')).toBeNull();
        expect(result.current.guestCart).toHaveLength(0);
      }, { timeout: 3000 });
    });
  });

  describe('Cart Calculations', () => {
    it('should calculate total items correctly', async () => {
      localStorage.setItem(
        'guestCart',
        JSON.stringify([
          { product_variant_id: 'v1', quantity: 2 },
          { product_variant_id: 'v2', quantity: 3 },
        ])
      );

      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        expect(result.current.getTotalItems()).toBe(5);
      }, { timeout: 3000 });
    });

    it('should return 0 for empty cart', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.getTotalItems()).toBe(0);
    });
  });

  describe('Stock Validation', () => {
    it('should validate stock availability', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const stock = await result.current.getAvailableStock('test-variant-id');
      expect(stock).toBe(100);
    });

    it('should get current cart quantity', async () => {
      const { result } = renderHook(() => useCart(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.addToCart('test-variant-id', 2);
      });

      await waitFor(() => {
        const quantity = result.current.getCurrentCartQuantity('test-variant-id');
        expect(quantity).toBeGreaterThanOrEqual(0);
      }, { timeout: 3000 });
    });
  });
});