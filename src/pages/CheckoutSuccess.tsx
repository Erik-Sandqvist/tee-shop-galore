// src/pages/CheckoutSuccess.tsx
import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order details from location state
  const orderId = location.state?.orderId;
  const orderTotal = location.state?.orderTotal;
  
  useEffect(() => {
    // If there's no order information, redirect to home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null; // Will redirect due to the effect
  }

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <Card className="text-center">
        <CardContent className="pt-6 pb-2">
          <div className="mb-6">
            <CheckCircle2 size={64} className="text-green-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">Thank you for your purchase</p>
          
          <div className="bg-slate-50 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-500">Order Reference</p>
            <p className="font-mono font-medium">{orderId}</p>
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="font-medium">Order Total:</span>
              <span>${orderTotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Payment Status:</span>
              <span className="text-green-600">Paid</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            We've sent a confirmation email with order details and tracking information.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/">Return to Home</Link>
          </Button>
          <Button asChild>
            <Link to="/account/orders">View My Orders</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};