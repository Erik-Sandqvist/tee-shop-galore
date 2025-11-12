import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from 'gsap';
import { useCart } from '@/context/CartContext';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, ProductVariant } from "@/types";

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
  enableMagicEffects?: boolean;
  glowColor?: string;
  particleCount?: number;
  enableTilt?: boolean;
  enableMagnetism?: boolean;
  clickEffect?: boolean;
  enableBorderGlow?: boolean;
}

const DEFAULT_GLOW_COLOR = '132, 0, 255';
const DEFAULT_PARTICLE_COUNT = 12;

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

const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement('div');
  el.className = 'magic-particle';
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 10px rgba(${color}, 0.8), 0 0 20px rgba(${color}, 0.4);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

export const ProductCard = ({ 
  product, 
  variants,
  enableMagicEffects = false,
  glowColor = DEFAULT_GLOW_COLOR,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  enableBorderGlow = true
}: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

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

  const sizeHasStock = (size: string) =>
    normalized.some((v) => v.size === size && getStock(v) > 0);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current || !enableMagicEffects) return;

    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor, enableMagicEffects]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach(particle => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'back.in(1.7)',
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        }
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current || !enableMagicEffects) return;

    if (!particlesInitialized.current) {
      initializeParticles();
    }

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, 
          { scale: 0, opacity: 0 }, 
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 120,
          y: (Math.random() - 0.5) * 120,
          rotation: Math.random() * 360,
          duration: 3 + Math.random() * 2,
          ease: 'none',
          repeat: -1,
          yoyo: true
        });

        gsap.to(clone, {
          opacity: 0.6,
          duration: 1.5,
          ease: 'power2.inOut',
          repeat: -1,
          yoyo: true
        });
      }, index * 80);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles, enableMagicEffects]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedVariant && getStock(selectedVariant) > 0) {
      addToCart(selectedVariant.id, 1);
    }
  };

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  // Magic effects
  useEffect(() => {
    if (!enableMagicEffects || !cardRef.current) return;

    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      setIsHovered(true);
      animateParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 3,
          rotateY: 3,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 1000
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      setIsHovered(false);
      clearAllParticles();

      if (enableTilt) {
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }

      if (enableMagnetism) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Update glow position
      const relativeX = (x / rect.width) * 100;
      const relativeY = (y / rect.height) * 100;
      setMousePos({ x: relativeX, y: relativeY });

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: 'power2.out',
          transformPerspective: 1000,
          transformStyle: 'preserve-3d'
        });
      }

      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.03;
        const magnetY = (y - centerY) * 0.03;

        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!clickEffect) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );

      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.5) 0%, rgba(${glowColor}, 0.3) 30%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 50;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          onComplete: () => ripple.remove()
        }
      );
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('click', handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('click', handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, enableMagicEffects, enableTilt, enableMagnetism, clickEffect, glowColor]);

  const cardStyle = enableMagicEffects && enableBorderGlow ? {
    '--glow-x': `${mousePos.x}%`,
    '--glow-y': `${mousePos.y}%`,
    '--glow-color': glowColor,
    '--glow-opacity': isHovered ? '1' : '0',
  } as React.CSSProperties : undefined;

  return (
    <>
      {enableMagicEffects && (
        <style>{`
          .product-card-magic {
            position: relative;
          }
          
          .product-card-magic::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: inherit;
            padding: 2px;
            background: radial-gradient(
              400px circle at var(--glow-x) var(--glow-y),
              rgba(var(--glow-color), 0.8),
              rgba(var(--glow-color), 0.4) 30%,
              transparent 60%
            );
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            pointer-events: none;
            opacity: var(--glow-opacity);
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .product-card-magic:hover {
            box-shadow: 
              0 0 30px rgba(var(--glow-color), 0.3),
              0 0 60px rgba(var(--glow-color), 0.1),
              0 4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .product-card-magic::after {
            content: '';
            position: absolute;
            inset: -100px;
            background: radial-gradient(
              600px circle at var(--glow-x) var(--glow-y),
              rgba(var(--glow-color), 0.15),
              transparent 60%
            );
            pointer-events: none;
            opacity: var(--glow-opacity);
            transition: opacity 0.3s ease;
            z-index: 0;
          }
        `}</style>
      )}
      
      <Card 
        ref={cardRef}
        className={cn(
          "overflow-hidden group hover:shadow-lg transition-shadow relative cursor-pointer",
          enableMagicEffects && "transform-gpu will-change-transform product-card-magic"
        )}
        onClick={handleCardClick}
        style={{
          ...cardStyle,
          position: 'relative',
          overflow: 'visible',
          transformStyle: enableMagicEffects ? 'preserve-3d' : undefined
        }}
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

        <CardContent className="p-4 space-y-3 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-medium line-clamp-2">{product.name}</h3>
          </div>

          <p className="text-lg font-bold">{product.price} kr</p>

          {/* Storlekar eller tomt utrymme */}
          {orderedAllSizes.length > 0 ? (
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
          ) : (
            <div className="h-[34px]"></div>
          )}
          
          {selectedOut && (
            <p className="text-xs text-destructive mt-2">
              Slut i lager för denna storlek
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 relative z-10">
          <Button 
            className="w-full" 
            onClick={handleAddToCart} 
            disabled={selectedOut}
          >
            {selectedOut ? "Slut i lager" : "Lägg i kundvagn"}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
};