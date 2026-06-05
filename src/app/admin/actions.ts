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

function gerarSlug(texto: string) {
  if (!texto) return 'video';
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-');
}

// ─── Helper de Upload pro Bunny.net ───
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

// ─── Adicionar vídeo ───
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
    console.error('❌ Erro no upload da thumbnail pro Bunny:', error.message)
    // Continua salvando o vídeo mesmo sem thumbnail, para não quebrar a tela
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
    console.error('❌ Erro ao adicionar vídeo:', error.message)
  } else {
    // ─── Enviar Notificação Push (Apenas se NÃO for vídeo em breve) ───
    if (!emBreve) {
      try {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
          // Usa variáveis de ambiente em vez de arquivo JSON para segurança (evita bloqueio no GitHub)
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
          const title = '✨ Novo Vídeo Disponível!';
          const body = `O vídeo "${titulo}" acabou de chegar no aplicativo. Vem assistir!`;
          
          const message = {
            notification: { title, body },
            topic: 'novos_videos',
          };

          // Salva a notificação no banco de dados para o histórico do "Sino"
          await supabase.from('notificacoes').insert({ titulo: title, mensagem: body });

          // Dispara notificação push em segundo plano para não travar a Server Action
          admin.messaging().send(message).then(() => {
            console.log('✅ Notificação Push enviada com sucesso!');
          }).catch((pushError: any) => {
            console.error('❌ Erro ao enviar notificação Push:', pushError.message);
          });
        } else {
          console.log('⚠️ Firebase Admin não inicializado. Push não enviado.');
        }
      } catch (pushError: any) {
        console.error('❌ Erro ao enviar notificação Push:', pushError.message);
      }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/watch')
}

// ─── Editar vídeo ───
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
    console.error('❌ Erro no upload da thumbnail:', error.message)
  }

  // Busca estado antigo do vídeo para saber se foi lançado agora (era em_breve e deixou de ser)
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
    console.error('❌ Erro ao editar vídeo:', error.message)
  } else {
    // Se o vídeo deixou de ser em_breve, dispara notificação push de lançamento!
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
          const title = '✨ Novo Vídeo Disponível!';
          const body = `O vídeo "${titulo}" acabou de chegar no aplicativo. Vem assistir!`;
          
          const message = {
            notification: { title, body },
            topic: 'novos_videos',
          };

          await supabase.from('notificacoes').insert({ titulo: title, mensagem: body });
          
          // Dispara notificação em background para evitar lentidão
          admin.messaging().send(message).then(() => {
            console.log('✅ Notificação Push de lançamento enviada com sucesso!');
          }).catch((pushError: any) => {
            console.error('❌ Erro ao enviar notificação Push de lançamento:', pushError.message);
          });
        }
      } catch (pushError: any) {
        console.error('❌ Erro ao enviar notificação Push de lançamento:', pushError.message);
      }
    }
  }
  
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

// ─── Alterar o Plano Manualmente (Básico, Essencial, Pro) ───
export async function alterarPlanoUsuario(userId: string, novoMaxTelas: number, novaEtiqueta: string) {
  await verificarAdmin()
  const admin = getAdminClient()
  
  // Primeiro, busca o usuário atual para não perder nenhum dado antigo do user_metadata
  const { data: userResponse, error: fetchError } = await admin.auth.admin.getUserById(userId)
  if (fetchError || !userResponse.user) {
    console.error('❌ Erro ao buscar usuário para alterar plano:', fetchError?.message)
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
  if (error) console.error('❌ Erro ao alterar plano do usuário:', error.message)
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
    console.log("✅ Nova imagem de fundo salva no Storage:", bgUrl);

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
    console.log("✅ config.json atualizado com sucesso no Storage!");

    revalidatePath('/', 'layout');
  } catch (error: any) {
    console.error('❌ Erro no salvarConfiguracao:', error.message || error);
  }
}

// ─── Atualizar Permissões de Acesso (Config.json) ───
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
    console.error('❌ Erro no salvarPermissoesPlanos:', error.message || error);
    return { success: false, error: error.message };
  }
}

// ─── Atualizar versao.json (Controle de APK) ───
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
    console.error('❌ Erro no salvarVersaoApk:', error.message || error);
    return { success: false, error: error.message };
  }
}

// ─── Publicar Material (HQ, Jogo, Desenho) ─── Upload já foi feito no cliente
export async function publicarMaterial(formData: FormData) {
  await verificarAdmin();
  try {
    const supabase = await createClient();
    const titulo = formData.get('titulo') as string;
    const descricao = (formData.get('descricao') as string) || null;
    const categoria = formData.get('categoria') as string;
    const planosAcesso = JSON.parse(formData.get('planos_acesso') as string) as string[];

    // URLs já prontas vindas do cliente (upload foi feito direto no Bunny)
    const capaUrl = (formData.get('capa_url') as string | null) || null;
    let linkPdf = (formData.get('link_pdf') as string | null)?.trim() || null;

    // Segurança: limpa AccessKey se vier no link
    if (linkPdf?.includes('br.storage.bunnycdn.com')) {
      linkPdf = linkPdf.split('?')[0];
      linkPdf = linkPdf.replace('br.storage.bunnycdn.com/contos-midia-app', 'contos-midia-app.b-cdn.net');
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

    // ─── Enviar Notificação Push para Materiais ───
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
        const title = '📚 Novo Material Adicionado!';
        const body = `"${titulo}" já está disponível na aba Pedagógica. Aproveite!`;

        const message = {
          notification: { title, body },
          topic: 'novos_videos', // usamos o mesmo tópico geral do app
        };

        // Salva a notificação no banco de dados para o histórico do "Sino"
        await supabase.from('notificacoes').insert({ titulo: title, mensagem: body });

        await admin.messaging().send(message);
        console.log('✅ Notificação Push (Material) enviada com sucesso!');
      }
    } catch (pushError: any) {
      console.error('❌ Erro ao enviar notificação Push (Material):', pushError.message);
    }

    revalidatePath('/materiais');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Erro no publicarMaterial:', error.message);
    return { success: false, error: error.message };
  }
}

