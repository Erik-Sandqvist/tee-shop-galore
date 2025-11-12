import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { useCart } from "@/hooks/useCart";
import { useCart } from '@/context/CartContext';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, ProductVariant } from "@/types";

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
}

// Robust lagerläsning
const getStock = (v: ProductVariant) => {
  const raw =
    (v as any).stock_quantity ??
    (v as any).stock ??
    (v as any).inventory ??
    (v as any).quantity ??
    0;
  const n = typeof raw === "string" ? parseInt(raw, 10) : Number(raw);
  return Number.isFinite(n) ? n : 0;
};

export const ProductCard = ({ product, variants }: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Normalisera storlekar
  const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"] as const;
  const normalized = variants.map((v) => ({
    ...v,
    size: v.size ? String(v.size).toUpperCase() : v.size,
  }));

  // Alla storlekar i rätt ordning
  const allSizes = [...new Set(normalized.map((v) => v.size).filter(Boolean))] as string[];
  const orderedAllSizes = [...allSizes].sort((a, b) => {
    const ai = sizeOrder.indexOf(a as any);
    const bi = sizeOrder.indexOf(b as any);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Lagerstatus och vald variant
  const inStockVariants = normalized.filter((v) => getStock(v) > 0);
  const selectedVariant =
    normalized.find((v) => v.size === selectedSize && getStock(v) > 0) ||
    normalized.find((v) => v.size === selectedSize) ||
    (selectedSize ? undefined : inStockVariants[0]) ||
    normalized[0];

  const allOutOfStock = normalized.every((v) => getStock(v) === 0);
  const selectedOut = !selectedVariant || getStock(selectedVariant) === 0;

  // Auto-välj första i lager om inget valt
  // useEffect(() => {
  //   if (!selectedSize && inStockVariants.length > 0) {
  //     setSelectedSize(inStockVariants[0].size!);
  //   }
  // }, [selectedSize, inStockVariants]);

  const sizeHasStock = (size: string) =>
    normalized.some((v) => v.size === size && getStock(v) > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Förhindra navigation när man klickar på knappen
    if (selectedVariant && getStock(selectedVariant) > 0) {
      addToCart(selectedVariant.id, 1); // Default quantity set to 1
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  return (
    <Card 
      className="overflow-hidden group hover:shadow-lg transition-shadow relative cursor-pointer"
      onClick={handleCardClick}
    >
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

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium line-clamp-2">{product.name}</h3>
        </div>

        <p className="text-lg font-bold">{product.price} kr</p>

        {/* Storlekar */}
        {orderedAllSizes.length > 0 && (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {orderedAllSizes.map((size) => {
              const available = sizeHasStock(size);
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(size);
                  }}
                  disabled={!available}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded border transition",
                    isSelected
                      ? "bg-black text-white border-black"
                      : "bg-white text-black hover:bg-neutral-100",
                    !available && "opacity-50 cursor-not-allowed"
                  )}
                  aria-pressed={isSelected}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}
        {selectedOut && (
          <p className="text-xs text-destructive mt-2">
            Slut i lager för denna storlek
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full" 
          onClick={handleAddToCart} 
          disabled={selectedOut}
        >
          {selectedOut ? "Slut i lager" : "Lägg i kundvagn"}
        </Button>
      </CardFooter>
    </Card>
  );
};