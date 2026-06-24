## Escopo

1. **Portal admin** restrito ao email `fradmasini@gmail.com` (verificação por role no banco, nunca por email no client).
2. **Configurações globais** editáveis pelo admin: nome do app, frase de boas-vindas, subtítulo, e rótulos das 5 abas (Hoje, Projetos, Metas, Agenda, Notas). Edição reflete para todos os usuários.
3. **Aba "Concluídas"** para todos os usuários: tarefas marcadas como feitas saem de "Hoje" e aparecem em "Concluídas", onde podem ser excluídas (ou reabertas).

## Banco de dados (migration)

- Enum `app_role` (`admin`, `user`) + tabela `public.user_roles` (user_id, role) com função `security definer` `has_role(_user_id, _role)` — padrão obrigatório de roles do projeto.
- Tabela `public.app_settings` (linha única, id fixo) com colunas: `app_name`, `tagline`, `greeting`, `tab_today`, `tab_projects`, `tab_goals`, `tab_reminders`, `tab_notes`, `updated_at`.
  - RLS: SELECT liberado para `authenticated` (todos leem); UPDATE só para `has_role(auth.uid(),'admin')`.
  - Seed da linha com os valores atuais ("North Note", "Bom te ver de novo.", etc.).
- Seed inicial: inserir role `admin` para o usuário cujo email é `fradmasini@gmail.com` (via subquery em `auth.users`).
- GRANTs em ambas as tabelas.

## Frontend

- **`src/lib/settings.ts`** — hook `useAppSettings()` que carrega `app_settings` uma vez e expõe os rótulos/textos. Usado no header, na home e nas abas.
- **`src/routes/__root.tsx`, `src/routes/app.tsx`, `src/routes/login.tsx`** — substituir literais "North Note", "Bom te ver de novo.", labels das abas e títulos das `<head>` pelos valores de `useAppSettings()`.
- **`src/routes/admin.tsx`** — nova rota protegida:
  - Redireciona para `/login` se não autenticado.
  - Consulta `has_role` (RPC) e bloqueia com mensagem "Acesso restrito" se não admin.
  - Formulário simples (inputs Paper & Ink) para editar todos os campos de `app_settings` e botão Salvar.
  - Link discreto para `/admin` aparece no header de `/app` apenas quando o usuário logado for admin.
- **`src/components/panels/TasksPanel.tsx`** — filtrar para mostrar apenas tarefas `completed = false` na aba "Hoje". Manter criação/checkbox.
- **`src/components/panels/CompletedPanel.tsx`** (novo) — lista de tarefas `completed = true` com ações: reabrir (desmarcar) e excluir.
- **`src/routes/app.tsx`** — adicionar 6ª aba "Concluídas" após "Notas", usando rótulo das settings (`tab_today` etc.) e um rótulo fixo "Concluídas" (ou também configurável; mantemos fixo para simplicidade).

## Segurança

- Toda checagem de admin é feita server-side via RLS (`has_role` em policies de `app_settings` UPDATE). O client apenas esconde a UI; tentativas de update sem role falham no banco.
- Nenhum email é hardcoded no frontend.

## Estilo

Mantém Paper & Ink: tipografia Instrument Serif para títulos, inputs minimalistas, sem cores fora dos tokens semânticos.