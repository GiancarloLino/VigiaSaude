# Passo #2: Servidor Express e Conectividade

Agora que o Prisma está configurado, vamos preparar o servidor para rodar e aceitar requisições.

## 1. Scripts no package.json

Para rodar o servidor em desenvolvimento, adicione os seguintes scripts no seu `server/package.json`:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "start": "node dist/index.js",
  "build": "tsc"
}
```
*(Você precisará instalar o `ts-node-dev` com `npm install -D ts-node-dev`)*

## 2. Testando a Conexão

Após configurar o `.env` (no Passo #1) e rodar as migrations, você pode iniciar o servidor:

```bash
npm run dev
```

Abra o navegador em `http://localhost:3001/health` para confirmar que o servidor está respondendo.

## 3. Estrutura de Pastas Criada
O servidor já possui a estrutura base para crescer:
- `src/config`: Configurações globais (como o Prisma Client).
- `src/controllers`: Lógica das rotas.
- `src/routes`: Definição dos endpoints.
- `src/services`: Camada de comunicação com o banco de dados.
- `src/index.ts`: Ponto de entrada da aplicação.
