# UC Brasil — Guia de Agentes e Projeto

## Sobre o Projeto

A plataforma **UC Brasil** é um catálogo digital de Unidades de Conservação do Brasil (federais, estaduais e municipais). Utiliza dados públicos do CNUC, ICMBio, IBGE, SiBBr e outras fontes oficiais.

O sistema é uma **aplicação web responsiva** que pode ser instalada como **Progressive Web App (PWA)** em Android e iOS. **NÃO é um aplicativo nativo.**

## Agentes Disponíveis

| Agente | Caminho | Papel |
|---|---|---|
| **Arquiteto de Soluções** | `.opencode/skill/uc-brasil-architect/SKILL.md` | Arquiteto técnico geral, consultor de decisão |
| **Engenheiro de Dados** | `.opencode/skill/uc-brasil-data-engineer/SKILL.md` | Pipelines de dados, ingestão, normalização, PostGIS |
| **Arquiteto Front-end** | `.opencode/skill/uc-brasil-frontend/SKILL.md` | Interface web, mapas, PWA, acessibilidade, UX/UI |

## Como Usar

Ao iniciar uma tarefa, selecione o agente mais relevante para o contexto:

- **Decisões de arquitetura geral** → UC Brasil Architect
- **Ingestão e tratamento de dados** → UC Brasil Data Engineer
- **Interface, mapas, PWA, UI/UX** → UC Brasil Frontend Architect

Para tarefas que envolvam múltiplas áreas, consulte os agentes relevantes em sequência.

## Stack Principal

| Camada | Tecnologia |
|---|---|
| Framework Frontend | Next.js 14+ (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Mapas | MapLibre GL JS |
| Estado Cliente | Zustand |
| Estado Servidor | TanStack Query |
| Backend | Node.js / NestJS |
| Banco de Dados | PostgreSQL 16+ com PostGIS |
| Cache | Redis |
| Deploy | Vercel |
| Testes | Vitest + Playwright |
| PWA | Workbox |

## Estrutura de Pastas (Planejada)

```
uc-brasil/
├── .opencode/
│   └── skill/
│       ├── uc-brasil-architect/
│       │   └── SKILL.md
│       ├── uc-brasil-data-engineer/
│       │   └── SKILL.md
│       └── uc-brasil-frontend/
│           └── SKILL.md
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── (routes)/
│   │       ├── mapa/
│   │       ├── ucs/
│   │       │   └── [id]/
│   │       ├── dashboard/
│   │       ├── favoritos/
│   │       ├── buscar/
│   │       └── api/            # API Routes (Next.js)
│   ├── components/
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── map/                # Componentes de mapa
│   │   ├── ucs/                # Componentes de UC
│   │   ├── dashboard/          # Componentes de dashboard
│   │   ├── layout/             # Componentes de layout
│   │   └── shared/             # Componentes compartilhados
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilitários e configurações
│   ├── types/                  # Tipos TypeScript
│   ├── data/                   # Lógica de dados e APIs
│   ├── styles/                 # Estilos globais
│   └── utils/                  # Funções utilitárias
├── docs/                       # Documentação do projeto
├── public/                     # Arquivos estáticos
│   ├── icons/
│   ├── images/
│   └── manifest.json
├── scripts/                    # Scripts de dados e migrações
│   ├── ingest/
│   ├── transform/
│   └── load/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schemas/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
└── AGENTS.md
```

## Princípios do Projeto

- **Gratuito**: Nenhuma tecnologia paga para o core da aplicação.
- **Acessível**: WCAG 2.1 nível AA.
- **Performático**: Core Web Vitals excelentes.
- **Escalável**: Preparado para dezenas de milhares de usuários.
- **Modular**: Cada camada é independente e substituível.
- **Documentado**: Cada decisão é justificada.
- **Automatizado**: Pipelines de dados e CI/CD.

## Dados

Fontes oficiais principais:
- **CNUC** — Cadastro Nacional de Unidades de Conservação
- **ICMBio** — Instituto Chico Mendes de Conservação da Biodiversidade
- **IBGE** — Instituto Brasileiro de Geografia e Estatística
- **SiBBr** — Sistema de Informação sobre a Biodiversidade Brasileira
- **INPE / MapBiomas** — Cobertura do solo e desmatamento

## MVP

O MVP inclui:
- Página inicial com estatísticas nacionais
- Pesquisa inteligente
- Mapa interativo com marcadores
- Ficha detalhada de cada UC
- Busca por estado, município, categoria, bioma, esfera e órgão gestor
- Favoritos (local storage)
- Compartilhamento

Funcionalidades fora do MVP:
- Dashboard com gráficos
- Comparação entre UCs
- Polígonos no mapa
- API pública
- Painel administrativo
- Multilíngue

## Próximos Passos

1. Definir o plano completo de desenvolvimento (fases, cronograma).
2. Configurar o ambiente de desenvolvimento.
3. Implementar o MVP seguindo o roteiro de fases.
