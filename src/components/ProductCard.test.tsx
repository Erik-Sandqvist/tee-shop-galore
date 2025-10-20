import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/ProductCard';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '@/context/CartContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => 
        Promise.resolve({ data: { user: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
        in: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockProduct = {
  id: 'product-1',
  name: 'Test T-Shirt',
  price: 299,
  image_url: 'https://example.com/image.jpg',
  description: 'En fin t-shirt',
  is_active: true,
  category_id: 'cat-1',
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
};

const mockVariants = [
  {
    id: 'variant-1',
    product_id: 'product-1',
    size: 'S',
    color: 'Svart',
    stock_quantity: 10,
    name: 'Small Black',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'variant-2',
    product_id: 'product-1',
    size: 'M',
    color: 'Svart',
    stock_quantity: 5,
    name: 'Medium Black',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 'variant-3',
    product_id: 'product-1',
    size: 'L',
    color: 'Svart',
    stock_quantity: 0,
    name: 'Large Black',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
];

const renderProductCard = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <ProductCard product={mockProduct} variants={mockVariants} />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render product name and price', () => {
    renderProductCard();
    
    expect(screen.getByText('Test T-Shirt')).toBeInTheDocument();
    expect(screen.getByText('299 kr')).toBeInTheDocument();
  });

  it('should show all available sizes', () => {
    renderProductCard();
    
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('L')).toBeInTheDocument();
  });

  it('should disable out of stock sizes', () => {
    renderProductCard();
    
    const sizeS = screen.getByText('S').closest('button');
    const sizeL = screen.getByText('L').closest('button');
    
    expect(sizeS).not.toBeDisabled();
    expect(sizeL).toBeDisabled();
  });

  it('should allow selecting a size', () => {
    renderProductCard();
    
    const sizeM = screen.getByText('M').closest('button');
    fireEvent.click(sizeM!);
    
    expect(sizeM).toHaveClass('bg-black');
    expect(sizeM).toHaveClass('text-white');
  });

  it('should navigate to product detail on card click', () => {
    renderProductCard();
    
    const productName = screen.getByText('Test T-Shirt');
    const card = productName.closest('.cursor-pointer');
    
    if (card) {
      fireEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/products/product-1');
    }
  });

  it('should show add to cart button when size is in stock', () => {
    renderProductCard();
    
    const button = screen.getByRole('button', { name: /lägg i kundvagn/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('should show "Slut i lager" badge when all variants are out of stock', () => {
    const outOfStockVariants = mockVariants.map(v => ({
      ...v,
      stock_quantity: 0,
    }));
    
    render(
      <BrowserRouter>
        <CartProvider>
          <ProductCard product={mockProduct} variants={outOfStockVariants} />
        </CartProvider>
      </BrowserRouter>
    );
    
    // Kolla att badge visas på bilden
    const badge = screen.getByText('Slut i lager', { 
      selector: '.absolute.top-2.left-2' 
    });
    expect(badge).toBeInTheDocument();
    
    // Kolla att knappen är disabled
    const button = screen.getByRole('button', { name: /slut i lager/i });
    expect(button).toBeDisabled();
  });
});