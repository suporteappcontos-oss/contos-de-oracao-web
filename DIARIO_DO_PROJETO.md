# 📘 CONTOS DE ORAÇÃO — Diário de Desenvolvimento da Plataforma

> **Última atualização:** 25 de Abril de 2026  
> **Desenvolvedor:** IA Antigravity (Google DeepMind)  
> **Proprietário:** João Pires de Freitas Neto  
> **E-mail do dono (admin):** suporte.appcontos@gmail.com  

---

## 🗺️ Visão Geral do Projeto
Estamos transformando o app "Contos de Oração" numa **plataforma de streaming completa na web**, com:
- Site premium estilo Netflix (Fundo `#090B10` e Destaques `#D4AF37`)
- Sistema de assinatura pago com **Checkout Dinâmico via Stripe**
- Banco de dados e Autenticação (via Supabase)
- Hospedagem profissional de vídeos (via Bunny.net)
- Painel administrativo on-site para o dono gerenciar conteúdo e planos

---

## ✅ O QUE JÁ FOI FEITO E CONCLUÍDO (Até 23/04/2026)

### 1. Site Web e Design (Next.js 16 + Tailwind CSS)
- **Framework:** Next.js 16 com App Router, TypeScript e Tailwind CSS v4.
- Componentes modulares fluídos, incluindo Navbars, Hero Banners, VideoCards com animações de hover e interfaces de vidro (Glassmorphism).
- **Remoção de Falsos Positivos Visuais:** Os placeholders da Netflix foram apagados.

### 2. Painel Administrativo de Conteúdo (`/admin`)
- Tela de `Gerenciamento de Conteúdo` totalmente funcional, restrita ao acesso admin.
- Integração direta de novos vídeos informando (Título, Descrição, Bunny Video ID, Thumbnail, Categoria).
- Ações imediatas de Publicar/Ocultar, e Deletar vídeos.

### 3. Gestão de Planos Financeiros (`/admin` + Stripe)
- **Painel Dinâmico:** O administrador pode criar, editar (nome, preço, benefícios, cor do card) e apagar planos diretamente do site, refletindo em tempo real no banco de dados da Stripe.
- **Cupons:** Integração com a API da Stripe para listar cupons ativos automaticamente.

### 4. Tela de Assinante (`/watch`)
- Carrosseis de vídeo segmentados por categorias e HeroBanner dinâmico.
- Tela dedicada ao Player (`/watch/[videoId]`) com o player do Bunny.net imbutido.

### 5. Sistema de Autenticação (Supabase)
- **SMTP Personalizado:** Configurado via Gmail (Senha de App de 16 dígitos).
- Recurso de "Esqueci minha senha" ajustado.

### 6. Sistema de Cobranças (Migração Total para Stripe)
- **Kiwify Removida:** Todo o fluxo do projeto foi desvinculado da Kiwify.
- **Checkout Automático:** O botão de compra gera sessões únicas no Stripe já habilitadas com Cartão, Pix e Boleto de acordo com o painel da Stripe.
- **Webhook Stripe (`api/stripe/webhook`):** Robô criado para escutar eventos. Se a compra aprova, ele cria o acesso no Supabase, marca `plano_ativo: true` e envia o e-mail pro cliente criar a senha. Se o cliente cancelar, corta o acesso.
- **Página de Sucesso:** Fluxo aprimorado para `/sucesso` para não confundir o cliente durante o processo de setar senha de primeiro acesso.

---

## ✅ O QUE JÁ FOI FEITO E CONCLUÍDO (Atualizado 25/04/2026)

### 7. Conta de Produção Stripe ✅
- **Status:** Conta ativada para produção pelo proprietário
- **Resultado:** PIX e Boletos agora aparecem para clientes finais
- **Dados bancários:** Configurados na Stripe

### 8. Domínio Customizado para Checkout 
- **Status:** Domínio principal `contosdeoracao.online` está ativo e respondendo
- **Subdomínio:** `pagamento.contosdeoracao.online` configurado e aguardando verificação Stripe
- **DNS:** CNAME apontando para `hosted-checkout.stripecdn.com`
- **Situação:** Aguardando aprovação final (pode levar até 3 horas)

### 9. Webhook de Produção 
- **Status:** Webhook implementado e pronto para produção
- **URL:** `https://contosdeoracao.online/api/stripe/webhook`
- **Implementação:** Código completo com validação de assinatura Stripe

---

## ✅ O QUE JÁ FOI FEITO E CONCLUÍDO (Atualizado 25/04/2026 - Tarde)

### 10. Melhorias de UX e Segurança ✅
- **Login:** Removido campo de confirmação de senha (local incorreto)
- **Cadastro:** Mantida confirmação de senha apenas na página `/assinar`
- **Ícones:** Implementados olhos para mostrar/ocultar senhas
- **Validação:** Senhas coincidentes validadas antes de criar conta
- **Planos:** Adicionado badge dinâmico de telas simultâneas
- **Benefícios:** Exibição dinâmica conforme plano selecionado
- **Admin:** Corrigido link "visitar" para abrir na mesma aba

### 11. Análise de Pagamentos PIX ✅
- **Status:** PIX disponível apenas para contas convidadas pela Stripe
- **Alternativas:** Boleto (R$3,45), Cartão (3,99%+R$0,39), Débito (1,5-2,5%)
- **Documentação:** Criado arquivo `ANALISE_PIX_STRIPE.md` com análise completa
- **Recomendação:** Configurar Boleto imediatamente, solicitar convite PIX

---

## 🟡 O QUE ESTÁ EM ANDAMENTO

### Prioridade 1: Verificação de Domínio Stripe
- **Status:** Subdomínio `pagamento.contosdeoracao.online` configurado
- **DNS:** CNAME apontando corretamente para `hosted-checkout.stripecdn.com`
- **Situação:** Aguardando verificação final pela Stripe (até 3 horas)
- **Ação:** Monitorar e aguardar e-mail de confirmação

---

## 💰 Custo Mensal da Plataforma Atual
| Serviço | Custo | Situação |
|---|---|---|
| Vercel (site) | **Grátis** | Rodando liso. |
| Supabase (banco) | **Grátis** | Limites gratuitos. |
| Bunny.net (vídeos) | **R$ ~30 a 50/mês** | Necessário botar crédito para os vídeos rodarem. |
| Stripe (cobranças) | **% por venda** | Paga apenas a taxa por transação aprovada. |

---

## 📁 Estrutura Atualizada e Resumida
```
d:\Projeto\web\
├── src\
│   ├── app\
│   │   ├── admin\            ← Painel do Dono (Vídeos e Planos Stripe)
│   │   ├── watch\            ← Plataforma do Assinante
│   │   ├── atualizar-senha\  ← Criação de senha (Novo Assinante)
│   │   ├── sucesso\          ← Tela pós-pagamento aprovado
│   │   └── api\stripe\       ← APIs do Checkout, Planos e Webhooks
│   ├── components\           ← Banners, Cards, Navbar, etc.
│   └── utils\supabase\       ← Clientes de Conexão com DB
├── .env.local                ← Chaves do Supabase e da Stripe
└── DIARIO_DO_PROJETO.md      ← Este diário de documentação da Plataforma!
```

*Arquivo atualizado em 23/04/2026 após a migração monumental para o ecossistema Stripe.*
