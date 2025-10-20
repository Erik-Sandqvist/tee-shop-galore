// // src/services/api.ts
// import { supabase } from '@/lib/supabase';
// import { 
//   Product, ProductInsert, ProductUpdate,
//   ProductVariant, ProductVariantInsert, ProductVariantUpdate 
// } from '@/types';

// export const productApi = {
//   // Get all products
//   getProducts: async (): Promise<Product[]> => {
//     const { data, error } = await supabase
//       .from('products')
//       .select('*')
//       .order('created_at', { ascending: false });
    
//     if (error) throw error;
//     return data || [];
//   },

//   // Get a single product
//   getProduct: async (id: string): Promise<Product> => {
//     const { data, error } = await supabase
//       .from('products')
//       .select('*')
//       .eq('id', id)
//       .single();
    
//     if (error) throw error;
//     if (!data) throw new Error(`Product with ID ${id} not found`);
//     return data;
//   },

//   // Create a new product
//   createProduct: async (product: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
//     const productToInsert = {
//       ...product,
//       updated_at: new Date().toISOString()
//     };
    
//     const { data, error } = await supabase
//       .from('products')
//       .insert([productToInsert])
//       .select()
//       .single();
    
//     if (error) throw error;
//     if (!data) throw new Error('Failed to create product');
//     return data;
//   },

//   // Update an existing product
//   updateProduct: async (id: string, product: ProductUpdate): Promise<Product> => {
//     const updateData = {
//       ...product,
//       updated_at: new Date().toISOString()
//     };
    
//     const { data, error } = await supabase
//       .from('products')
//       .update(updateData)
//       .eq('id', id)
//       .select()
//       .single();
    
//     if (error) throw error;
//     if (!data) throw new Error(`Failed to update product with ID ${id}`);
//     return data;
//   },

//   // Delete a product
//   deleteProduct: async (id: string): Promise<void> => {
//     const { error } = await supabase
//       .from('products')
//       .delete()
//       .eq('id', id);
    
//     if (error) throw error;
//   },

//   // Get variants for a product
//   getProductVariants: async (productId: string): Promise<ProductVariant[]> => {
//     const { data, error } = await supabase
//       .from('product_variants')
//       .select('*')
//       .eq('product_id', productId);
    
//     if (error) throw error;
//     return data || [];
//   },

//   // Create a variant
//   createVariant: async (variant: ProductVariantInsert): Promise<ProductVariant> => {
//     const { data, error } = await supabase
//       .from('product_variants')
//       .insert([variant])
//       .select()
//       .single();
    
//     if (error) throw error;
//     if (!data) throw new Error('Failed to create variant');
//     return data;
//   },

//   // Update a variant
//   updateVariant: async (id: string, variant: ProductVariantUpdate): Promise<ProductVariant> => {
//     const { data, error } = await supabase
//       .from('product_variants')
//       .update(variant)
//       .eq('id', id)
//       .select()
//       .single();
    
//     if (error) throw error;
//     if (!data) throw new Error(`Failed to update variant with ID ${id}`);
//     return data;
//   },

//   // Delete a variant
//   deleteVariant: async (id: string): Promise<void> => {
//     const { error } = await supabase
//       .from('product_variants')
//       .delete()
//       .eq('id', id);
    
//     if (error) throw error;
//   }
// };