import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const WALLPAPERS_FOLDER_ID = '1B0syJyqgyNrE2RYovxuSA3pfKvq07Ze9';

export const revalidate = 60; // Cache de 60 segundos

export async function GET() {
  try {
    const clientId = process.env.DRIVE_CLIENT_ID;
    const clientSecret = process.env.DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return NextResponse.json({ background_url: null });
    }

    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');
    oAuth2Client.setCredentials({ refresh_token: refreshToken });
    
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    // Procura o config.json
    const res = await drive.files.list({
      q: `'${WALLPAPERS_FOLDER_ID}' in parents and name='config.json' and trashed=false`,
      fields: 'files(id)',
      spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0) {
      const configId = res.data.files[0].id;
      
      // Baixa o conteúdo do config.json
      const fileRes = await drive.files.get({
        fileId: configId as string,
        alt: 'media'
      }, { responseType: 'json' });

      return NextResponse.json(fileRes.data);
    }

    return NextResponse.json({ background_url: null });
  } catch (error) {
    console.error('Erro ao buscar config do fundo:', error);
    return NextResponse.json({ background_url: null }, { status: 500 });
  }
}
