import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  viewedAt: number;
}

const COOKIE_NAME = 'recentlyViewed';

export const RecentlyViewedSection = () => {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);

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
        // Visa max 4 produkter
        setRecentProducts(data.sort((a: RecentProduct, b: RecentProduct) => b.viewedAt - a.viewedAt).slice(0, 4));
      } catch (e) {
        console.error('Failed to parse recently viewed:', e);
      }
    }
  };

  // Om inga produkter, visa ingenting
  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <Eye className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-bold text-center">Senast Visade Produkter</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recentProducts.map((product, index) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
                {index === 0 && (
                  <Badge className="absolute top-2 right-2 z-10" variant="secondary">
                    Senaste
                  </Badge>
                )}
                <div className="aspect-square bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">👕</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-bold">{product.price} kr</p>
                    <p className="text-xs text-gray-500">
                      {new Date(product.viewedAt).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-6">
          <Link to="/cookies" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
            Hantera cookies och din historik →
          </Link>
        </div>
      </div>
    </section>
  );
};
