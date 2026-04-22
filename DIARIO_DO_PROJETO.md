# 📘 CONTOS DE ORAÇÃO — Diário de Desenvolvimento da Plataforma

> **Última atualização:** 22 de Abril de 2026  
> **Desenvolvedor:** IA Antigravity (Google DeepMind)  
> **Proprietário:** João Pires de Freitas Neto  
> **E-mail do dono (admin):** suporte.appcontos@gmail.com  

---

## 🗺️ Visão Geral do Projeto
Estamos transformando o app "Contos de Oração" numa **plataforma de streaming completa na web**, com:
- Site premium estilo Netflix (Fundo `#090B10` e Destaques `#D4AF37`)
- Sistema de assinatura pago (via Kiwify)
- Banco de dados e Autenticação (via Supabase)
- Hospedagem profissional de vídeos (via Bunny.net)
- Painel administrativo on-site para o dono gerenciar conteúdo

---

## ✅ O QUE JÁ FOI FEITO E CONCLUÍDO (Até 22/04/2026)

### 1. Site Web e Design (Next.js 16 + Tailwind CSS)
- **Framework:** Next.js 16 com App Router, TypeScript e Tailwind CSS v4.
- Componentes modulares fluídos, incluindo Navbars, Hero Banners, VideoCards com animações de hover e interfaces de vidro (Glassmorphism).
- **Remoção de Falsos Positivos Visuais:** Os placeholders da Netflix foram completamente apagados para o site ter identidade própria.

### 2. Painel Administrativo (`/admin`)
- Tela de `Gerenciamento de Conteúdo` totalmente funcional, restrita exclusivamente ao acesso de `suporte.appcontos@gmail.com`.
- **Formulário de Cadastro:** Integração direta de novos vídeos informando (Título, Descrição, Bunny Video ID, Thumbnail, Categoria).
- **Ações Imediatas:** Botões para Publicar/Ocultar, e Deletar vídeo do catálogo do cliente.

### 3. Tela de Assinante (`/watch`)
- Renderização dinâmica do banco de dados (Supabase).
- Componente `HeroBanner` gerado automaticamente a partir do último lançamento Ativo.
- Carrosseis de vídeo segmentados automaticamente por categorias (`Geral`, `Testemunho`, `Infantil`, etc).
- Tela dedicada ao Player (`/watch/[videoId]`) com o player do Bunny.net imbutido e responsivo, forçando o idioma e layout padrão da plataforma.

### 4. Sistema de Autenticação e E-mail (Supabase)
- **SMTP Personalizado:** Configurado via Gmail (Senha de App de 16 dígitos) ao invés do serviço base do Supabase limite.
- **Recuperação de Senha:** Ajustado formulário `/esqueci-senha` contornando bloqueios do HTML5 e tratando erros de rede/mensagens diretamente da API.
- **Rotação de Chaves (Segurança):** O Projeto passou por uma revisão de chaves em 22/04, rotacionando o `JWT Secret` e configurando as chaves modernas (`sb_publishable_` e `sb_secret_`) para prevenir invasões após varreduras do GitGuardian.

### 5. Sistema de Cobranças (Kiwify)
- **Webhook Funcionando:** Rota criada `api/webhook/kiwify`. Quando alguém compra pelo checkout `https://pay.kiwify.com.br/YApXtLr`, o banco de dados Supabase forja a conta do usuário instantaneamente e manda e-mail.

---

## 🔴 O QUE AINDA FALTA FAZER (Próximos Passos)

### Prioridade 1: Testes em Produção do Webhook Kiwify
- Monitorar se o webhook na rota Kiwify está gerando os registros corretamente (`role` = membro, `plano` = premium) nas tabelas do Supabase (`auth.users` e public `perfis`) no fluxo de compra real com a nova chave da Vercel.

### Prioridade 2: Domínio Próprio e Melhoria de SMTP
- **Domínio Próprio:** Comprar um `.com.br` para conectar à Vercel.
- **SMTP Profissional:** Parar de usar o Gmail comum (`suporte.appcontos@gmail.com`) e integrar com a "Endereço Profissional" (ex: Resend ou Brevo) para reduzir taxas de spam e limitação de envio de 100 emails/hora do Gmail.

### Prioridade 3: Gestão de Planos
- O sistema visual tem botões diferentes de "Premium", mas a mecânica para identificar que um usuário foi "Cancelado" na Kiwify e deve ter o acesso bloqueado ao site ainda precisa ser automatizada (outro endpoint de Webhook).

---

## 💰 Custo Mensal da Plataforma Atual
| Serviço | Custo | Situação |
|---|---|---|
| Vercel (site) | **Grátis** | Rodando liso. |
| Supabase (banco) | **Grátis** | Limites gratuitos. |
| Bunny.net (vídeos) | **R$ ~30 a 50/mês** | Necessário botar crédito para os vídeos rodarem. |
| Kiwify (cobranças) | **7% por venda** | Apenas por conversão. |

---

## 📁 Estrutura Atualizada e Resumida
```
d:\Projeto\web\
├── src\
│   ├── app\
│   │   ├── admin\            ← Painel do Dono (Controle de Catalogo)
│   │   ├── watch\            ← Plataforma do Assinante
│   │   │   └── [videoId]     ← Tela do Player do Video Ativo
│   │   ├── esqueci-senha\    ← Tratamento de Recuperação por Email
│   │   ├── login\            ← Login
│   │   └── api\webhook\      ← Robô da Kiwify
│   ├── components\           ← Banners, Cards, Navbar, etc.
│   └── utils\supabase\       ← Clientes de Conexão com DB
├── .env.local                ← Chaves de Acesso e Banco (Rotacionados)
└── DIARIO_DO_PROJETO.md      ← Este diário de documentação da Plataforma!
```

*Arquivo atualizado automaticamente pelo sistema Antigravity em 22/04/2026 após o ciclo de implementação do Bunny.net e Resolução de Segurança Auth/SMTP.*
