import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface GuestCart {
  cartId: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  createdAt: number;
  expiresAt: number;
}

const CART_COOKIE = 'guestCart';

export const GuestCartDemo = () => {
  const [cart, setCart] = useState<GuestCart | null>(null);
  const [productName, setProductName] = useState('Cool T-Shirt');
  const [productPrice, setProductPrice] = useState(299);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(CART_COOKIE + '='));
    
    if (cookie) {
      try {
        const cartData = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        // Kolla om cart har gått ut
        if (cartData.expiresAt > Date.now()) {
          setCart(cartData);
        } else {
          clearCart();
        }
      } catch (e) {
        console.error('Failed to parse cart:', e);
      }
    }
  };

  const saveCart = (cartData: GuestCart) => {
    // Spara i 7 dagar
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
    document.cookie = `${CART_COOKIE}=${encodeURIComponent(JSON.stringify(cartData))};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    setCart(cartData);
  };

  const addToCart = () => {
    const productId = Date.now().toString();
    const newItem = {
      productId,
      name: productName,
      quantity: 1,
      price: productPrice,
    };

    if (cart) {
      // Uppdatera befintlig varukorg
      const updatedCart = {
        ...cart,
        items: [...cart.items, newItem],
      };
      saveCart(updatedCart);
    } else {
      // Skapa ny varukorg
      const newCart: GuestCart = {
        cartId: `guest-${Date.now()}`,
        items: [newItem],
        createdAt: Date.now(),
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 dagar
      };
      saveCart(newCart);
    }
  };

  const removeItem = (productId: string) => {
    if (!cart) return;
    
    const updatedCart = {
      ...cart,
      items: cart.items.filter(item => item.productId !== productId),
    };
    
    if (updatedCart.items.length === 0) {
      clearCart();
    } else {
      saveCart(updatedCart);
    }
  };

  const clearCart = () => {
    document.cookie = `${CART_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    setCart(null);
  };

  const getTotalPrice = () => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTimeRemaining = () => {
    if (!cart) return '';
    const remaining = cart.expiresAt - Date.now();
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>🛒 Gäst-Varukorg (Cookie-baserad)</CardTitle>
            <CardDescription>
              Varukorg för icke-inloggade användare sparas i cookies
            </CardDescription>
          </div>
          {cart && (
            <Badge variant="secondary">
              Utgår om: {getTimeRemaining()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lägg till produkt */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md space-y-3">
          <h3 className="font-semibold">Lägg till produkt</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Produktnamn</Label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="T-Shirt"
              />
            </div>
            <div>
              <Label>Pris (kr)</Label>
              <Input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
                placeholder="299"
              />
            </div>
          </div>
          <Button onClick={addToCart} className="w-full">
            Lägg till i varukorg
          </Button>
        </div>

        {/* Varukorg innehåll */}
        {cart && cart.items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Varukorg ({cart.items.length} artiklar)</h3>
              <Button onClick={clearCart} variant="outline" size="sm">
                Töm varukorg
              </Button>
            </div>
            
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} x {item.price} kr
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">{item.price * item.quantity} kr</span>
                  <Button
                    onClick={() => removeItem(item.productId)}
                    variant="destructive"
                    size="sm"
                  >
                    Ta bort
                  </Button>
                </div>
              </div>
            ))}

            {/* Total */}
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Totalt:</span>
                <span className="text-2xl font-bold">{getTotalPrice()} kr</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                💡 Denna varukorg sparas i en cookie och gäller i 7 dagar
              </p>
            </div>

            {/* Cart metadata */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md text-xs">
              <p><strong>Cart ID:</strong> {cart.cartId}</p>
              <p><strong>Skapad:</strong> {new Date(cart.createdAt).toLocaleString('sv-SE')}</p>
              <p><strong>Utgår:</strong> {new Date(cart.expiresAt).toLocaleString('sv-SE')}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Varukorgen är tom
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
          <h4 className="font-semibold text-sm mb-2">💡 Hur det fungerar:</h4>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• Gäst-användare kan lägga produkter i varukorgen</li>
            <li>• Varukorgen sparas i en cookie i 7 dagar</li>
            <li>• Kommer ihåg produkter även om användaren stänger webbläsaren</li>
            <li>• När användaren loggar in flyttas innehållet till databasen</li>
            <li>• Minskar bortfall genom att spara tillfälliga köp</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
