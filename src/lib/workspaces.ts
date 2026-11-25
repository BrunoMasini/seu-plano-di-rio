export type WorkspaceKind = "student" | "professional" | "daily";
export type Workspace = { id: string; kind: WorkspaceKind };

export const WORKSPACE_INFO: Record<WorkspaceKind, { label: string; emoji: string; description: string }> = {
  student: { label: "Estudos", emoji: "🎓", description: "Aulas, matérias, provas e leituras." },
  professional: { label: "Trabalho", emoji: "💼", description: "Projetos, entregas e metas de carreira." },
  daily: { label: "Dia a dia", emoji: "☀️", description: "Rotina, hábitos, casa e compromissos." },
};

export const WORKSPACE_ORDER: WorkspaceKind[] = ["student", "professional", "daily"];
