import React from 'react';
import { Link } from 'react-router-dom';


export const Footer = () => (
<section className="bg-muted/30 py-16">
<div className="container mx-auto px-4">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
    <div>
      <div className="text-3xl mb-4">🚚</div>
      <h3 className="font-semibold mb-2">Grattis Leverans</h3>
      {/* <p className="text-sm text-muted-foreground">On orders over $50</p> */}
    </div>
    <div>
      <div className="text-3xl mb-4">↩️</div>
      <h3 className="font-semibold mb-2">Easy Returns</h3>
      <p className="text-sm text-muted-foreground">30-day return policy</p>
    </div>
    <Link to="/about">
    <div>
      <div className="text-3xl mb-4">🌟</div>
      <h3 className="font-semibold mb-2">Om Butiken</h3>
      <p className="text-sm text-muted-foreground">Premium materials only</p>
    </div>
    </Link>
    <div>
      <div className="text-3xl mb-4">💬</div>
      <h3 className="font-semibold mb-2">24/7 Support</h3>
      <p className="text-sm text-muted-foreground">Always here to help</p>
    </div>
  </div>
</div>
</section>

);
export default Footer;
