import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    // Agora o sistema busca as senhas diretamente do cofre secreto do servidor!
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
        return NextResponse.json({ error: 'Credenciais secretas nao configuradas na Vercel ou no .env.local' }, { status: 500 });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        // Esse replace converte as quebras de linha de texto da Vercel para o padrão de criptografia real e remove os erros do Windows
        private_key: privateKey.replace(/\\n/g, '\n').replace(/\r/g, ''),
      },
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
