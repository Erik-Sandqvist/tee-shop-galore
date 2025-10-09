import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, ProductVariant, CartItem, GuestCartItem, CartContextType } from '@/types';

// Create the context with the proper type
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Guest cart helpers ---
  const loadGuestCart = async () => {
    const stored = localStorage.getItem('guestCart');
    if (!stored) {
      setGuestCart([]);
      return;
    }

    const guestItems: { product_variant_id: string; quantity: number }[] = JSON.parse(stored);
    
    if (guestItems.length === 0) {
      setGuestCart([]);
      return;
    }

    // Fetch product information for guest cart items
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
    localStorage.setItem('guestCart', JSON.stringify(cart));
    loadGuestCart();
  };

  const addToGuestCart = async (product_variant_id: string, quantity = 1) => {
    const stored = localStorage.getItem('guestCart');
    const currentCart: { product_variant_id: string; quantity: number }[] = stored ? JSON.parse(stored) : [];
    
    const index = currentCart.findIndex(i => i.product_variant_id === product_variant_id);
    
    if (index >= 0) {
      currentCart[index].quantity += quantity;
    } else {
      currentCart.push({ product_variant_id, quantity });
    }
    
    saveGuestCart(currentCart);
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
      const stored = localStorage.getItem('guestCart');
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
          localStorage.removeItem('guestCart');
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
    } finally {
      setLoading(false);
    }
  };

  // --- Add / update / remove ---
  const addToCart = async (
    variantId: string, 
    quantity: number = 1, // Default to 1 if not provided
    product?: Product, 
    variant?: ProductVariant
  ) => {
    try {
      // Check for valid quantity
      if (!quantity || quantity <= 0) {
        quantity = 1; // Ensure quantity is at least 1
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await addToGuestCart(variantId, quantity);
        return;
      }

      try {
        const { error } = await supabase
          .from('cart_items')
          .upsert(
            { user_id: user.id, product_variant_id: variantId, quantity }, 
            { onConflict: 'user_id,product_variant_id' }
          );
        if (error) throw error;
        await fetchCartItems();
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const updateQuantity = async (variantId: string, quantity: number = 1) => {
    try {
      // Ensure quantity is valid
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item instead
        return await removeFromCart(variantId);
      }

      const { data: { user } } = await supabase.auth.getUser();
    
      if (!user) {
        const stored = localStorage.getItem('guestCart');
        if (!stored) return;
        
        const currentCart: { product_variant_id: string; quantity: number }[] = JSON.parse(stored);
        const updated = currentCart
          .map(i => i.product_variant_id === variantId ? { ...i, quantity } : i)
          .filter(i => i.quantity > 0);
        
        saveGuestCart(updated);
        return;
      }

      if (quantity <= 0) {
        await removeFromCart(variantId);
        return;
      }

      try {
        const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', variantId);
        if (error) throw error;
        await fetchCartItems();
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      const stored = localStorage.getItem('guestCart');
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
    }
  };

  const clearCart = async () => {
    try {
      // Clear user cart if logged in
      const { data: { user } } = await supabase.auth.getSession();
      if (user) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      }
      
      // Clear guest cart in local storage
      localStorage.removeItem('guestCart');
      
      // Update state
      setCartItems([]);
      setGuestCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
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
    const userCartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const guestCartCount = guestCart.reduce((total, item) => total + item.quantity, 0);
    return userCartCount + guestCartCount;
  };

  useEffect(() => {
    loadGuestCart();
    fetchCartItems();
  }, []);

  const contextValue: CartContextType = {
    cartItems,
    guestCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    loading,
    clearCart,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};