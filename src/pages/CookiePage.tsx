import { CookieDemo } from '@/components/CookieDemo';
import { RecentlyViewedProducts } from '@/components/RecentlyViewedProducts';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { GuestCartDemo } from '@/components/GuestCartDemo';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CookiePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Cookie Explorer 🍪</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Utforska hur cookies fungerar i en verklig e-handelskontext
        </p>
        
        <Tabs defaultValue="basics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Grunder</TabsTrigger>
            <TabsTrigger value="guest-cart">Gäst-Varukorg</TabsTrigger>
            <TabsTrigger value="consent">Cookie Consent</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>

          {/* Grundläggande Cookie Demo */}
          <TabsContent value="basics">
            <CookieDemo />
          </TabsContent>

          {/* Guest Cart */}
          <TabsContent value="guest-cart">
            <GuestCartDemo />
          </TabsContent>

          {/* Cookie Consent Banner */}
          <TabsContent value="consent">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm">
                  <strong>⚠️ GDPR & Cookie-lagen:</strong> I EU krävs användarens samtycke innan du 
                  använder icke-nödvändiga cookies (analytics, marketing). Detta är lagkrav!
                </p>
              </div>
              <CookieConsentBanner />
            </div>
          </TabsContent>

          {/* Information */}
          <TabsContent value="info">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vanliga användningsområden för e-handel */}
                <div className="p-6 border rounded-lg">
                  <h3 className="text-xl font-bold mb-4">🛒 E-handels Cookie-användningar</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2">🔑</span>
                      <div>
                        <strong>Session Management</strong>
                        <p className="text-gray-600 dark:text-gray-400">Håller användare inloggade mellan sidvisningar</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🛍️</span>
                      <div>
                        <strong>Gäst-Varukorg</strong>
                        <p className="text-gray-600 dark:text-gray-400">Sparar kundvagn för icke-inloggade användare</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">👁️</span>
                      <div>
                        <strong>Senast Visade</strong>
                        <p className="text-gray-600 dark:text-gray-400">Visa produkter användaren nyligen tittat på</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🎨</span>
                      <div>
                        <strong>Preferenser</strong>
                        <p className="text-gray-600 dark:text-gray-400">Språk, valuta, tema, storlek, etc.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🎯</span>
                      <div>
                        <strong>Remarketing</strong>
                        <p className="text-gray-600 dark:text-gray-400">Visa annonser baserat på besökta produkter</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">📊</span>
                      <div>
                        <strong>Analytics</strong>
                        <p className="text-gray-600 dark:text-gray-400">Google Analytics, konverteringsspårning</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">💰</span>
                      <div>
                        <strong>Rabattkoder</strong>
                        <p className="text-gray-600 dark:text-gray-400">Spara applicerade kampanjkoder</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">❤️</span>
                      <div>
                        <strong>Önskelistor</strong>
                        <p className="text-gray-600 dark:text-gray-400">Gäst-önskelista innan inloggning</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* Cookie-typer */}
                <div className="p-6 border rounded-lg">
                  <h3 className="text-xl font-bold mb-4">📋 Cookie-kategorier (GDPR)</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">✅</span>
                        <strong>Nödvändiga (Strictly Necessary)</strong>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 ml-7">
                        Krävs inte samtycke. Ex: Inloggning, varukorg, säkerhet
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">⚙️</span>
                        <strong>Funktionella (Functional)</strong>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 ml-7">
                        Förbättrar upplevelsen. Ex: Språkval, tema, preferenser
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">📊</span>
                        <strong>Analytics (Performance)</strong>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 ml-7">
                        Mäter användning. Ex: Google Analytics, heatmaps
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">🎯</span>
                        <strong>Marketing (Targeting)</strong>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 ml-7">
                        Reklam & tracking. Ex: Facebook Pixel, Google Ads
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-md">
                    <p className="text-xs">
                      <strong>⚠️ VIKTIGT:</strong> Analytics, Functional och Marketing cookies 
                      kräver användarens samtycke enligt GDPR innan de aktiveras!
                    </p>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-bold mb-4">✨ Best Practices</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ GÖR:</h4>
                    <ul className="space-y-1">
                      <li>• Använd cookies för icke-känslig data</li>
                      <li>• Sätt lämpliga utgångsdatum</li>
                      <li>• Använd Secure flag för HTTPS</li>
                      <li>• Använd HttpOnly för session cookies</li>
                      <li>• Implementera SameSite för CSRF-skydd</li>
                      <li>• Komprimera data för att spara utrymme</li>
                      <li>• Be om samtycke för icke-nödvändiga cookies</li>
                      <li>• Dokumentera alla cookies i Privacy Policy</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">❌ GÖR INTE:</h4>
                    <ul className="space-y-1">
                      <li>• Lagra känslig data (lösenord, kortnummer)</li>
                      <li>• Överskrida 4KB per cookie</li>
                      <li>• Skapa fler än 50 cookies per domän</li>
                      <li>• Använd cookies för komplexa objekt (använd localStorage)</li>
                      <li>• Glöm att hantera GDPR-krav</li>
                      <li>• Sätt cookies på subdomäner utan anledning</li>
                      <li>• Lita på client-side validation (cookies kan editeras)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Code Examples */}
              <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-bold mb-4">💻 Kodexempel för Webshop</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Spara användarens valuta preferens</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// När användaren väljer valuta
