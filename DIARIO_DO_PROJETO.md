# 📖 DIÁRIO DO PROJETO — CONTOS DE ORAÇÃO (SITE WEB)
**Última atualização:** 05/05/2026  
**Domínio ativo:** https://www.contosdeoracao.online  
**Stack:** Next.js 14 · Supabase · Stripe · Bunny.net CDN · Vercel

---

## ✅ O QUE JÁ ESTÁ PRONTO NO SITE

### 🏠 Landing Page & Marketing
- [x] Hero animado com tagline e botões de CTA
- [x] Carrossel de thumbnails dos vídeos do catálogo
- [x] Seção **"Planos e Preços"** movida para página própria `/planos`
- [x] Banner CTA na homepage → link para `/planos`
- [x] Banner de download do app (`AppBanner.tsx`)
- [x] Botão Flutuante de Suporte via WhatsApp Global (`WhatsAppButton.tsx`)
- [x] Footer completo com links e redes sociais

### 📄 Página de Planos (`/planos`)
- [x] Criada página dedicada com hero + componente `Pricing`
- [x] Seção de FAQ (4 perguntas frequentes)
- [x] Busca planos direto da Stripe em tempo real
- [x] Link correto no App agora aponta para `/planos`

### 🔐 Autenticação & Contas
- [x] Login / Cadastro via Supabase Auth
- [x] Página de cadastro integrada (`/assinar`) — cria usuário + inicia checkout Stripe
- [x] Recuperação de senha (`/esqueci-senha` + `/atualizar-senha`)
- [x] Campo `user_metadata.nome` salvo no Supabase Auth ao cadastrar
- [x] Trigger automático: ao criar usuário → cria linha em `public.perfis`

### 🎬 Área Logada (`/watch`)
- [x] **NOVO:** Autenticação por Token (Bunny.net Token Auth) implementada para blindar vídeos e resolver erro 403 no .apk
- [x] Catálogo de vídeos organizado por categoria
- [x] **NOVO:** Seção "Continue Assistindo" baseada no histórico de visualizações
- [x] Player Bunny.net embutido via `<iframe>` com `Referer` correto
- [x] Guard de acesso: verifica `plano_ativo = true` no `user_metadata`
- [x] Controle de sessão simultânea (tabela `sessoes_ativas`)
  - Realtime via Supabase: detecta login em outro dispositivo em < 1s
  - API Centralizada (`/api/sessoes`): usada TANTO pelo site quanto pelo App para garantir a derrubada correta do acesso.
  - Limite de telas por plano (padrão: 1, anual: 2, família: 5)
  - Isolamento por abas via `sessionStorage` (abrir nova aba = novo dispositivo)
- [x] Sistema de favoritos (favorito no app aparece no site e vice-versa)
- [x] Página de vídeo individual `/watch/[videoId]`

### 🔔 Notificações Push
- [x] API `/api/push/enviar` — envia push via Expo Push Service
- [x] Sino 🔔 no header com últimos vídeos lançados
- [x] Redirecionamento automático ao clicar na notificação (vai para o vídeo)

### 💳 Integração Stripe
- [x] Funil de Checkout Otimizado (2 passos rápidos sem redundância de escolher plano)
- [x] Novo UI de Planos (`/planos`) com Modal interativo de benefícios e cálculo automático de descontos
- [x] Correção do corte de Benefícios (aceitando vírgulas dentro de parênteses e pipe `|`)
- [x] Fluxo de Checkout Inteligente: Se e-mail já existe, redireciona para login e volta automaticamente para pagamento pulando a etapa de senha.
- [x] Checkout de assinatura via Stripe
- [x] Webhook que ativa `plano_ativo = true` no Supabase quando pagamento é confirmado
- [x] Portal do cliente (gerenciar/cancelar assinatura)
- [x] API pública de planos: `GET /api/stripe/planos-publicos` (consumida pelo App)

### **🚨 Pendências e Próximos Passos**
1. [x] **Carrossel do App:** Alterar a lógica para usar thumbs reais de vídeos, duplicando caso existam menos de 6, removendo o fallback de imagens falsas no OnboardingScreen.js.
2. [x] **Logo do App:** Incluir `icon.png` no `OnboardingScreen.js` em vez de texto.
3. [x] **Erro 403 do Bunny Stream:** 
    - Criada a rota `api/bunny/token/route.ts` no backend Web para buscar a variável de ambiente e gerar o token SHA-256 do Bunny.
    - Modificada a tela `VideoPlayerScreen.js` do App para buscar esse token da web antes de abrir o WebView, garantindo a permissão.
4. [ ] **Testar Fluxo Completo:** Executar o `mandar_pro_ar.bat` (Web) e, logo em seguida, o `gerar-apk-local.bat` (App).

