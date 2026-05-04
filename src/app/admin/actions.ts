'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function getAdminClient() {
  return createSupabaseAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function verificarAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') redirect('/')
  return { supabase, user }
  return { supabase, user }
}

// ─── Helper de Upload pro Bunny.net ───
async function uploadToBunny(file: File, prefix: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const extensao = file.name.split('.').pop() || 'jpg';
  const fileName = `${prefix}_${Date.now()}.${extensao}`;

  const res = await fetch(`https://br.storage.bunnycdn.com/contos-apks/${fileName}`, {
    method: 'PUT',
    headers: {
      'AccessKey': '5513bf80-0970-4a66-a4e06d748364-2d6f-4522',
      'Content-Type': file.type || 'image/jpeg',
    },
    body: arrayBuffer // Envio direto do ArrayBuffer suportado pelo fetch() nativo
  });

  if (!res.ok) throw new Error(`Falha no upload [${res.status}]: ${res.statusText}`);
  return `https://contos-apks.b-cdn.net/${fileName}`;
}

// ─── Adicionar vídeo ───
export async function adicionarVideo(formData: FormData) {
  const { supabase } = await verificarAdmin()

  let thumbnailUrl = formData.get('thumbnail_url') as string;
  const thumbFile = formData.get('thumbnail_file') as File | null;
  if (thumbFile && typeof thumbFile !== 'string' && thumbFile.size > 0) {
    thumbnailUrl = await uploadToBunny(thumbFile, 'thumb');
  }

  const { error } = await supabase.from('videos').insert({
    titulo: formData.get('titulo') as string,
    descricao: (formData.get('descricao') as string) || null,
    categoria: (formData.get('categoria') as string) || 'Geral',
    bunny_video_id: formData.get('bunny_video_id') as string,
    bunny_library_id: process.env.BUNNY_LIBRARY_ID || '642831',
    thumbnail_url: thumbnailUrl || null,
    duracao: (formData.get('duracao') as string) || null,
    ativo: true,
  })
  if (error) console.error('❌ Erro ao adicionar vídeo:', error.message)
  revalidatePath('/admin')
  revalidatePath('/watch')
}

// ─── Editar vídeo ───
export async function editarVideo(videoId: string, formData: FormData) {
  const { supabase } = await verificarAdmin()

  let thumbnailUrl = formData.get('thumbnail_url') as string;
  const thumbFile = formData.get('thumbnail_file') as File | null;
  if (thumbFile && typeof thumbFile !== 'string' && thumbFile.size > 0) {
    thumbnailUrl = await uploadToBunny(thumbFile, 'thumb');
  }

  await supabase.from('videos').update({
    titulo: formData.get('titulo') as string,
    descricao: (formData.get('descricao') as string) || null,
    categoria: formData.get('categoria') as string,
    thumbnail_url: thumbnailUrl || null,
    duracao: (formData.get('duracao') as string) || null,
  }).eq('id', videoId)
  
  revalidatePath('/admin')
  revalidatePath('/watch')
  redirect('/admin?tab=videos')
}

// ─── Ativar / Desativar vídeo ───
export async function toggleVideoAtivo(videoId: string, ativoAtual: boolean) {
  const { supabase } = await verificarAdmin()
  await supabase.from('videos').update({ ativo: !ativoAtual }).eq('id', videoId)
  revalidatePath('/admin')
  revalidatePath('/watch')
  redirect('/admin?tab=videos')
}

// ─── Deletar vídeo ───
export async function deletarVideo(videoId: string) {
  const { supabase } = await verificarAdmin()
  await supabase.from('videos').delete().eq('id', videoId)
  revalidatePath('/admin')
  revalidatePath('/watch')
  redirect('/admin?tab=videos')
}

// ─── Ativar / Bloquear assinante ───
export async function togglePlanoUsuario(userId: string, planoAtual: boolean) {
  await verificarAdmin()
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { plano_ativo: !planoAtual },
  })
  if (error) console.error('❌ Erro ao atualizar plano:', error.message)
  revalidatePath('/admin')
}

// ─── Salvar Configuração Global (Fundo do app/site) ───
export async function salvarConfiguracao(formData: FormData) {
  await verificarAdmin();

  try {
    const file = formData.get('backgroundImage') as File | null;

    if (!file || typeof file === 'string' || file.size === 0) {
      console.error('Nenhum arquivo válido recebido.');
      return;
    }

    // 1. Faz upload usando o helper seguro
    const bgUrl = await uploadToBunny(file, 'background');
    const config = { background_url: bgUrl };

    // 2. Atualiza o config.json apontando para a nova imagem
    const resConf = await fetch(`https://br.storage.bunnycdn.com/contos-apks/config.json`, {
      method: 'PUT',
      headers: {
        'AccessKey': '5513bf80-0970-4a66-a4e06d748364-2d6f-4522',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    });

    if (!resConf.ok) throw new Error(`Erro config.json: ${resConf.statusText}`);

    revalidatePath('/', 'layout');
  } catch (error: any) {
    console.error('❌ Erro no salvarConfiguracao:', error.message || error);
  }
}