const setCurrency = (currency: 'SEK' | 'EUR' | 'USD') => {
  document.cookie = \`currency=\${currency};max-age=31536000;path=/;SameSite=Lax\`;
};

// Läs valuta vid sidladdning
const getCurrency = (): string => {
  const match = document.cookie.match(/currency=([^;]+)/);
  return match ? match[1] : 'SEK'; // Default till SEK
};`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Spara affiliate tracking</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`// När användaren kommer via affiliate länk
const trackAffiliate = (affiliateId: string) => {
  // Spara i 30 dagar
  const expires = new Date();
  expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
  document.cookie = \`ref=\${affiliateId};expires=\${expires.toUTCString()};path=/\`;
};

// Vid checkout, läs referral
const getAffiliateRef = (): string | null => {
  const match = document.cookie.match(/ref=([^;]+)/);
  return match ? match[1] : null;
};`}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. "First Visit" popup hantering</h4>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const hasVisitedBefore = (): boolean => {
  return document.cookie.includes('visited=true');
};

const markAsVisited = () => {
  // Spara permanent (1 år)
  document.cookie = 'visited=true;max-age=31536000;path=/';
};

// Användning
if (!hasVisitedBefore()) {
  showWelcomePopup(); // Visa välkomst-popup med rabatt
  markAsVisited();
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Säkerhet */}
              <div className="p-6 border rounded-lg bg-red-50 dark:bg-red-950">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <span className="text-2xl mr-2">🔒</span>
                  Säkerhetsöverväganden
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>XSS-attacker:</strong>
                    <p className="text-gray-700 dark:text-gray-300">
                      Cookies kan läsas av JavaScript. Använd HttpOnly flag för känsliga cookies
                      som session tokens så att de inte kan läsas av skadlig kod.
                    </p>
                  </div>
                  <div>
                    <strong>CSRF-attacker:</strong>
                    <p className="text-gray-700 dark:text-gray-300">
                      Använd SameSite=Lax eller Strict för att förhindra att cookies skickas
                      med requests från andra webbplatser.
                    </p>
                  </div>
                  <div>
                    <strong>Man-in-the-Middle:</strong>
                    <p className="text-gray-700 dark:text-gray-300">
                      Använd Secure flag så att cookies endast skickas över HTTPS.
                    </p>
                  </div>
                  <div>
                    <strong>Client-side manipulation:</strong>
                    <p className="text-gray-700 dark:text-gray-300">
                      Validera ALLTID cookies på servern. Lita aldrig på data från klienten.
                      Använd signerade/krypterade cookies för känslig data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
