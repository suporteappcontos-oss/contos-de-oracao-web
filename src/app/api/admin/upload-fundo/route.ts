import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

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

    // Se user logado não for encontrado, barramos
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    const formData = await request.formData();
    const fileDesk = formData.get('backgroundDesktop') as File;
    const fileMob = formData.get('backgroundMobile') as File;

    if (!fileDesk || !fileMob) {
      return NextResponse.json({ error: 'Imagens Desktop e Mobile são obrigatórias' }, { status: 400 });
    }

    // Valida tipo
    if (!fileDesk.type.startsWith('image/') || !fileMob.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Os arquivos devem ser imagens válidas.' }, { status: 400 });
    }

    // Obter serviço do Drive
    const drive = await getDriveService();

    const bufferDesk = Buffer.from(await fileDesk.arrayBuffer());
    const bufferMob = Buffer.from(await fileMob.arrayBuffer());

    // 1. Fazer Upload ou Atualizar as imagens no Drive
    const existingDesk = await findFileInFolder(drive, 'background_desktop.jpg', WALLPAPERS_FOLDER_ID);
    const existingMob = await findFileInFolder(drive, 'background_mobile.jpg', WALLPAPERS_FOLDER_ID);

    let deskId = '';
    let mobId = '';

    // ================= UPLOAD DESKTOP =================
    const mediaDesk = {
      mimeType: fileDesk.type,
      body: Readable.from(bufferDesk),
    };

    if (existingDesk) {
      const res = await drive.files.update({ fileId: existingDesk.id as string, media: mediaDesk as any, fields: 'id' });
      deskId = res.data.id as string;
    } else {
      const res = await drive.files.create({
        requestBody: { name: 'background_desktop.jpg', parents: [WALLPAPERS_FOLDER_ID] },
        media: mediaDesk as any,
        fields: 'id',
      });
      deskId = res.data.id as string;
    }

    // ================= UPLOAD MOBILE =================
    const mediaMob = {
      mimeType: fileMob.type,
      body: Readable.from(bufferMob),
    };

    if (existingMob) {
      const res = await drive.files.update({ fileId: existingMob.id as string, media: mediaMob as any, fields: 'id' });
      mobId = res.data.id as string;
    } else {
      const res = await drive.files.create({
        requestBody: { name: 'background_mobile.jpg', parents: [WALLPAPERS_FOLDER_ID] },
        media: mediaMob as any,
        fields: 'id',
      });
      mobId = res.data.id as string;
    }

    // Tornar ambos os arquivos públicos na web para que o <img src> ou css background funcione
    await drive.permissions.create({ fileId: deskId, requestBody: { role: 'reader', type: 'anyone' } });
    await drive.permissions.create({ fileId: mobId, requestBody: { role: 'reader', type: 'anyone' } });

    // 2. Salvar URL no config.json do Drive
    const timestamp = Date.now();
    const configData = {
      background_url_desktop: `https://drive.google.com/uc?export=download&id=${deskId}&t=${timestamp}`,
      background_url_mobile: `https://drive.google.com/uc?export=download&id=${mobId}&t=${timestamp}`
    };

    const configBuffer = Buffer.from(JSON.stringify(configData, null, 2), 'utf8');
    const configMedia = {
      mimeType: 'application/json',
      body: Readable.from(configBuffer),
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
      message: 'Fundos atualizados com sucesso no Google Drive!',
      urls: configData
    });

  } catch (error: any) {
    console.error('Erro no upload para o Drive:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer upload', details: error.message },
      { status: 500 }
    );
  }
}
