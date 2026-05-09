# 📖 DIÁRIO DO PROJETO — CONTOS DE ORAÇÃO (SITE WEB)
**Última atualização:** 09/05/2026  
**Domínio ativo:** https://contosdeoracao.com.br  
**Stack:** Next.js 14 · Supabase · Stripe · Bunny.net CDN · Vercel  
**Deploy:** Automático via GitHub → Vercel (push na branch `main`)

---

## ✅ O QUE JÁ ESTÁ PRONTO NO SITE

### 🏠 Landing Page & Marketing
- [x] Hero animado com tagline e botões de CTA
- [x] Carrossel de thumbnails dos vídeos do catálogo
- [x] Seção **"Planos e Preços"** movida para página própria `/planos`
- [x] Banner de download do app (`AppBanner.tsx`) com versão dinâmica do `versao.json`
- [x] Botão Flutuante de Suporte via WhatsApp Global
- [x] Footer completo com links e redes sociais
- [x] Navbar dinâmica: busca versão do APK em `/api/apk` e exibe badge `v{versao}`

### 📄 Página de Planos (`/planos`)
- [x] Página dedicada com hero + componente `Pricing`
- [x] Busca planos direto da Stripe em tempo real
- [x] FAQ (4 perguntas frequentes)

### 🔐 Autenticação & Contas
- [x] Login / Cadastro via Supabase Auth
- [x] Página de cadastro integrada (`/assinar`) — cria usuário + inicia checkout Stripe
- [x] Recuperação de senha (`/esqueci-senha` + `/atualizar-senha`)
- [x] Campo `user_metadata.nome` salvo no Supabase Auth ao cadastrar
- [x] Trigger automático: ao criar usuário → cria linha em `public.perfis`

### 🎬 Área Logada (`/watch`)
- [x] Catálogo de vídeos organizado por categoria
- [x] Seção "Continue Assistindo" (histórico de visualizações)
- [x] Player Bunny.net via `<iframe>` com Token Auth
- [x] Guard de acesso: verifica `plano_ativo = true` no `user_metadata`
- [x] Controle de sessão simultânea (tabela `sessoes_ativas`)
- [x] Sistema de favoritos (sincronizado com app)
- [x] **NOVO (09/05):** Botão "App" 📱 na navbar — aparece para planos autorizados
  - Verde/esmeralda, compacto, com ícone de celular
  - Link dinâmico lido do `versao.json` no Bunny CDN
  - Admin sempre vê o botão

### 📚 Material Catequese (`/material-catequese`)
- [x] Página de materiais (HQs) com controle de acesso por plano
- [x] **NOVO (09/05):** Controle dinâmico via `config.json` (campo `planos_hq`)
  - Antes era hardcoded `['Essencial', 'Pro']`
  - Agora o admin pode mudar via painel sem deploy

### 📖 Leitor de HQ (`/hq/[slug]`)
- [x] Leitor de HQ em quadrinhos com páginas em grid
- [x] Controle de acesso por plano (dinâmico via `config.json`)
- [x] **MELHORADO (09/05):** Botão de download redesenhado
  - Gradiente dourado, glow/pulse animado, mais destaque

### 🔔 Notificações Push
- [x] API `/api/push/enviar` — envia push via Expo Push Service
- [x] Sino 🔔 no header com últimos vídeos lançados

### 💳 Integração Stripe
- [x] Checkout de assinatura + webhook de ativação
- [x] Portal do cliente (gerenciar/cancelar assinatura)
- [x] API pública de planos: `GET /api/stripe/planos-publicos`

### ⚙️ Painel Admin (`/admin`)
- [x] Protegido por role `admin` + email admin
- [x] CRUD completo de vídeos
- [x] Ver e gerenciar assinantes
- [x] **NOVO (09/05):** Aba "Configurações" com:
  - **Gerenciador de APK** (`GerenciadorApk.tsx`): publica nova versão do app
    - Seleciona APK existente no CDN
    - Atualiza `versao.json` automaticamente
    - Toggle "Atualização Obrigatória"
  - **Permissões de Acesso** (`ConfiguracoesAcesso.tsx`): escolhe quais planos acessam
    - Planos do App (quem pode usar o aplicativo)
    - Planos HQ (quem pode ver Material Catequese)
    - Salva no `config.json` do Bunny CDN em tempo real

### 🌐 APIs do Site

