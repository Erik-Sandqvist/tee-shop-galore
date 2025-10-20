// src/pages/About.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, Shield, Heart, Users, Sparkles } from "lucide-react";

export const About = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <Badge className="mb-4" variant="outline">About Us</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Welcome to Nohamma
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your trusted destination for quality products and exceptional service. 
          We're passionate about bringing you the best shopping experience.
        </p>
      </div>

      {/* Our Story Section */}
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Story</h2>
          <p className="text-muted-foreground mb-4">
            Founded with a vision to revolutionize online shopping, Nohamma started 
            as a small venture driven by passion and dedication. We believe that 
            shopping should be more than just transactions – it should be an experience.
          </p>
          <p className="text-muted-foreground mb-4">
            Today, we've grown into a trusted platform serving thousands of satisfied 
            customers. Our commitment to quality, authenticity, and customer satisfaction 
            remains at the heart of everything we do.
          </p>
          <p className="text-muted-foreground">
            Every product in our collection is carefully curated to meet our high 
            standards, ensuring you receive only the best.
          </p>
        </div>
        <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop" 
            alt="Our Store" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Customer First</h3>
              <p className="text-muted-foreground">
                Your satisfaction is our top priority. We go above and beyond 
                to ensure every shopping experience exceeds expectations.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
              <p className="text-muted-foreground">
                We carefully select every product to ensure it meets our rigorous 
                quality standards. Only the best makes it to our store.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="mb-4 p-3 bg-primary/10 rounded-full w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community Focused</h3>
              <p className="text-muted-foreground">
                We're not just a store – we're a community. Building lasting 
                relationships with our customers is what drives us forward.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 md:p-12 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="mb-4 p-4 bg-background rounded-full w-fit mx-auto">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Quality Products</h3>
            <p className="text-sm text-muted-foreground">
              Carefully curated selection of premium items
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 p-4 bg-background rounded-full w-fit mx-auto">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Fast Shipping</h3>
            <p className="text-sm text-muted-foreground">
              Quick and reliable delivery to your doorstep
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 p-4 bg-background rounded-full w-fit mx-auto">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">Secure Payment</h3>
            <p className="text-sm text-muted-foreground">
              Safe and encrypted payment processing
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 p-4 bg-background rounded-full w-fit mx-auto">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold mb-2">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">
              Always here to help with any questions
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">10K+</div>
          <div className="text-muted-foreground">Happy Customers</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">500+</div>
          <div className="text-muted-foreground">Products</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">98%</div>
          <div className="text-muted-foreground">Satisfaction Rate</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">24/7</div>
          <div className="text-muted-foreground">Customer Support</div>
        </div>
      </div>

      {/* Team Section (Optional) */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
        <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
          Behind every great shopping experience is a dedicated team working 
          tirelessly to bring you the best.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 mx-auto mb-4"></div>
              <h3 className="font-bold mb-1">Emma Johnson</h3>
              <p className="text-sm text-muted-foreground mb-2">Founder & CEO</p>
              <p className="text-sm text-muted-foreground">
                Passionate about creating exceptional shopping experiences
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 mx-auto mb-4"></div>
              <h3 className="font-bold mb-1">Michael Chen</h3>
              <p className="text-sm text-muted-foreground mb-2">Head of Operations</p>
              <p className="text-sm text-muted-foreground">
                Ensuring smooth operations and timely deliveries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 mx-auto mb-4"></div>
              <h3 className="font-bold mb-1">Sarah Williams</h3>
              <p className="text-sm text-muted-foreground mb-2">Customer Success</p>
              <p className="text-sm text-muted-foreground">
                Dedicated to making every customer smile
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary text-primary-foreground rounded-xl p-8 md:p-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
        <p className="text-lg mb-6 opacity-90">
          Discover our curated collection of quality products
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/products" 
            className="bg-background text-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Browse Products
          </a>
          <a 
            href="/contact" 
            className="border-2 border-background text-background px-8 py-3 rounded-lg font-semibold hover:bg-background hover:text-foreground transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;