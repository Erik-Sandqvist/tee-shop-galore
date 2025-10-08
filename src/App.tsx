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
import { CartProvider } from '@/context/CartContext';

// Import Admin components
import { ProductsAdmin } from "./pages/admin/Products";
import { AdminLayout } from "./components/admin/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CartProvider>
          {/* Routes will determine whether to show Header or not */}
          <Routes>
            {/* Admin routes - no Header */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              {/* Add more admin routes as needed */}
              {/* <Route path="orders" element={<OrdersAdmin />} /> */}
              {/* <Route path="settings" element={<SettingsAdmin />} /> */}
            </Route>
            
            {/* Public routes with Header */}
            <Route path="/" element={
              <>
                <Header />
                <Index />
              </>
            } />
            <Route path="/products" element={
              <>
                <Header />
                <Products />
              </>
            } />
            <Route path="/products/:id" element={
              <>
                <Header />
                <ProductDetail />
              </>
            } />
            <Route path="/cart" element={
              <>
                <Header />
                <Cart />
              </>
            } />
            <Route path="/auth" element={
              <>
                <Header />
                <Auth />
              </>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={
              <>
                <Header />
                <NotFound />
              </>
            } />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;