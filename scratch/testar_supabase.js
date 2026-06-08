const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://simlfedsforfwwtlmshy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não encontrada no env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data: videos, error } = await supabase
      .from('videos_tematicos')
      .select('*');
      
    if (error) {
      console.error('Erro ao buscar vídeos temáticos:', error);
    } else {
      console.log(`Encontrados ${videos.length} vídeos temáticos no banco:`);
      videos.forEach(v => {
        console.log(`- ID: ${v.id} | Título: ${v.titulo} | Ativo: ${v.ativo} | Video URL: ${v.video_url}`);
      });
    }
  } catch (err) {
    console.error('Erro:', err);
  }
}

test();
