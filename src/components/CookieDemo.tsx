import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Helper-funktioner för att hantera cookies
const cookieUtils = {
  // Sätt en cookie
  set: (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  },

  // Hämta en cookie
  get: (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  // Ta bort en cookie
  delete: (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  },

  // Hämta alla cookies
  getAll: (): Record<string, string> => {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.split('=').map(c => c.trim());
      if (name) cookies[name] = value || '';
    });
    return cookies;
  }
};

export const CookieDemo = () => {
  const [cookieName, setCookieName] = useState('testCookie');
  const [cookieValue, setCookieValue] = useState('Hello from cookies! 🍪');
  const [allCookies, setAllCookies] = useState<Record<string, string>>({});
  const [readValue, setReadValue] = useState<string | null>(null);

  // Uppdatera listan över cookies
  const refreshCookies = () => {
    setAllCookies(cookieUtils.getAll());
  };

  // Ladda cookies när komponenten mountas
  useEffect(() => {
    refreshCookies();
  }, []);

  const handleSetCookie = () => {
    cookieUtils.set(cookieName, cookieValue, 7); // 7 dagar
    refreshCookies();
    alert(`Cookie "${cookieName}" har sparats! ✅`);
  };

  const handleGetCookie = () => {
    const value = cookieUtils.get(cookieName);
    setReadValue(value);
    if (value) {
      alert(`Cookie värde: ${value}`);
    } else {
      alert(`Cookie "${cookieName}" hittades inte!`);
    }
  };

  const handleDeleteCookie = () => {
    cookieUtils.delete(cookieName);
    refreshCookies();
    setReadValue(null);
    alert(`Cookie "${cookieName}" har tagits bort! 🗑️`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>🍪 Cookie Demo</CardTitle>
        <CardDescription>
          Utforska hur cookies fungerar i din webbläsare
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sätt cookie */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">1. Sätt en Cookie</h3>
          <div className="space-y-2">
            <Label htmlFor="cookieName">Cookie namn</Label>
            <Input
              id="cookieName"
              value={cookieName}
              onChange={(e) => setCookieName(e.target.value)}
              placeholder="t.ex. userName"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cookieValue">Cookie värde</Label>
            <Input
              id="cookieValue"
              value={cookieValue}
              onChange={(e) => setCookieValue(e.target.value)}
              placeholder="t.ex. Erik"
            />
          </div>
          <Button onClick={handleSetCookie} className="w-full">
            Spara Cookie (gäller i 7 dagar)
          </Button>
        </div>

        {/* Läs cookie */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-lg font-semibold">2. Läs en Cookie</h3>
          <Button onClick={handleGetCookie} variant="outline" className="w-full">
            Läs Cookie: {cookieName}
          </Button>
          {readValue && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
              <p className="text-sm font-mono">
                <strong>Värde:</strong> {readValue}
              </p>
            </div>
          )}
        </div>

        {/* Ta bort cookie */}
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-lg font-semibold">3. Ta bort en Cookie</h3>
          <Button onClick={handleDeleteCookie} variant="destructive" className="w-full">
            Ta bort Cookie: {cookieName}
          </Button>
        </div>

        {/* Visa alla cookies */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">4. Alla Cookies</h3>
            <Button onClick={refreshCookies} variant="ghost" size="sm">
              Uppdatera 🔄
            </Button>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-md max-h-60 overflow-auto">
            {Object.keys(allCookies).length > 0 ? (
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(allCookies, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-500">Inga cookies hittades</p>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md space-y-2">
          <h4 className="font-semibold text-sm">💡 Tips:</h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Cookies sparas i din webbläsare</li>
            <li>De är synliga i DevTools → Application → Cookies</li>
            <li>Cookies skickas automatiskt med varje HTTP-request</li>
            <li>Max storlek: ~4KB per cookie</li>
            <li>Använd för: användarpreferenser, sessions, tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Exportera även utility-funktionerna för användning i andra komponenter
export { cookieUtils };
