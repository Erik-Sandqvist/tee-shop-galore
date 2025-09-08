import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Product, ProductVariant, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

type ProductType = Database['public']['Tables']['products']['Row'];

function FeaturedProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const [productsRes, variantsRes, categoriesRes] = await Promise.all([
          supabase
            .from('products')
            .select('id,name,price,image_url,is_active,category_id,created_at,description,updated_at')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(8),              // justera antal om du vill
          supabase
            .from('product_variants')
            .select('id,product_id'),
          supabase
            .from('categories')
            .select('id,name')
        ]);

        if (cancelled) return;

        if (!productsRes.error && productsRes.data) setProducts(productsRes.data as ProductType[]);
        if (!variantsRes.error && variantsRes.data) setVariants(variantsRes.data as ProductVariant[]);
        if (!categoriesRes.error && categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-square rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <div className="text-center py-10 text-muted-foreground">Inga produkter hittades.</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map(p => (
        <ProductCard
          key={p.id}
            product={p}
            variants={variants.filter(v => v.product_id === p.id)}
        />
      ))}
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
             Eriks Store
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our collection of high-quality, comfortable t-shirts in various colors and sizes. 
            Perfect for everyday wear or special occasions.
          </p>
          <div className="space-x-4">
            <Link to="/products">
              <Button size="lg" className="px-8">
                Shop Now
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg" className="px-8">
                View Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Produkter</h2>
          <FeaturedProducts />
          <div className="text-center mt-10">
            <Button asChild variant="outline">
              <Link to="/products">Visa alla</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over $50</p>
            </div>
            <div>
              <div className="text-3xl mb-4">↩️</div>
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">30-day return policy</p>
            </div>
            <div>
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">Premium materials only</p>
            </div>
            <div>
              <div className="text-3xl mb-4">💬</div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