// ─── Deletar Material ───
export async function deletarMaterial(id: string) {
  await verificarAdmin();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('materiais').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/materiais');
    revalidatePath('/admin');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── ANÚNCIOS DE PAUSA ───

export async function adicionarAnuncioPausa(formData: FormData) {
  await verificarAdmin();
  try {
    const titulo = formData.get('titulo') as string;
    const imagemUrl = formData.get('imagem_url') as string | null;
    const linkDestino = formData.get('link_destino') as string | null;
    const ativo = formData.get('ativo') === 'true';

    if (!titulo) throw new Error('Título é obrigatório');

    const supabase = await createClient();
    const { error } = await supabase.from('anuncios_pausa').insert({
      titulo,
      imagem_url: imagemUrl,
      link_destino: linkDestino,
      ativo,
    });

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function deletarAnuncioPausa(id: string) {
  await verificarAdmin();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('anuncios_pausa').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

export async function toggleAnuncioAtivo(id: string, ativoAtual: boolean) {
  await verificarAdmin();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('anuncios_pausa').update({ ativo: !ativoAtual }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/admin');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// ─── Criar Usuário Vitalício (Cliente - Role de Membro) ───
export async function criarUsuarioVitalicio(formData: FormData) {
  await verificarAdmin()
  const admin = getAdminClient()

  const email = (formData.get('email') as string)?.trim()
  const nome = (formData.get('nome') as string)?.trim()
  const plano = formData.get('plano') as string

  if (!email || !nome || !plano) {
    return { success: false, error: 'Todos os campos são obrigatórios' }
  }

  // Gera uma senha aleatória de 12 caracteres (letras maiúsculas, minúsculas e números)
  const senhaGerada = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4)

  // Determinar telas baseado no plano
  let maxTelas = 1
  if (plano === 'Família') maxTelas = 5

  // Cria o usuário via Admin API do Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: senhaGerada,
    email_confirm: true, // Auto-confirmação do e-mail do usuário
    user_metadata: {
      nome,
      plano_ativo: true,
      etiqueta_plano: plano,
      max_telas: maxTelas,
      vitalicio: true
    }
  })

  if (authError) {
    console.error('❌ Erro ao criar usuário vitalício no auth:', authError.message)
    return { success: false, error: authError.message }
  }

  const userId = authData.user.id

  // Nota: o trigger no Supabase 'on_auth_user_created' já cria automaticamente o perfil do usuário
  // na tabela public.perfis com a role padrão de 'membro' (cliente comum), garantindo segurança total.

  revalidatePath('/admin')
  
  return {
    success: true,
    nome,
    email,
    senhaGerada,
    plano
  }
}

// ─── Deletar Assinante / Usuário (Auth e Tabelas vinculadas) ───
export async function deletarUsuario(userId: string) {
  await verificarAdmin()
  const admin = getAdminClient()
  const supabase = await createClient()

  try {
    // 1. Limpa tabelas vinculadas que possam impedir a exclusão por Foreign Key
    await supabase.from('favoritos').delete().eq('user_id', userId)
    await supabase.from('visualizacoes').delete().eq('user_id', userId)
    await supabase.from('perfis').delete().eq('id', userId)

    // 2. Deleta o usuário permanentemente do Supabase Auth
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw new Error(error.message)

    revalidatePath('/admin')
  } catch (error: any) {
    console.error('❌ Erro ao deletar usuário:', error.message)
  }
}

// ─── LOJA DE AFILIADOS ───

export async function adicionarProdutoLoja(formData: FormData) {
  const { supabase } = await verificarAdmin()
  try {
    const titulo = formData.get('titulo') as string;
    const descricao = formData.get('descricao') as string;
    const linkAfiliado = formData.get('link_afiliado') as string;
    const imagemUrl1 = formData.get('imagem_url_1') as string | null;
    const imagemUrl2 = formData.get('imagem_url_2') as string | null;
    const imagemUrl3 = formData.get('imagem_url_3') as string | null;
    const proporcaoImagem = (formData.get('proporcao_imagem') as string) || '1:1';
    const ativo = formData.get('ativo') === 'true';

    if (!titulo || !descricao || !linkAfiliado) {
      throw new Error('Título, descrição e link de afiliado são obrigatórios.');
    }

    const { error } = await supabase.from('produtos_loja').insert({
      titulo,
      descricao,
      link_afiliado: linkAfiliado,
      imagem_url_1: imagemUrl1 || null,
      imagem_url_2: imagemUrl2 || null,
      imagem_url_3: imagemUrl3 || null,
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
    const imagemUrl1 = formData.get('imagem_url_1') as string | null;
    const imagemUrl2 = formData.get('imagem_url_2') as string | null;
    const imagemUrl3 = formData.get('imagem_url_3') as string | null;
    const proporcaoImagem = (formData.get('proporcao_imagem') as string) || '1:1';

    if (!titulo || !descricao || !linkAfiliado) {
      throw new Error('Título, descrição e link de afiliado são obrigatórios.');
    }

    const { error } = await supabase.from('produtos_loja').update({
      titulo,
      descricao,
      link_afiliado: linkAfiliado,
      imagem_url_1: imagemUrl1 || null,
      imagem_url_2: imagemUrl2 || null,
      imagem_url_3: imagemUrl3 || null,
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

