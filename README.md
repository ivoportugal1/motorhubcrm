<div align="center">

# 🏎️ MotorHub CRM

**Sistema de gestão completo para oficinas e revendas automotivas**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?style=for-the-badge&logo=vercel)](https://motorhubcrm.vercel.app)
[![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-68a063?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003b57?style=for-the-badge&logo=sqlite)](https://sqlite.org)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

[🌐 Ver Demo ao Vivo](https://motorhubcrm.vercel.app) • [🐛 Reportar Bug](https://github.com/ivoportugal1/motorhubcrm/issues) • [💡 Sugerir Feature](https://github.com/ivoportugal1/motorhubcrm/issues)

</div>

---

## 📋 Sobre o Projeto

O **MotorHub CRM** é uma aplicação web fullstack desenvolvida para gerenciar o dia a dia de oficinas mecânicas e revendas de veículos. Com ele é possível controlar clientes, veículos, ordens de serviço, estoque, financeiro e muito mais — tudo em um único painel.

> Projeto desenvolvido do zero como parte do meu portfólio, aplicando conceitos de desenvolvimento fullstack com React, Node.js e banco de dados relacional.

---

## ✨ Funcionalidades

- 📊 **Dashboard** — visão geral com métricas e indicadores em tempo real
- 👥 **Clientes** — cadastro, histórico e detalhes de cada cliente
- 🚗 **Veículos** — controle de veículos vinculados a clientes
- 🗂️ **Ordens de Serviço** — criação e acompanhamento de OS
- 📦 **Estoque** — gerenciamento de peças e produtos
- 💰 **Financeiro** — controle de receitas, despesas e relatórios
- 📄 **Documentos** — armazenamento e gestão de documentos
- 📈 **Relatórios** — geração de relatórios gerenciais
- 🔧 **Manutenção** — agendamento e histórico de manutenções
- 🔔 **Alertas** — notificações e avisos importantes
- ⚙️ **Configurações** — personalização do sistema
- 👤 **Usuários** — controle de acesso e permissões
- 🔗 **Integrações** — conexão com serviços externos

---

## 🛠️ Tecnologias

### Frontend
| Tecnologia | Uso |
|---|---|
| [React 18](https://react.dev) | Interface de usuário |
| [React Router DOM](https://reactrouter.com) | Navegação entre páginas |
| [Axios](https://axios-http.com) | Requisições HTTP |
| [Vite](https://vitejs.dev) | Build e dev server |

### Backend
| Tecnologia | Uso |
|---|---|
| [Node.js](https://nodejs.org) | Runtime JavaScript |
| [Express](https://expressjs.com) | Framework web / API REST |
| [SQLite](https://sqlite.org) | Banco de dados relacional |

### Deploy
| Serviço | Uso |
|---|---|
| [Vercel](https://vercel.com) | Hospedagem do frontend |
| [Railway](https://railway.app) | Hospedagem do backend |

---

## 🚀 Rodando localmente

### Pré-requisitos
- [Node.js](https://nodejs.org) v18 ou superior
- [npm](https://npmjs.com)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/ivoportugal1/motorhubcrm.git
cd motorhubcrm

# 2. Instale as dependências do backend
cd backend
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Inicie o backend
npm start

# 5. Em outro terminal, instale e inicie o frontend
cd ../frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 📁 Estrutura do Projeto

```
motorhubcrm/
├── frontend/
│   └── src/
│       ├── components/     # Componentes reutilizáveis
│       ├── contexts/       # Contextos React (estado global)
│       ├── pages/          # Páginas da aplicação
│       ├── services/       # Chamadas à API
│       ├── styles/         # Estilos globais
│       ├── App.jsx
│       └── main.jsx
├── backend/
│   └── src/               # Rotas e lógica do servidor
├── server.js              # Entry point do servidor
├── motorhub.db            # Banco de dados SQLite
└── vercel.json            # Config de deploy
```

---

## 🌐 Deploy

A aplicação está disponível em produção:

- **Frontend:** [motorhubcrm.vercel.app](https://motorhubcrm.vercel.app)
- **Backend:** Hospedado no Railway

---

## 👤 Autor

**Ivo Portugal Santana**

Estudante de Engenharia de Software | Fullstack Developer & Data Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-ivoportugal1-black?style=flat-square&logo=github)](https://github.com/ivoportugal1)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ivoportugal-blue?style=flat-square&logo=linkedin)](https://linkedin.com/in/ivoportugal)

---

<div align="center">
  Feito com ❤️ e muito ☕ por <a href="https://github.com/ivoportugal1">Ivo Portugal</a>
</div>
