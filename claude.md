# Engenharia de Software e Boas Práticas - Projetos Dev

Este documento consolida a arquitetura, padrões tecnológicos e boas práticas extraídos dos sistemas desenvolvidos (SOM, Patrimônio, PNEU+ ERP/Home, Hotspot e SIEM). Ele serve como guia para a manutenção do ecossistema e como base para acelerar a criação de novos projetos via IA.

---

## 1. Padrões de Arquitetura e Stack Tecnológica

Os projetos seguem um ecossistema moderno voltado à alta produtividade e segurança corporativa:

### Frontend
* **Core:** React 18/19.
* **Frameworks:** Next.js (App Router + Turbopack) para projetos conteinerizados ou Vite para SPAs rápidas e painéis administrativos.
* **Estilização e Componentes:** TailwindCSS (v3/v4), Radix UI e componentes baseados no **shadcn/ui** (cards, botões, modais, inputs). Uso do `framer-motion` para micro-interações fluidas.
* **Estado:** TanStack Query (via integração tRPC) e Contextos (ex: AuthContext, ThemeContext).

### Backend
* **API e Tipagem:** **tRPC** é amplamente utilizado como substituto ao REST tradicional. As `procedures` permitem chamadas de backend fortemente tipadas diretamente do frontend, sem duplicar definições de tipos. Para endpoints públicos, utiliza-se Express ou rotas base do Next.js.
* **ORM e Banco de Dados:** Banco relacional sempre presente (PostgreSQL preferencialmente, ou MySQL/MariaDB). Gerenciamento de banco feito majoritariamente pelo **Drizzle ORM** (ou Prisma), garantindo migrações automáticas e tipagem estrita SQL-like.
* **Armazenamento / Arquivos:** Integração com NAS (protocolos SMB), MinIO (S3 compatible) e disco local (uploads controlados e em streaming via Multer).

### Infraestrutura e Deploy
* **Docker First:** Adoção unânime do Docker e Docker Compose (`docker-compose.yml`), empacotando os serviços (`db`, `cache`, `api`, `frontend`). Scripts `.sh` ou `.ps1` de inicialização automatizada e entrada via `docker-entrypoint.sh`.
* **Ambiente Híbrido:** Variáveis configuradas em múltiplos `.env` (ex: `.env.local`, `.env.homolog`).

---

## 2. Boas Práticas Estruturais e de Código

1. **Validação de Inputs (Zod):** Tudo o que transita na rede ou em variáveis de ambiente é validado usando Zod, impedindo dados corrompidos.
2. **Soft Deletes:** Nenhuma entidade sensível (Usuários, Ativos, Movimentações) recebe Hard Delete. É utilizada uma flag `deletedAt` tratada em todos os selects do ORM.
3. **Paginação com Cursores:** Em listagens extensas, utiliza-se "Cursores" com desempate por data e ID (`tie-breaker`), evitando duplicação e pulos de registros, algo comum na paginação por `offset`.
4. **Tratamento de Tema:** Utilização nativa do `next-themes` ou de variáveis CSS (tokens semânticos do Tailwind, como `bg-muted` e `dark:bg-slate-900`) garantindo suporte inteligente a Light/Dark Mode sem flashes (`ThemeApplier`).
5. **Auditoria (`Audit Trails`):** Tabelas isoladas (ex: `audit_logs`) que interceptam e salvam mudanças (quem alterou, ação, dados anteriores, dados novos). Possui scripts de "cleanup" para remoção de logs antigos mantendo o DB enxuto.

---

## 3. Gestão de Usuários, Autenticação e Perfil

Este é o fluxo padrão robusto que deve ser adotado (ou reusado) em todo novo projeto:

### Segurança e Login
* Senhas recebem hashing com **bcryptjs** (dinâmico ou de custo no mínimo 10).
* Autenticação transita via JWT (em cookies `HttpOnly`, `SameSite=Lax`, `Secure`) ou via provedor **NextAuth** (Credentials Provider).
* **Rate Limiting e Anti-Enumeração:** O backend limita as tentativas (ex: 10 em 15 minutos por IP e por E-mail). Respostas são genéricas ("Credenciais inválidas"), evitando confirmar para atacantes se o email existe.
* Usuários possuem flags de obrigatoriedade de re-login ou atualização de senha periódica.

### Perfil e Recuperação de Senha
* Os sistemas incluem a página `/profile` para gestão da própria conta, requerendo inserção da "senha atual" para realizar a troca pela "senha nova".
* Recuperação de senha implementada por fluxo de Tokens Temporários: A API cria um registro único e criptografado (`password_reset_tokens`), válido por tempo limitado, e gera um Link que dispara e-mail (via Nodemailer) ao usuário.

