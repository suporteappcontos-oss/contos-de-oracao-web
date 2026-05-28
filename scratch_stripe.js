const fs = require('fs');
const path = require('path');
const Stripe = require('stripe');

// Parse .env.local manually
try {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        // Remove quotes if present
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
    const email = 'j.p2013neto@gmail.com';
    console.log('Buscando customer por e-mail:', email);
    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length > 0) {
      const customer = customers.data[0];
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1
      });
      if (subscriptions.data.length > 0) {
        const sub = subscriptions.data[0];
        const rawPeriodEnd = sub.current_period_end || (sub.items && sub.items.data && sub.items.data[0] && sub.items.data[0].current_period_end);
        console.log('rawPeriodEnd extraído:', rawPeriodEnd);
        if (rawPeriodEnd) {
          const date = new Date(rawPeriodEnd * 1000);
          console.log('Data formatada pt-BR:', date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }));
        } else {
          console.log('Não foi possível extrair a data de renovação.');
        }
      }
    }
  } catch (err) {
    console.error('Erro no teste:', err);
  }
}

test();
