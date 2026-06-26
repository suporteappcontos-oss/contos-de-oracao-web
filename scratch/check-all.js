const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('./.env.local', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '').replace(/\r$/, '');
    env[key] = value;
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: videos, error: err1 } = await supabase.from('videos').select('id, titulo');
  const { data: perfis, error: err2 } = await supabase.from('perfis').select('id, nome');
  const { data: avatars, error: err3 } = await supabase.from('avatars_santos').select('id, nome');
  console.log('Videos:', videos || err1);
  console.log('Perfis:', perfis || err2);
  console.log('Avatars:', avatars || err3);
}

run();