### ⚙️ Painel Admin (`/admin`)
- [x] Protegido por role `admin` na tabela `perfis`
- [x] CRUD completo de vídeos (título, categoria, thumbnail, Bunny ID, duração)
- [x] Ativar/desativar vídeos sem deletar
- [x] Ver e gerenciar assinantes
- [x] **NOVO:** Upload direto de imagens do computador para Thumbnails de Vídeos e Fundo Global do App para a Bunny.net, suportando imagens sem corte forçado no app.

### 🛡️ SEO & Performance
- [x] Meta tags completas (título, descrição, Open Graph, Twitter Card)
- [x] `metadataBase` configurado para `www.contosdeoracao.online`
- [x] Favicon configurado (`logo_stripe.png` — 89,3 KB em `/web/public/`)
- [x] Página 404 personalizada (dark + versículo bíblico)
- [x] Deploy automático via `.bat`

---

## 🔴 PENDÊNCIAS DO SITE

### 🌐 Troca de Domínio — CHECKLIST COMPLETO
> ⚠️ **Quando trocar de domínio, fazer TUDO isso na ordem:**
>
> 1. **`src/app/layout.tsx`** — atualizar `metadataBase`:
>    ```ts
>    metadataBase: new URL('https://NOVO-DOMINIO.com.br'),
>    ```
> 2. **Supabase** → Authentication → URL Configuration → adicionar novo domínio
> 3. **Stripe** → Webhooks → atualizar endpoint URL
> 4. **Stripe** → redirect URLs para checkout e portal
> 5. **App** (`SubscriptionScreen.js`) → `API_URL` e `CHECKOUT_URL` já apontam para `www.contosdeoracao.online`

## 🔒 CORE BLOQUEADO (NÃO MODIFICAR SEM PERMISSÃO EXPLÍCITA)
1. **Mecanismo de Assinatura (Checkout)**: A validação de usuário e geração de sessão com a Stripe (em `/api/stripe/assinatura` e `/assinar/page.tsx`) **NÃO DEVE SER ALTERADA**. O fluxo já foi testado à exaustão e garante que contas duplicadas não sejam criadas e que o Stripe Checkout abra corretamente após checar o email na rota rápida `check-email`.
2. **Parser de Benefícios**: O `Pricing.tsx` e `SubscriptionScreen.js` (App) fazem split dos benefícios via **barra vertical (`|`)**. Isso é definitivo para não conflitar com vírgulas em textos longos.
3. **Mecanismo de Update do App**: A função `isNewerVersion` está **TRAVADA** como `remote > local` (Ex: "1.0.4" > "1.0.2"). Ela consulta o Bunny.

## 📝 Status Atual das Tarefas (06/05/2026)

### ✅ Finalizado:
- **Botão Real do Portal Stripe:** Adicionado o botão "Gerenciar na Stripe" ao site na página `perfil/page.tsx` para permitir aos usuários trocar de plano ou cancelar suas assinaturas usando o Customer Portal da Stripe.
- **Redirecionamento do App para Perfil:** Quando o usuário clica em "Gerenciar" no App, ele agora é redirecionado para o perfil do site. Assim, o fluxo não tenta abrir um novo checkout indevidamente.
- **Melhoria no Erro de Email Existente (Checkout):** Agora, o passo 1 já faz um "pre-check" de e-mail ao clicar em "Continuar para Pagamento". Se o e-mail existir no Supabase, a UI já aciona o botão de Login. Isso salva o usuário de ter que clicar de novo no botão final para descobrir o erro.
- **Correção da renderização dos benefícios na tela de planos:** O sistema de separação de frases estava quebrando na vírgula e colocando símbolos misturados. O código foi limpo. **Agora, para separar os benefícios no painel da Stripe, o cliente deve usar o caractere `|`**.

### 🚨 Bugs para Corrigir
- [ ] **Atualizador Automático (OTA):** O aplicativo não detectou nova versão. Provavelmente o APK instalado no celular do usuário ainda tinha a lógica antiga (com bug). Ele precisará baixar o `.apk` novo manualmente 1 vez para que as *próximas* atualizações funcionem.

### 📌 Melhorias Futuras
- [ ] **NOVO:** Implementar Seção de HQs / Materiais Extras (Modelar tabelas para PDFs/Imagens e adicionar nova interface no Site)
- [ ] Dashboard de analytics para o admin (views por vídeo)
- [ ] Notificação por e-mail de novos vídeos

---

## 📂 ARQUIVOS CRÍTICOS DO SITE

