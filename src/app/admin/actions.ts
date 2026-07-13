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
}

async function registrarLogAuditoria(acao: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const adminSupabase = getAdminClient()
    await adminSupabase.from('logs_auditoria_admin').insert({
      user_id: user.id,
      user_email: user.email,
      acao
    })
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error)
  }
}

function gerarSlug(texto: string) {
  if (!texto) return 'video';
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-');
}

// â”€â”€â”€ Helper de Upload pro Bunny.net â”€â”€â”€
async function uploadToBunny(file: File, prefix: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const extensao = file.name.split('.').pop() || 'jpg';
  const fileName = `${prefix}_${Date.now()}.${extensao}`;

  const res = await fetch(`https://br.storage.bunnycdn.com/contos-midia-app/${fileName}`, {
    method: 'PUT',
    headers: {
      'AccessKey': '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c',
      'Content-Type': file.type || 'image/jpeg',
    },
    body: arrayBuffer // Envio direto do ArrayBuffer suportado pelo fetch() nativo
  });

  if (!res.ok) throw new Error(`Falha no upload [${res.status}]: ${res.statusText}`);
  return `https://contos-midia-app.b-cdn.net/${fileName}`;
}

// â”€â”€â”€ Adicionar VÃ­deo TemÃ¡tico (Instagram) â”€â”€â”€
export async function adicionarVideoTematico(formData: FormData) {
  const { supabase } = await verificarAdmin()

  const titulo    = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string | null
  const bunnyId   = formData.get('bunny_video_id') as string
  const capaUrl   = formData.get('capa_url') as string | null

  if (!titulo?.trim()) return { success: false, error: 'TÃ­tulo obrigatÃ³rio.' }
  if (!bunnyId?.trim()) return { success: false, error: 'Video ID do Bunny obrigatÃ³rio.' }

  // Monta a video_url usando a biblioteca Instagram dedicada
  const bunnyLibraryId = process.env.NEXT_PUBLIC_BUNNY_INSTAGRAM_LIBRARY_ID || process.env.BUNNY_INSTAGRAM_LIBRARY_ID || '678138'
  const videoUrl = `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyId}`

  const { error } = await supabase.from('videos_tematicos').insert({
    titulo:    titulo.trim(),
    descricao: descricao?.trim() || null,
    video_url: videoUrl,
    capa_url:  capaUrl || null,
    ativo:     true,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/videos-tematicos')
  return { success: true }
}

// â”€â”€â”€ Deletar VÃ­deo TemÃ¡tico â”€â”€â”€
export async function deletarVideoTematico(id: string) {
  const { supabase } = await verificarAdmin()
  const { error } = await supabase.from('videos_tematicos').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  revalidatePath('/videos-tematicos')
  return { success: true }
}

// â”€â”€â”€ Toggle Ativo VÃ­deo TemÃ¡tico â”€â”€â”€
export async function toggleVideoTematicoAtivo(id: string, ativo: boolean) {
  const { supabase } = await verificarAdmin()
  const { error } = await supabase.from('videos_tematicos').update({ ativo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  revalidatePath('/videos-tematicos')
  return { success: true }
}

// â”€â”€â”€ Editar VÃ­deo TemÃ¡tico â”€â”€â”€
export async function editarVideoTematico(formData: FormData) {
  const { supabase } = await verificarAdmin()

  const id       = formData.get('id') as string
  const titulo   = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string | null
  const bunnyId  = formData.get('bunny_video_id') as string
  const capaUrl  = formData.get('capa_url') as string | null

  if (!id?.trim())     return { success: false, error: 'ID invÃ¡lido.' }
  if (!titulo?.trim()) return { success: false, error: 'TÃ­tulo obrigatÃ³rio.' }
  if (!bunnyId?.trim()) return { success: false, error: 'Bunny Video ID obrigatÃ³rio.' }

  const bunnyLibraryId = process.env.NEXT_PUBLIC_BUNNY_INSTAGRAM_LIBRARY_ID
    || process.env.BUNNY_INSTAGRAM_LIBRARY_ID
    || '678138'
  const videoUrl = `https://iframe.mediadelivery.net/embed/${bunnyLibraryId}/${bunnyId.trim()}`

  const { error } = await supabase
    .from('videos_tematicos')
    .update({
      titulo:    titulo.trim(),
      descricao: descricao?.trim() || null,
      video_url: videoUrl,
      capa_url:  capaUrl?.trim() || null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin')
  revalidatePath('/videos-tematicos')
  return { success: true }
}


// â”€â”€â”€ Adicionar vÃ­deo â”€â”€â”€
export async function adicionarVideo(formData: FormData) {
  const { supabase } = await verificarAdmin()

  const titulo = formData.get('titulo') as string;
  let thumbnailUrl = formData.get('thumbnail_url') as string;
  const thumbFile = formData.get('thumbnail_file') as File | null;
  const emBreve = formData.get('em_breve') === 'true';
  
  try {
    if (thumbFile && typeof thumbFile !== 'string' && thumbFile.size > 0) {
      const slug = gerarSlug(titulo);
      thumbnailUrl = await uploadToBunny(thumbFile, `capas_videos/${slug}/capa`);
    }
  } catch (error: any) {
    console.error('âŒ Erro no upload da thumbnail pro Bunny:', error.message)
    // Continua salvando o vÃ­deo mesmo sem thumbnail, para nÃ£o quebrar a tela
  }

  const bunnyVideoId = (formData.get('bunny_video_id') as string) || null;
  const duracao = (formData.get('duracao') as string) || null;

  const categoria = (formData.get('categoria') as string) || 'Geral';
  const temporadaNome = categoria === 'Temporada' ? ((formData.get('temporada_nome') as string) || null) : null;
  const episodioNumeroStr = categoria === 'Temporada' ? formData.get('episodio_numero') : null;
  const episodioNumero = episodioNumeroStr ? parseInt(episodioNumeroStr as string, 10) : null;

  const { error } = await supabase.from('videos').insert({
    titulo: titulo,
    descricao: (formData.get('descricao') as string) || null,
    categoria: categoria,
    bunny_video_id: emBreve ? (bunnyVideoId || null) : bunnyVideoId,
    bunny_library_id: process.env.BUNNY_LIBRARY_ID || '642831',
    thumbnail_url: thumbnailUrl || null,
    duracao: duracao,
    ativo: true,
    em_breve: emBreve,
    temporada_nome: temporadaNome,
    episodio_numero: isNaN(Number(episodioNumero)) ? null : episodioNumero,
  })

  if (error) {
    console.error('â Œ Erro ao adicionar vÃ­deo:', error.message)
  } else {
    await registrarLogAuditoria(`Adicionou o vídeo "${titulo}"`)
    // â”€â”€â”€ Enviar NotificaÃ§Ã£o Push (Apenas se NÃƒO for vÃ­deo em breve) â”€â”€â”€
    if (!emBreve) {
      try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
          // Usa variÃ¡veis de ambiente em vez de arquivo JSON para seguranÃ§a (evita bloqueio no GitHub)
          const projectId = process.env.FIREBASE_PROJECT_ID;
          const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
          const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

          if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
              credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
              })
            });
          }
        }

        if (admin.apps.length) {
          const title = 'Novo Vídeo Disponível!';
          const body = `O vídeo "${titulo}" acabou de chegar no aplicativo. Vem assistir!`;
          
          const message = {
            notification: { title, body },
            topic: 'novos_videos',
          };

          // Salva a notificaÃ§Ã£o no banco de dados para o histÃ³rico do "Sino"
          await getAdminClient().from('notificacoes').insert({ titulo: title, mensagem: body });

          // Dispara notificaÃ§Ã£o push em segundo plano para nÃ£o travar a Server Action
          admin.messaging().send(message).then(() => {
            console.log('âœ… NotificaÃ§Ã£o Push enviada com sucesso!');
          }).catch((pushError: any) => {
            console.error('â Œ Erro ao enviar notificaÃ§Ã£o Push:', pushError.message);
          });
        } else {
          console.log('âš ï¸  Firebase Admin nÃ£o inicializado. Push nÃ£o enviado.');
        }
      } catch (pushError: any) {
        console.error('â Œ Erro ao enviar notificaÃ§Ã£o Push:', pushError.message);
      }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/watch')
}

// â”€â”€â”€ Editar vÃ­deo â”€â”€â”€
export async function editarVideo(videoId: string, formData: FormData) {
  const { supabase } = await verificarAdmin()

  const titulo = formData.get('titulo') as string;
  let thumbnailUrl = formData.get('thumbnail_url') as string;
  const thumbFile = formData.get('thumbnail_file') as File | null;
  const emBreve = formData.get('em_breve') === 'true';
  const bunnyVideoId = (formData.get('bunny_video_id') as string) || null;
  const duracao = (formData.get('duracao') as string) || null;
  
  try {
    if (thumbFile && typeof thumbFile !== 'string' && thumbFile.size > 0) {
      const slug = gerarSlug(titulo);
      thumbnailUrl = await uploadToBunny(thumbFile, `capas_videos/${slug}/capa`);
    }
  } catch (error: any) {
    console.error('â Œ Erro no upload da thumbnail:', error.message)
  }

  // Busca estado antigo do vÃ­deo para saber se foi lanÃ§ado agora (era em_breve e deixou de ser)
  const { data: videoAntigo } = await supabase.from('videos').select('em_breve').eq('id', videoId).single();

  const categoria = (formData.get('categoria') as string) || 'Geral';
  const temporadaNome = categoria === 'Temporada' ? ((formData.get('temporada_nome') as string) || null) : null;
  const episodioNumeroStr = categoria === 'Temporada' ? formData.get('episodio_numero') : null;
  const episodioNumero = episodioNumeroStr ? parseInt(episodioNumeroStr as string, 10) : null;

  const { error } = await supabase.from('videos').update({
    titulo: titulo,
    descricao: (formData.get('descricao') as string) || null,
    categoria: categoria,
    thumbnail_url: thumbnailUrl || null,
    bunny_video_id: emBreve ? (bunnyVideoId || null) : bunnyVideoId,
    duracao: duracao,
    em_breve: emBreve,
    temporada_nome: temporadaNome,
    episodio_numero: isNaN(Number(episodioNumero)) ? null : episodioNumero,
  }).eq('id', videoId)

  if (error) {
    console.error('â Œ Erro ao editar vÃ­deo:', error.message)
  } else {
    await registrarLogAuditoria(`Editou o vídeo "${titulo}"`)
    // Se o vÃ­deo deixou de ser em_breve, dispara notificaÃ§Ã£o push de lanÃ§amento!
    if (videoAntigo && videoAntigo.em_breve && !emBreve) {
      try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
          const projectId = process.env.FIREBASE_PROJECT_ID;
          const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
          const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

          if (projectId && clientEmail && privateKey) {
            admin.initializeApp({
              credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
              })
            });
          }
        }

        if (admin.apps.length) {
          const title = 'Novo Vídeo Disponível!';
          const body = `O vídeo "${titulo}" acabou de chegar no aplicativo. Vem assistir!`;
          
          const message = {
            notification: { title, body },
            topic: 'novos_videos',
          };

          await getAdminClient().from('notificacoes').insert({ titulo: title, mensagem: body });
          
          // Dispara notificaÃ§Ã£o em background para evitar lentidÃ£o
          admin.messaging().send(message).then(() => {
            console.log('âœ… NotificaÃ§Ã£o Push de lanÃ§amento enviada com sucesso!');
          }).catch((pushError: any) => {
            console.error('âŒ Erro ao enviar notificaÃ§Ã£o Push de lanÃ§amento:', pushError.message);
          });
        }
      } catch (pushError: any) {
        console.error('âŒ Erro ao enviar notificaÃ§Ã£o Push de lanÃ§amento:', pushError.message);
      }
    }
  }
  
  revalidatePath('/admin')
  revalidatePath('/watch')
  redirect('/admin?tab=videos')
}

