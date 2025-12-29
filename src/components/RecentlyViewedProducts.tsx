import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  viewedAt: number;
}

// Cookie utility för Recently Viewed
const COOKIE_NAME = 'recentlyViewed';
const MAX_ITEMS = 10;

export const RecentlyViewedProducts = () => {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = () => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(COOKIE_NAME + '='));
    
    if (cookie) {
      try {
        const data = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
        setRecentProducts(data.sort((a: Product, b: Product) => b.viewedAt - a.viewedAt));
      } catch (e) {
        console.error('Failed to parse recently viewed:', e);
      }
    }
  };

  const addToRecentlyViewed = (product: Omit<Product, 'viewedAt'>) => {
    let products = [...recentProducts];
    
    // Ta bort produkten om den redan finns
    products = products.filter(p => p.id !== product.id);
    
    // Lägg till i början med timestamp
    products.unshift({ ...product, viewedAt: Date.now() });
    
    // Begränsa till MAX_ITEMS
    products = products.slice(0, MAX_ITEMS);
    
    // Spara till cookie (max 30 dagar)
    const expires = new Date();
    expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(products))};expires=${expires.toUTCString()};path=/`;
    
    setRecentProducts(products);
  };

  const clearHistory = () => {
    document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    setRecentProducts([]);
  };

  // Demo: Simulera att användaren tittar på en produkt
  const viewDemoProduct = () => {
    const demoProducts = [
      { id: '1', name: 'Cool T-Shirt', price: 299, image: '👕' },
      { id: '2', name: 'Awesome Hoodie', price: 599, image: '🧥' },
      { id: '3', name: 'Classic Cap', price: 199, image: '🧢' },
      { id: '4', name: 'Stylish Jeans', price: 799, image: '👖' },
      { id: '5', name: 'Comfortable Shoes', price: 999, image: '👟' },
    ];
    
    const randomProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)];
    addToRecentlyViewed(randomProduct);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>🕐 Senast Visade Produkter</CardTitle>
            <CardDescription>
              Automatiskt sparas med cookies när du besöker produktsidor
            </CardDescription>
          </div>
          {recentProducts.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory}>
              Rensa historik
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demo knapp */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
          <p className="text-sm mb-2">
            <strong>Demo:</strong> Simulera att du tittar på en produkt
          </p>
          <Button onClick={viewDemoProduct} size="sm">
            Visa en slumpmässig produkt 🎲
          </Button>
        </div>

        {/* Lista över produkter */}
        {recentProducts.length > 0 ? (
          <div className="space-y-2">
            {recentProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{product.image}</span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(product.viewedAt).toLocaleString('sv-SE')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-semibold">{product.price} kr</span>
                  {index === 0 && (
                    <Badge variant="secondary">Senaste</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Inga produkter visade ännu. Klicka på demo-knappen ovan!
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
          <h4 className="font-semibold text-sm mb-2">💡 Hur det fungerar:</h4>
          <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
            <li>• När du besöker en produktsida sparas den i en cookie</li>
            <li>• Max {MAX_ITEMS} produkter sparas</li>
            <li>• Historiken sparas i 30 dagar</li>
            <li>• Fungerar även för icke-inloggade användare</li>
            <li>• Sorteras efter senast visade först</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Export funktion för att använda i ProductDetail-sidan
export const trackProductView = (productId: string, productName: string, price: number, image?: string) => {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(COOKIE_NAME + '='));
  
  let products: Product[] = [];
  
  if (cookie) {
    try {
      products = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    } catch (e) {
      console.error('Failed to parse recently viewed:', e);
    }
  }
  
  // Ta bort om den redan finns
  products = products.filter(p => p.id !== productId);
  
  // Lägg till i början
  products.unshift({
    id: productId,
    name: productName,
    price,
    image,
    viewedAt: Date.now()
  });
  
  // Begränsa
  products = products.slice(0, MAX_ITEMS);
  
  // Spara
  const expires = new Date();
  expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(products))};expires=${expires.toUTCString()};path=/`;
};
