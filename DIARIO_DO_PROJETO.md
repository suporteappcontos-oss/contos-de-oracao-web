# 📘 CONTOS DE ORAÇÃO — Diário de Desenvolvimento da Plataforma

> **Última atualização:** 20 de Abril de 2026  
> **Desenvolvedor:** IA Antigravity (Google DeepMind)  
> **Proprietário:** João Pires de Freitas Neto  
> **E-mail do dono (admin):** suporte.appcontos@gmail.com  
> **E-mail de desenvolvimento:** j.p2013neto@gmail.com  

---

## 🗺️ Visão Geral do Projeto

Estamos transformando o app "Contos de Oração" (que existia no celular com React Native/Expo) numa **plataforma de streaming completa na web**, com:
- Site premium estilo Netflix
- Sistema de assinatura pago (via Kiwify)
- Banco de dados de usuários (via Supabase)
- Hospedagem de vídeos profissional (via Bunny.net — próximo passo)
- Painel administrativo para o dono postar conteúdo (a construir)

---

## ✅ O QUE JÁ FOI FEITO

### 1. Site Web (Next.js 16 + Tailwind CSS)
- **Pasta:** `d:\Projeto\web`
- **Comando para rodar local:** `npm run dev` (dentro da pasta `web`)
- **Framework:** Next.js 16 com App Router, TypeScript e Tailwind CSS v4
- **Fonte:** Inter (Google Fonts)
- **Paleta de cores:** Fundo `#0C121D` (azul escuro) + Destaque `#FFD700` (dourado)

**Componentes criados:**
| Arquivo | O que faz |
|---|---|
| `src/components/Navbar.tsx` | Menu superior com efeito de transparência no scroll |
| `src/components/Hero.tsx` | Tela de destaque principal com gradiente |
| `src/components/Carousel.tsx` | Carrosséis de conteúdo (Lançamentos e Em Alta) |
| `src/components/Pricing.tsx` | Tabela de planos (Básico R$5 / Família R$6 / Premium R$7) |
| `src/components/Footer.tsx` | Rodapé da plataforma |
| `src/app/login/page.tsx` | Tela de login profissional (dourada) |
| `src/app/login/actions.ts` | Controlador de login e criação de conta (Server Actions) |
| `src/app/watch/page.tsx` | Tela principal do assinante logado |
| `src/app/api/webhook/kiwify/route.ts` | Receptor automático dos pagamentos da Kiwify |
| `src/utils/supabase/client.ts` | Conexão com banco pelo navegador |
| `src/utils/supabase/server.ts` | Conexão com banco pelo servidor |
| `src/utils/supabase/middleware.ts` | Verificador de sessão para cada request |
| `src/proxy.ts` | Guardião de rotas (barra quem não está logado de acessar /watch) |

---

### 2. Hospedagem do Site (Vercel)
- **URL do site:** `https://contos-de-oracao-web.vercel.app`
- **GitHub:** `https://github.com/suporteappcontos-oss/contos-de-oracao-web`
- **Deploy:** Automático — toda vez que fazemos `git push`, o site atualiza em ~1 minuto

**Variáveis de ambiente na Vercel (Settings → Environment Variables):**
```
NEXT_PUBLIC_SUPABASE_URL       = https://simlfedsforfwwtlmshy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY  = sb_publishable_xZAHvIkXUFD3m8wXsLu4NQ_ngczLhNS
SUPABASE_SERVICE_ROLE_KEY      = eyJhbGci... (chave secreta de admin)
KIWIFY_WEBHOOK_TOKEN           = x2vymmp5c1b
```

---

### 3. Banco de Dados (Supabase)
- **Projeto:** `contos-de-oracao-db`
- **URL:** `https://simlfedsforfwwtlmshy.supabase.co`
- **Autenticação:** E-mail + Senha (sem confirmação de e-mail obrigatória)
- **Usuário criado:** `j.p2013neto@gmail.com` (confirmado manualmente via API)

---

### 4. Sistema de Cobranças (Kiwify)
- **Conta:** `suporteappcontas-oss` em `dashboard.kiwify.com`
- **Produto criado:** "Teste Básico - Contos de Oração" (R$ 5,00/mês)
- **Link de checkout:** `https://pay.kiwify.com.br/YApXtLr`
- **Webhook configurado:** quando alguém paga, a Kiwify avisa o nosso site automaticamente

**Fluxo automático de compra:**
```
Cliente paga na Kiwify
       ↓
Kiwify dispara o Webhook para o nosso site
       ↓  
Nosso site verifica o token secreto (x2vymmp5c1b)
       ↓
Cria conta automaticamente no Supabase
       ↓
Cliente já pode fazer login e assistir ✅
```

---

## 🔴 O QUE AINDA FALTA FAZER