// â”€â”€â”€ Ativar / Desativar vÃ­deo â”€â”€â”€
export async function toggleVideoAtivo(videoId: string, ativoAtual: boolean) {
  const { supabase } = await verificarAdmin()
  await supabase.from('videos').update({ ativo: !ativoAtual }).eq('id', videoId)
  revalidatePath('/admin')
  revalidatePath('/watch')
  redirect('/admin?tab=videos')
}

// â”€â”€â”€ Deletar vÃ­deo â”€â”€â”€
export async function deletarVideo(videoId: string) {
  const { supabase } = await verificarAdmin()
  const { data: video } = await supabase.from('videos').select('titulo').eq('id', videoId).single()
  await supabase.from('videos').delete().eq('id', videoId)
  await registrarLogAuditoria(`Excluiu o vídeo "${video?.titulo || videoId}"`)
  revalidatePath('/admin')
  revalidatePath('/watch')
  redirect('/admin?tab=videos')
}

// â”€â”€â”€ Ativar / Bloquear assinante â”€â”€â”€
export async function togglePlanoUsuario(userId: string, planoAtual: boolean) {
  await verificarAdmin()
  const admin = getAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { plano_ativo: !planoAtual },
  })
  if (error) console.error('âŒ Erro ao atualizar plano:', error.message)
  revalidatePath('/admin')
}

