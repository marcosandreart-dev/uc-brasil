# Plano Mestre de Desenvolvimento — UC Brasil (MVP)

> **Papel:** Arquiteto de Soluções Web Geoespaciais (uc-brasil-architect)
> **Agentes complementares:** uc-brasil-data-engineer (dados) · uc-brasil-frontend (interface)
> **Premissas assumidas:** equipe de 1–2 desenvolvedores; prazo-alvo de MVP em ~19 semanas; stack gratuita/open-source; idioma PT-BR; dados públicos.
> **Status do projeto:** scaffolding inicial já existente (Next.js 14, TypeScript, Tailwind, estrutura de pastas, scripts de dados e docker-compose esqueleto).

---

## 1. Visão Geral e Público-Alvo

### 1.1 Visão geral

O **UC Brasil** é um catálogo digital interativo de todas as Unidades de Conservação do Brasil (federais, estaduais e municipais), consolidando dados oficiais do CNUC, ICMBio, IBGE e SiBBr em uma única aplicação web responsiva, instalável como PWA. O MVP entrega navegação, pesquisa, mapa com marcadores e ficha detalhada de cada UC — sem código nativo, sem tecnologias pagas.

### 1.2 Público-alvo

| Segmento | Necessidade principal | Funcionalidade-chave |
|---|---|---|
| Pesquisadores e estudantes | Dados confiáveis, citação de fontes | Ficha detalhada, links oficiais, dados de biodiversidade |
| Gestores públicos e ONGs | Visão consolidada por região/esfera | Busca e filtros combinados, estatísticas |
| Turistas e ecoturistas | Descobrir UCs próximas, planejar visita | Mapa interativo, busca por estado/bioma |
| Cidadãos em geral | Entender o que são UCs, educação ambiental | Página inicial com estatísticas, conteúdo acessível |

### 1.3 Princípios não negociáveis

- **Gratuito/open-source** no core da aplicação.
- **WCAG 2.1 nível AA** — acessibilidade desde a primeira tela.
- **Core Web Vitals excelentes** — performance é requisito funcional.
- **Escalável** — dezenas de milhares de usuários e milhares de marcadores.
- **Dados rastreáveis** — toda informação aponta para a fonte oficial.

---

## 2. Definição do MVP

### 2.1 Funcionalidades INCLUÍDAS no MVP

| # | Funcionalidade | Descrição |
|---|---|---|
| 1 | Página inicial | Estatísticas nacionais (total de UCs por esfera/categoria/bioma), destaques, CTAs para busca e mapa |
| 2 | Pesquisa inteligente | Busca por nome/código/palavra-chave com autocomplete; filtros por estado, município, categoria, bioma, esfera, órgão gestor |
| 3 | Mapa interativo | MapLibre GL JS, marcadores por UC com clusterização, popup resumido, filtros de camada, legenda, geolocalização |
| 4 | Ficha detalhada da UC | Localização, categoria, bioma, esfera, órgão gestor, área, situação, ato legal, links oficiais, coordenadas |
| 5 | Favoritos | Persistência local (localStorage/IndexedDB) |
| 6 | Compartilhamento | Links diretos por UC e por busca; Web Share API; Open Graph |
| 7 | PWA | Instalável em Android/iOS, cache offline de dados essenciais (manifest + Service Worker) |
| 8 | SEO | SSG/SSR, metadados por página, sitemap.xml, robots.txt, Schema.org |

### 2.2 Funcionalidades EXCLUÍDAS do MVP (adiadas)

| Funcionalidade | Motivo | Versão prevista |
|---|---|---|
| Polígonos no mapa | Alto custo de renderização/processamento; marcadores atendem ao MVP | v1.1 |
| Dashboard com gráficos avançados | Sem urgência; estatísticas básicas já cobrem o MVP | v1.2 |
| Comparação entre UCs | Depende de dashboard e dados ricos | v1.2 |
| API pública | Exige rate limiting, docs, versionamento | v1.3 |
| Painel administrativo | Requer autenticação/RBAC | v1.4 |
| Multilíngue | Aumenta escopo de copy e SEO | v1.5 |
| Backend separado (NestJS) | API Routes do Next.js bastam para o MVP | v2.0 |

### 2.3 Critérios de aceite do MVP

- [ ] Todas as UCs federais/estaduais/municipais do CNUC presentes e navegáveis.
- [ ] Busca por todos os filtros definidos, com resultados < 300 ms.
- [ ] Mapa carrega e renderiza clusterizado sem queda de FPS em dispositivo móvel médio.
- [ ] Lighthouse ≥ 90 em Performance, Acessibilidade e Best Practices; SEO ≥ 90.
- [ ] Auditoria de acessibilidade sem erros críticos (axe-core).
- [ ] PWA instalável e funcional offline para páginas essenciais.
- [ ] Testes unitários ≥ 70% de cobertura nas funções de dados; E2E cobrindo fluxos críticos.

