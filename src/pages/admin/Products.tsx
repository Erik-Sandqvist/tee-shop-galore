// src/pages/admin/Products.tsx
import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ProductForm from '@/components/admin/ProductForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from '@/components/ui/skeleton';

// Use the same type as in your Index.tsx
import type { Database } from '@/integrations/supabase/types';
type Product = Database['public']['Tables']['products']['Row'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];

export const ProductsAdmin = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [variantsMap, setVariantsMap] = useState<Record<string, ProductVariant[]>>({});
  const { toast } = useToast();

  // Fetch products and variants - similar to your Index.tsx approach
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // Get products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (productsError) throw productsError;
      setProducts(productsData || []);
      
      // Get all variants
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*');
        
      if (variantsError) throw variantsError;
      
      // Organize variants by product ID
      const variants: Record<string, ProductVariant[]> = {};
      variantsData?.forEach(variant => {
        if (variant.product_id) {
          if (!variants[variant.product_id]) {
            variants[variant.product_id] = [];
          }
          variants[variant.product_id].push(variant);
        }
      });
      
      setVariantsMap(variants);
      
      toast({
        title: "Success",
        description: "Products loaded successfully",
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setProducts(products.filter(p => p.id !== id));
        const updatedVariants = { ...variantsMap };
        delete updatedVariants[id];
        setVariantsMap(updatedVariants);
        
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveProduct = async (product: any) => {
    try {
      if (editingProduct) {
        // Update existing product
        const { data, error } = await supabase
          .from('products')
          .update({
            name: product.name,
            description: product.description,
            price: product.price,
            category_id: product.category_id,
            image_url: product.image_url,
            is_active: product.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProduct.id)
          .select();
          
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts(products.map(p => p.id === editingProduct.id ? data[0] : p));
        }
        
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            description: product.description,
            price: product.price,
            category_id: product.category_id,
            image_url: product.image_url,
            is_active: product.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();
          
        if (error) throw error;
        if (data && data.length > 0) {
          setProducts([...products, data[0]]);
          // Initialize empty variants array for new product
          setVariantsMap({
            ...variantsMap,
            [data[0].id]: []
          });
        }
        
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button onClick={() => { setEditingProduct(null); setShowForm(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {showForm ? (
        <ProductForm 
          product={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => setShowForm(false)} 
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-md">
              <p className="text-gray-500">No products found. Click "Add Product" to create one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      {product.image_url && (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.category_id}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>{variantsMap[product.id]?.length || 0}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsAdmin;