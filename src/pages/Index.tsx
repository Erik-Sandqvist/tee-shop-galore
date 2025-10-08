import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
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
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(8),
          supabase
            .from('product_variants')
            .select('*'),
          supabase
            .from('categories')
            .select('*')
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

  const getProductVariants = (productId: string) => {
    return variants.filter(v => v.product_id === productId);
  };

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
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          variants={getProductVariants(product.id)}
        />
      ))}
    </div>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Nohamma
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            En butik som är till för norrahammarsborna att kunna utrycka sin kärlek till Nohamma
          </p>
          <div className="space-x-4">
            <Link to="/products">
              <Button size="lg" className="px-8">
                Handla nu
              </Button>
            </Link>
            {/* <Link to="/products">
              <Button variant="outline" size="lg" className="px-8">
                View Collection
              </Button>
            </Link> */}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Produkter</h2>
          <FeaturedProducts />
          <div className="text-center mt-10">
            {/* <Button asChild variant="outline">
              <Link to="/products">Visa alla</Link>
            </Button> */}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
