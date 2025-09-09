import { useState, useEffect } from 'react';
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
  // Nu väljer användaren endast storlek. Färg ignoreras.
  const [selectedSize, setSelectedSize] = useState<string>('');
  const { addToCart } = useCart();

  const inStockVariants = variants.filter(v => v.stock_quantity > 0);
  const availableSizes = [...new Set(inStockVariants.map(v => v.size))];
  const sizeOrder = ['XS','S','M','L','XL','XXL','3XL'];
  const orderedSizes = [...availableSizes].filter(Boolean).sort((a,b) => {
    const ia = sizeOrder.indexOf(a.toUpperCase());
    const ib = sizeOrder.indexOf(b.toUpperCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
  // Fallback: om inga storlekar finns men varianter existerar, behandla som "One Size"
  const effectiveSizes = orderedSizes.length > 0
    ? orderedSizes
    : (inStockVariants.length === 0 ? [] : ['One Size']);

  // Auto-välj första storlek om inget valt ännu
  useEffect(() => {
    if (!selectedSize && effectiveSizes.length > 0) {
      setSelectedSize(effectiveSizes[0]);
    }
  }, [effectiveSizes, selectedSize]);
  // Om flera varianter har samma storlek men olika färger tar vi den första.
  // Förvald variant: prioritera i lager, annars första matchande
  const selectedVariant = (inStockVariants.find(v => v.size === selectedSize))
    || variants.find(v => v.size === selectedSize);

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

        <div>
          <label className="text-sm font-medium mb-1 block">Size</label>
          {effectiveSizes.length === 0 ? (
            <div className="text-sm font-medium text-destructive">Slut i lager</div>
          ) : effectiveSizes.length === 1 ? (
            <div className="text-sm text-muted-foreground">{effectiveSizes[0]}</div>
          ) : (
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger>
                <SelectValue placeholder="Välj storlek" />
              </SelectTrigger>
              <SelectContent>
                {effectiveSizes.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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