import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, ProductVariant } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface GuestCartItem {
  product_variant_id: string;
  quantity: number;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // --- Guest cart helpers ---
  const loadGuestCart = () => {
    const stored = localStorage.getItem('guest_cart');
    if (stored) setGuestCart(JSON.parse(stored));
  };

  const saveGuestCart = (cart: GuestCartItem[]) => {
    localStorage.setItem('guest_cart', JSON.stringify(cart));
    setGuestCart(cart);
  };

  const addToGuestCart = (product_variant_id: string, quantity = 1) => {
    const index = guestCart.findIndex(i => i.product_variant_id === product_variant_id);
    const newCart = [...guestCart];
    if (index >= 0) newCart[index].quantity += quantity;
    else newCart.push({ product_variant_id, quantity });
    saveGuestCart(newCart);
    toast({ title: 'Lagt i kundvagn', description: 'Produkten har lagts till i din kundvagn.' });
  };

  // --- Fetch user cart ---
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCartItems([]);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`*, product_variants!inner(*, products!inner(*))`)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);

      // Merge guest cart into user cart
      if (guestCart.length > 0) {
        const promises = guestCart.map(g =>
          supabase.from('cart_items').upsert(
            { user_id: user.id, product_variant_id: g.product_variant_id, quantity: g.quantity },
            { onConflict: 'user_id,product_variant_id' }
          )
        );
        await Promise.all(promises);
        saveGuestCart([]);
        await fetchCartItems();
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Error', description: 'Failed to fetch cart items', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productVariantId: string, quantity = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      addToGuestCart(productVariantId, quantity);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({ user_id: user.id, product_variant_id: productVariantId, quantity }, { onConflict: 'user_id,product_variant_id' });
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
      const updated = guestCart.map(i => i.product_variant_id === cartItemId ? { ...i, quantity } : i).filter(i => i.quantity > 0);
      saveGuestCart(updated);
      return;
    }
    if (quantity <= 0) return removeFromCart(cartItemId);

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
      saveGuestCart(guestCart.filter(i => i.product_variant_id !== cartItemId));
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
      saveGuestCart([]);
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

  const getTotalPrice = () => {
    const guestTotal = guestCart.reduce((sum, item) => {
      const variant = window['variants']?.find((v: ProductVariant & { products?: any }) => v.id === item.product_variant_id);
      const price = variant?.products?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    const userTotal = cartItems.reduce((sum, item) => sum + (item.product_variants?.products?.price || 0) * item.quantity, 0);
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

  return {
    cartItems,
    guestCart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    fetchCartItems,
  };
};
