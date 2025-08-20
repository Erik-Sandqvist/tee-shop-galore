import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Header } from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            Premium T-Shirts for Everyone
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover our collection of high-quality, comfortable t-shirts in various colors and sizes. 
            Perfect for everyday wear or special occasions.
          </p>
          <div className="space-x-4">
            <Link to="/products">
              <Button size="lg" className="px-8">
                Shop Now
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" size="lg" className="px-8">
                View Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">👕</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Basic T-Shirts</h3>
                <p className="text-muted-foreground">Classic comfortable t-shirts for everyday wear</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Premium T-Shirts</h3>
                <p className="text-muted-foreground">High-quality premium t-shirts with superior comfort</p>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Graphic T-Shirts</h3>
                <p className="text-muted-foreground">T-shirts with unique graphic designs</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl mb-4">🚚</div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-muted-foreground">On orders over $50</p>
            </div>
            <div>
              <div className="text-3xl mb-4">↩️</div>
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-sm text-muted-foreground">30-day return policy</p>
            </div>
            <div>
              <div className="text-3xl mb-4">🌟</div>
              <h3 className="font-semibold mb-2">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">Premium materials only</p>
            </div>
            <div>
              <div className="text-3xl mb-4">💬</div>
              <h3 className="font-semibold mb-2">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
