const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler .env.local manualmente
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRevistas() {
  console.log('Buscando revistas do banco...');
  try {
    const { data, error } = await supabase.from('revistas').select('*');
    if (error) {
      console.error('Erro ao buscar revistas:', error);
    } else {
      console.log(`Total de revistas encontradas (com service_role): ${data.length}`);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Erro na execução:', err);
  }
}

checkRevistas();