// â”€â”€â”€ Alterar o Plano Manualmente (BÃ¡sico, Essencial, Pro) â”€â”€â”€
export async function alterarPlanoUsuario(userId: string, novoMaxTelas: number, novaEtiqueta: string) {
  await verificarAdmin()
  const admin = getAdminClient()
  
  // Primeiro, busca o usuÃ¡rio atual para nÃ£o perder nenhum dado antigo do user_metadata
  const { data: userResponse, error: fetchError } = await admin.auth.admin.getUserById(userId)
  if (fetchError || !userResponse.user) {
    console.error('âŒ Erro ao buscar usuÃ¡rio para alterar plano:', fetchError?.message)
    return
  }

  const currentMetadata = userResponse.user.user_metadata || {}

  // Mescla os novos dados com os antigos
  const { error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { 
      ...currentMetadata, 
      max_telas: novoMaxTelas, 
      etiqueta_plano: novaEtiqueta, 
      plano_ativo: true 
    },
  })
  if (error) console.error('âŒ Erro ao alterar plano do usuÃ¡rio:', error.message)
  revalidatePath('/admin')
}

// â”€â”€â”€ Salvar ConfiguraÃ§Ã£o Global (Fundo do app/site) â”€â”€â”€
export async function salvarConfiguracao(formData: FormData) {
  await verificarAdmin();

  try {
    const file = formData.get('backgroundImage') as File | null;

    if (!file || typeof file === 'string' || file.size === 0) {
      console.error('Nenhum arquivo vÃ¡lido recebido.');
      return;
    }

    // 1. Faz upload usando nome de arquivo fixo exigido
    const fileName = 'background_1777927708063.png';
    const arrayBuffer = await file.arrayBuffer();
    
    console.log("Fazendo upload da imagem fixa pro Bunny...");
    const resImage = await fetch(`https://br.storage.bunnycdn.com/contos-midia-app/${fileName}`, {
      method: 'PUT',
      headers: {
        'AccessKey': '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c',
        'Content-Type': file.type || 'image/jpeg',
      },
      body: arrayBuffer
    });

    if (!resImage.ok) throw new Error(`Falha no upload da imagem: ${resImage.statusText}`);

    const bgUrl = `https://contos-midia-app.b-cdn.net/${fileName}`;
    const config = { background_url: bgUrl };
    console.log("âœ… Nova imagem de fundo salva no Storage:", bgUrl);

    // 2. Atualiza o config.json apontando para a imagem
    console.log("Enviando PUT para o config.json no Bunny Storage...");
    const resConf = await fetch(`https://br.storage.bunnycdn.com/contos-midia-app/config.json`, {
      method: 'PUT',
      headers: {
        'AccessKey': '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
      cache: 'no-store'
    });

    if (!resConf.ok) throw new Error(`Erro config.json: ${resConf.statusText}`);
    console.log("âœ… config.json atualizado com sucesso no Storage!");

    revalidatePath('/', 'layout');
  } catch (error: any) {
    console.error('âŒ Erro no salvarConfiguracao:', error.message || error);
  }
}

// â”€â”€â”€ Atualizar PermissÃµes de Acesso (Config.json) â”€â”€â”€
export async function salvarPermissoesPlanos(planosApp: string[], planosHq: string[]) {
  await verificarAdmin();
  try {
    // 1. Fetch current config
    let config = {};
    try {
      const res = await fetch(`https://contos-midia-app.b-cdn.net/config.json?t=${Date.now()}`);
      if (res.ok) {
        config = await res.json();
      }
    } catch (e) {
      console.log('Nenhum config.json existente encontrado, criando um novo...');
    }

    // 2. Merge with new permissions
    config = {
      ...config,
      planos_app: planosApp,
      planos_hq: planosHq
    };

    // 3. Upload back to Bunny
    const resConf = await fetch(`https://br.storage.bunnycdn.com/contos-midia-app/config.json`, {
      method: 'PUT',
      headers: {
        'AccessKey': '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
      cache: 'no-store'
    });

    if (!resConf.ok) throw new Error(`Erro ao salvar config.json: ${resConf.statusText}`);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('âŒ Erro no salvarPermissoesPlanos:', error.message || error);
    return { success: false, error: error.message };
  }
}

// â”€â”€â”€ Atualizar versao.json (Controle de APK) â”€â”€â”€
export async function salvarVersaoApk(versao: string, linkDownload: string, mensagem: string, obrigatorio: boolean) {
  await verificarAdmin();
  try {
    const { writeFileSync } = await import('fs');
    const { join } = await import('path');

    const dados = {
      versao_atual: versao,
      link_download: linkDownload,
      obrigatorio: obrigatorio,
      mensagem: mensagem,
      data_lancamento: new Date().toISOString(),
    };

    const versaoPath = join(process.cwd(), 'public', 'versao.json');
    writeFileSync(versaoPath, JSON.stringify(dados, null, 2), 'utf-8');

    revalidatePath('/admin');
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error: any) {
    console.error('âŒ Erro no salvarVersaoApk:', error.message || error);
    return { success: false, error: error.message };
  }
}

// â”€â”€â”€ Publicar Material (HQ, Jogo, Desenho) â”€â”€â”€ Upload jÃ¡ foi feito no cliente
export async function publicarMaterial(formData: FormData) {
  await verificarAdmin();
  try {
    const supabase = await createClient();
    const titulo = formData.get('titulo') as string;
    const descricao = (formData.get('descricao') as string) || null;
    const categoria = formData.get('categoria') as string;
    const planosAcesso = JSON.parse(formData.get('planos_acesso') as string) as string[];

    // URLs jÃ¡ prontas vindas do cliente (upload foi feito direto no Bunny)
    const capaUrl = (formData.get('capa_url') as string | null) || null;
    let linkPdf = (formData.get('link_pdf') as string | null)?.trim() || null;

    // SeguranÃ§a: limpa AccessKey se vier no link
    if (linkPdf) {
      try {
        if (new URL(linkPdf).hostname === 'br.storage.bunnycdn.com') {
          linkPdf = linkPdf.split('?')[0];
          linkPdf = linkPdf.replace('br.storage.bunnycdn.com/contos-midia-app', 'contos-midia-app.b-cdn.net');
        }
      } catch {}
    }

    // Gera slug
    const slug = titulo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim()
      .replace(/\s+/g, '-');

    const { error } = await supabase.from('materiais').upsert({
      slug,
      titulo,
      descricao,
      categoria,
      capa_url: capaUrl,
      link_pdf: linkPdf,
      planos_acesso: planosAcesso,
      ativo: true,
    }, { onConflict: 'slug' });

    if (error) throw new Error(error.message);

    // â”€â”€â”€ Enviar NotificaÃ§Ã£o Push para Materiais â”€â”€â”€
    try {
      const admin = require('firebase-admin');
      if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (projectId && clientEmail && privateKey) {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            })
          });
        }
      }

      if (admin.apps.length) {
        const title = 'Novo Material Adicionado!';
        const body = `"${titulo}" já está disponível na aba Pedagógica. Aproveite!`;

        const message = {
          notification: { title, body },
          topic: 'novos_videos', // usamos o mesmo tÃ³pico geral do app
        };

        // Salva a notificaÃ§Ã£o no banco de dados para o histÃ³rico do "Sino"
        await getAdminClient().from('notificacoes').insert({ titulo: title, mensagem: body });

        await admin.messaging().send(message);
        console.log('âœ… NotificaÃ§Ã£o Push (Material) enviada com sucesso!');
      }
    } catch (pushError: any) {
      console.error('âŒ Erro ao enviar notificaÃ§Ã£o Push (Material):', pushError.message);
    }

    await registrarLogAuditoria(`Publicou o material/desenho "${titulo}"`)
    revalidatePath('/materiais');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('âŒ Erro no publicarMaterial:', error.message);
    return { success: false, error: error.message };
  }
}

