# Plano Fast-Track — MVP UC Brasil em 7 Dias (solo)

> **Papel:** Arquiteto de Soluções Web Geoespaciais (uc-brasil-architect)
> **Contexto:** 1 desenvolvedor · 7 dias corridos · ~8h/dia · stack existente no scaffold
> **Objetivo:** publicar um MVP funcional com **dados reais do CNUC**, busca, ficha de UC e mapa com marcadores.

---

## 1. Decisão de escopo (feita pelo arquiteto)

Em 7 dias, solo, o plano de 19 semanas é inviável. A prioridade é o **valor central do produto**: catálogo com dados reais navegável. Cortes deliberados abaixo.

### Incluído (não negociável)

| # | Item | Observação |
|---|---|---|
| 1 | Dados reais do CNUC | Download manual único + ingestão simples → PostGIS |
| 2 | Home com estatísticas | Total por esfera/categoria/bioma |
| 3 | Busca com filtros | texto + esfera + categoria + UF (+ bioma se viável) |
| 4 | Ficha da UC | todas as informações, favoritar, compartilhar, links oficiais |
| 5 | Mapa com marcadores | MapLibre + clusterização |
| 6 | Favoritos | localStorage (Zustand persist) |
| 7 | Deploy público | Vercel + Postgres grátis (Neon/Supabase) |
| 8 | SEO básico | metadata por página + sitemap simples |

### Cortado (adiado, sem bloqueio do MVP)

| Item | Motivo |
|---|---|
| ICMBio, SiBBr, IBGE como fontes enriquecidas | Só CNUC no fast-track; demais na v1.1 |
| Polígonos no mapa | Definido: marcadores apenas |
| Dashboard/comparação | Fora do MVP |
| PWA com Service Worker offline | Apenas manifest básico; SW depois |
| Redis, rate limiting | Cache via ISR; rate limit na v1.3 |
| Autenticação / painel admin | Pós-MVP |
| Auditoria a11y completa (axe-core no CI) | Manter HTML semântico + labels básicos |
| Testes E2E automatizados | Testes manuais de smoke + lint/build limpos |
| API pública | v1.3 |

**Decisão de banco:** manter **PostgreSQL + PostGIS** (docker-compose já existe) porque o CNUC entrega geometrias e o schema já foi planejado; porém o fast-track **não** cria Redis nem tabelas de auditoria complexas.

---

## 2. Sequência diária (com dependências)

```
D1 Dados ─▶ D2 API ─▶ D3 Home/Busca ─▶ D4 Ficha ─▶ D5 Mapa ─▶ D6 Favoritos/Polish ─▶ D7 Deploy
```

### DIA 1 — Fundação: ambiente + dados reais

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Ambiente rodando e banco populado com UCs reais do CNUC |
| **O que fazer** | (1) Remover `@maplibre/maplibre-gl` do package.json (duplicado de `maplibre-gl`); (2) criar `.env.local` a partir de `.env.example` com `DATABASE_URL` real do compose; (3) `docker compose up -d postgres`; (4) criar migração SQL mínima: tabelas `categorias`, `biomas`, `estados`, `ucs` (+ `uc_biomas`, `uc_municipios` se o dado permitir) com colunas do §4 do plano; (5) baixar o GeoJSON/CSV do CNUC manualmente para `scripts/data/cnuc/`; (6) escrever `scripts/load/cnuc.js` (ou `.py`) que lê o arquivo, converte polígono→centroide (lat/lon) e faz upsert por `id_cnuc`; (7) rodar ingestão e conferir contagens |
| **Por que** | Tudo depende de dados no banco; fundação correta evita retrabalho nas rotas |
| **Resultado** | `npm run dev` sobe; `SELECT count(*) FROM ucs` retorna as UCs reais com lat/lon |
| **Pré-requisitos** | Docker; Node ≥ 18; acesso ao download do CNUC |
| **Ferramentas** | Docker Compose, Node/pg (ou Python/psycopg2), psql, script de ingestão |
| **Tempo** | ~8h (download/ajuste de schema do CNUC costuma tomar 2–3h) |
| **Riscos** | Schema do CNUC difere do esperado → mapear campos no script e ajustar migração no próprio dia; geometria inválida → usar `ST_MakeValid` ou centroide via `ST_PointOnSurface` |
| **Concluído quando** | Banco com todas as UCs do download, coordenadas preenchidas, sem NULL em `nome`/`slug` |

