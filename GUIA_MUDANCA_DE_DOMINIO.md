# 🔄 GUIA DEFINITIVO: O QUE FAZER QUANDO MUDAR O DOMÍNIO

Este guia foi criado para que você saiba exatamente o que precisa ser alterado quando você comprar e mudar para o **domínio oficial/definitivo**. Se você esquecer de mudar qualquer uma dessas coisas, os pagamentos, logins ou e-mails podem parar de funcionar.

> **Domínio Atual (Temporário):** `https://www.contosdeoracao.online`

---

## 1️⃣ MUDANÇAS NO SITE (PROJETO WEB)

**1. Arquivo de Variáveis de Ambiente (`.env.local` e Vercel):**
- Na Vercel, vá nas configurações do seu projeto (Settings > Environment Variables) e altere a variável `NEXT_PUBLIC_SITE_URL` para o seu novo domínio (com o `https://`).
- *Exemplo:* `NEXT_PUBLIC_SITE_URL="https://www.meunovodominio.com.br"`

**2. Autenticação do Supabase (Login):**
- Entre no painel do Supabase.
- Vá em **Authentication > URL Configuration**.
- Mude o **Site URL** para o seu domínio novo.
- Nas **Redirect URLs**, adicione as novas rotas de sucesso (ex: `https://www.meunovodominio.com.br/watch`, etc). Isso garante que quando o cliente logar ou recuperar a senha, ele seja redirecionado para o site certo.

---

## 2️⃣ MUDANÇAS NA STRIPE (PAGAMENTOS E CHECKOUT)

**1. Domínio de Pagamento (Custom Domain):**
- Vá no painel da Stripe > Configurações > Branding (ou Configurações de Checkout).
- Delete o subdomínio antigo (ex: `pagamento.contosdeoracao.online`) e conecte o novo subdomínio (ex: `pagamento.meunovodominio.com.br`). A Stripe vai pedir para você colocar novos códigos no DNS do seu provedor (Hostinger/Registro.br) para aprovar.

**2. Webhooks da Stripe (O mais importante):**
- Vá em **Developers > Webhooks**.
- Clique no webhook antigo e clique em "Update" (Atualizar).
- Troque o Endpoint URL para o novo site: `https://www.meunovodominio.com.br/api/stripe/webhook`

---

## 3️⃣ MUDANÇAS DE E-MAIL MARKETING E SUPORTE (RESEND)

- **Validação de DNS:** Entre no painel do **Resend.com**, clique em "Domains" e adicione o domínio novo. Você terá que copiar e colar os registros (TXT, SPF, DKIM) lá onde o domínio foi comprado.
- **Mudança de Remetente no Código:** No projeto Web, abra o arquivo `src/app/api/admin/enviar-promocao/route.ts` e mude o e-mail de envio (`from`) para o seu novo domínio, tipo: `suporte@meunovodominio.com.br`.

---

## 4️⃣ MUDANÇAS NO APLICATIVO ANDROID (APP)

**1. Links de Redirecionamento:**
- No código do aplicativo (projeto `App`), existirá um botão "Assinar" que abre o navegador do celular. O link desse botão deverá ser trocado para `https://www.meunovodominio.com.br/#planos`.

**2. Atualização via OTA (EAS Update):**
- Ao fazer essa mudança de link no código do App, basta rodar o comando de atualizar o App e o aplicativo de todos os clientes baixará a correção sozinho.
