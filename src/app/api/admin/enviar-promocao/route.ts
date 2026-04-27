import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    
    const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
    if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { emails, assunto, mensagem } = await req.json();

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'Nenhum email fornecido.' }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'Chave RESEND_API_KEY não encontrada nas variáveis de ambiente da Vercel. Crie uma conta no Resend.com e adicione a chave na Vercel.' 
      }, { status: 400 });
    }

    // O Resend permite até 50 e-mails no BCC por requisição.
    // Vamos dividir o array de emails em blocos de 50.
    const chunks = [];
    for (let i = 0; i < emails.length; i += 50) {
      chunks.push(emails.slice(i, i + 50));
    }

    for (const chunk of chunks) {
      const resendReq = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Contos de Oração <contato@contosdeoracao.online>', // O domínio contosdeoracao.online DEVE estar verificado no Resend
          to: ['contato@contosdeoracao.online'],
          bcc: chunk,
          subject: assunto,
          html: mensagem.replace(/\n/g, '<br/>')
        })
      });

      if (!resendReq.ok) {
        const data = await resendReq.json();
        throw new Error(data.message || 'Erro na API do Resend');
      }
    }

    return NextResponse.json({ success: true, message: 'E-mails enviados com sucesso!' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
