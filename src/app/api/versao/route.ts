import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const APK_FOLDER_ID = '1ENFT7pQbQIvLCmqeq6SiZptddF9CdLJQ';

export const revalidate = 60; // Cache de 60 segundos

export async function GET() {
  try {
    const clientId = process.env.DRIVE_CLIENT_ID;
    const clientSecret = process.env.DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({ error: 'Credenciais ausentes' }, { status: 500 });
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Procura o versao.json na pasta de APKs
    const res = await drive.files.list({
      q: `'${APK_FOLDER_ID}' in parents and name='versao.json' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0) {
      const versaoId = res.data.files[0].id;
      
      // Baixa o conteúdo do versao.json
      const fileRes = await drive.files.get({
        fileId: versaoId as string,
        alt: 'media'
      }, { responseType: 'json' });

      return NextResponse.json(fileRes.data);
    }

    return NextResponse.json({ error: 'versao.json não encontrado' }, { status: 404 });
  } catch (error) {
    console.error('Erro ao buscar versao.json do Drive:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
