# UC Brasil 🌿🗺️

O maior catálogo digital de **Unidades de Conservação do Brasil**.

Plataforma web responsiva que centraliza informações oficiais sobre todas as Unidades de Conservação (federais, estaduais e municipais), utilizando dados públicos do CNUC, ICMBio, IBGE, SiBBr e outras fontes oficiais.

## 📋 Visão Geral

| Item | Detalhe |
|---|---|
| **Tipo** | Aplicação Web Responsiva + PWA |
| **Plataformas** | Web, Android (via PWA), iOS (via PWA) |
| **Tecnologia Principal** | Next.js 14+ + React 18 + TypeScript |
| **Mapas** | MapLibre GL JS |
| **Banco de Dados** | PostgreSQL + PostGIS |
| **Deploy** | Vercel |
| **Licenciamento** | Gratuito / Open Source |

## 🏗️ Estrutura do Projeto

```
uc-brasil/
├── .opencode/skill/          # Agentes e skills de IA
│   ├── uc-brasil-architect/
│   ├── uc-brasil-data-engineer/
│   └── uc-brasil-frontend/
├── src/                       # Código-fonte
│   ├── app/                   # Next.js App Router
│   ├── components/            # Componentes React
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utilitários e configurações
│   ├── types/                 # Tipos TypeScript
│   ├── data/                  # Lógica de dados e APIs
│   ├── styles/                # Estilos globais
│   └── utils/                 # Funções utilitárias
├── database/                  # Scripts de banco de dados
├── scripts/                   # Scripts de dados e automação
├── docs/                      # Documentação
├── public/                    # Arquivos estáticos
└── tests/                     # Testes
```

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+
- npm 9+
- Docker (para banco de dados local)

### Instalação

```bash
# 1. Clone o repositório
git clone <repo-url>
cd uc-brasil

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env.local

# 4. Inicie o banco de dados (Docker)
docker-compose up -d

# 5. Execute migrações
npm run db:migrate

# 6. Execute o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## 🗺️ Funcionalidades

### MVP
- [x] Página inicial com estatísticas nacionais
- [x] Pesquisa inteligente
- [x] Mapa interativo com marcadores
- [x] Ficha detalhada de cada UC
- [x] Busca por estado, município, categoria, bioma, esfera e órgão gestor
- [x] Favoritos
- [x] Compartilhamento

### Futuro
- [ ] Dashboard com gráficos
- [ ] Comparação entre UCs
- [ ] Polígonos no mapa
- [ ] API pública
- [ ] Painel administrativo
- [ ] Multilíngue

## 📚 Documentação

- [Plano de Desenvolvimento](docs/plano-desenvolvimento.md)
- [Arquitetura](docs/arquitetura.md)
- [Guia de Contribuição](docs/contribuicao.md)

## 🤖 Agentes Disponíveis

| Agente | Descrição |
|---|---|
| **Arquiteto de Soluções** | Consultor técnico geral e decisões de arquitetura |
| **Engenheiro de Dados** | Pipelines de dados, ingestão e normalização |
| **Arquiteto Front-end** | Interface, mapas, PWA e UX/UI |

Consulte os arquivos `.opencode/skill/*/SKILL.md` para instruções detalhadas de cada agente.

## 📜 Licença

Este projeto é de código aberto e utiliza dados públicos de fontes governamentais.
