const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://simlfedsforfwwtlmshy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpbWxmZWRzZm9yZnd3dGxtc2h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY5NTQxOSwiZXhwIjoyMDkyMjcxNDE5fQ.hJY_bvNmWO9YDsWP3Bv8EgvoipqdkwWeeoO_e_9d74w',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log('--- BUSCANDO TODOS OS USUÁRIOS AUTH ---');
  const { data: usersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers();
  if (usersErr) {
    console.error('Erro users:', usersErr);
    return;
  }
  
  const users = usersData.users;
  users.forEach(u => console.log(`ID: ${u.id} | Email: "${u.email}"`));

  console.log('\n--- BUSCANDO TODOS OS PERFIS ---');
  const { data: perfis, error: perfisErr } = await supabaseAdmin.from('perfis').select('*');
  if (perfisErr) {
    console.error('Erro perfis:', perfisErr);
    return;
  }
  
  perfis.forEach(p => console.log(`ID: ${p.id} | Role: ${p.role} | Nome: ${p.nome}`));

  console.log('\n--- TENTANDO ATUALIZAR TODOS PARA ADMIN ---');
  for (const u of users) {
    const { error: updErr } = await supabaseAdmin.from('perfis').upsert({ id: u.id, role: 'admin', nome: 'Admin Forçado' });
    if (updErr) {
      console.error(`Falha ao dar admin para ${u.email}:`, updErr.message);
    } else {
      console.log(`✅ Admin garantido para: ${u.email}`);
    }
  }
}

run();
