import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    const credsPath = path.join(process.cwd(), 'credentials.json');
    
    // Tratamento ninja para Vercel: Se o arquivo não existir lá (porque não foi upado), a gente retorna o motivo certinho!
    if (!fs.existsSync(credsPath)) {
        return NextResponse.json({ error: 'Credenciais ausentes no Vercel (arquivo não foi enviado via GIT)' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      keyFile: credsPath,
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Pasta de APKs que você enviou
    const folderId = '1ENFT7pQbQIvLCmqeq6SiZptddF9CdLJQ';
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.android.package-archive'`,
      fields: 'files(id, name, webContentLink, createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 5,
    });
    
    const files = response.data.files;
    
    if (files && files.length > 0) {
      // Prioriza o arquivo que tem 'v' e números no nome para garantir que é o com versão (ex: -v1.0.5.apk)
      const latestApk = files.find(f => /v\d+\.\d+\.\d+/.test(f.name || '')) || files[0];
      
      // Extrair versão do nome (ex: ContosDeOracao_v1.0.4.apk -> 1.0.4)
      let versao = "1.0.0";
      const versaoMatch = latestApk.name?.match(/v?(\d+\.\d+\.\d+)/);
      if (versaoMatch) {
        versao = versaoMatch[1];
      }
      
      return NextResponse.json({
        link_download: `https://drive.google.com/uc?export=download&confirm=t&id=${latestApk.id}`,
        versao_atual: versao,
        nome: latestApk.name
      });
    }
    
    return NextResponse.json({ error: 'Nenhum APK encontrado' }, { status: 404 });
  } catch (error: any) {
    console.error("Erro ao listar APKs no Google Drive:", error);
    return NextResponse.json({ error: 'Erro interno', details: error?.message || String(error) }, { status: 500 });
  }
}
