import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL }));

// Webhook endpoint behöver raw body, så vi hanterar det separat
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // I utvecklingsmiljö kan du skippa webhook secret
    // I produktion: använd din WEBHOOK_SECRET från Stripe Dashboard
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // För utveckling utan webhook secret
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Hantera checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Hämta line items från sessionen
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      console.log('Payment successful! Processing order...');
      console.log('Session metadata:', session.metadata);
      
      // Om du har metadata med produkt-info
      if (session.metadata && session.metadata.cartItems) {
        const cartItems = JSON.parse(session.metadata.cartItems);
        
        // Uppdatera lagersaldo för varje produkt
        for (const item of cartItems) {
          await updateProductStock(item.variantId, item.quantity);
        }
      }
      
      console.log('Order processed successfully!');
    } catch (error) {
      console.error('Error processing order:', error);
    }
  }

  res.json({ received: true });
});

// Regular JSON parsing för andra endpoints
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    // Skapa metadata med cart information
    const metadata = {
      cartItems: JSON.stringify(cartItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity,
        name: item.name
      })))
    };
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: cartItems.map(item => ({
        price_data: {
          currency: 'sek',
          product_data: { 
            name: item.name || 'Produkt',
            description: item.description || ''
          },
          unit_amount: Math.round(item.price * 100)
        },
        quantity: item.quantity
      })),
      metadata: metadata,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/cart`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint för att verifiera betalning (används på success-sidan)
app.get('/verify-payment/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (session.payment_status === 'paid') {
      res.json({ 
        success: true, 
        status: 'paid',
        customerEmail: session.customer_details?.email 
      });
    } else {
      res.json({ 
        success: false, 
        status: session.payment_status 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Funktion för att uppdatera lagersaldo
async function updateProductStock(variantId, quantityPurchased) {
  try {
    // Hämta nuvarande stock från product_variants
    const variantResult = await db.query(
      'SELECT stock, product_id FROM product_variants WHERE id = $1',
      [variantId]
    );
    
    if (variantResult.rows.length === 0) {
      console.error('Variant not found:', variantId);
      return;
    }
    
    const variant = variantResult.rows[0];
    const newStock = variant.stock - quantityPurchased;
    
    if (newStock <= 0) {
      // Ta bort varianten om stock är 0 eller mindre
      await db.query('DELETE FROM product_variants WHERE id = $1', [variantId]);
      console.log(`Variant ${variantId} deleted (out of stock)`);
      
      // Kolla om produkten har fler varianter
      const remainingVariants = await db.query(
        'SELECT COUNT(*) FROM product_variants WHERE product_id = $1',
        [variant.product_id]
      );
      
      // Om inga varianter finns kvar, ta bort produkten
      if (parseInt(remainingVariants.rows[0].count) === 0) {
        await db.query('DELETE FROM products WHERE id = $1', [variant.product_id]);
        console.log(`Product ${variant.product_id} deleted (no variants left)`);
      }
    } else {
      // Uppdatera stock
      await db.query(
        'UPDATE product_variants SET stock = $1 WHERE id = $2',
        [newStock, variantId]
      );
      console.log(`Variant ${variantId} stock updated: ${newStock}`);
    }
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
}

// Manuell purchase endpoint (för testning)
app.post('/api/purchase', async (req, res) => {
  try {
    const { variantId, quantity } = req.body;
    
    await updateProductStock(variantId, quantity);
    
    res.json({ success: true, message: 'Stock updated' });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;