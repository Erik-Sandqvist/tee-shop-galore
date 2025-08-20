import { useState } from 'react';
import { Product, ProductVariant } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
}

export const ProductCard = ({ product, variants }: ProductCardProps) => {
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addToCart } = useCart();

  const availableColors = [...new Set(variants.map(v => v.color))];
  const availableSizes = [...new Set(variants.filter(v => v.color === selectedColor).map(v => v.size))];
  
  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(selectedVariant.id);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">${product.price}</span>
          {selectedVariant && (
            <Badge variant={selectedVariant.stock_quantity > 0 ? "default" : "destructive"}>
              {selectedVariant.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Color</label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger>
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {availableColors.map(color => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedColor && (
            <div>
              <label className="text-sm font-medium mb-1 block">Size</label>
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {availableSizes.map(size => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};