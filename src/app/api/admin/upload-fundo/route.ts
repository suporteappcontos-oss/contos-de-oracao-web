import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// ============================================================================
// ⚙️ CONFIGURAÇÕES DO GOOGLE DRIVE
// ============================================================================
const WALLPAPERS_FOLDER_ID = '1B0syJyqgyNrE2RYovxuSA3pfKvq07Ze9'; // ID da pasta Wallpapers no Drive

async function getDriveService() {
  const clientId = process.env.DRIVE_CLIENT_ID;
  const clientSecret = process.env.DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.DRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('As chaves do Google Drive não foram configuradas nas Variáveis de Ambiente (Vercel).');
  }

  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');
  oAuth2Client.setCredentials({ refresh_token: refreshToken });
  
  return google.drive({ version: 'v3', auth: oAuth2Client });
}

// Procura um arquivo pelo nome na pasta
async function findFileInFolder(drive: any, fileName: string, folderId: string) {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
    fields: 'files(id, name, webContentLink)',
    spaces: 'drive',
  });
  return res.data.files.length > 0 ? res.data.files[0] : null;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verificação de segurança: Apenas admin
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('backgroundImage') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Valida tipo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'O arquivo deve ser uma imagem válida.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Obter serviço do Drive
    const drive = await getDriveService();

    // 1. O NOME DO ARQUIVO:
    // Vamos manter o nome 'background.jpg' ou similar, mas atualizamos o conteúdo.
    // O ID do Drive se manterá igual.
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `background.${fileExtension}`;

    const media = {
      mimeType: file.type,
      body: {
        // Stream from buffer for googleapis
        [Symbol.asyncIterator]: async function* () {
          yield fileBuffer;
        },
      },
    };

    let backgroundId = '';

    const existingFile = await findFileInFolder(drive, fileName, WALLPAPERS_FOLDER_ID);
    
    if (existingFile) {
      // ATUALIZAR
      console.log(`Atualizando imagem no Drive: ${existingFile.id}`);
      await drive.files.update({
        fileId: existingFile.id,
        media: media as any,
      });
      backgroundId = existingFile.id;
    } else {
      // CRIAR
      console.log(`Criando nova imagem no Drive...`);
      const res = await drive.files.create({
        requestBody: { name: fileName, parents: [WALLPAPERS_FOLDER_ID] },
        media: media as any,
        fields: 'id',
      });
      backgroundId = res.data.id as string;
    }

    // 2. Salvar URL no config.json do Drive (para que o app e o site leiam)
    const backgroundUrl = `https://drive.google.com/uc?export=download&id=${backgroundId}`;
    
    // Opcionalmente, cache-busting adicionando ?t= ao final para o site
    const timestamp = Date.now();
    const configData = {
      background_url: `${backgroundUrl}&t=${timestamp}`
    };

    const configBuffer = Buffer.from(JSON.stringify(configData, null, 2), 'utf8');
    const configMedia = {
      mimeType: 'application/json',
      body: {
        [Symbol.asyncIterator]: async function* () { yield configBuffer; },
      },
    };

    const existingConfig = await findFileInFolder(drive, 'config.json', WALLPAPERS_FOLDER_ID);

    if (existingConfig) {
      await drive.files.update({ fileId: existingConfig.id as string, media: configMedia as any });
    } else {
      await drive.files.create({
        requestBody: { name: 'config.json', parents: [WALLPAPERS_FOLDER_ID] },
        media: configMedia as any,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Fundo atualizado com sucesso no Google Drive!',
      url: backgroundUrl
    });

  } catch (error: any) {
    console.error('Erro no upload para o Drive:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload', details: error.message },
      { status: 500 }
    );
  }
}