### Prioridade 1: Hospedar os Vídeos (Bunny.net)
**Por que Bunny.net e não YouTube?**
- YouTube pode suspender o canal (viola ToS ao incorporar em sites comerciais)
- Bunny.net: $0,005/GB armazenado + $0,01/GB entregue — **muito barato**
- Converte automaticamente em 480p/720p/1080p/4K
- O cliente não consegue baixar os vídeos

**Passos:**
1. Criar conta gratuita em `bunny.net`
2. Criar uma "Stream Library" (biblioteca de vídeos)
3. Fazer upload dos primeiros vídeos
4. Pegar o "iFrame URL" de cada vídeo para usar no site

**Custo estimado:** R$ 20-50/mês para catálogo inicial de 50 vídeos

---

### Prioridade 2: Painel Administrativo (`/admin`)
**O que é:** Uma tela exclusiva em `https://contos-de-oracao-web.vercel.app/admin` acessível **apenas** com o e-mail `suporte.appcontos@gmail.com`.

**O que o dono vai poder fazer:**
- ➕ Cadastrar novos vídeos (título, descrição, categoria, thumbnail, link do Bunny.net)
- 📂 Criar e gerenciar categorias (Infantil, Adulto, Documentário Católico, etc.)
- 👥 Ver lista de assinantes ativos
- 🚫 Bloquear/desbloquear acesso de um cliente específico

**Banco de dados necessário (tabela `videos` no Supabase):**
```sql
id, titulo, descricao, categoria, thumbnail_url, video_url, 
criado_em, ativo (boolean)
```

---

### Prioridade 3: Tela de Catálogo Real (`/watch`)
Atualmente a tela `/watch` mostra uma mensagem "Catálogo em construção". Precisamos substituir por:
- Carrosséis reais com os vídeos cadastrados pelo admin
- Player de vídeo embutido seguro (HLS.js)
- Histórico de onde o usuário parou

---

### Prioridade 4: Confirmar Conta do Dono como Admin
O e-mail `suporte.appcontos@gmail.com` precisa:
1. Ser criado no Supabase (igual fizemos com o j.p2013neto@gmail.com)
2. Ter uma coluna `role = 'admin'` na tabela de perfis do Supabase
3. O código verificar essa role antes de mostrar o painel `/admin`

---

### Prioridade 5: Melhorias Futuras
- Perfil de criança com PIN de controle parental
- Notificações por e-mail para assinantes quando novo conteúdo for adicionado
- Analytics de visualização (quais vídeos são mais assistidos)
- Aplicativo mobile (React Native) conectado ao mesmo Supabase

---

## 💰 Custo Mensal da Plataforma

| Serviço | Custo |
|---|---|
| Vercel (site) | **Grátis** |
| Supabase (banco) | **Grátis** |
| Bunny.net (vídeos) | **~R$ 20-50/mês** |
| Kiwify (cobranças) | **7% por venda** |
| **Total fixo** | **~R$ 20-50/mês** |

✅ Com apenas **2 assinantes pagando R$ 29,90** toda a infraestrutura já se paga!

---

## 📁 Estrutura de Arquivos do Projeto

```
d:\Projeto\
├── App\                    ← App mobile antigo (React Native/Expo) — pausado
└── web\                    ← SITE NOVO (Next.js 16) — ativo
    ├── src\
    │   ├── app\
    │   │   ├── page.tsx         ← Página inicial
    │   │   ├── layout.tsx       ← Layout global (fonte, metadata)
    │   │   ├── globals.css      ← Cores e estilos globais
    │   │   ├── login\
    │   │   │   ├── page.tsx     ← Tela de login
    │   │   │   └── actions.ts   ← Lógica de login/cadastro
    │   │   ├── watch\
    │   │   │   └── page.tsx     ← Tela do assinante logado
    │   │   └── api\
    │   │       └── webhook\
    │   │           └── kiwify\
    │   │               └── route.ts  ← Receptor de pagamentos
    │   ├── components\
    │   │   ├── Navbar.tsx
    │   │   ├── Hero.tsx
    │   │   ├── Carousel.tsx
    │   │   ├── Pricing.tsx
    │   │   └── Footer.tsx
    │   ├── utils\
    │   │   └── supabase\
    │   │       ├── client.ts
    │   │       ├── server.ts
    │   │       └── middleware.ts
    │   └── proxy.ts             ← Guardião de rotas
    ├── .env.local               ← Senhas locais (NÃO vai pro GitHub)
    └── package.json
```

---

## 🛠️ Comandos Úteis

```bash
# Rodar o site localmente (desenvolvimento)
cd d:\Projeto\web
npm run dev
# Acesse: http://localhost:3000

# Enviar atualizações para o GitHub (e Vercel atualiza automaticamente)
cd d:\Projeto\web
git add .
git commit -m "descrição do que mudou"
git push
```

---

*Arquivo gerado automaticamente pelo sistema de IA Antigravity em 20/04/2026*
