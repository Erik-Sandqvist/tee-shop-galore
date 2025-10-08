import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, ProductVariant, Product } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface GuestCartItem {
  product_variant_id: string;
  quantity: number;
  product_variants?: ProductVariant & { products?: Product };
}

interface CartContextType {
  cartItems: CartItem[];
  guestCart: GuestCartItem[];
  loading: boolean;
  addToCart: (productVariantId: string, quantity?: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  fetchCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // --- Guest cart helpers ---
  const loadGuestCart = async () => {
    const stored = localStorage.getItem('guest_cart');
    if (!stored) {
      setGuestCart([]);
      return;
    }

    const guestItems: { product_variant_id: string; quantity: number }[] = JSON.parse(stored);
    
    if (guestItems.length === 0) {
      setGuestCart([]);
      return;
    }

    // Hämta produktinformation för guest cart items
    const { data: variants } = await supabase
      .from('product_variants')
      .select(`
        *,
        products(*)
      `)
      .in('id', guestItems.map(i => i.product_variant_id));

    if (variants) {
      const enriched: GuestCartItem[] = guestItems.map(item => ({
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        product_variants: variants.find(v => v.id === item.product_variant_id)
      }));
      setGuestCart(enriched);
    } else {
      setGuestCart(guestItems);
    }
  };

  const saveGuestCart = (cart: { product_variant_id: string; quantity: number }[]) => {
    localStorage.setItem('guest_cart', JSON.stringify(cart));
    loadGuestCart();
  };

  const addToGuestCart = async (product_variant_id: string, quantity = 1) => {
    const stored = localStorage.getItem('guest_cart');
    const currentCart: { product_variant_id: string; quantity: number }[] = stored ? JSON.parse(stored) : [];
    
    const index = currentCart.findIndex(i => i.product_variant_id === product_variant_id);
    
    if (index >= 0) {
      currentCart[index].quantity += quantity;
    } else {
      currentCart.push({ product_variant_id, quantity });
    }
    
    saveGuestCart(currentCart);
    toast({ title: 'Lagt i kundvagn', description: 'Produkten har lagts till i din kundvagn.' });
  };

  // --- Fetch user cart ---
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product_variants!inner(
            *,
            products!inner(*)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);

      // Merge guest cart into user cart
      const stored = localStorage.getItem('guest_cart');
      if (stored) {
        const guestItems: { product_variant_id: string; quantity: number }[] = JSON.parse(stored);
        
        if (guestItems.length > 0) {
          const promises = guestItems.map(g => 
            supabase.from('cart_items').upsert(
              { 
                user_id: user.id, 
                product_variant_id: g.product_variant_id, 
                quantity: g.quantity 
              }, 
              { onConflict: 'user_id,product_variant_id' }
            )
          );
          await Promise.all(promises);
          localStorage.removeItem('guest_cart');
          setGuestCart([]);
          
          const { data: updatedData } = await supabase
            .from('cart_items')
            .select(`
              *,
              product_variants!inner(
                *,
                products!inner(*)
              )
            `)
            .eq('user_id', user.id);
          setCartItems(updatedData || []);
        }
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to fetch cart items', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // --- Add / update / remove ---
  const addToCart = async (productVariantId: string, quantity = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      await addToGuestCart(productVariantId, quantity);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert(
          { user_id: user.id, product_variant_id: productVariantId, quantity }, 
          { onConflict: 'user_id,product_variant_id' }
        );
      if (error) throw error;
      await fetchCartItems();
      toast({ title: 'Lagt i kundvagn', description: 'Produkten har lagts till i din kundvagn.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to add item to cart', variant: 'destructive' });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const stored = localStorage.getItem('guest_cart');
      if (!stored) return;
      
      const currentCart: { product_variant_id: string; quantity: number }[] = JSON.parse(stored);
      const updated = currentCart
        .map(i => i.product_variant_id === cartItemId ? { ...i, quantity } : i)
        .filter(i => i.quantity > 0);
      
      saveGuestCart(updated);
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    try {
      const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);
      if (error) throw error;
      await fetchCartItems();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to update quantity', variant: 'destructive' });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const stored = localStorage.getItem('guest_cart');
      if (!stored) return;
      
      const currentCart: { product_variant_id: string; quantity: number }[] = JSON.parse(stored);
      saveGuestCart(currentCart.filter(i => i.product_variant_id !== cartItemId));
      return;
    }

    try {
      const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);
      if (error) throw error;
      await fetchCartItems();
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to remove item', variant: 'destructive' });
    }
  };

  const clearCart = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      localStorage.removeItem('guest_cart');
      setGuestCart([]);
      return;
    }
    try {
      const { error } = await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (error) throw error;
      setCartItems([]);
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to clear cart', variant: 'destructive' });
    }
  };

  // --- Totals ---
  const getTotalPrice = () => {
    const guestTotal = guestCart.reduce((sum, item) => {
      const price = item.product_variants?.products?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    const userTotal = cartItems.reduce((sum, item) => {
      const price = item.product_variants?.products?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    return userTotal + guestTotal;
  };

  const getTotalItems = () => {
    const guestCount = guestCart.reduce((sum, i) => sum + i.quantity, 0);
    const userCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    return userCount + guestCount;
  };

  useEffect(() => {
    loadGuestCart();
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        guestCart,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        fetchCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};