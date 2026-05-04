# 📖 Diário do Projeto — Contos de Oração (SITE)
**Atualizado em:** 03/05/2026

---

## ✅ O QUE JÁ ESTÁ FEITO NO SITE

- [x] Landing page com seção de planos (Stripe)
- [x] Login / Cadastro com Supabase Auth
- [x] Área logada `/watch` com catálogo de vídeos
- [x] Player de vídeo com controle de sessão simultânea
- [x] Realtime — detecta novo login em outro dispositivo em < 1 segundo
- [x] Header com bolinas de Instagram e Facebook
- [x] Sino de notificações 🔔 com últimos vídeos lançados
- [x] Banner premium de download do App
- [x] Página 404 personalizada (dark + versículo bíblico)
- [x] SEO completo — título, descrição, Open Graph, Twitter Card
- [x] API de push notifications `/api/push/enviar`
- [x] Deploy automático via `.bat`

---

## 🔴 PENDÊNCIAS DO SITE

### 🌐 Domínio e Ícone — FAZER JUNTOS quando trocar o domínio
> ⚠️ **LEMBRETE IMPORTANTE:**
> Quando trocar para o novo domínio (ex: `contosdeoracao.com.br`), fazer TUDO isso:
>
> 1. **Atualizar o `metadataBase`** em `src/app/layout.tsx`:
>    ```ts
>    metadataBase: new URL('https://SEU-NOVO-DOMINIO.com.br'),
>    ```
>
> 2. **Atualizar a URL canônica** no mesmo arquivo:
>    ```ts
>    alternates: { canonical: '/' },
>    ```
>
> 3. **Verificar o favicon** — o `logo_stripe.png` (89KB) já está configurado
>    corretamente. Após trocar o domínio, esperar 2-7 dias para o Google
>    atualizar o ícone automaticamente, ou usar o Google Search Console
>    para solicitar re-indexação:
>    👉 https://search.google.com/search-console
>
> 4. **Atualizar as URLs hardcoded** no App (`SubscriptionScreen.js`):
>    - `API_URL` → nova URL da API de planos
>    - `CHECKOUT_URL` → nova URL da página de assinatura
>
> 5. **Adicionar domínio no Supabase** (Authentication → URL Configuration)
>
> 6. **Adicionar domínio no Stripe** (webhooks e redirect URLs)

---

## 📂 ARQUIVOS CRÍTICOS DO SITE

| Arquivo | Função |
|---|---|
| `src/app/layout.tsx` | SEO global, favicon, Open Graph |
| `src/app/not-found.tsx` | Página 404 personalizada |
| `src/components/VideoPlayerGuard.tsx` | Controle de sessão simultânea |
| `src/components/NotificationBell.tsx` | Sino de notificações |
| `src/components/AppBanner.tsx` | Banner de download do App |
| `src/app/api/push/enviar/route.ts` | API de envio de push notifications |
| `src/app/api/stripe/planos-publicos/route.ts` | API de planos (consumida pelo App) |
| `src/app/watch/page.tsx` | Área logada principal |