// â”€â”€â”€ Deletar Material â”€â”€â”€
export async function deletarMaterial(id: string) {
  await verificarAdmin();
  try {
    const supabase = await createClient();
    const { data: material } = await supabase.from('materiais').select('titulo').eq('id', id).single();
    const { error } = await supabase.from('materiais').delete().eq('id', id);
    if (error) throw new Error(error.message);
    await registrarLogAuditoria(`Excluiu o material "${material?.titulo || id}"`)
    revalidatePath('/materiais');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// â”€â”€â”€ Publicar Revista â”€â”€â”€ Upload jÃ¡ foi feito no cliente
export async function publicarRevista(formData: FormData) {
  await verificarAdmin()                 // garante que Ã© admin
  const supabase = getAdminClient()      // usa service role â†’ bypassa RLS
  try {
    const titulo   = formData.get('titulo') as string
    const descricao = (formData.get('descricao') as string) || null
    const edicao   = (formData.get('edicao') as string) || null
    const capaUrl  = (formData.get('capa_url') as string | null) || null
    let   linkPdf  = (formData.get('link_pdf') as string | null)?.trim() || null

    if (linkPdf) {
      try {
        if (new URL(linkPdf).hostname === 'br.storage.bunnycdn.com') {
          linkPdf = linkPdf.split('?')[0];
          linkPdf = linkPdf.replace('br.storage.bunnycdn.com/contos-midia-app', 'contos-midia-app.b-cdn.net');
        }
      } catch {}
    }

    const slug = titulo.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim()
      .replace(/\s+/g, '-')

    const { error } = await supabase.from('revistas').upsert({
      slug,
      titulo,
      descricao,
      edicao,
      capa_url: capaUrl,
      link_pdf: linkPdf,
      ativo: true,
    }, { onConflict: 'slug' })

    if (error) throw new Error(error.message)

    revalidatePath('/revistas')
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('âŒ Erro no publicarRevista:', error.message)
    return { success: false, error: error.message }
  }
}

// â”€â”€â”€ Deletar Revista â”€â”€â”€
export async function deletarRevista(id: string) {
  await verificarAdmin()               // garante que Ã© admin
  const supabase = getAdminClient()    // usa service role â†’ bypassa RLS
  try {
    const { error } = await supabase.from('revistas').delete().eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath('/revistas')
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


// â”€â”€â”€ Criar UsuÃ¡rio VitalÃ­cio (Cliente - Role de Membro) â”€â”€â”€
export async function criarUsuarioVitalicio(formData: FormData) {
  await verificarAdmin()
  const admin = getAdminClient()

  const email = (formData.get('email') as string)?.trim()
  const nome = (formData.get('nome') as string)?.trim()
  const plano = formData.get('plano') as string

  if (!email || !nome || !plano) {
    return { success: false, error: 'Todos os campos sÃ£o obrigatÃ³rios' }
  }

  // Gera uma senha aleatÃ³ria de 12 caracteres segura criptograficamente
  const senhaGerada = require('crypto').randomBytes(6).toString('hex')

  // Determinar telas baseado no plano (todos agora têm 5 telas)
  const maxTelas = 5

  // Cria o usuÃ¡rio via Admin API do Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senhaGerada,
    email_confirm: true, // Auto-confirmaÃ§Ã£o do e-mail do usuÃ¡rio
    user_metadata: {
      nome,
      plano_ativo: true,
      etiqueta_plano: plano,
      max_telas: maxTelas,
      vitalicio: true
    }
  })

  if (authError) {
    console.error('âŒ Erro ao criar usuÃ¡rio vitalÃ­cio no auth:', authError.message)
    return { success: false, error: authError.message }
  }

  const userId = authData.user.id

  // Nota: o trigger no Supabase 'on_auth_user_created' jÃ¡ cria automaticamente o perfil do usuÃ¡rio
  // na tabela public.perfis com a role padrÃ£o de 'membro' (cliente comum), garantindo seguranÃ§a total.

  revalidatePath('/admin')
  
  return {
    success: true,
    nome,
    email,
    senhaGerada,
    plano
  }
}

// â”€â”€â”€ Deletar Assinante / UsuÃ¡rio (Auth e Tabelas vinculadas) â”€â”€â”€
export async function deletarUsuario(userId: string) {
  await verificarAdmin()
  const admin = getAdminClient()
  const supabase = await createClient()

  try {
    // 1. Limpa tabelas vinculadas que possam impedir a exclusÃ£o por Foreign Key
    await supabase.from('favoritos').delete().eq('user_id', userId)
    await supabase.from('visualizacoes').delete().eq('user_id', userId)
    await supabase.from('perfis').delete().eq('id', userId)

    // 2. Deleta o usuÃ¡rio permanentemente do Supabase Auth
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw new Error(error.message)

    revalidatePath('/admin')
  } catch (error: any) {
    console.error('âŒ Erro ao deletar usuÃ¡rio:', error.message)
  }
}

// â”€â”€â”€ LOJA DE AFILIADOS â”€â”€â”€

export async function adicionarProdutoLoja(formData: FormData) {
  const { supabase } = await verificarAdmin()
  try {
    const titulo = formData.get('titulo') as string;
    const descricao = formData.get('descricao') as string;
    const linkAfiliado = formData.get('link_afiliado') as string;
    const proporcaoImagem = (formData.get('proporcao_imagem') as string) || '1:1';
    const ativo = formData.get('ativo') === 'true';

    const imagensUrlsStr = formData.get('imagens_urls') as string;
    const imagensUrls = imagensUrlsStr ? JSON.parse(imagensUrlsStr) as string[] : [];

    if (!titulo || !descricao || !linkAfiliado) {
      throw new Error('TÃ­tulo, descriÃ§Ã£o e link de afiliado sÃ£o obrigatÃ³rios.');
    }

    const { error } = await supabase.from('produtos_loja').insert({
      titulo,
      descricao,
      link_afiliado: linkAfiliado,
      imagem_url_1: imagensUrls[0] || null,
      imagem_url_2: imagensUrls[1] || null,
      imagem_url_3: imagensUrls[2] || null,
      imagens_urls: imagensUrls,
      proporcao_imagem: proporcaoImagem,
      ativo
    });

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    revalidatePath('/loja');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao adicionar produto:', error.message);
    return { success: false, error: error.message };
  }
}

export async function editarProdutoLoja(id: string, formData: FormData) {
  const { supabase } = await verificarAdmin()
  try {
    const titulo = formData.get('titulo') as string;
    const descricao = formData.get('descricao') as string;
    const linkAfiliado = formData.get('link_afiliado') as string;
    const proporcaoImagem = (formData.get('proporcao_imagem') as string) || '1:1';

    const imagensUrlsStr = formData.get('imagens_urls') as string;
    const imagensUrls = imagensUrlsStr ? JSON.parse(imagensUrlsStr) as string[] : [];

    if (!titulo || !descricao || !linkAfiliado) {
      throw new Error('TÃ­tulo, descriÃ§Ã£o e link de afiliado sÃ£o obrigatÃ³rios.');
    }

    const { error } = await supabase.from('produtos_loja').update({
      titulo,
      descricao,
      link_afiliado: linkAfiliado,
      imagem_url_1: imagensUrls[0] || null,
      imagem_url_2: imagensUrls[1] || null,
      imagem_url_3: imagensUrls[2] || null,
      imagens_urls: imagensUrls,
      proporcao_imagem: proporcaoImagem
    }).eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    revalidatePath('/loja');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao editar produto:', error.message);
    return { success: false, error: error.message };
  }
}

export async function deletarProdutoLoja(id: string) {
  const { supabase } = await verificarAdmin()
  try {
    const { error } = await supabase.from('produtos_loja').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    revalidatePath('/loja');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error.message);
    return { success: false, error: error.message };
  }
}

export async function toggleProdutoLojaAtivo(id: string, ativoAtual: boolean) {
  const { supabase } = await verificarAdmin()
  try {
    const { error } = await supabase.from('produtos_loja').update({ ativo: !ativoAtual }).eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    revalidatePath('/loja');
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao alternar status do produto:', error.message);
    return { success: false, error: error.message };
  }
}


// --- SÉRIES ---
export async function adicionarSerie(formData: FormData) {
  const { supabase } = await verificarAdmin()
  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const capa_url = formData.get('capa_url') as string

  try {
    const { error } = await supabase.from('series').insert([{
      titulo,
      descricao,
      capa_url
    }])
    if (error) {
      if (error.message.includes('duplicate key value violates unique constraint') || error.code === '23505') {
        throw new Error('Já existe uma série com este título. Escolha um nome diferente.');
      }
      throw new Error(error.message)
    }

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao adicionar serie:', error.message)
    return { success: false, error: error.message }
  }
}

export async function editarSerie(id: string, formData: FormData) {
  const { supabase } = await verificarAdmin()
  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string
  const capa_url = formData.get('capa_url') as string

  try {
    const { error } = await supabase.from('series').update({
      titulo,
      descricao,
      capa_url
    }).eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao editar serie:', error.message)
    return { success: false, error: error.message }
  }
}

export async function deletarSerie(id: string) {
  const { supabase } = await verificarAdmin()
  const { error } = await supabase.from('series').delete().eq('id', id)
  if (error) {
    console.error('Erro ao deletar serie:', error.message)
    throw new Error(error.message)
  }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function toggleSerieAtiva(id: string, ativoAtual: boolean) {
  const { supabase } = await verificarAdmin()
  try {
    const { error } = await supabase.from('series').update({ ativo: !ativoAtual }).eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin')
    revalidatePath('/')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao alternar status da serie:', error.message)
    return { success: false, error: error.message }
  }
}

// --- TESTADORES ---
export async function deletarTestador(id: string) {
  await verificarAdmin()
  const admin = getAdminClient()
  try {
    const { error } = await admin.from('testadores_playstore').delete().eq('id', id)
    if (error) throw new Error(error.message)

    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar testador:', error.message)
    return { success: false, error: error.message }
  }
}

// --- AUTOMAÇÕES INSTAGRAM ---
export async function adicionarAutomacaoInstagram(formData: FormData) {
  const { supabase } = await verificarAdmin()

  const palavraChave = formData.get('palavra_chave') as string
  const resposta     = formData.get('resposta') as string
  const resposta2    = formData.get('resposta_2') as string | null
  const resposta3    = formData.get('resposta_3') as string | null
  const resposta4    = formData.get('resposta_4') as string | null
  const resposta5    = formData.get('resposta_5') as string | null
  const videoId      = formData.get('video_id') as string | null
  const linkVendas   = formData.get('link_vendas') as string | null

  if (!palavraChave?.trim()) return { success: false, error: 'Palavra-chave é obrigatória.' }
  if (!resposta?.trim()) return { success: false, error: 'Resposta é obrigatória.' }

  const { error } = await supabase.from('automacoes_instagram').insert({
    palavra_chave: palavraChave.trim(),
    resposta:      resposta.trim(),
    resposta_2:    resposta2?.trim() || '',
    resposta_3:    resposta3?.trim() || '',
    resposta_4:    resposta4?.trim() || '',
    resposta_5:    resposta5?.trim() || '',
    video_id:      videoId?.trim() || '',
    link_vendas:   linkVendas?.trim() || '',
    ativo:         true,
  })

  if (error) return { success: false, error: error.message }

  await registrarLogAuditoria(`Criou automação Insta Auto para a palavra-chave "${palavraChave}"`)
  revalidatePath('/admin')
  return { success: true }
}

export async function editarAutomacaoInstagram(formData: FormData) {
  const { supabase } = await verificarAdmin()

  const id           = formData.get('id') as string
  const palavraChave = formData.get('palavra_chave') as string
  const resposta     = formData.get('resposta') as string
  const resposta2    = formData.get('resposta_2') as string | null
  const resposta3    = formData.get('resposta_3') as string | null
  const resposta4    = formData.get('resposta_4') as string | null
  const resposta5    = formData.get('resposta_5') as string | null
  const videoId      = formData.get('video_id') as string | null
  const linkVendas   = formData.get('link_vendas') as string | null

  if (!id) return { success: false, error: 'ID da automação é obrigatório.' }
  if (!palavraChave?.trim()) return { success: false, error: 'Palavra-chave é obrigatória.' }
  if (!resposta?.trim()) return { success: false, error: 'Resposta é obrigatória.' }

  const { error } = await supabase.from('automacoes_instagram').update({
    palavra_chave: palavraChave.trim(),
    resposta:      resposta.trim(),
    resposta_2:    resposta2?.trim() || '',
    resposta_3:    resposta3?.trim() || '',
    resposta_4:    resposta4?.trim() || '',
    resposta_5:    resposta5?.trim() || '',
    video_id:      videoId?.trim() || '',
    link_vendas:   linkVendas?.trim() || '',
  }).eq('id', id)

  if (error) return { success: false, error: error.message }

  await registrarLogAuditoria(`Editou automação Insta Auto para a palavra-chave "${palavraChave}"`)
  revalidatePath('/admin')
  return { success: true }
}

export async function deletarAutomacaoInstagram(id: string) {
  const { supabase } = await verificarAdmin()
  const { data } = await supabase.from('automacoes_instagram').select('palavra_chave').eq('id', id).single()
  const { error } = await supabase.from('automacoes_instagram').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  await registrarLogAuditoria(`Excluiu automação Insta Auto da palavra-chave "${data?.palavra_chave || id}"`)
  revalidatePath('/admin')
  return { success: true }
}

export async function toggleAutomacaoInstagramAtiva(id: string, ativo: boolean) {
  const { supabase } = await verificarAdmin()
  const { data } = await supabase.from('automacoes_instagram').select('palavra_chave').eq('id', id).single()
  const { error } = await supabase.from('automacoes_instagram').update({ ativo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  await registrarLogAuditoria(`Alterou status do Insta Auto "${data?.palavra_chave || id}" para ${ativo ? 'Ativo' : 'Inativo'}`)
  revalidatePath('/admin')
  return { success: true }
}

export async function resolverErroAutomacao(id: string) {
  await verificarAdmin()
  const adminSupabase = getAdminClient()
  try {
    const { error } = await adminSupabase
      .from('logs_automacoes_instagram')
      .update({ resolvido: true })
      .eq('id', id)
    if (error) throw new Error(error.message)
    const { data: logData } = await adminSupabase.from('logs_automacoes_instagram').select('seguidor').eq('id', id).single()
    await registrarLogAuditoria(`Marcou falha de Insta Auto como resolvida (Seguidor: ${logData?.seguidor || id})`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao resolver log de automacao:', error.message)
    return { success: false, error: error.message }
  }
}

export async function resolverErroAutomacaoWhatsapp(id: string) {
  await verificarAdmin()
  const adminSupabase = getAdminClient()
  try {
    const { error } = await adminSupabase
      .from('logs_automacoes_whatsapp')
      .update({ resolvido: true })
      .eq('id', id)
    if (error) throw new Error(error.message)
    const { data: logData } = await adminSupabase.from('logs_automacoes_whatsapp').select('seguidor').eq('id', id).single()
    await registrarLogAuditoria(`Marcou falha de Whats Auto como resolvida (Seguidor: ${logData?.seguidor || id})`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao resolver log de automacao WhatsApp:', error.message)
    return { success: false, error: error.message }
  }
}

export async function adicionarAutomacaoWhatsapp(data: {
  palavra_chave: string
  mensagem_link: string
  prompt_ia: string
  link_vendas?: string
  ativo?: boolean
  is_fallback?: boolean
}) {
  const { supabase } = await verificarAdmin()
  try {
    const { error } = await supabase
      .from('automacoes_whatsapp')
      .insert([data])
    if (error) throw new Error(error.message)
    await registrarLogAuditoria(`Criou automação Whats Auto para a palavra-chave "${data.palavra_chave || 'Fallback'}"`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao adicionar automacao WhatsApp:', error.message)
    return { success: false, error: error.message }
  }
}

export async function editarAutomacaoWhatsapp(id: string, data: {
  palavra_chave: string
  mensagem_link: string
  prompt_ia: string
  link_vendas?: string
  ativo?: boolean
  is_fallback?: boolean
}) {
  const { supabase } = await verificarAdmin()
  try {
    const { error } = await supabase
      .from('automacoes_whatsapp')
      .update(data)
      .eq('id', id)
    if (error) throw new Error(error.message)
    await registrarLogAuditoria(`Editou automação Whats Auto para a palavra-chave "${data.palavra_chave || 'Fallback'}"`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao editar automacao WhatsApp:', error.message)
    return { success: false, error: error.message }
  }
}

export async function deletarAutomacaoWhatsapp(id: string) {
  const { supabase } = await verificarAdmin()
  try {
    const { data } = await supabase.from('automacoes_whatsapp').select('palavra_chave, is_fallback').eq('id', id).single()
    const { error } = await supabase
      .from('automacoes_whatsapp')
      .delete()
      .eq('id', id)
    if (error) throw new Error(error.message)
    await registrarLogAuditoria(`Excluiu automação Whats Auto da palavra-chave "${data?.is_fallback ? 'Fallback' : (data?.palavra_chave || id)}"`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar automacao WhatsApp:', error.message)
    return { success: false, error: error.message }
  }
}

export async function toggleAutomacaoWhatsappAtiva(id: string, ativo: boolean) {
  const { supabase } = await verificarAdmin()
  try {
    const { data } = await supabase.from('automacoes_whatsapp').select('palavra_chave, is_fallback').eq('id', id).single()
    const { error } = await supabase
      .from('automacoes_whatsapp')
      .update({ ativo })
      .eq('id', id)
    if (error) throw new Error(error.message)
    await registrarLogAuditoria(`Alterou status do Whats Auto "${data?.is_fallback ? 'Fallback' : (data?.palavra_chave || id)}" para ${ativo ? 'Ativo' : 'Inativo'}`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao alterar status da automacao WhatsApp:', error.message)
    return { success: false, error: error.message }
  }
}

export async function obterNumeroWhatsapp() {
  const { supabase } = await verificarAdmin()
  try {
    const { data, error } = await supabase
      .from('configuracoes_sistema')
      .select('valor')
      .eq('chave', 'whatsapp_numero')
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return { success: true, valor: data?.valor || '5564992994823' }
  } catch (error: any) {
    console.error('Erro ao obter numero do whatsapp:', error.message)
    return { success: false, valor: '5564992994823', error: error.message }
  }
}

export async function salvarNumeroWhatsapp(numero: string, senha?: string) {
  const { supabase, user } = await verificarAdmin()

  if (!senha || senha.trim() === '') {
    return { success: false, error: 'A senha do administrador é obrigatória para alterar o número.' }
  }

  // Verifica a senha tentando autenticar o usuário logado
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: senha
  })

  if (authError) {
    return { success: false, error: 'Senha do administrador incorreta.' }
  }

  try {
    const { error } = await supabase
      .from('configuracoes_sistema')
      .upsert({
        chave: 'whatsapp_numero',
        valor: numero.trim(),
        atualizado_em: new Date().toISOString()
      }, { onConflict: 'chave' })
    if (error) throw error

    // Atualiza em cascata os links das automações do Instagram que possuem wa.me
    const { data: automacoes, error: fetchErr } = await supabase
      .from('automacoes_instagram')
      .select('id, link_vendas')

    if (fetchErr) throw fetchErr

    if (automacoes) {
      for (const auto of automacoes) {
        if (auto.link_vendas && auto.link_vendas.includes('wa.me/')) {
          // Expressão regular para encontrar e substituir o número de telefone no link wa.me
          const regex = /(wa\.me\/)(\d+)/g
          const novoLink = auto.link_vendas.replace(regex, `$1${numero.trim()}`)
          if (novoLink !== auto.link_vendas) {
            await supabase
              .from('automacoes_instagram')
              .update({ link_vendas: novoLink })
              .eq('id', auto.id)
          }
        }
      }
    }

    await registrarLogAuditoria(`Alterou o número geral de WhatsApp para ${numero.trim()}`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao salvar numero do whatsapp:', error.message)
    return { success: false, error: error.message }
  }
}

export async function promoverEmailParaAdmin(email: string) {
  const { supabase, user } = await verificarAdmin()
  const adminClient = getAdminClient()
  try {
    const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
    if (listErr) throw listErr
    
    const targetUser = users.find(u => u.email?.toLowerCase().trim() === email.toLowerCase().trim())
    if (!targetUser) {
      return { success: false, error: 'Usuário com este e-mail não foi encontrado no sistema. Peça para ele se cadastrar primeiro.' }
    }

    const { error: updateErr } = await adminClient
      .from('perfis')
      .update({ role: 'admin' })
      .eq('id', targetUser.id)

    if (updateErr) throw updateErr

    // Sincroniza metadados do auth para leitura rápida no front
    const { error: authMetaErr } = await adminClient.auth.admin.updateUserById(targetUser.id, {
      user_metadata: { ...targetUser.user_metadata, role: 'admin' }
    })
    if (authMetaErr) console.warn('Aviso ao atualizar metadados:', authMetaErr.message)

    await registrarLogAuditoria(`Promoveu o usuário ${email} para Administrador`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao promover usuário para admin:', error.message)
    return { success: false, error: error.message }
  }
}

export async function rebaixarAdminParaMembro(userId: string) {
  const { supabase, user } = await verificarAdmin()
  const adminClient = getAdminClient()
  
  if (userId === user.id) {
    return { success: false, error: 'Você não pode rebaixar a si mesmo!' }
  }

  try {
    const { data: targetAuth, error: authErr } = await adminClient.auth.admin.getUserById(userId)
    if (authErr) throw authErr

    if (targetAuth?.user?.email === 'suporte.appcontos@gmail.com') {
      return { success: false, error: 'O administrador geral da plataforma não pode ser rebaixado.' }
    }

    const { error: updateErr } = await adminClient
      .from('perfis')
      .update({ role: 'membro' })
      .eq('id', userId)

    if (updateErr) throw updateErr

    // Sincroniza metadados do auth para leitura rápida no front
    const { error: authMetaErr } = await adminClient.auth.admin.updateUserById(userId, {
      user_metadata: { ...targetAuth.user.user_metadata, role: 'membro' }
    })
    if (authMetaErr) console.warn('Aviso ao atualizar metadados:', authMetaErr.message)

    await registrarLogAuditoria(`Rebaixou o administrador ${targetAuth?.user?.email || userId} para Membro`)
    revalidatePath('/admin')
    return { success: true }
  } catch (error: any) {
    console.error('Erro ao rebaixar administrador:', error.message)
    return { success: false, error: error.message }
  }
}


