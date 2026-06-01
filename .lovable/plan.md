## Escopo
Adicionar uma aba **Projetos** ao dashboard, permitindo criar, listar, editar e excluir projetos. Tarefas existentes ganham vínculo opcional com um projeto.

## Banco de dados (migration)
- Criar enum `project_status` com valores: `active`, `paused`, `done`.
- Criar tabela `public.projects`:
  - `name` (text, obrigatório)
  - `description` (text, opcional)
  - `status` (project_status, default `active`)
  - `due_date` (date, opcional)
  - campos padrão (id, user_id, created_at, updated_at)
- GRANTs para `authenticated` e `service_role`; RLS com 4 policies escopadas por `auth.uid()`.
- Trigger de `updated_at`.
- Adicionar coluna `project_id uuid` (nullable) em `public.tasks` para vincular tarefa a um projeto.

## Frontend
- Novo arquivo `src/components/panels/ProjectsPanel.tsx`:
  - Formulário inline para criar projeto (nome, descrição, status, prazo).
  - Lista de projetos em cards mostrando nome, descrição, badge de status, prazo e ações (editar status, excluir).
- `src/routes/app.tsx`: adicionar nova aba **Projetos** entre "Metas" e "Agenda".
- `src/components/panels/TasksPanel.tsx`: adicionar seletor opcional de projeto ao criar tarefa e exibir o nome do projeto vinculado em cada tarefa.

## Estilo
Mantém a estética Paper & Ink existente (tipografia Instrument Serif para títulos, cards minimalistas, sem cores fora dos tokens semânticos).