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

console.log('Using Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('avatars_santos').select('*');
  if (error) {
    console.error('Error fetching avatars:', error);
  } else {
    console.log('Avatars in database:', data);
  }
}

run();
