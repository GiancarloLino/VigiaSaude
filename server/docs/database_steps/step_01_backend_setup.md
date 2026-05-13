# Passo #1: Setup Inicial do Backend e Prisma

Este é o primeiro passo para colocar o banco de dados no ar.

## 1. Configuração do Ambiente (.env)

Crie o arquivo `.env` dentro da pasta `server/` e preencha com as suas credenciais do Supabase:

```env
# URL para queries (Transaction Mode - Porta 6543)
# Adicione ?pgbouncer=true ao final se usar o pooler do Supabase
DATABASE_URL="postgresql://postgres:[SENHA]@[HOST]:6543/postgres?pgbouncer=true"

# URL para migrations (Session Mode - Porta 5432)
DIRECT_URL="postgresql://postgres:[SENHA]@[HOST]:5432/postgres"

PORT=3001
```

## 2. Comandos para Executar

Abra o terminal na pasta `server/` e execute:

```bash
# Instalar dependências (caso ainda não tenha feito)
npm install

# Gerar o código do cliente Prisma baseado no schema.prisma
npx prisma generate

# Criar as tabelas no Supabase (Rodar a primeira migration)
npx prisma migrate dev --name init

# Popular o banco com os usuários iniciais (Seed)
npx prisma db seed
```

## 3. O que foi criado?
- Tabelas: `usuarios`, `atas`, `medicamentos_ata`, `pedidos_compra`, `auditorias`.
- Enums para garantir que status e roles sejam fixos.
- Relacionamentos automáticos entre as tabelas.
