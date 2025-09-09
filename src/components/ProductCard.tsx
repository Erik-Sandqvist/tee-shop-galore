import { useState, useEffect } from "react";
import { Product, ProductVariant } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
}

export const ProductCard = ({ product, variants }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { addToCart } = useCart();

  // Normalisera storlekar
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"] as const;
  const normalized = variants.map((v) => ({
    ...v,
    size: v.size ? v.size.toUpperCase() : v.size,
  }));

  // Alla storlekar från varianterna, i rätt ordning
  const allSizes = [...new Set(normalized.map((v) => v.size).filter(Boolean))];
  const orderedAllSizes = [...allSizes].sort(
    (a, b) => sizeOrder.indexOf(a as any) - sizeOrder.indexOf(b as any)
  );

  // Hitta lagerstatus
  const inStockVariants = normalized.filter((v) => v.stock_quantity > 0);
  const selectedVariant =
    // först: hitta en variant med lager för vald storlek
    normalized.find((v) => v.size === selectedSize && v.stock_quantity > 0) ||
    // annars: ta första varianten för storleken (slut i lager)
    normalized.find((v) => v.size === selectedSize) ||
    // fallback: första i lager om ingen storlek är vald
    (selectedSize ? undefined : inStockVariants[0]);

  const allOutOfStock = normalized.every((v) => v.stock_quantity === 0);
  const selectedOut = selectedVariant && selectedVariant.stock_quantity === 0;

  // Auto-välj första i lager om inget valt
  useEffect(() => {
    if (!selectedSize && inStockVariants.length > 0) {
      setSelectedSize(inStockVariants[0].size!);
    }
  }, [selectedSize, inStockVariants]);

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.stock_quantity > 0) {
      addToCart(selectedVariant.id);
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow relative">
      {/* Produktbild */}
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {allOutOfStock && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Slut i lager
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-primary">
            ${product.price}
          </span>
          {selectedVariant && (
            <Badge
              variant={selectedVariant.stock_quantity > 0 ? "default" : "destructive"}
            >
              {selectedVariant.stock_quantity > 0 ? "I lager" : "Slut"}
            </Badge>
          )}
        </div>

        {/* Storleksknappar */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {orderedAllSizes.map((size) => {
              const sizeVariants = normalized.filter((v) => v.size === size);
              const inStock = sizeVariants.some((v) => v.stock_quantity > 0);
              const isActive = size === selectedSize;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => inStock && setSelectedSize(size!)}
                  disabled={!inStock}
                  className={cn(
                    "px-3 py-1 border rounded text-sm transition",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background",
                    inStock
                      ? isActive
                        ? ""
                        : "hover:bg-muted cursor-pointer"
                      : "opacity-40 line-through cursor-not-allowed"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
          {selectedOut && (
            <p className="text-xs text-destructive mt-2">
              Slut i lager för denna storlek
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
        >
          {selectedVariant?.stock_quantity === 0
            ? "Slut i lager"
            : "Lägg i kundvagn"}
        </Button>
      </CardFooter>
    </Card>
  );
};
