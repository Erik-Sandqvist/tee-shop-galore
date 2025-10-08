import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from './pages/Index';
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Cart } from "./pages/Cart";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Header } from "./components/Header";
import { CartProvider } from '@/context/CartContext'

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          <Header />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider> {/* ✅ Här stänger du CartProvider */}
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
