# 🗺️ **ESTRUTURA COMPLETA DOS SITES E FUNÇÕES**

## 🌐 **MAPEAMENTO COMPLETO DA PLATAFORMA**

---

## 📁 **ESTRUTURA DE PASTAS**

```
d:\Projeto\web\
├── src\
│   ├── app\                          ← Rotas Next.js App Router
│   │   ├── admin\               ← Painel Administrativo
│   │   │   ├── page.tsx         ← Dashboard principal
│   │   │   ├── actions.ts         ← Funções server-side admin
│   │   │   └── StripeAdmin.tsx   ← Componente Stripe admin
│   │   ├── assinar\             ← Criação de conta/assinatura
│   │   │   └── page.tsx         ← Fluxo 3 steps + checkout
│   │   ├── login\               ← Login de usuários
│   │   │   ├── page.tsx         ← Formulário login
│   │   │   └── actions.ts         ← Autenticação server-side
│   │   ├── atualizar-senha\     ← Reset/criação de senha
│   │   │   ├── page.tsx         ← Formulário senha + confirmação
│   │   │   └── actions.ts         ← Validação e atualização
│   │   ├── sucesso\             ← Pós-pagamento aprovado
│   │   │   └── page.tsx         ← Mensagem sucesso + redirecionamento
│   │   ├── perfil\              ← Perfil do usuário
│   │   │   └── page.tsx         ← Dados pessoais + planos
│   │   ├── watch\               ← Plataforma principal assinantes
│   │   │   ├── page.tsx         ← Catálogo com carrossel
│   │   │   └── [videoId]\       ← Player individual
│   │   │       └── page.tsx     ← Player Bunny.net + controles
│   │   └── api\                 ← APIs REST
│   │       └── stripe\          ← Integração Stripe completa
│   │           ├── checkout\      ← Sessões pagamento
│   │           │   └── route.ts     ← Criar checkout Stripe
│   │           ├── webhook\       ← Eventos Stripe
│   │           │   └── route.ts     ← Processar webhooks
│   │           ├── planos-publicos\ ← Planos ativos
│   │           │   └── route.ts     ← Listar produtos/preços
│   │           └── produtos\      ← Admin produtos
│   │               └── route.ts     ← CRUD produtos Stripe
│   ├── components\                  ← Componentes reutilizáveis
│   │   ├── Navbar.tsx          ← Menu navegação principal
│   │   ├── Hero.tsx            ← Banner principal animado
│   │   ├── HeroBanner.tsx       ← Banner informativo
│   │   ├── Carousel.tsx         ← Carrossel vídeos
│   │   ├── CategoryCarousel.tsx  ← Carrossel categorias
│   │   ├── VideoCard.tsx        ← Card vídeo com hover
│   │   ├── VideoPlayerGuard.tsx ← Proteção acesso vídeos
│   │   ├── Pricing.tsx          ← Cards de planos dinâmicos
│   │   ├── PasswordField.tsx     ← Campo senha + ícone olho
│   │   ├── SubmitButton.tsx      ← Botão loading estados
│   │   ├── FavoritoButton.tsx   ← Botão favoritar vídeos
│   │   ├── CancelarPlanoBtn.tsx ← Cancelamento assinatura
│   │   └── Footer.tsx           ← Rodapé links redes sociais
│   ├── lib\                       ← Bibliotecas e configurações
│   │   ├── stripe.ts            ← Cliente Stripe
│   │   └── supabase-admin.ts   ← Cliente admin Supabase
│   └── utils\supabase\           ← Utilitários Supabase
│       ├── server.ts            ← Cliente server Supabase
│       └── client.ts            ← Cliente client Supabase
├── public\                     ← Arquivos estáticos
│   ├── logo.png               ← Logo da plataforma
│   └── favicon.ico            ← Ícone aba navegador
├── .env.local                   ← Variáveis ambiente desenvolvimento
├── DIARIO_DO_PROJETO.md        ← Documentação projeto
├── ANALISE_PIX_STRIPE.md        ← Análise pagamentos PIX
├── ESTRUTURA_SITES_FUNCOES.md ← Este arquivo
├── package.json                ← Dependências Next.js + libs
├── next.config.ts              ← Configuração Next.js
├── tailwind.config.js           ← Configuração Tailwind CSS
├── tsconfig.json              ← Configuração TypeScript
└── README.md                  ← Documentação oficial
```

---

## 🎯 **FUNÇÕES POR SITE/ROTA**

