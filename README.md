# Eletro Link Manutenções ⚡

Site institucional com painel administrativo completo para empresa de manutenções elétricas.

## 🛠️ Stack

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** (dark theme, fonte Oswald + Source Sans 3)
- **Supabase** (Auth + Database + RLS)
- **React Router v6**
- Deploy recomendado: **Vercel**

## 🚀 Setup

### 1. Instalar dependências
```bash
pnpm install
# ou
npm install
```

### 2. Configurar Supabase
Copie `.env.example` para `.env.local` e preencha com suas credenciais:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Criar tabelas no Supabase
Acesse **Supabase > SQL Editor** e execute o SQL disponível em:
> Admin Panel → Configurações → Setup do Banco de Dados

### 4. Criar usuário admin
No Supabase Dashboard: **Authentication > Users > Add User**
- Email: seu email
- Password: sua senha

### 5. Rodar em dev
```bash
pnpm dev
```

## 📋 Funcionalidades

### Site público
- Hero com CTA e stats
- Seção de serviços (grid 4 colunas)
- Sobre / diferenciais
- Depoimentos de clientes
- Formulário de solicitação de orçamento
- Formulário de contato
- Botão flutuante WhatsApp
- Design responsivo dark theme

### Painel Admin (`/admin`)
- **Dashboard**: stats em tempo real (orçamentos, mensagens)
- **Orçamentos**: listagem, filtros, detalhes, atualização de status
- **Mensagens**: inbox com leitura automática, resposta por email
- **Serviços**: CRUD completo
- **Depoimentos**: CRUD com toggle de visibilidade
- **Configurações**: infos da empresa, SEO, segurança, SQL setup

## 🗂️ Estrutura

```
src/
├── components/
│   ├── layout/       # Navbar, Footer
│   ├── sections/     # Hero, Serviços, Sobre, Depoimentos, Orçamento, Contato
│   └── admin/        # AdminLayout (sidebar)
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── admin/        # Dashboard, Orcamentos, Mensagens, Servicos, Depoimentos, Configuracoes
├── hooks/
│   └── useAuth.ts
├── lib/
│   └── supabase.ts
└── types/
    └── index.ts
```

## 🌐 Deploy (Vercel)

1. Push no GitHub
2. Conectar repo no Vercel
3. Adicionar variáveis de ambiente
4. Deploy automático ✓
