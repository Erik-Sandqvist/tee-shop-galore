import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/hooks/useCart';
import { Product, ProductVariant } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Samma getStock funktion som i ProductCard
const getStock = (v: ProductVariant) => {
  const raw =
    (v as any).stock_quantity ??
    (v as any).stock ??
    (v as any).inventory ??
    (v as any).quantity ??
    0;
  const n = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
  return Number.isFinite(n) ? n : 0;
};

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Hämta produkten
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        setProduct(productData);

        // Hämta varianter
        const { data: variantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', id);

        if (variantsError) throw variantsError;
        
        // Normalisera storlekar
        const normalized = (variantsData || []).map(v => ({
          ...v,
          size: v.size ? String(v.size).toUpperCase() : v.size,
        }));
        
        setVariants(normalized);

        // Auto-välj första tillgängliga variant
        const inStock = normalized.filter(v => getStock(v) > 0);
        if (inStock.length > 0) {
          setSelectedSize(inStock[0].size || '');
          setSelectedColor(inStock[0].color || '');
        } else if (normalized.length > 0) {
          setSelectedSize(normalized[0].size || '');
          setSelectedColor(normalized[0].color || '');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Laddar produkt...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produkten hittades inte</h2>
          <Button onClick={() => navigate('/products')}>Tillbaka till produkter</Button>
        </div>
      </div>
    );
  }

  // Sortera storlekar
  const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
  const allSizes = [...new Set(variants.map(v => v.size).filter(Boolean))] as string[];
  const orderedSizes = [...allSizes].sort((a, b) => {
    const ai = sizeOrder.indexOf(a as any);
    const bi = sizeOrder.indexOf(b as any);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  // Hämta alla färger
  const allColors = [...new Set(variants.map(v => v.color).filter(Boolean))] as string[];

  // Hitta vald variant
  const selectedVariant = variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );

  const selectedStock = selectedVariant ? getStock(selectedVariant) : 0;
  const canAddToCart = selectedVariant && selectedStock > 0;

  // Kolla vilka storlekar/färger som finns i lager
  const sizeHasStock = (size: string) => {
    if (selectedColor) {
      return variants.some(v => v.size === size && v.color === selectedColor && getStock(v) > 0);
    }
    return variants.some(v => v.size === size && getStock(v) > 0);
  };

  const colorHasStock = (color: string) => {
    if (selectedSize) {
      return variants.some(v => v.color === color && v.size === selectedSize && getStock(v) > 0);
    }
    return variants.some(v => v.color === color && getStock(v) > 0);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedStock === 0) return;
    
    setAddingToCart(true);
    await addToCart(selectedVariant.id);
    setAddingToCart(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tillbaka-knapp */}
      <Button
        variant="ghost"
        onClick={() => navigate('/products')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Tillbaka till produkter
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Produktbild */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Produktinformation */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold">{product.price} kr</p>
          </div>

          {product.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Beskrivning</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Färgval */}
          {allColors.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Färg</h3>
              <div className="flex flex-wrap gap-2">
                {allColors.map(color => {
                  const available = colorHasStock(color);
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      disabled={!available}
                      className={cn(
                        'px-4 py-2 rounded-md border transition',
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black hover:bg-gray-50',
                        !available && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Storleksval */}
          {orderedSizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Storlek</h3>
              <div className="flex flex-wrap gap-2">
                {orderedSizes.map(size => {
                  const available = sizeHasStock(size);
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!available}
                      className={cn(
                        'px-4 py-2 rounded-md border transition min-w-[60px]',
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black hover:bg-gray-50',
                        !available && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lagerstatus */}
          <div>
            {selectedStock > 0 ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Check className="mr-1 h-3 w-3" />
                {selectedStock} st i lager
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                Slut i lager
              </Badge>
            )}
          </div>

          {/* Lägg i kundvagn */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={!canAddToCart || addingToCart}
          >
            {addingToCart ? (
              'Lägger till...'
            ) : canAddToCart ? (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Lägg i kundvagn
              </>
            ) : (
              'Slut i lager'
            )}
          </Button>

          {/* Produktdetaljer */}
          {selectedVariant && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Produktdetaljer</h3>
                <div className="space-y-2 text-sm">
                  {(selectedVariant as any).sku && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Artikelnummer:</span>
                      <span className="font-medium">{(selectedVariant as any).sku}</span>
                    </div>
                  )}
                  {selectedVariant.size && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Storlek:</span>
                      <span className="font-medium">{selectedVariant.size}</span>
                    </div>
                  )}
                  {selectedVariant.color && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Färg:</span>
                      <span className="font-medium">{selectedVariant.color}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};