### **🏠 Página Principal (`/`)**
- **URL:** `https://contosdeoracao.online`
- **Função:** Landing page principal com Hero, Pricing, depoimentos
- **Componentes:** Navbar, Hero, Carousel, Pricing, Footer
- **Recursos:** Animações, cards responsivos, CTA para assinatura

### **🔐 Login (`/login`)**
- **URL:** `https://contosdeoracao.online/login`
- **Função:** Autenticação de usuários existentes
- **Componentes:** PasswordField com ícone olho, validação
- **Fluxo:** Email + senha → dashboard assinante
- **Segurança:** Validação server-side, proteção CSRF

### **📝 Cadastro/Assinatura (`/assinar`)**
- **URL:** `https://contosdeoracao.online/assinar`
- **Função:** Fluxo 3-step para nova assinatura
- **Steps:** 1) Dados pessoais 2) Escolha plano 3) Pagamento
- **Validação:** Confirmação de senha, email válido, nome completo
- **UX:** Progress indicator, benefícios dinâmicos, telas simultâneas

### **⚙️ Painel Admin (`/admin`)**
- **URL:** `https://contosdeoracao.online/admin`
- **Função:** Gestão completa da plataforma
- **Módulos:**
  - 📹 **Vídeos:** Upload, edição, categorias, publicar/ocultar
  - 💳 **Planos Stripe:** Criar/editar produtos, preços, benefícios
  - 🎫 **Cupons:** Gerenciar cupons de desconto
  - 👥 **Usuários:** Ver assinantes, ativar/desativar planos
- **Segurança:** Acesso restrito, middleware de proteção

### **📺 Plataforma Assinantes (`/watch`)**
- **URL:** `https://contosdeoracao.online/watch`
- **Função:** Catálogo principal para assinantes
- **Componentes:** HeroBanner, CategoryCarousel, VideoCard grid
- **Proteção:** VideoPlayerGuard para acesso condicional
- **Categorias:** Geral, Infantil, Adulto, Documentário, Louvor, Sermão, Testemunho

### **🎬 Player Individual (`/watch/[videoId]`)**
- **URL:** `https://contosdeoracao.online/watch/{videoId}`
- **Função:** Player de vídeo individual
- **Player:** Bunny.net embutido com controles custom
- **Recursos:** Fullscreen, volume, qualidade, favoritar
- **Proteção:** Verificação de assinatura ativa

### **🔄 Atualizar Senha (`/atualizar-senha`)**
- **URL:** `https://contosdeoracao.online/atualizar-senha`
- **Função:** Criar senha após primeiro acesso
- **Validação:** Senha + confirmação, força mínima 6 chars
- **UX:** PasswordField duplo, mensagens erro específicas

### **✅ Sucesso Pagamento (`/sucesso`)**
- **URL:** `https://contosdeoracao.online/sucesso`
- **Função:** Página pós-pagamento aprovado
- **Conteúdo:** Mensagem sucesso + instruções senha
- **Redirecionamento:** Automático para /watch após 10s

### **👤 Perfil Usuário (`/perfil`)**
- **URL:** `https://contosdeoracao.online/perfil`
- **Função:** Dados pessoais e gerenciamento conta
- **Informações:** Nome, email, plano atual, data assinatura
- **Ações:** Atualizar dados, cancelar plano

---

## 🔌 **APIs ENDPOINTS**

### **🏦 Stripe APIs (`/api/stripe/`)**

#### **POST `/api/stripe/checkout`**
- **Função:** Criar sessão pagamento Stripe
- **Parâmetros:** nome, email, senha, planoId
- **Retorno:** URL checkout Stripe ou erro
- **Uso:** Formulário assinatura → pagamento

#### **GET `/api/stripe/planos-publicos`**
- **Função:** Listar planos ativos com benefícios
- **Retorno:** Array produtos + preços Stripe
- **Uso:** Página assinatura e pricing

#### **POST `/api/stripe/webhook`**
- **Função:** Processar eventos Stripe
- **Eventos:** checkout.completed, invoice.paid, subscription.deleted
- **Ações:** Criar usuário, ativar plano, cancelar acesso
- **Segurança:** Validação assinatura Stripe

#### **GET/POST `/api/stripe/produtos`**
- **Função:** CRUD produtos Stripe (admin)
- **Operações:** Listar, criar, editar, deletar
- **Controle:** Apenas usuários admin

---

## 🎨 **COMPONENTES REUTILIZÁVEIS**

