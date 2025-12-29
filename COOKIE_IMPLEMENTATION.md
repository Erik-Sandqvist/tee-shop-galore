# Cookie-implementationer i Tee Shop Galore

## 🍪 Implementerade funktioner

### 1. **Senast Visade Produkter** (Recently Viewed)

#### Hur det fungerar:
- När en användare besöker en produktsida (ProductDetail) sparas produkten automatiskt i en cookie
- Max 10 produkter sparas (de äldsta tas bort automatiskt)
- Cookien gäller i 30 dagar
- Visas på:
  - **Startsidan** (Index) - visar 4 senaste produkter
  - **Produktsidan** (Products) - visar 4 senaste produkter
  - **Cookie Demo-sidan** (/cookies) - full hantering

#### Filer som påverkats:
- `src/components/RecentlyViewedProducts.tsx` - Huvudkomponent med all logik
- `src/components/RecentlyViewedSection.tsx` - Sektion för att visa på andra sidor
- `src/pages/ProductDetail.tsx` - Anropar `trackProductView()` när produkt visas
- `src/pages/Index.tsx` - Visar senast visade produkter
- `src/pages/Products.tsx` - Visar senast visade produkter

#### Användning i kod:
```typescript
import { trackProductView } from '@/components/RecentlyViewedProducts';

// När en produkt visas:
trackProductView(
  productId,
  productName,
  productPrice,
  imageUrl
);
```

---

### 2. **Cookie Consent Banner** (GDPR-kompatibel)

#### Hur det fungerar:
- Visas automatiskt för nya besökare efter 1 sekund
- Låter användare välja vilka cookie-kategorier de accepterar:
  - ✅ **Nödvändiga** (krävs alltid, kan inte stängas av)
  - ⚙️ **Preferenser** (tema, språk, etc.)
  - 📊 **Analytics** (Google Analytics, etc.)
  - 🎯 **Marketing** (Facebook Pixel, Google Ads, etc.)
- Sparar användarens val i en cookie som gäller i 365 dagar
- Bannern visas inte igen efter att användaren har gjort ett val

#### Filer som påverkats:
- `src/components/CookieConsentBanner.tsx` - Huvudkomponent
- `src/App.tsx` - Bannern visas globalt i hela appen

#### Användning i kod:
```typescript
import { useCookieConsent } from '@/components/CookieConsentBanner';

// Kolla om användaren har godkänt analytics:
const consent = useCookieConsent();

if (consent?.analytics) {
  // Aktivera Google Analytics
  initGoogleAnalytics();
}

if (consent?.marketing) {
  // Aktivera Facebook Pixel
  initFacebookPixel();
}
```

---

## 🎯 Andra implementerade demos (endast på /cookies-sidan)

### 3. **Grundläggande Cookie Demo**
- Interaktiv demo för att lära sig hur cookies fungerar
- Sätt, läs och ta bort cookies
- Visa alla aktiva cookies

### 4. **Gäst-Varukorg Demo**
- Visar hur man kan spara en varukorg för icke-inloggade användare
- Automatisk utgångsdatum (7 dagar)
- Flyttas till databasen när användaren loggar in

---

## 📁 Cookie-struktur

### Cookie: `recentlyViewed`
```json
[
  {
    "id": "product-123",
    "name": "Cool T-Shirt",
    "price": 299,
    "image": "https://...",
    "viewedAt": 1735488000000
  }
]
```
- **Max storlek:** ~3-4 KB
- **Utgångsdatum:** 30 dagar
- **Path:** /
- **SameSite:** Lax

### Cookie: `cookieConsent`
```json
{
  "necessary": true,
  "analytics": false,
  "marketing": false,
  "preferences": true,
  "timestamp": 1735488000000
}
```
- **Max storlek:** <1 KB
- **Utgångsdatum:** 365 dagar
- **Path:** /
- **SameSite:** Lax

---

## 🚀 Hur man testar

1. **Testa Senast Visade:**
   - Gå till `/products`
   - Klicka på några produkter
   - Gå tillbaka till startsidan (`/`)
   - Se sektionen "Senast Visade Produkter" längst ner

2. **Testa Cookie Consent:**
   - Öppna sidan i inkognito-läge
   - Vänta 1 sekund
   - Cookie consent-bannern dyker upp
   - Testa olika alternativ:
     - "Acceptera alla"
     - "Endast nödvändiga"
     - "Anpassa" för att välja specifika kategorier

3. **Testa Cookie Demo:**
   - Gå till `/cookies`
   - Utforska alla 5 flikar med olika funktioner

---

## 🔒 Säkerhet & GDPR

### GDPR-kompatibilitet:
- ✅ Cookie consent visas innan icke-nödvändiga cookies används
- ✅ Tydlig kategorisering av cookie-typer
- ✅ Användaren kan välja vilka cookies som ska aktiveras
- ✅ Val sparas och respekteras

### Säkerhet:
- Cookies innehåller ingen känslig information
- Använder SameSite=Lax för CSRF-skydd
- Ingen personlig identifierbar information (PII) sparas
- Client-side cookies valideras alltid på server-sidan (där det är relevant)

---

## 📊 Framtida förbättringar

1. **Server-side cookie management:**
   - Använd signerade cookies för säkerhet
   - Kryptera känslig data

2. **Analytics integration:**
   - Koppla cookie consent till riktig Google Analytics
   - Implementera event tracking

3. **Marketing integration:**
   - Facebook Pixel
   - Google Ads remarketing
   - Dynamic remarketing för produkter

4. **Extended features:**
   - "Köp igen" baserat på tidigare köp
   - Personaliserade rekommendationer
   - Wishlist för gäster

---

## 🛠️ Tech Stack

- **React 18** med TypeScript
- **Cookie management:** Vanilla JavaScript (document.cookie)
- **UI Components:** Shadcn/ui
- **Routing:** React Router v6
- **State:** React Context API

---

## 📝 Nästa steg

För att göra detta production-ready:

1. Lägg till en **Privacy Policy** sida
2. Lägg till en **Cookie Policy** sida
3. Implementera riktig analytics (om consent.analytics === true)
4. Implementera riktig marketing tracking (om consent.marketing === true)
5. Testa cookies med riktig Stripe checkout
6. Överväg att använda ett library som `js-cookie` för bättre cookie-hantering
7. Implementera server-side cookie management för känsliga sessions

---

## 🎉 Resultat

Din webshop har nu:
- ✅ GDPR-kompatibel cookie consent
- ✅ Automatisk spårning av senast visade produkter
- ✅ Full cookie-demo för utbildning
- ✅ Best practices för cookie-säkerhet
- ✅ Skalbar arkitektur för framtida cookie-funktioner