### DIA 2 — API (Next.js API Routes)

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Frontend com dados consumíveis via JSON tipado |
| **O que fazer** | Criar `src/lib/db.ts` (pg Pool); rotas: `GET /api/ucs` (filtros `esfera`, `categoria`, `uf`, `bioma`, paginação simples `page/limit`), `GET /api/ucs/[id]`, `GET /api/busca?q=`, `GET /api/estatisticas`; endpoint de mapa `GET /api/ucs?formato=geojson`; tipar contratos em `src/types/`; validar com curl |
| **Por que** | As 3 páginas seguintes (Home, Busca, Ficha) consomem esta camada |
| **Resultado** | Endpoints respondendo JSON real, < 300 ms em dev |
| **Pré-requisitos** | Dia 1 |
| **Ferramentas** | Next.js, `pg`, Zod (validação de query), curl/Insomnia |
| **Tempo** | ~7h |
| **Riscos** | N+1 em joins de bioma/município → montar query única com `json_agg`; busca lenta → `WHERE unaccent(lower(nome)) ILIKE` + índice |
| **Concluído quando** | 4 endpoints funcionando com dados reais e erros padronizados |

### DIA 3 — Home + Busca

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Navegação e descoberta de UCs |
| **O que fazer** | Layout global (`Header`/`Footer`/`SearchBar`) com Tailwind; Home renderizando `/api/estatisticas` (ISR) com cards + CTAs; página `/buscar` com filtros combinados e lista de `UcCard` via TanStack Query; estados de loading/erro/vazio; `<main>`/`<nav>` semânticos e labels nos filtros |
| **Por que** | É a porta de entrada do catálogo |
| **Resultado** | Fluxo Home → Busca com resultados filtrados funcionando |
| **Pré-requisitos** | Dia 2 |
| **Ferramentas** | Next.js, Tailwind, shadcn/ui, TanStack Query |
| **Tempo** | ~8h |
| **Riscos** | Excessiva busca por features → manter apenas filtros essenciais; UI sem estados vazios → tratar loading/erro/sem-resultado |
| **Concluído quando** | Busca por texto e por filtro retornam resultados corretos, responsivo em mobile |

### DIA 4 — Ficha da UC

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Página detalhada de cada UC |
| **O que fazer** | `/ucs/[id]` com dados completos (nome, categoria, esfera, bioma, UF, municípios, órgão gestor, área, data de criação, situação, ato legal, coordenadas, links oficiais e para a fonte); `generateStaticParams` + ISR para SEO básico; botões **favoritar** (cria o hook `useFavoritos` em localStorage) e **compartilhar** (Web Share API + fallback de copiar link); metadata dinâmica |
| **Por que** | É o coração do conteúdo e a página que recebe tráfego de SEO |
| **Resultado** | Ficha completa e navegável de qualquer UC |
| **Pré-requisitos** | Dia 3 |
| **Ferramentas** | Next.js, Zustand persist, Web Share API |
| **Tempo** | ~7h |
| **Riscos** | Campos nulos no CNUC → renderizar apenas os preenchidos; slug/URL instável → manter rota por `id` |
| **Concluído quando** | Toda UC abre sua ficha; favoritar e compartilhar funcionam |

### DIA 5 — Mapa interativo

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Mapa com marcadores de todas as UCs |
| **O que fazer** | `/mapa` com MapLibre GL (versão única `maplibre-gl`); fonte GeoJSON via `/api/ucs?formato=geojson` com `cluster: true` (`clusterRadius: 50`, `clusterMaxZoom: 12`); camadas `circle` (cluster/individual) + `symbol` (contagem); `Popup` com resumo e link para a ficha; filtros simples de esfera/categoria no topo; `dynamic import()` para não inflar o bundle inicial; estilo base gratuito (do `.env.example` — Carto) |
| **Por que** | Diferencial do produto e requisito de performance mais severo |
| **Resultado** | Mapa fluido com todas as UCs clusterizadas em desktop e mobile |
| **Pré-requisitos** | Dia 3 (reuso dos filtros) |
| **Ferramentas** | maplibre-gl, TanStack Query |
| **Tempo** | ~8h |
| **Riscos** | Mapa pesado no bundle → `dynamic import`; estouro de FPS → clusterização nativa já cobre; permissão de geolocalização → não obrigatória |
| **Concluído quando** | Todas as UCs aparecem clusterizadas; clique abre popup; filtros atualizam camada |