| Endpoint | Função |
|---|---|
| `GET /api/apk` | Retorna versão e link do APK (lê do `versao.json`) |
| `POST /api/admin/atualizar-versao` | Atualiza `versao.json` via Admin autenticado |
| `GET /api/stripe/planos-publicos` | Planos Stripe (consumido pelo App) |
| `POST /api/stripe/checkout` | Inicia checkout + cria usuário Supabase |
| `POST /api/stripe/webhook` | Ativa plano no Supabase ao pagar |
| `GET /api/push/enviar` | Envia push notification |
| `GET /api/sessoes` | Controle de sessão simultânea |

---

## 🗂️ FONTES DE VERDADE — BUNNY CDN

| Arquivo | URL | O que controla |
|---|---|---|
| `versao.json` | `https://contos-apks.b-cdn.net/versao.json` | Versão atual do APK, link download, mensagem |
| `config.json` | `https://contos-apks.b-cdn.net/config.json` | Permissões: `planos_app`, `planos_hq`, fundo do app |

**⚠️ IMPORTANTE:** Sempre que publicar novo APK, atualizar o `versao.json`. Pode ser feito:
1. Automaticamente pelo `gerar-apk-local.bat` (responder "S")
2. Pelo painel Admin → aba Configurações → "Publicar Nova Versão"

---

## 🔴 PENDÊNCIAS DO SITE

### 🟡 Importantes
- [ ] **Git push pendente**: mudanças de 09/05 (botão App na navbar, fallback APK, painel admin melhorado) precisam de `git push` para ir ao Vercel
- [ ] **Testar botão "App"** na navbar após o push — aparece para planos Essencial/Pro

### 🟢 Melhorias Futuras
- [ ] Dashboard de analytics para o admin (views por vídeo)
- [ ] Notificação por e-mail de novos vídeos
- [ ] Adicionar mais HQs na página de Material Catequese

---

## 🔒 CORE BLOQUEADO (NÃO MODIFICAR SEM PERMISSÃO)

1. **Mecanismo de Assinatura (Checkout)**: `/api/stripe/assinatura` e `/assinar/page.tsx` — fluxo testado e validado
2. **Parser de Benefícios**: split por **barra vertical (`|`)** — definitivo para não conflitar com vírgulas
3. **Função `isNewerVersion`**: lógica `remote > local` — travada conforme esperado

---

## 📂 ARQUIVOS CRÍTICOS DO SITE

| Arquivo | Função |
|---|---|
| `src/app/layout.tsx` | SEO global, favicon, Open Graph |
| `src/app/page.tsx` | Homepage |
| `src/app/planos/page.tsx` | Página de planos e preços |
| `src/app/assinar/page.tsx` | Cadastro + checkout Stripe |
| `src/app/watch/page.tsx` | Área logada (catálogo + botão App na navbar) |
| `src/app/material-catequese/page.tsx` | Material Catequese (acesso dinâmico) |
| `src/app/hq/[slug]/page.tsx` | Leitor de HQ |
| `src/app/hq/[slug]/HQReaderClient.tsx` | UI do leitor + botão download melhorado |
| `src/app/admin/page.tsx` | Painel administrativo |
| `src/app/admin/actions.ts` | Server Actions (CRUD + `salvarVersaoApk` + `salvarPermissoesPlanos`) |
| `src/app/admin/GerenciadorApk.tsx` | Componente publicar versão do APK |
| `src/app/admin/ConfiguracoesAcesso.tsx` | Componente permissões de planos |
| `src/app/api/apk/route.ts` | API de versão do APK (lê `versao.json`) |
| `src/app/api/admin/atualizar-versao/route.ts` | API admin para atualizar `versao.json` |
| `src/components/Navbar.tsx` | Navbar pública com botão de download dinâmico |
| `src/components/Pricing.tsx` | Cards de planos (busca da Stripe) |
| `src/components/AppBanner.tsx` | Banner de download do App |

---

## 🗄️ BANCO DE DADOS — SUPABASE (SCHEMA COMPLETO)

### Tabela: `public.perfis`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | FK → `auth.users(id)` — CASCADE DELETE |
| `role` | TEXT | `'admin'` ou `'membro'` (padrão: `'membro'`) |
| `nome` | TEXT | Nome completo |
| `push_token` | TEXT | Token Expo Push |
| `criado_em` | TIMESTAMPTZ | Data de criação |

