import { WORKSPACE_INFO, WORKSPACE_ORDER, type WorkspaceKind } from "@/lib/workspaces";

export function WorkspacePicker({ exclude, onPick, busy }: { exclude: WorkspaceKind[]; onPick: (k: WorkspaceKind) => void; busy?: boolean }) {
  const options = WORKSPACE_ORDER.filter((k) => !exclude.includes(k));
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {options.map((k) => {
        const info = WORKSPACE_INFO[k];
        return (
          <button key={k} disabled={busy} onClick={() => onPick(k)}
            className="rounded-lg border border-border bg-card p-6 text-left transition hover:border-primary hover:shadow-md disabled:opacity-50">
            <span className="text-3xl">{info.emoji}</span>
            <h3 className="mt-3 font-display text-2xl">{info.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{info.description}</p>
          </button>
        );
      })}
    </div>
  );
}
