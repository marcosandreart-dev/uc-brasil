# Arquitetura — UC Brasil

> Este documento será preenchido pelo Arquiteto de Soluções ao executar o prompt de plano de desenvolvimento.

---

## Diagrama de Arquitetura

```
[Cliente Browser]
       │
       ▼
[Next.js (App Router)]
       │
       ├── Frontend Components (React + TypeScript)
       ├── API Routes (Next.js)
       └── Middleware (Auth, Cache, Security)
              │
              ▼
[Backend API (NestJS / Express)]
       │
       ├── Serviços de Negócio
       ├── Repositórios (PostgreSQL/PostGIS)
       ├── Cache (Redis)
       └── Integrações Externas (CNUC, ICMBio, IBGE, SiBBr)
              │
              ▼
[PostgreSQL + PostGIS]
       │
       ├── unidades_conservacao
       ├── favoritos
       └── dados_atualizacao
```

---

## Decisões Arquiteturais

> A ser preenchido pelo Arquiteto.
