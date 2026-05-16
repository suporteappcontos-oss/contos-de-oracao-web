const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixDB() {
  console.log('Iniciando correção do banco de dados (URLs antigas contos-apks)...');

  // Corrigir Vídeos
  const { data: videos } = await supabase.from('videos').select('*');
  let videosAtualizados = 0;
  for (const v of videos || []) {
    if (v.thumbnail_url && v.thumbnail_url.includes('contos-apks')) {
      const novaUrl = v.thumbnail_url.replace('contos-apks', 'contos-midia-app');
      await supabase.from('videos').update({ thumbnail_url: novaUrl }).eq('id', v.id);
      videosAtualizados++;
      console.log(`[Vídeos] Corrigido: ${v.titulo}`);
    }
  }

  // Corrigir Materiais
  const { data: materiais } = await supabase.from('materiais').select('*');
  let materiaisAtualizados = 0;
  for (const m of materiais || []) {
    let mudou = false;
    const payload = {};
    
    if (m.capa_url && m.capa_url.includes('contos-apks')) {
      payload.capa_url = m.capa_url.replace('contos-apks', 'contos-midia-app');
      mudou = true;
    }
    if (m.arquivo_url && m.arquivo_url.includes('contos-apks')) {
      payload.arquivo_url = m.arquivo_url.replace('contos-apks', 'contos-midia-app');
      mudou = true;
    }

    if (mudou) {
      await supabase.from('materiais').update(payload).eq('id', m.id);
      materiaisAtualizados++;
      console.log(`[Materiais] Corrigido: ${m.titulo}`);
    }
  }

  console.log('--- Resumo ---');
  console.log(`Vídeos corrigidos: ${videosAtualizados}`);
  console.log(`Materiais corrigidos: ${materiaisAtualizados}`);
  console.log('Finalizado com sucesso!');
}

fixDB();