| Arquivo | Função |
|---|---|
| `src/app/layout.tsx` | SEO global, favicon, Open Graph |
| `src/app/page.tsx` | Homepage — carrossel + banner CTA para /planos |
| `src/app/planos/page.tsx` | Página dedicada de planos e preços |
| `src/app/assinar/page.tsx` | Cadastro + checkout Stripe |
| `src/app/watch/page.tsx` | Área logada principal (catálogo) |
| `src/app/watch/[videoId]/page.tsx` | Player individual de vídeo |
| `src/app/admin/page.tsx` | Painel administrativo |
| `src/app/admin/actions.ts` | Server Actions do CRUD de vídeos |
| `src/app/not-found.tsx` | Página 404 personalizada |
| `src/components/VideoCard.tsx` | Card de vídeo com fallback de thumbnail |
| `src/components/VideoPlayerGuard.tsx` | Controle de sessão simultânea |
| `src/components/Pricing.tsx` | Cards de planos (busca da Stripe) |
| `src/components/AppBanner.tsx` | Banner de download do App |
| `src/app/api/push/enviar/route.ts` | API de envio de push notifications |
| `src/app/api/stripe/planos-publicos/route.ts` | API pública de planos (consumida pelo App) |
| `src/app/api/stripe/checkout/route.ts` | Inicia checkout + cria usuário Supabase |
| `src/app/api/stripe/webhook/route.ts` | Ativa plano no Supabase ao pagar |

---

## 🗄️ BANCO DE DADOS — SUPABASE (SCHEMA COMPLETO)

### Tabela: `public.perfis`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | FK → `auth.users(id)` — CASCADE DELETE |
| `role` | TEXT | `'admin'` ou `'membro'` (padrão: `'membro'`) |
| `nome` | TEXT | Nome completo (copiado de `user_metadata.nome` via trigger) |
| `push_token` | TEXT | Token Expo Push (salvo pelo App ao login) |
| `criado_em` | TIMESTAMPTZ | Data de criação |

> **Trigger:** `on_auth_user_created` → cria linha em `perfis` automaticamente ao registrar usuário

### Tabela: `public.videos`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Gerado automaticamente |
| `titulo` | TEXT | Título do vídeo (obrigatório) |
| `descricao` | TEXT | Descrição (opcional) |
| `categoria` | TEXT | Ex: 'Oração', 'Novena', 'Terço' (padrão: `'Geral'`) |
| `thumbnail_url` | TEXT | URL da imagem de capa (opcional — usa fallback determinístico se null) |
| `bunny_video_id` | TEXT | ID do vídeo no Bunny Stream (obrigatório) |
| `bunny_library_id` | TEXT | ID da biblioteca Bunny (fixo: `642831`) |
| `duracao` | TEXT | Ex: `'12:34'` (opcional) |
| `ativo` | BOOLEAN | Visível no catálogo? (padrão: `true`) |
| `criado_em` | TIMESTAMPTZ | Data de upload |

> **URL do player:** `https://iframe.mediadelivery.net/embed/{bunny_library_id}/{bunny_video_id}`  
> **Thumbnail fallback:** algoritmo determinístico por ID (mesmo no site e no app)

### Tabela: `public.favoritos`
| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID PK | Gerado automaticamente |
| `user_id` | UUID FK | → `auth.users(id)` CASCADE DELETE |
| `video_id` | UUID FK | → `videos(id)` CASCADE DELETE |
| `criado_em` | TIMESTAMPTZ | Quando foi favoritado |
> **Constraint:** `UNIQUE(user_id, video_id)` — sem duplicatas

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
| `device_token` | TEXT | Token único gerado no dispositivo |
| `video_id` | TEXT | Qual vídeo está assistindo |
| `criado_em` | TIMESTAMPTZ | Início da sessão |
| `atualizado_em` | TIMESTAMPTZ | Último heartbeat |
> **Realtime:** habilitado (`supabase_realtime` publication)  
> **Cleanup:** função `limpar_sessoes_antigas()` — remove sessões com > 2h sem atividade

### RLS (Row Level Security) — Resumo

| Tabela | Quem pode LER | Quem pode ESCREVER |
|---|---|---|
| `videos` | anon (ativo=true) + authenticated | admin |
| `perfis` | próprio usuário + admin | próprio usuário |
| `favoritos` | próprio usuário | próprio usuário |
| `visualizacoes` | todos | usuário logado (próprio uid) |
| `sessoes_ativas` | próprio usuário | próprio usuário |

### `user_metadata` no Supabase Auth
Campo | Valor | Quem salva
---|---|---
`nome` | Nome completo do usuário | Checkout ao criar conta
`plano_ativo` | `true` / `false` | Webhook do Stripe
`etiqueta_plano` | Ex: `'Mensal'`, `'Anual'` | Webhook do Stripe
`has_downloaded_app` | `true` | App ao fazer login
