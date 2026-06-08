const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

// Carregar .env.local
try {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  console.error('Erro ao carregar .env.local:', e);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const products = await stripe.products.list({ active: true, limit: 100 });
    const prices = await stripe.prices.list({ active: true, limit: 100 });
    
    console.log('--- PRODUTOS E PREÇOS NO STRIPE ---');
    products.data.forEach(p => {
      console.log(`\nProduto: ${p.name} (ID: ${p.id})`);
      console.log(`Ativo: ${p.active}`);
      console.log(`Metadata:`, p.metadata);
      
      const prodPrices = prices.data.filter(pr => pr.product === p.id);
      prodPrices.forEach(pr => {
        const valor = pr.unit_amount / 100;
        console.log(`  - Preço: R$ ${valor.toFixed(2)} (ID: ${pr.id}) | Intervalo: ${pr.recurring?.interval} | interval_count: ${pr.recurring?.interval_count}`);
      });
    });
  } catch (err) {
    console.error('Erro:', err);
  }
}

test();
