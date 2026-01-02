import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Cookie, Check, X } from 'lucide-react';

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
}

const COOKIE_NAME = 'cookieConsent';

export const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true, // Alltid true
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: 0,
  });

  useEffect(() => {
    // Kolla om användaren redan har godkänt
    const existingConsent = getConsent();
    if (!existingConsent) {
      // Vänta lite innan vi visar bannern
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const getConsent = (): CookieConsent | null => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(COOKIE_NAME + '='));
    
    if (cookie) {
      try {
        return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const saveConsent = (newConsent: CookieConsent) => {
    const consentWithTimestamp = {
      ...newConsent,
      timestamp: Date.now(),
    };
    
    // Spara i 365 dagar
    const expires = new Date();
    expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consentWithTimestamp))};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    
    setShowBanner(false);
    
    // Här skulle du normalt aktivera/deaktivera analytics scripts
    if (consentWithTimestamp.analytics) {
      console.log('✅ Analytics cookies enabled');
      // initGoogleAnalytics();
    }
    if (consentWithTimestamp.marketing) {
      console.log('✅ Marketing cookies enabled');
      // initFacebookPixel();
    }
  };

  const acceptAll = () => {
    const allConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: Date.now(),
    };
    saveConsent(allConsent);
  };

  const acceptNecessary = () => {
    const necessaryOnly: CookieConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: Date.now(),
    };
    saveConsent(necessaryOnly);
  };

  const acceptSelected = () => {
    saveConsent(consent);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4  shadow-xl">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-0 bg-white/95 dark:bg-gray-900/95">
          <CardHeader>
            <div className="flex items-start space-x-3">
              <Cookie className="h-6 w-6 text-orange-500 mt-1" />
              <div className="flex-1">
                <CardTitle>🍪 Vi använder cookies</CardTitle>
                <CardDescription className="mt-2">
                  Vi använder cookies för att förbättra din upplevelse på vår webbplats.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enkel vy */}
            {!showDetails && (
              <div className="flex flex-wrap gap-3">
                <Button onClick={acceptAll} size="lg" className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  Acceptera alla
                </Button>
                <Button onClick={acceptNecessary} variant="outline" size="lg">
                  <X className="h-4 w-4 mr-2" />
                  Endast nödvändiga
                </Button>
                <Button 
                  onClick={() => setShowDetails(true)} 
                  variant="ghost" 
                  size="lg"
                >
                  Anpassa
                </Button>
              </div>
            )}

            {/* Detaljerad vy */}
            {showDetails && (
              <div className="space-y-4">
                {/* Nödvändiga */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Label className="font-semibold">Nödvändiga cookies</Label>
                      <Badge variant="secondary">Krävs</Badge>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Krävs för att webbplatsen ska fungera (inloggning, varukorg)
                    </p>
                  </div>
                  <Switch checked={true} disabled />
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-semibold">Analytics cookies</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Hjälper oss förstå hur besökare använder webbplatsen (Google Analytics)
                    </p>
                  </div>
                  <Switch 
                    checked={consent.analytics}
                    onCheckedChange={(checked) => setConsent(prev => ({ ...prev, analytics: checked }))}
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-semibold">Marketing cookies</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Används för annonser och remarketing (Facebook Pixel, Google Ads)
                    </p>
                  </div>
                  <Switch 
                    checked={consent.marketing}
                    onCheckedChange={(checked) => setConsent(prev => ({ ...prev, marketing: checked }))}
                  />
                </div>

                {/* Preferences */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <Label className="font-semibold">Preferens cookies</Label>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Sparar dina inställningar (språk, tema, storlek)
                    </p>
                  </div>
                  <Switch 
                    checked={consent.preferences}
                    onCheckedChange={(checked) => setConsent(prev => ({ ...prev, preferences: checked }))}
                  />
                </div>

                {/* Knappar */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={acceptSelected} size="lg" className="flex-1">
                    Spara inställningar
                  </Button>
                  <Button 
                    onClick={() => setShowDetails(false)} 
                    variant="ghost" 
                    size="lg"
                  >
                    Tillbaka
                  </Button>
                </div>
              </div>
            )}

            {/* Privacy policy länk */}
            <p className="text-xs text-center text-gray-500">
              Läs mer om hur vi använder cookies i vår{' '}
              <a href="#" className="underline hover:text-primary">
                integritetspolicy
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Hook för att kolla consent
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(COOKIE_NAME + '='));
    
    if (cookie) {
      try {
        setConsent(JSON.parse(decodeURIComponent(cookie.split('=')[1])));
      } catch (e) {
        setConsent(null);
      }
    }
  }, []);

  return consent;
};