### DIA 6 — Favoritos + polimento

| Campo | Conteúdo |
|---|---|
| **Objetivo** | Experiência completa e polida |
| **O que fazer** | Página `/favoritos` listando UCs salvas (lê o mesmo storage do hook); skeleton/loading; responsividade (mobile-first); estados vazios com CTA; correção de contraste/aria básicos; limpar erros de lint e console; rodar `npm run build` e corrigir TypeScript |
| **Por que** | Favoritos retêm usuário; build limpo é gate para o deploy |
| **Resultado** | App completo, polido e compilando sem erros |
| **Pré-requisitos** | Dias 4 e 5 |
| **Ferramentas** | Zustand persist, ESLint, `next build` |
| **Tempo** | ~7h |
| **Riscos** | Favoritos perdidos entre rotas → persistir no `localStorage` com `partialize` estável |
| **Concluído quando** | Favoritos persistem após reload; build sem erros; mobile utilizável |

### DIA 7 — Deploy e publicação

| Campo | Conteúdo |
|---|---|
| **Objetivo** | MVP público e funcionando |
| **O que fazer** | Criar Postgres+PostGIS grátis na nuvem (Neon ou Supabase); rodar migração + ingestão no banco de produção; configurar `DATABASE_URL` de produção na Vercel; `git push` + deploy; validar endpoints em produção; smoke test mobile; conferir metadata/SEO básico e sitemap; publicar link |
| **Por que** | Transforma o produto em serviço público real |
| **Resultado** | Site no ar com dados reais |
| **Pré-requisitos** | Dia 6; contas grátis Vercel + Neon/Supabase |
| **Ferramentas** | Vercel CLI, Neon/Supabase, GitHub |
| **Tempo** | ~6h |
| **Riscos** | Erros só em produção → testar endpoints via `curl` antes de anunciar; limites free (conexões/banda) → pool pequeno e cache ISR |
| **Concluído quando** | URL pública abrindo, busca/ficha/mapa/favoritos validados em produção |

---

## 3. Regras de ouro para os 7 dias

1. **Um problema por dia** — se o dia atrasar, corte polimento, não funcionalidade essencial.
2. **Dados reais > dados perfeitos** — aceite UCs com campos nulos; não bloqueie por limpeza.
3. **Não implemente nada da lista "cortado"** sem terminar o dia corrente primeiro.
4. **Comprometa código no fim de cada dia** (branch `feat/...` + commit) para não perder trabalho.
5. **Build limpo antes de dormir** — `npm run build` sem erros é o gate diário.

---

## 4. Cronograma resumido

| Dia | Entrega | Resultado verificável |
|---|---|---|
| 1 | Ambiente + dados CNUC no PostGIS | `SELECT count(*) FROM ucs` > 0, com lat/lon |
| 2 | API (ucs, busca, estatisticas, geojson) | curl retorna JSON real |
| 3 | Home + Busca | fluxo navegável, filtros funcionam |
| 4 | Ficha da UC | ficha + favoritar + compartilhar |
| 5 | Mapa | todas as UCs clusterizadas no mapa |
| 6 | Favoritos + polish + build limpo | build sem erros, mobile ok |
| 7 | Deploy público | URL no ar, smoke test ok |

> **Meta realista:** ~52h de trabalho efetivo. Sobra margem se 1 dia atrasar 2–3h. Se estourar o dia 1 (dados do CNUC), rebaixe a ingestão para um JSON estático servido pela API — o resto do cronograma não muda.

---

## 5. Auto-revisão do arquiteto

- [x] Escopo cortado de forma explícita e justificada (seção 1)
- [x] Dependências entre dias corretas (D1→D2→D3/4→D5, D6 e D7 no fim)
- [x] Cada dia tem objetivo, tarefas, resultado verificável e riscos
- [x] Soluções gratuitas (Vercel free, Neon/Supabase free, MapLibre, Carto basemap)
- [x] Sem contradições com o plano mestre (mesmo schema e stack; cortes são adiamentos)
- [x] Contingência para o maior risco (dados do CNUC) definida
- [x] Um desenvolvedor solo consegue executar o dia a dia sem apoio externo
