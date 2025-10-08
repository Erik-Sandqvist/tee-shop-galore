// src/components/admin/ProductForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

// Import the types from the same place as your admin page
import type { Database } from '@/integrations/supabase/types';
type Product = Database['public']['Tables']['products']['Row'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];

interface ProductFormProps {
  product: Product | null;
  onSave: (product: any) => void;
  onCancel: () => void;
}

const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category_id: product?.category_id || "",
    image_url: product?.image_url || "",
    is_active: product?.is_active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : 
              name === "is_active" ? (value === "true") : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {product ? "Edit Product" : "Add New Product"}
        </h2>
        <div className="space-x-2">
          <Button type="submit">Save</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleChange}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>

          <div>
            <Label htmlFor="category_id">Category</Label>
            <Input
              id="category_id"
              name="category_id"
              value={formData.category_id || ""}
              onChange={handleChange}
              placeholder="Category ID"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="is_active">Status</Label>
          <select
            id="is_active"
            name="is_active"
            value={formData.is_active === false ? "false" : "true"}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <div>
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            name="image_url"
            value={formData.image_url || ""}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          
          {formData.image_url && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 mb-1">Image Preview:</p>
              <img 
                src={formData.image_url} 
                alt="Product preview" 
                className="h-32 object-contain border rounded p-2" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                }}
              />
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default ProductForm;