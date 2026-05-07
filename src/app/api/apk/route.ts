import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), 'credentials.json'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Pasta de APKs que você enviou
    const folderId = '1ENFT7pQbQIvLCmqeq6SiZptddF9CdLJQ';
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.android.package-archive'`,
      fields: 'files(id, name, webContentLink, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 1,
    });
    
    const files = response.data.files;
    
    if (files && files.length > 0) {
      const latestApk = files[0];
      
      // Extrair versão do nome (ex: ContosDeOracao_v1.0.4.apk -> 1.0.4)
      let versao = "1.0.0";
      const versaoMatch = latestApk.name?.match(/v?(\d+\.\d+\.\d+)/);
      if (versaoMatch) {
        versao = versaoMatch[1];
      }
      
      return NextResponse.json({
        link_download: latestApk.webContentLink,
        versao_atual: versao,
        nome: latestApk.name
      });
    }
    
    return NextResponse.json({ error: 'Nenhum APK encontrado' }, { status: 404 });
  } catch (error) {
    console.error("Erro ao listar APKs no Google Drive:", error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