---

## 3. Arquitetura da Aplicação

### 3.1 Arquitetura-alvo (MVP)

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENTE (Browser)                     │
│  Next.js 14 (App Router) + React 18 + TypeScript            │
│  Tailwind + shadcn/ui  |  MapLibre GL JS  |  Zustand        │
│  TanStack Query  |  Service Worker (Workbox)  |  PWA        │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────────────┐
│                  CAMADA API (Next.js API Routes)            │
│  /api/ucs, /api/ucs/[id], /api/busca, /api/estatisticas     │
│  TanStack Query (server) + Zod (validação) + rate limit     │
└──────────────┬──────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│            PostgreSQL 16 + PostGIS (dados mestre)           │
│          Redis (cache de consultas frequentes)              │
└─────────────────────────────────────────────────────────────┘
         ▲
         │ pipeline (offline, via GitHub Actions)
┌────────┴─────────────────────────────────────────────────────┐
│            PIPELINE DE DADOS (Python 3.12)                   │
│  CNUC  ·  ICMBio  ·  IBGE  ·  SiBBr  → validação → PostGIS   │
└─────────────────────────────────────────────────────────────┘
```

**Decisão-chave — Monólito modular com API Routes:** o Next.js concentra frontend + API no MVP. Justificativa: reduz a complexidade operacional para equipe pequena, mantém um único deploy, e o TanStack Query no cliente conversa com a mesma base de código. A separação em NestJS é possível depois sem reescrever o frontend, pois a camada API é desacoplada por contrato.

### 3.2 Alternativas consideradas para a camada de API

| Opção | Prós | Contras | Recomendação |
|---|---|---|---|
| **Next.js API Routes** | Um deploy, sem infra extra, tipagem compartilhada, Vercel nativo | Não escala para carga pura de API externa sozinho; Vercel tem limite de função | ✅ **MVP** |
| NestJS separado | Arquitetura robusta, módulos, DI, mature | Deploy duplo, sobrecarga para o MVP, mais tempo | Pós-MVP (v2.0) |
| Python FastAPI | Excelente para dados, mas cria segunda stack | Divide contexto, mais custo de manutenção | Não recomendado agora |

### 3.3 Roteamento (App Router)

| Rota | Tipo | Renderização |
|---|---|---|
| `/` | Home + estatísticas | SSG com revalidação (ISR) |
| `/buscar` | Busca com filtros | Client-side + API |
| `/mapa` | Mapa interativo | Client-side (lazy) |
| `/ucs/[id]` | Ficha da UC | SSG/ISR + generateStaticParams |
| `/favoritos` | Favoritos locais | Client-side |
| `/api/*` | API JSON | Server |

---

## 4. Estrutura do Banco de Dados (Schema)

Banco: **PostgreSQL 16 + PostGIS 3.4**, schema `public` (dados) + `catalogo` (metadados). Srid de armazenamento: **EPSG:4674 (SIRGAS 2000)** para geometria; exposição via API em **EPSG:4326 (WGS 84)**.

### 4.1 Diagrama ER textual

```
fontes_origem 1───* ingestao_execucoes
                         │
dimensoes:               │
  categorias 1───* ucs *───1 grupos   (grupo = proteção integral / uso sustentável)
  biomas     1───* ucs (via uc_biomas)
  estados    1───* municipios *───* ucs (via uc_municipios)
  orgaos_gestores 1───* ucs
                         │
favoritos (1──1 ucs, chave dispositivo anônimo)
```

### 4.2 Tabelas e colunas

**`categorias`**

| Coluna | Tipo | Observação |
|---|---|---|
| id | serial PK | |
| nome | varchar(120) NOT NULL | ex.: "Parque Nacional" |
| grupo | varchar(40) NOT NULL | `protecao_integral` ou `uso_sustentavel` |
| sigla | varchar(20) | ex.: "PARNA" |

**`biomas`**

| Coluna | Tipo | Observação |
|---|---|---|
| id | serial PK | |
| nome | varchar(80) UNIQUE NOT NULL | Amazônia, Cerrado, etc. |

**`estados`**

| Coluna | Tipo | Observação |
|---|---|---|
| uf | char(2) PK | |
| nome | varchar(60) NOT NULL | |
| regiao | varchar(20) NOT NULL | Norte, Nordeste, ... |

**`municipios`**

| Coluna | Tipo | Observação |
|---|---|---|
| id | serial PK | |
| cod_ibge | int UNIQUE NOT NULL | código oficial IBGE (7 dígitos) |
| nome | varchar(120) NOT NULL | |
| uf | char(2) FK → estados.uf | |

**`orgaos_gestores`**

| Coluna | Tipo | Observação |
|---|---|---|
| id | serial PK | |
| nome | varchar(160) NOT NULL | |
| sigla | varchar(30) | ex.: "ICMBio", "SEMA-MT" |
| esfera | varchar(20) | federal/estadual/municipal |

**`ucs`** (tabela núcleo)

| Coluna | Tipo | Observação |
|---|---|---|
| id | uuid PK default gen_random_uuid() | chave interna |
| id_cnuc | varchar(40) UNIQUE | chave mestra oficial |
| nome | varchar(200) NOT NULL | nome popular |
| nome_oficial | varchar(240) | nome completo do ato de criação |
| slug | varchar(220) UNIQUE NOT NULL | para URLs SEO |
| categoria_id | int FK → categorias.id | |
| esfera | varchar(20) NOT NULL | federal/estadual/municipal |
| gestor_id | int FK → orgaos_gestores.id | |
| area_ha | numeric(15,2) | área em hectares |
| data_criacao | date | |
| ato_legal | varchar(200) | decreto/lei |
| situacao | varchar(40) | criada/extinta/alterada... |
| descricao | text | texto resumido |
| latitude | double precision | centroide (para marcadores) |
| longitude | double precision | |
| geom | geometry(Polygon, 4674) | polígono (armazenado, não renderizado no MVP) |
| fonte_principal | varchar(60) | origem dominante dos dados |
| ultima_atualizacao | timestamptz | |
| criado_em / atualizado_em | timestamptz | auditoria |

**Tabelas relacionais:** `uc_biomas (uc_id FK, bioma_id FK, PK composta)` · `uc_municipios (uc_id, municipio_id)` · `favoritos (uc_id FK, dispositivo_id varchar, criado_em, PK(dispositivo_id, uc_id))`.

**`ingestao_execucoes`** (rastreabilidade)

| Coluna | Tipo |
|---|---|
| id | bigserial PK |
| fonte | varchar(40) NOT NULL |
| status | varchar(20) NOT NULL (sucesso/falha/parcial) |
| iniciado_em / concluido_em | timestamptz |
| registros_novos / atualizados / erros | int |
| log_url | text |

### 4.3 Índices

| Índice | Tipo | Justificativa |
|---|---|---|
| `ucs(lower(nome))` | B-tree | busca por nome/accent-insensitive |
| `ucs(esfera)`, `ucs(categoria_id)`, `ucs(gestor_id)`, `ucs(situacao)` | B-tree | filtros combinados |
| `ucs(latitude, longitude)` | B-tree composto | coordenadas para marcadores |
| `ucs(geom)` | GiST | consultas espaciais futuras |
| `municipios(cod_ibge)`, `municipios(uf)` | B-tree | joins de filtro |

**Alternativa considerada (schema de dados) — PostGIS vs. formatos arquivo:** para o MVP os marcadores poderiam vir de um JSON estático; contudo, o PostGIS já se justifica por filtros combinados + estatísticas + evolução para polígonos. Mantém-se a recomendação PostGIS.

---

## 5. Estrutura de Pastas (Árvore-Alvo)

```
uc-brasil/
├── .github/workflows/          # CI: lint, testes, pipeline de dados, deploy
├── .opencode/skill/            # agentes (já existente)
├── docs/                       # ADRs, dicionário de dados, plano
├── public/                     # icons, images, manifest.json, sw
├── database/
│   ├── migrations/             # SQL migratório (versionado)
│   ├── schemas/                # schema full + dicionário de dados
│   └── seeds/                  # categorias, biomas, estados
├── scripts/
│   ├── ingest/                 # download CNUC/ICMBio/IBGE/SiBBr
│   ├── transform/              # normalização, limpeza, validação
│   └── load/                   # upsert no PostGIS
├── src/
│   ├── app/
│   │   ├── layout.tsx / page.tsx / globals.css / manifest.ts
│   │   ├── (routes)/
│   │   │   ├── mapa/  buscar/  favoritos/  dashboard/
│   │   │   ├── ucs/[id]/
│   │   │   └── api/
│   │   │       ├── ucs/route.ts  ucs/[id]/route.ts
│   │   │       ├── busca/route.ts
│   │   │       └── estatisticas/route.ts
│   ├── components/
│   │   ├── ui/        # shadcn/ui
│   │   ├── map/       # UcMap, MarkerLayer, MapPopup, MapControls
│   │   ├── ucs/       # UcCard, UcDetail, UcFilters, UcStats
│   │   ├── dashboard/ # stat-cards, gráficos
│   │   ├── layout/    # Header, Footer, SearchBar
│   │   └── shared/
│   ├── hooks/         # useFavoritos, useUc, useBusca, useMapa
│   ├── lib/           # db, api-client, maplibre, pwa
│   ├── types/         # uc.ts, busca.ts, api.ts
│   ├── data/          # access layer e queries
│   ├── styles/
│   └── utils/
├── tests/
│   ├── unit/  integration/  e2e/
├── docker-compose.yml         # postgres+postgis, redis (dev)
├── next.config.js  tsconfig.json  tailwind.config.ts
└── package.json  AGENTS.md  README.md
```

> Estrutura já 90% criada no scaffold atual — esta árvore confirma e completa a existente.

---

## 6. Seleção de Tecnologias (com justificativa e alternativas)

| Camada | Escolhida | Justificativa | Alternativas (prós/contras) |
|---|---|---|---|
| Frontend | **Next.js 14 + React 18 + TS** | SSR/SSG/ISR nativos (SEO crítico para catálogo), deploy Vercel, ecossistema maduro | Vite+SPA (menos SEO); Remix (menor comunidade) |
| Estilo | **Tailwind + shadcn/ui** | Utility-first, acessível, componentes tipados e customizáveis | MUI (mais pesado, menos customizável); Radix puro (mais trabalho manual) |
| Estado cliente | **Zustand** | 1 kB, TS-native, simples; ideal para favoritos/UI state | Redux Toolkit (verboso, sem ganho no MVP) |
| Estado servidor | **TanStack Query** | Cache, invalidação, retry, SSR hydration | SWR (menos recursos); fetch puro (sem cache) |
| Mapas | **MapLibre GL JS** | Open-source, WebGL, clusterização nativa, sem chave de API paga, vetorial performático | Leaflet (leve, mas sem GL/cluster nativo de qualidade); OpenLayers (poderoso, curva de aprendizado maior) |
| Banco | **PostgreSQL 16 + PostGIS** | Padrão de fato geoespacial, GiST, grátis, robusto | MySQL+geo (frágil); SQLite (sem concorrência); MongoDB (sem geo-sólido) |
| Cache | **Redis** | microssegundos, padrão para cache + rate limit | Memcached (sem estruturas avançadas) |
| API | **Next.js API Routes** | Unificação (ver §3.2) | NestJS/FastAPI (pós-MVP) |
| Pipeline | **Python 3.12 + GeoPandas/Shapely** | Ferramenta-padrão de dados geoespaciais, bibliotecas maduras | Node (ecossistema geo inferior); R (especialista demais) |
| Testes | **Vitest + RTL + Playwright** | Vitest rápido no ecossistema Vite/Next; Playwright para E2E real | Jest (mais lento); Cypress (mais pesado) |
| PWA | **Workbox** | Geração robusta de service workers | SW manual (erro propenso); next-pwa (menos atualizado) |
| CI/CD | **GitHub Actions** | Grátis, integração nativa | GitLab CI (se já usasse GitLab); CircleCI (pago) |
| Infra | **Vercel + Docker (dev)** | Integração nativa Next.js, cache/ISR; Docker p/ Postgres/Redis locais | Railway/Render (mais setup); AWS (sobrecarga no MVP) |
| Gráficos | **Recharts** | React-friendly, leve, acessível via aria | Nivo (mais visual, mas mais pesado); Chart.js (imperativo) |

**Decisão crítica — versão do MapLibre:** manter apenas **`maplibre-gl`** no `package.json` (o scaffold atual lista `@maplibre/maplibre-gl` duplicado). Correção a fazer na Fase 1.

---

## 7. Fases de Desenvolvimento

> Ordem projetada para maximizar dependências corretas: primeiro o alicerce (ambiente → banco → dados → API), depois a interface (core → mapa → recursos), depois qualidade e publicação.

### FASE 0 — Concepção, governança e aceite

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Consolidar escopo, indicadores de sucesso e governança do projeto |
| **O que deve ser feito** | Validar este plano com stakeholders; definir ADRs para decisões-chave; criar dicionário de dados inicial; definir definição de pronto (DoD); estabelecer rotina de revisão; configurar repositório Git com branch protection e conventional commits |
| **Por que é importante** | Evita retrabalho; documenta decisões; cria base de rastreabilidade |
| **Resultado esperado** | Plano validado, ADRs 001–003 assinados, dicionário v0, DoD aprovado |
| **Pré-requisitos** | Este documento; alinhamento dos stakeholders |
| **Ferramentas** | Git, GitHub, Markdown, AGENTS.md |
| **Tempo estimado** | 1 semana |
| **Principais riscos** | Escopo nebuloso → mitiga-se com MVP explícito (§2) e DoD |
| **Concluída quando** | ADRs existem, DoD aprovado e branch protection ativo |

### FASE 1 — Ambiente de desenvolvimento e scaffolding

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Ambiente local reproduzível com stack funcional |
| **O que deve ser feito** | Corrigir duplicidade de pacotes do MapLibre; criar `.env.local` a partir de `.env.example`; subir `docker-compose` (Postgres+PostGIS, Redis); configurar ESLint/Prettier/Husky/lint-staged; validar `next dev`; instalar shadcn/ui e tipagens base |
| **Por que é importante** | Toda fase seguinte depende de ambiente estável e padronizado |
| **Resultado esperado** | `npm run dev` sobe a home com placeholder; lint e testes rodam; DB local conectável |
| **Pré-requisitos** | Fase 0; Node ≥ 18; Docker instalado |
| **Ferramentas** | Docker Compose, Next.js, shadcn CLI, Husky, pnpm/npm |
| **Tempo estimado** | 1 semana |
| **Principais riscos** | Incompatibilidade de versões (Node/Next/maplibre) → pinar versões no package.json |
| **Concluída quando** | Dev rodando de `git clone` para `npm run dev` sem passos manuais além de `.env` |

### FASE 2 — Banco de dados e modelo de dados

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Schema PostGIS versionado, com seeds de dimensões |
| **O que deve ser feito** | Criar migrações SQL (tabelas §4.2), extensão PostGIS, índices §4.3; seeds de categorias/biomas/estados/órgãos federais; script de teste de integridade (constraints, unicidade) |
| **Por que é importante** | Dados de qualidade dependem de schema validado antes da ingestão |
| **Resultado esperado** | Banco criado por migração; seeds aplicados; `npm run db:migrate` idempotente |
| **Pré-requisitos** | Fase 1 |
| **Ferramentas** | Node scripts (pg), SQL, DBeaver/psql |
| **Tempo estimado** | 1–2 semanas |
| **Principais riscos** | Mudança de campos por descoberta de dados reais → ADR + revisão de schema antes da Fase 3 |
| **Concluída quando** | Migração aplicada de zero; constraint checks passam; dicionário de dados alinhado ao schema |

### FASE 3 — Pipeline de dados (CNUC/ICMBio/IBGE/SiBBr)

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Ingestão automatizada, validada e reprodutível de dados oficiais |
| **O que deve ser feito** | Implementar pipelines Python: ingestão CNUC (fonte mestra) → transformação (normalização, correção de geometria com `ST_MakeValid`, conversão 4674↔4326, dedup por `id_cnuc`, tratamento de nulos) → load (upsert); enriquecimento ICMBio/SiBBr; cruzamento IBGE (municípios via código); registrar execuções em `ingestao_execucoes`; documentar dicionário de dados |
| **Por que é importante** | É o coração do produto — sem dados confiáveis a interface é vazia |
| **Resultado esperado** | UCs completas no banco com coordenadas de centroide; relatório de execução com contagens e erros |
| **Pré-requisitos** | Fase 2 |
| **Ferramentas** | Python 3.12, GeoPandas, Shapely, requests, psycopg2, GitHub Actions (scheduler) |
| **Tempo estimado** | 2–3 semanas |
| **Principais riscos** | APIs instáveis/mudança de schema → adapter por fonte, monitoramento, fallback de download manual; geometrias inválidas → `ST_MakeValid` + tabela de erros |
| **Concluída quando** | Pipeline roda de ponta a ponta sem intervenção; contagem de UCs confere com CNUC; execuções registradas e versionadas |

### FASE 4 — API (Next.js API Routes)

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Camada de dados consumível pelo frontend com contratos tipados |
| **O que deve ser feito** | Implementar `/api/ucs` (paginado + filtros), `/api/ucs/[id]`, `/api/busca` (accent-insensitive), `/api/estatisticas`; validação Zod; cache Redis; rate limiting; testes de integração |
| **Por que é importante** | Frontend depende de contratos estáveis e tipados |
| **Resultado esperado** | Endpoints respondendo com dados reais; schema OpenAPI documentado; testes de integração verdes |
| **Pré-requisitos** | Fase 3 |
| **Ferramentas** | Next.js, Zod, Redis (ioredis), Vitest, Swagger/OpenAPI |
| **Tempo estimado** | 1–2 semanas |
| **Principais riscos** | N+1 queries → joins planejados; latência de filtros → índices + cache |
| **Concluída quando** | Todos os endpoints testados; latência < 300 ms em dev; erros padronizados |

### FASE 5 — Frontend core (layout, home, busca, ficha de UC)

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Navegação completa e páginas funcionais com dados reais |
| **O que deve ser feito** | Layout global (Header/Footer/SearchBar) acessível e responsivo; Home com estatísticas e destaques (ISR); Busca com autocomplete + filtros combinados; Ficha de UC com `generateStaticParams`; skeleton/loading states; types TS para todos os contratos |
| **Por que é importante** | Entrega o valor central do catálogo e valida a arquitetura de dados |
| **Resultado esperado** | Fluxo Home → Busca → Ficha completo, responsivo, acessível |
| **Pré-requisitos** | Fase 4 |
| **Ferramentas** | Next.js, shadcn/ui, Tailwind, TanStack Query, React Hook Form + Zod |
| **Tempo estimado** | 2–3 semanas |
| **Principais riscos** | Acessibilidade esquecida → axe-core no CI; bundle grande → code splitting e lazy loading |
| **Concluída quando** | E2E dos 3 fluxos verdes; axe-core sem erros críticos; Lighthouse ≥ 90 |

### FASE 6 — Mapa interativo (MapLibre GL JS)

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Mapa com marcadores de UCs, clusterizado e filtros |
| **O que deve ser feito** | Componentes `UcMap`, `MarkerLayer` (GeoJSON clusterizado via `cluster: true`), `MapPopup`, `MapControls`; filtros de esfera/categoria/bioma reutilizando o endpoint `/api/ucs`; geolocalização do usuário; `dynamic import` do mapa para não inflar o bundle inicial; testes E2E de interação |
| **Por que é importante** | É o diferencial do produto e o requisito de performance mais severo (milhares de marcadores) |
| **Resultado esperado** | Mapa fluido com clusterização, popups informativos e filtros funcionando em mobile |
| **Pré-requisitos** | Fase 5 (dados + API) |
| **Ferramentas** | maplibre-gl, @vis.gl/react-maplibre (opcional), TanStack Query |
| **Tempo estimado** | 2 semanas |
| **Principais riscos** | Queda de FPS com muitos marcadores → cluster + `maxZoom` de cluster + simplify; memória → descarte de fontes ao desmontar |
| **Concluída quando** | 1000+ marcadores sem degradação perceptível; popups acessíveis por teclado; testes E2E de zoom/filtro verdes |

### FASE 7 — Favoritos, compartilhamento e PWA

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Recursos de engajamento e instalabilidade |
| **O que deve ser feito** | Hook `useFavoritos` (localStorage/IndexedDB via Zustand persist); botão favoritar na ficha e nos resultados; compartilhamento (Web Share API + fallback clipboard + Open Graph por UC); manifest.json + ícones; Service Worker Workbox com cache de app shell e estratégia stale-while-revalidate para API essencial |
| **Por que é importante** | Favoritos retêm usuário; compartilhamento amplia alcance; PWA atende ao requisito de "app" sem código nativo |
| **Resultado esperado** | Favoritos persistidos entre sessões; link de UC gera preview social; PWA instalável offline |
| **Pré-requisitos** | Fase 6 |
| **Ferramentas** | Zustand persist, Web Share API, Workbox, next-pwa (avaliar) |
| **Tempo estimado** | 1–2 semanas |
| **Principais riscos** | SW cacheando conteúdo desatualizado → cache-busting e versionamento do SW |
| **Concluída quando** | Instalação testada em Android e iOS; offline funcional; favoritos sobrevivem a reload |

### FASE 8 — Qualidade: testes, acessibilidade, SEO e performance

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Elevar o produto aos padrões WCAG 2.1 AA, SEO e Core Web Vitals |
| **O que deve ser feito** | Completar cobertura de testes unitários e E2E; auditoria axe-core + Lighthouse no CI; SEO (metadata dinâmica, Open Graph, sitemap.xml, robots.txt, Schema.org `TouristAttraction`/`Organization`); otimização de imagens, fontes, prefetch; revisão de bundle (analyze) |
| **Por que é importante** | Qualidade é requisito do projeto; SEO decide visibilidade; performance decide retenção |
| **Resultado esperado** | Lighthouse ≥ 90 em todas as categorias; sitemap gerado; Schema.org validado |
| **Pré-requisitos** | Fases 5–7 |
| **Ferramentas** | Lighthouse CI, axe-core, bundle-analyzer, Google Search Console |
| **Tempo estimado** | 1–2 semanas |
| **Principais riscos** | Correções de acessibilidade no fim são caras → já mitigado por padrões desde a Fase 5 |
| **Concluída quando** | CI bloqueia por regressão de performance/a11y; testes E2E completos verdes |

### FASE 9 — Deploy, monitoramento e lançamento do MVP

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Publicação pública do MVP com observabilidade |
| **O que deve ser feito** | Deploy na Vercel (preview → produção); pipeline de dados agendado em GitHub Actions com Docker; monitoramento (Sentry, uptime, logs); rate limiting e headers de segurança em produção; teste de carga leve; plano de rollback; anúncio e coleta de feedback |
| **Por que é importante** | Transforma o produto em serviço público real, com suporte a milhares de usuários |
| **Resultado esperado** | MVP público, monitorado e atualizável por agendamento |
| **Pré-requisitos** | Fase 8; domínio (recomendado) |
| **Ferramentas** | Vercel, GitHub Actions, Sentry, UptimeRobot |
| **Tempo estimado** | 1 semana |
| **Principais riscos** | Incidentes em produção → monitoramento ativo + rollback simples via Vercel |
| **Concluída quando** | MVP no ar em produção, pipeline de dados agendado rodando, alertas configurados, critérios de aceite (§2.3) verificados em produção |

---

## 8. Estratégia de Dados (CNUC · ICMBio · IBGE · SiBBr)

### 8.1 Matriz de fontes

| Fonte | Papel | Formato | Frequência | Campos usados no MVP |
|---|---|---|---|---|
| **CNUC** | Fonte mestra (cadastro + polígonos) | GeoJSON/CSV | Trimestral | id_uc, nome, categoria, esfera, bioma, uf, municípios, gestor, área, data criação, situação, geometry |
| **ICMBio** | Enriquecimento das UCs federais | API/SIFF | Mensal/Trimestral | detalhes de plano de manejo, descrição, status de UCs federais |
| **IBGE** | Malhas e municípios | Shapefile/Sidra | Anual | códigos municipais, nomes, UF |
| **SiBBr** | Biodiversidade por UC | API REST | Contínua | contagem de ocorrências/espécies (metadado na ficha) |

### 8.2 Regras de conflito

| Conflito | Regra |
|---|---|
| Duplicatas | `id_cnuc` é a chave mestra; merge de atributos quando CNUC não traz o campo |
| CNUC × ICMBio divergem | CNUC prevalece para cadastro; ICMBio prevalece para descrição/plano de manejo (documentar no dicionário) |
| Geometria inválida | `ST_MakeValid`; se irrecuperável → registrar em tabela de erros e manter registro com geom NULL (marcador usa centroide/null) |
| Nulos | Manter NULL, sinalizar flag `dados_incompletos` e lista de revisão |
| Alteração de schema da fonte | Adapter por fonte + alerta de CI quando parsing falhar |

### 8.3 Fluxo automatizado (GitHub Actions)

```
CRON (mensal/trimestral) → ingestão → validação (pandera) → transformação
→ upsert PostGIS → registro em ingestao_execucoes → notificação de divergência
```

Versionamento de dados via `ingestao_execucoes` + tags de release do pipeline permite rollback e auditoria.

---

## 9. Plano de Integração do Mapa (MapLibre GL JS)

### 9.1 Decisão e justificativa

**MapLibre GL JS** — open-source, WebGL, clusterização nativa (`cluster`, `clusterMaxZoom`, `clusterRadius`), sem chave de API paga (diferente do Mapbox), vetorial e performático em mobile. Leaflet foi a alternativa principal, descartada por clusterização de qualidade inferior para milhares de pontos. Polígonos ficam fora do MVP (definição do skill), mas a stack já armazena `geom` para a v1.1.

### 9.2 Arquitetura de renderização

| Camada | Técnica |
|---|---|
| Dados | GeoJSON gerado no backend (`/api/ucs?formato=geojson`) com `coords` do centroide (lat/lon) |
| Fonte | `GeoJSONSource` com `cluster: true`, `clusterRadius: 50`, `clusterMaxZoom: 12` |
| Camadas | `circle` para cluster, `symbol` (label com nº de itens), `circle` individual por UC |
| Popup | `Popup` ancorado com card resumido (nome, categoria, esfera, botão "Ver ficha") |
| Filtros | `Map.setFilter` por esfera/categoria/bioma, reutilizando os filtros da busca |
| Interação | Click → popup; hover → cursor; teclado (foco no mapa via aria) |
| Performance | `dynamic import()` do mapa; remoção de listeners ao desmontar; `maxPitch` limitado |

### 9.3 Evolução (pós-MVP)

v1.1 renderiza os polígonos de `geom` via PMtiles (vetor tiles gerados com tippecanoe/pg_tileserv), mantendo clusterização para zoom out.

---

## 10. Plano de Evolução Futura (Roadmap pós-MVP)

| Versão | Entregas | Dependências |
|---|---|---|
| **v1.1** | Polígonos no mapa (PMtiles), camada de limites municipais/estaduais | Pipeline de tiles + simplificação de geometria |
| **v1.2** | Dashboard com gráficos (Recharts), comparação entre UCs | Dados históricos + métricas agregadas |
| **v1.3** | API pública (rate limiting, tokens, docs OpenAPI versionada) | RBAC + filas |
| **v1.4** | Painel administrativo (moderação, atualizações manuais) | Autenticação (Auth.js), RBAC |
| **v1.5** | Multilíngue (i18n, PT/EN) | Estrutura de copy, SEO multilíngue |
| **v2.0** | Backend NestJS separado, microserviços se necessário, app nativo PWA avançado, dados MapBiomas (desmatamento) | Crescimento de carga/equipe |

Cada evolução respeita a arquitetura por contrato: frontend conversa com API independente da implementação do backend.

---

## 11. Boas Práticas Transversais

### 11.1 Segurança

- Headers de segurança (CSP, HSTS, X-Frame-Options) na Vercel/next.config.
- Validação Zod em toda entrada; `prepared statements` (evita SQL injection).
- **Sem secrets no repositório** — apenas `.env.example`; variáveis de ambiente na Vercel.
- Rate limiting na API pública e em `/api/busca`.
- Sanitização de HTML (`dangerouslySetInnerHTML` proibido sem sanitize).

### 11.2 Desempenho

- ISR para home e fichas; SSG com `generateStaticParams` para UCs.
- Clusterização de marcadores; `dynamic import` do mapa.
- Otimização de imagens via `next/image`; fontes com `font-display: swap`.
- Auditoria contínua de bundle (`@next/bundle-analyzer`).

### 11.3 Acessibilidade (WCAG 2.1 AA)

- Estrutura semântica (header/nav/main/footer), landmarks.
- Popups do mapa navegáveis por teclado; contraste AA; foco visível.
- `aria-live` para resultados de busca; labels explícitos nos filtros.
- axe-core no CI como gate de bloqueio.

### 11.4 SEO

- Metadata dinâmica (title/description/OG) por UC.
- `sitemap.xml` + `robots.txt` dinâmicos; `Schema.org` (Organization + TouristAttraction).
- URLs canônicas e slugs estáveis; breadcrumbs na ficha.

### 11.5 PWA

- manifest.json com ícones, tema e `display: standalone`.
- Workbox: app-shell cacheado, API essencial stale-while-revalidate, versão do SW com cache-busting.
- Estratégia de exclusão de dados sensíveis do cache.

### 11.6 Escalabilidade

- Cache Redis nas consultas quentes; paginação cursor-based em `/api/ucs`.
- Índices GiST/B-tree planejados; políticas de cache do CDN (Vercel).
- Teste de carga (k6) pré-lançamento; monitoramento de p95.
- Separação futura em NestJS sem quebrar contratos (API por contrato).

---

## 12. Cronograma Resumido

| Fase | Descrição | Semanas | Acumulado |
|---|---|---|---|
| 0 | Concepção e governança | 1 | Semana 1 |
| 1 | Ambiente e scaffolding | 1 | Semana 2 |
| 2 | Banco de dados | 1–2 | Semanas 3–4 |
| 3 | Pipeline de dados | 2–3 | Semanas 5–7 |
| 4 | API | 1–2 | Semanas 8–9 |
| 5 | Frontend core | 2–3 | Semanas 10–12 |
| 6 | Mapa interativo | 2 | Semanas 13–14 |
| 7 | Favoritos, compartilhamento, PWA | 1–2 | Semanas 15–16 |
| 8 | Qualidade (a11y, SEO, perf, testes) | 1–2 | Semanas 17–18 |
| 9 | Deploy e lançamento | 1 | Semana 19 |

> **Total estimado: ~19 semanas (1 desenvolvedor sênior ou equipe de 2).** Fases 5–8 podem ser paralelizadas parcialmente com 2 devs, reduzindo para ~14 semanas.

---

## Status

- [x] Plano completo gerado
- [x] MVP definido
- [ ] Arquitetura aprovada
- [ ] Schema do banco definido (proposto — validar com Fase 2)
- [x] Estrutura de pastas definida
- [x] Tecnologias selecionadas
- [x] Cronograma definido