### **🔤 PasswordField**
- **Arquivo:** `src/components/PasswordField.tsx`
- **Função:** Input senha com show/hide toggle
- **Recursos:** Ícone olho, validação visual, estados
- **Uso:** Login, cadastro, atualizar senha

### **📹 VideoCard**
- **Arquivo:** `src/components/VideoCard.tsx`
- **Função:** Card vídeo com hover e informações
- **Recursos:** Thumbnail, título, duração, categoria
- **Ações:** Play, favoritar, admin (editar/ocultar)

### **💳 Pricing**
- **Arquivo:** `src/components/Pricing.tsx`
- **Função:** Cards de planos dinâmicos
- **Recursos:** Stripe integration, benefícios, badges
- **Dinamismo:** Preços, telas simultâneas, destaque

### **🎞 VideoPlayerGuard**
- **Arquivo:** `src/components/VideoPlayerGuard.tsx`
- **Função:** Proteção de acesso a vídeos
- **Lógica:** Verifica assinatura ativa antes de exibir
- **Fallback:** Redirecionamento para login se não assinante

---

## 🔐 **SEGURANÇA IMPLEMENTADA**

### **🛡️ Middleware (`src/middleware.ts`)**
- **Proteção:** Rotas admin com base em sessão
- **Headers:** Security headers, rate limiting
- **Redirecionamento:** Login se não autenticado

### **🔑 Supabase Auth**
- **Autenticação:** Email + senha
- **Sessões:** Gerenciamento automático
- **Proteção:** RLS (Row Level Security)
- **Recuperação:** Esqueci senha com token seguro

### **🔒 Stripe Webhook**
- **Validação:** Assinatura webhook secreta
- **Eventos:** Processamento seguro eventos Stripe
- **Integridade:** Verificação de assinaturas ativas

---

## 🚀 **DEPLOYMENT E INFRAESTRUTURA**

### **🌐 Frontend (Vercel)**
- **URL:** `https://contosdeoracao.online`
- **Framework:** Next.js 16 com App Router
- **Build:** Automático por Git push
- **Performance:** CDN global, otimizações automáticas

### **💾 Vídeos (Bunny.net)**
- **Storage:** CDN global para vídeos
- **Player:** HTML5 embutido com controles
- **Performance:** Streaming adaptativo por qualidade
- **Custo:** Pay-per-use (~R$30-50/mês)

### **🗄️ Banco de Dados (Supabase)**
- **Database:** PostgreSQL com RLS
- **Auth:** Sistema completo usuários
- **Realtime:** WebSocket para atualizações
- **Limites:** Tier gratuito (escalável)

### **💳 Pagamentos (Stripe)**
- **Checkout:** Sessions seguras com SSL
- **Webhook:** Eventos tempo real
- **Formas:** Cartão, Boleto, Débito (PIX em convite)
- **Domínio:** pagamento.contosdeoracao.online (em verificação)

---

## 📊 **ESTATÍSTICAS E MONITORAMENTO**

### **📈 Métricas Implementadas**
- **Acesso:** Login/cadastro tracking
- **Engajamento:** Vídeos assistidos, favoritos
- **Conversão:** Funil assinatura completo
- **Performance:** Core Web Vitals otimizados

### **🔍 Ferramentas Admin**
- **Analytics:** Visualização vídeos populares
- **Usuários:** Lista assinantes ativos
- **Financeiro:** Relatórios Stripe integrados
- **Conteúdo:** Gestão completa catálogo

---

## 🎯 **RESUMO FUNCIONALIDADES**

| Categoria | Funcionalidade | Status |
|-----------|----------------|---------|
| **Autenticação** | Login, Cadastro, Recuperação | ✅ Completo |
| **Pagamentos** | Stripe Checkout, Webhook | ✅ Produção |
| **Conteúdo** | Upload, Categorização, Player | ✅ Funcional |
| **Admin** | Painel completo gestão | ✅ Produção |
| **Segurança** | Middleware, RLS, Validação | ✅ Implementado |
| **UX/UI** | Responsivo, Animado, Intuitivo | ✅ Otimizado |
| **APIs** | RESTful, Seguras, Documentadas | ✅ Disponíveis |

---

## 🔄 **PRÓXIMOS PASSOS**

1. **Monitorar** verificação domínio Stripe
2. **Configurar** Boleto como alternativa PIX
3. **Implementar** analytics avançados
4. **Otimizar** performance player
5. **Adicionar** recursos comunidade

---

*Documentação atualizada em 25/04/2026 - Status completo da plataforma*
