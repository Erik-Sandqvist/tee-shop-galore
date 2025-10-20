import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, ProductVariant, CartItem, GuestCartItem, CartContextType } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Create the context with the proper type
const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Add function to check available stock
  const getAvailableStock = async (variantId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('stock_quantity')
        .eq('id', variantId)
        .single();

      if (error) throw error;
      return data?.stock_quantity || 0;
    } catch (error) {
      console.error('Error fetching stock:', error);
      return 0;
    }
  };

  // Get current quantity in cart for a variant
  const getCurrentCartQuantity = (variantId: string): number => {
    // Check user cart
    const userCartItem = cartItems.find(item => item.product_variant_id === variantId);
    const userQuantity = userCartItem?.quantity || 0;

    // Check guest cart
    const guestCartItem = guestCart.find(item => item.product_variant_id === variantId);
    const guestQuantity = guestCartItem?.quantity || 0;

    return userQuantity + guestQuantity;
  };

  // Validate if we can add more items to cart
  const validateStock = async (
    variantId: string, 
    quantityToAdd: number
  ): Promise<{ canAdd: boolean; availableStock: number; currentInCart: number }> => {
    const availableStock = await getAvailableStock(variantId);
    const currentInCart = getCurrentCartQuantity(variantId);
    const totalAfterAdd = currentInCart + quantityToAdd;

    return {
      canAdd: totalAfterAdd <= availableStock,
      availableStock,
      currentInCart,
    };
  };

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
    // Validate stock before adding
    const validation = await validateStock(product_variant_id, quantity);
    
    if (!validation.canAdd) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${validation.availableStock - validation.currentInCart} more items available in stock.`,
        variant: "destructive",
      });
      return false;
    }

    const stored = localStorage.getItem('guestCart');
    const currentCart: { product_variant_id: string; quantity: number }[] = stored ? JSON.parse(stored) : [];
    
    const index = currentCart.findIndex(i => i.product_variant_id === product_variant_id);
    
    if (index >= 0) {
      currentCart[index].quantity += quantity;
    } else {
      currentCart.push({ product_variant_id, quantity });
    }
    
    saveGuestCart(currentCart);
    return true;
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
    quantity: number = 1,
    product?: Product, 
    variant?: ProductVariant
  ) => {
    try {
      if (!quantity || quantity <= 0) {
        quantity = 1;
      }

      // Validate stock before adding
      const validation = await validateStock(variantId, quantity);
      
      if (!validation.canAdd) {
        const productName = product?.name || 'Product';
        toast({
          title: "Insufficient Stock",
          description: `Cannot add ${quantity} more ${productName}. Only ${validation.availableStock - validation.currentInCart} available (${validation.currentInCart} already in cart).`,
          variant: "destructive",
        });
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const success = await addToGuestCart(variantId, quantity);
        if (success) {
          toast({
            title: "Added to Cart",
            description: `${product?.name || 'Product'} has been added to your cart.`,
          });
        }
        return success;
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
        
        toast({
          title: "Added to Cart",
          description: `${product?.name || 'Product'} has been added to your cart.`,
        });
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateQuantity = async (variantId: string, quantity: number = 1): Promise<boolean> => {
    try {
      if (quantity <= 0) {
        await removeFromCart(variantId);
        return true; // Add explicit return
      }

      // Get current quantity in cart
      const currentInCart = getCurrentCartQuantity(variantId);
      const difference = quantity - currentInCart;

      // Only validate if increasing quantity
      if (difference > 0) {
        const validation = await validateStock(variantId, difference);
        
        if (!validation.canAdd) {
          toast({
            title: "Insufficient Stock",
            description: `Only ${validation.availableStock} items available in stock.`,
            variant: "destructive",
          });
          return false;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
    
      if (!user) {
        const stored = localStorage.getItem('guestCart');
        if (!stored) return false;
        
        const currentCart: { product_variant_id: string; quantity: number }[] = JSON.parse(stored);
        const updated = currentCart
          .map(i => i.product_variant_id === variantId ? { ...i, quantity } : i)
          .filter(i => i.quantity > 0);
        
        saveGuestCart(updated);
        return true;
      }

      try {
        const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', variantId);
        if (error) throw error;
        await fetchCartItems();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
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
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      
      if (user) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
      }
      
      localStorage.removeItem('guestCart');
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
    getAvailableStock, // Export this function
    getCurrentCartQuantity, // Export this function
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