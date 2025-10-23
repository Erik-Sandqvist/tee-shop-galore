import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, ProductVariant, Category } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, variantsRes, categoriesRes] = await Promise.all([
          supabase.from('products').select('*').eq('is_active', true),
          supabase.from('product_variants').select('*'),
          supabase.from('categories').select('*')
        ]);

        if (productsRes.error) throw productsRes.error;
        if (variantsRes.error) throw variantsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        setProducts(productsRes.data || []);
        setVariants(variantsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProductVariants = (productId: string) => {
    return variants.filter(v => v.product_id === productId);
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Våra Produkter</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Våra Produkter</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Products</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name.replace(' T-Shirts', '')}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                variants={getProductVariants(product.id)}
              />
            ))}
          </div>
        </TabsContent>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {getProductsByCategory(category.id).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variants={getProductVariants(product.id)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};