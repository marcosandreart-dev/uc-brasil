# Guia de Contribuição — UC Brasil

## Como Contribuir

1. Faça um fork do repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`).
3. Faça commit das suas alterações.
4. Abra um Pull Request.

## Padrões de Código

- TypeScript estrito (`strict: true`).
- ESLint + Prettier para formatação.
- Testes unitários para funções de negócio.
- Testes E2E para fluxos críticos.
- Commit messages claros e descritivos.

## Estrutura de Pastas

Consulte o `AGENTS.md` para a estrutura completa do projeto.

## Ambiente de Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar banco de dados
docker-compose up -d

# Executar migrações
npm run db:migrate

# Executar seed (dados de exemplo)
npm run db:seed

# Iniciar servidor de desenvolvimento
npm run dev
```

## Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e
```
