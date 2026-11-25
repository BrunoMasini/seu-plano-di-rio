import { ThemeToggle } from "@/components/ThemeToggle";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { WorkspacePicker } from "@/components/workspace/WorkspacePicker";
import { WORKSPACE_INFO, WORKSPACE_ORDER, type Workspace, type WorkspaceKind } from "@/lib/workspaces";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useAppSettings, useIsAdmin } from "@/lib/settings";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TasksPanel } from "@/components/panels/TasksPanel";
import { GoalsPanel } from "@/components/panels/GoalsPanel";
import { RemindersPanel } from "@/components/panels/RemindersPanel";
import { NotesPanel } from "@/components/panels/NotesPanel";
import { ProjectsPanel } from "@/components/panels/ProjectsPanel";
import { CompletedPanel } from "@/components/panels/CompletedPanel";

export const Route = createFileRoute("/app")({
  component: AppPage,
});

function AppPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { settings } = useAppSettings();
  const isAdmin = useIsAdmin(user?.id);

  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  const loadWorkspaces = async () => {
    const { data, error } = await supabase.from("workspaces").select("id,kind");
    if (error) { toast.error(error.message); return; }
    const list = ((data ?? []) as Workspace[]).sort((a, b) => WORKSPACE_ORDER.indexOf(a.kind) - WORKSPACE_ORDER.indexOf(b.kind));
    setWorkspaces(list);
    const saved = localStorage.getItem("nn-workspace");
    setActiveId((cur) => {
      const pick = cur ?? saved;
      return list.find((w) => w.id === pick)?.id ?? list[0]?.id ?? null;
    });
  };
  useEffect(() => { if (user) loadWorkspaces(); }, [user?.id]);
  useEffect(() => { if (activeId) localStorage.setItem("nn-workspace", activeId); }, [activeId]);

  const createWorkspace = async (kind: WorkspaceKind) => {
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase.from("workspaces").insert({ user_id: user.id, kind }).select("id").single();
    setBusy(false);
    if (error) return toast.error(error.message);
    setActiveId(data.id); setAdding(false);
    await loadWorkspaces();
  };

  if (loading || !user || workspaces === null) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawName = String(meta["full_name"] || meta["name"] || "").trim();
  const firstName = rawName.split(" ")[0] ?? "";
  const greeting = firstName
    ? `${settings.greeting.replace(/[.!]\s*$/, "")}, ${firstName}.`
    : settings.greeting;
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  if (workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Bem-vindo ao {settings.app_name}</p>
          <h1 className="mt-3 font-display text-5xl">{firstName ? `${firstName}, qual` : "Qual"} área você quer organizar primeiro?</h1>
          <p className="mt-3 text-muted-foreground">Você pode criar os outros espaços depois, quando quiser.</p>
          <div className="mt-10"><WorkspacePicker exclude={[]} onPick={createWorkspace} busy={busy} /></div>
        </main>
      </div>
    );
  }

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0]!;
  const wsId = active.id;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-2xl">{settings.app_name}<span className="text-muted-foreground">.</span></Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition">Admin</Link>
            )}
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{today}</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">{greeting}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{settings.tagline}</p>

        <div className="mt-10 flex flex-wrap gap-3">
          {workspaces.map((w) => {
            const info = WORKSPACE_INFO[w.kind];
            const on = w.id === wsId;
            return (
              <button key={w.id} onClick={() => setActiveId(w.id)}
                className={"flex items-center gap-3 rounded-lg border px-5 py-3 text-left transition " + (on ? "border-primary bg-primary text-primary-foreground shadow-md" : "border-border bg-card hover:border-primary")}>
                <span className="text-2xl">{info.emoji}</span>
                <span className="font-display text-xl">{info.label}</span>
              </button>
            );
          })}
          {workspaces.length < 3 && (
            <button onClick={() => setAdding(true)} className="flex items-center gap-2 rounded-lg border border-dashed border-border px-5 py-3 text-muted-foreground transition hover:border-primary hover:text-foreground">
              <Plus className="h-4 w-4" /> Novo espaço
            </button>
          )}
        </div>
        <Dialog open={adding} onOpenChange={setAdding}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle className="font-display text-3xl">Criar novo espaço</DialogTitle></DialogHeader>
            <WorkspacePicker exclude={workspaces.map((w) => w.kind)} onPick={createWorkspace} busy={busy} />
          </DialogContent>
        </Dialog>

        <Tabs key={wsId} defaultValue="tasks" className="mt-10">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-2 p-0 h-auto flex-wrap">
            {[
              ["tasks", settings.tab_today],
              ["projects", settings.tab_projects],
              ["goals", settings.tab_goals],
              ["reminders", settings.tab_reminders],
              ["notes", settings.tab_notes],
              ["completed", settings.tab_completed],
            ].map(([v, l]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-3 font-display text-lg data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="tasks" className="mt-8"><TasksPanel userId={user.id} workspaceId={wsId} /></TabsContent>
          <TabsContent value="projects" className="mt-8"><ProjectsPanel userId={user.id} workspaceId={wsId} /></TabsContent>
          <TabsContent value="goals" className="mt-8"><GoalsPanel userId={user.id} workspaceId={wsId} /></TabsContent>
          <TabsContent value="reminders" className="mt-8"><RemindersPanel userId={user.id} workspaceId={wsId} /></TabsContent>
          <TabsContent value="notes" className="mt-8"><NotesPanel userId={user.id} workspaceId={wsId} /></TabsContent>
          <TabsContent value="completed" className="mt-8"><CompletedPanel userId={user.id} workspaceId={wsId} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
