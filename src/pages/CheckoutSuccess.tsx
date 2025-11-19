import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { clearCart } = useCart();

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMessage('Ingen session hittades');
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`http://localhost:3000/verify-payment/${sessionId}`);
        const data = await response.json();

        if (data.success && data.status === 'paid') {
          setStatus('success');
          // Rensa kundvagnen efter lyckad betalning
          clearCart();
        } else {
          setStatus('error');
          setErrorMessage('Betalningen kunde inte verifieras');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setErrorMessage('Ett fel uppstod vid verifiering av betalning');
      }
    };

    verifyPayment();
  }, [sessionId, clearCart]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {status === 'loading' && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <h2 className="text-2xl font-bold mb-2">Verifierar betalning...</h2>
              <p className="text-muted-foreground">Vänligen vänta</p>
            </CardContent>
          </Card>
        )}

        {status === 'success' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-center text-3xl">Tack för ditt köp!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                Din betalning har genomförts och din order behandlas nu.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Du kommer att få en orderbekräftelse via e-post inom kort.
              </p>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products">
                  <Button size="lg">Fortsätt handla</Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" size="lg">Mina beställningar</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {status === 'error' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-center text-3xl">Något gick fel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                {errorMessage || 'Din betalning kunde inte verifieras.'}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                Om du har blivit debiterad men inte fått någon bekräftelse, vänligen kontakta vår support.
              </p>
              
              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/cart">
                  <Button size="lg">Tillbaka till kundvagn</Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="lg">Fortsätt handla</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};