// import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
// import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

// const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
//   apiVersion: '2024-11-20.acacia',
//   httpClient: Stripe.createFetchHttpClient(),
// })

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// }

// serve(async (req) => {
//   // Handle CORS
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   try {
//     const { cartItems } = await req.json()

//     // Validera input
//     if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
//       throw new Error('Cart is empty')
//     }

//     // Konvertera cart items till Stripe line items
//     const lineItems = cartItems.map((item: any) => ({
//       price_data: {
//         currency: 'sek',
//         product_data: {
//           name: item.product_variants?.products?.name || 'Product',
//           description: `Size: ${item.product_variants?.size || 'N/A'}, Color: ${item.product_variants?.color || 'N/A'}`,
//           images: item.product_variants?.products?.image_url 
//             ? [item.product_variants.products.image_url] 
//             : [],
//         },
//         unit_amount: Math.round((item.product_variants?.products?.price || 0) * 100), // Pris i ören
//       },
//       quantity: item.quantity,
//     }))

//     const YOUR_DOMAIN = Deno.env.get('SITE_URL') || 'http://localhost:5173'

//     // Skapa Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       ui_mode: 'embedded',
//       line_items: lineItems,
//       mode: 'payment',
//       return_url: `${YOUR_DOMAIN}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
//       automatic_tax: { enabled: false },
//       shipping_address_collection: {
//         allowed_countries: ['SE', 'NO', 'DK', 'FI'],
//       },
//     })

//     return new Response(
//       JSON.stringify({ clientSecret: session.client_secret }),
//       { 
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 200,
//       }
//     )
//   } catch (error) {
//     console.error('Error creating checkout session:', error)
//     return new Response(
//       JSON.stringify({ error: error.message }),
//       { 
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//         status: 400,
//       }
//     )
//   }
// })