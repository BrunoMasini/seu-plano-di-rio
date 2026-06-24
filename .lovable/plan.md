## Correções

### 1. Erro 404 em `/admin`
O arquivo `src/routes/admin.tsx` foi criado mas a árvore de rotas (`routeTree.gen.ts`) é regenerada apenas em build/dev — provavelmente o preview ainda não a recarregou. Vou:
- Reiniciar o dev server para forçar a regeneração da árvore de rotas.
- Confirmar que `createFileRoute("/admin")` está correto e adicionar `notFoundComponent` + `errorComponent` ao root caso ainda falhe.

### 2. Edição completa de projetos
No `ProjectsPanel.tsx`, hoje só dá para criar, mudar status e excluir. Vou adicionar modo de edição inline em cada card:
- Botão "Editar" abre o card como formulário com os campos **nome**, **descrição**, **status** e **prazo (data)**.
- Botões "Salvar" e "Cancelar" no modo edição.
- O salvar faz `update` em `projects` (RLS já permite o dono editar).

Mantém o visual Paper & Ink existente. Nenhuma mudança de banco.