### Tabela: `public.videos`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Gerado automaticamente |
| `titulo` | TEXT | Título do vídeo |
| `descricao` | TEXT | Descrição (opcional) |
| `categoria` | TEXT | Ex: 'Oração', 'Novena', 'Terço' |
| `thumbnail_url` | TEXT | URL da capa (usa fallback se null) |
| `bunny_video_id` | TEXT | ID do vídeo no Bunny Stream |
| `bunny_library_id` | TEXT | ID da biblioteca Bunny (fixo: `642831`) |
| `duracao` | TEXT | Ex: `'12:34'` |
| `ativo` | BOOLEAN | Visível no catálogo? |
| `criado_em` | TIMESTAMPTZ | Data de upload |

### Tabela: `public.favoritos`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Gerado automaticamente |
| `user_id` | UUID FK | → `auth.users(id)` CASCADE DELETE |
| `video_id` | UUID FK | → `videos(id)` CASCADE DELETE |
| `criado_em` | TIMESTAMPTZ | Quando foi favoritado |

> **Constraint:** `UNIQUE(user_id, video_id)`

### Tabela: `public.visualizacoes`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Gerado automaticamente |
| `video_id` | UUID FK | → `videos(id)` CASCADE DELETE |
| `user_id` | UUID FK | → `auth.users(id)` CASCADE DELETE |
| `criado_em` | TIMESTAMPTZ | Quando assistiu |

### Tabela: `public.sessoes_ativas`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Gerado automaticamente |
| `user_id` | UUID FK | → `auth.users(id)` CASCADE DELETE |
| `device_token` | TEXT | Token único do dispositivo |
| `video_id` | TEXT | Vídeo em reprodução |
| `criado_em` | TIMESTAMPTZ | Início da sessão |
| `atualizado_em` | TIMESTAMPTZ | Último heartbeat |

> **Realtime:** habilitado · **Cleanup:** remove sessões com > 2h sem atividade

### `user_metadata` no Supabase Auth
| Campo | Valor | Quem salva |
|---|---|---|
| `nome` | Nome completo do usuário | Checkout ao criar conta |
| `plano_ativo` | `true` / `false` | Webhook do Stripe |
| `etiqueta_plano` | Ex: `'Essencial'`, `'Pro'` | Webhook do Stripe |
| `has_downloaded_app` | `true` | App ao fazer login |

### RLS (Row Level Security) — Resumo
| Tabela | Quem pode LER | Quem pode ESCREVER |
|---|---|---|
| `videos` | anon (ativo=true) + authenticated | admin |
| `perfis` | próprio usuário + admin | próprio usuário |
| `favoritos` | próprio usuário | próprio usuário |
| `visualizacoes` | todos | usuário logado |
| `sessoes_ativas` | próprio usuário | próprio usuário |

---

## 🌐 TROCA DE DOMÍNIO — CHECKLIST

> ⚠️ **Quando trocar de domínio, fazer TUDO isso na ordem:**
> 1. `src/app/layout.tsx` → atualizar `metadataBase`
> 2. **Supabase** → Authentication → URL Configuration → adicionar novo domínio
> 3. **Stripe** → Webhooks → atualizar endpoint URL
> 4. **Stripe** → redirect URLs para checkout e portal
> 5. **App** → `SubscriptionScreen.js` → `API_URL` e `CHECKOUT_URL`

---

## 📌 HISTÓRICO DE DECISÕES IMPORTANTES

| Data | Decisão | Motivo |
|---|---|---|
| Mai/2026 | Migrar de Kiwify para Stripe | Mais controle, webhook confiável |
| Mai/2026 | Planos movidos para `/planos` | Homepage mais limpa |
| Mai/2026 | Domínio migrado para `contosdeoracao.com.br` | Domínio .com.br mais profissional |
| 09/05/2026 | `/api/apk` lê do `versao.json` em vez de listar arquivos | Mais simples, rápido e controlado pelo admin |
| 09/05/2026 | Permissões dinâmicas via `config.json` | Admin controla acesso sem deploy |
| 09/05/2026 | Painel de Publicar Versão no Admin | Nunca mais esquecer de atualizar o `versao.json` |
| 09/05/2026 | Botão "App" na navbar do `/watch` | Usuários dos planos pagos podem baixar o app facilmente |