### Autorização Granular (RBAC)
* Abandono de "Roles Simples" (Admin/Viewer) em favor de Permissões Granulares (`permissions` e `groups`).
* Exemplo: Middleware avalia se o usuário autenticado contém a flag `asset.create` ou `settings.users` antes da execução (`requirePermission`).
* Menus na `Sidebar` reagem ao hook de permissões, escondendo opções automaticamente.

### Sugestão de Autenticação de Dois Fatores (2FA - TOTP)
*(Estrutura pronta para acoplar)*
* **Banco:** Colunas extras no `users`: `totp_secret` (texto) e `is_2fa_enabled` (bool).
* **Setup:** Rota gera o secret (via lib `otplib`), retorna um QRCode e o usuário escaneia (Google Authenticator/Authy).
* **Verificação:** Ao logar, a API confere o JWT com status `pending_2fa`. O Frontend exibe campo pro código. A rota envia os 6 dígitos para o servidor, valida e emite o Token final da sessão.

---

## 4. Prompts de IA Reutilizáveis (Para Agentes e Novos Projetos)

Caso precise criar um novo projeto, copie os prompts abaixo para alimentar sua IA de programação, garantindo o seguimento dos padrões estabelecidos:

### Prompt 1: Inicialização do Repositório (Base Next.js)
> **Prompt:** "Inicialize um projeto novo em Next.js (App Router), React 19, TypeScript e TailwindCSS v4. Instale e configure o shadcn/ui. Inclua o pacote tRPC v11 e integre com o Drizzle ORM apontando para PostgreSQL. Quero também que você crie um `docker-compose.yml` local para subir a base de dados PostgreSQL e gere o schema do Zod para validação das variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`)."

### Prompt 2: Sistema de Autenticação e Usuários
> **Prompt:** "Baseado no Drizzle ORM, crie o schema de banco de dados para gestão de Usuários com permissões granulares granulares. Crie as tabelas `users`, `permissions`, `groups`, `group_permissions` e `user_groups`. Inclua soft-delete (`deletedAt`) e a senha usando hashing (`bcrypt_hash`). Após os schemas, construa os routers do tRPC com middlewares protegidos: um para listar os usuários com paginação em cursor, outro para criar o usuário com validação completa no Zod e outro para desativar. Adicione uma funcionalidade de log automático inserindo na tabela `audit_logs` quando um usuário for editado."

### Prompt 3: Regras de Segurança, Rate Limit e Login
> **Prompt:** "Escreva a rota/endpoint de login do sistema. O body da requisição deve ser validado por Zod. Implemente 'In-Memory Rate Limiting' que bloqueie as chamadas se ultrapassarem 10 tentativas a cada 15 minutos do mesmo IP. Muito importante: retorne uma mensagem de erro genérica ('Credenciais inválidas') tanto para senha incorreta quanto para usuário inexistente. Caso o login seja bem-sucedido, defina um cookie de sessão assinado JWT com as tags `HttpOnly`, `SameSite=Lax` e `Secure` (caso em produção)."

### Prompt 4: View de Perfil e Reset de Senha (com UI)
> **Prompt:** "Usando componentes shadcn/ui (Card, Button, Label, Input e toast do Sonner), crie a página de Perfil (`/profile`), onde o usuário pode alterar sua própria senha. Para a rota no backend via tRPC, é OBRIGATÓRIO receber a `senha atual`, a `nova senha` e validar o bcrypt antes de atualizar. Crie também o fluxo esqueci a senha: o backend cria um UUID em uma tabela `reset_tokens` vinculada ao userId com expiração de 1 hora. Construa as telas React que fazem essa chamada."

### Prompt 5: Adição de 2FA (TOTP)
> **Prompt:** "Quero adicionar Autenticação de Dois Fatores. Crie um endpoint backend que gere um secret TOTP (com otplib) e devolva um URI para formar um QRCode para Authy/Google Authenticator. Crie um endpoint de validação. Ajuste o controlador de login original para: se o usuário tiver `is_2fa_enabled` no banco de dados, o login não devolve a sessão completa; devolve um status `require_2fa` e o frontend deve redirecionar para uma tela que pede o PIN de 6 dígitos. Após validar este PIN no servidor, o token JWT real é emitido."

---
_Gerado a partir da inteligência extraída dos arquivos CLAUDE.md, READMEs, Dockerfiles e código fonte dos sistemas PNEU+, SOM, Patrimônio e parceiros._
