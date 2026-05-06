const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config({ path: '.env.local' });

const stripeInstance = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function check() {
  const products = await stripeInstance.products.list({ active: true });
  products.data.forEach(p => {
    console.log(`Product: ${p.name}`);
    console.log(`Metadata beneficios: ${p.metadata.beneficios}`);
    console.log('---');
  });
}

check();
