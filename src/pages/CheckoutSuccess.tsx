// src/pages/CheckoutSuccess.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { supabase } from '@/lib/supabase';

export const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState({
    id: searchParams.get('session_id') || '',
    status: 'processing'
  });
  
  useEffect(() => {
    // Rensa kundvagnen vid framgångsrik betalning
    clearCart();
    
    // Här kan du hämta sessionsdetaljer med Supabase Edge Function om du vill
    // och uppdatera orderdetaljer i din databas
  }, [clearCart]);

  return (
    <div className="container max-w-lg mx-auto py-12 px-4">
      <Card className="text-center">
        <CardContent className="pt-6 pb-2">
          <div className="mb-6">
            <CheckCircle2 size={64} className="text-green-500 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Tack för din beställning!</h1>
          <p className="text-gray-600 mb-4">Din betalning har bekräftats</p>
          
          {orderDetails.id && (
            <div className="bg-slate-50 p-4 rounded-md mb-4">
              <p className="text-sm text-gray-500">Ordernummer</p>
              <p className="font-mono font-medium">{orderDetails.id}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Du kommer få en bekräftelse via e-post inom kort.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center space-x-4">
          <Button onClick={() => navigate('/')}>
            Tillbaka till startsidan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};