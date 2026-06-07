const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function checkPolicies() {
  console.log('Buscando políticas da tabela revistas...');
  try {
    const { data, error } = await supabase.rpc('get_policies_for_table', { table_name: 'revistas' });
    if (error) {
      // Se a RPC não existir, fazemos uma consulta na pg_policies
      console.log('RPC não encontrada, tentando query sql...');
      const { data: dataSql, error: errorSql } = await supabase.from('pg_policies').select('*').eq('tablename', 'revistas');
      // Espera, pg_policies é uma view do postgres, ela pode não estar exposta na API REST diretamente.
      // Vamos tentar executar via query SQL genérica se tivermos uma RPC de sql, ou usar um select simples.
      console.log('Erro ao buscar políticas diretamente via API REST:', error.message);
    } else {
      console.log('Políticas encontradas:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Erro na execução:', err);
  }
}

// Vamos tentar ler de outra forma: executando uma query SQL se a RPC "exec_sql" ou similar existir,
// ou simplesmente fazendo uma consulta de teste simulando a RLS.
async function testRLS() {
  console.log('Testando select com chave anônima (sem autenticação)...');
  const supabaseAnon = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: dataAnon, error: errorAnon } = await supabaseAnon.from('revistas').select('*');
  console.log('Anon SELECT error:', errorAnon);
  console.log('Anon SELECT data:', dataAnon);
}

testRLS();
