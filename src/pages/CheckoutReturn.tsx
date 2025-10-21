import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      navigate('/');
      return;
    }

    const fetchSessionStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('session-status', {
          body: { session_id: sessionId }
        });

        if (error) throw error;

        setStatus(data.status);
        setCustomerEmail(data.customer_email || '');

        // Om betalningen är klar, rensa kundvagnen
        if (data.status === 'complete') {
          await clearCart();
        }
      } catch (error) {
        console.error('Error fetching session status:', error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionStatus();
  }, [searchParams, navigate, clearCart]);

  // Redirect om sessionen fortfarande är öppen
  if (status === 'open') {
    navigate('/checkout');
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-lg">Verifierar din betalning...</p>
        </div>
      </div>
    );
  }

  if (status === 'complete') {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-3xl">Tack för din beställning!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">
              Din betalning har genomförts och din beställning är bekräftad.
            </p>
            {customerEmail && (
              <p className="text-muted-foreground">
                En orderbekräftelse har skickats till <strong>{customerEmail}</strong>
              </p>
            )}
            <div className="pt-6 space-y-3">
              <Button onClick={() => navigate('/products')} className="w-full">
                Fortsätt handla
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline" 
                className="w-full"
              >
                Tillbaka till startsidan
              </Button>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              Har du frågor? Kontakta oss på{' '}
              <a href="mailto:support@nohamma.se" className="text-primary hover:underline">
                support@nohamma.se
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <CardTitle className="text-3xl">Något gick fel</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg">
            Det uppstod ett problem med din betalning.
          </p>
          <p className="text-muted-foreground">
            Ingen betalning har dragits från ditt konto.
          </p>
          <div className="pt-6 space-y-3">
            <Button onClick={() => navigate('/cart')} className="w-full">
              Tillbaka till kundvagn
            </Button>
            <Button 
              onClick={() => navigate('/checkout')} 
              variant="outline" 
              className="w-full"
            >
              Försök igen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};