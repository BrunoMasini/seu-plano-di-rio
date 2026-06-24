import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
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

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="font-display text-2xl">{settings.app_name}<span className="text-muted-foreground">.</span></Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition">Admin</Link>
            )}
            <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sair</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{today}</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">{settings.greeting}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{settings.tagline}</p>

        <Tabs defaultValue="tasks" className="mt-12">
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
          <TabsContent value="tasks" className="mt-8"><TasksPanel userId={user.id} /></TabsContent>
          <TabsContent value="projects" className="mt-8"><ProjectsPanel userId={user.id} /></TabsContent>
          <TabsContent value="goals" className="mt-8"><GoalsPanel userId={user.id} /></TabsContent>
          <TabsContent value="reminders" className="mt-8"><RemindersPanel userId={user.id} /></TabsContent>
          <TabsContent value="notes" className="mt-8"><NotesPanel userId={user.id} /></TabsContent>
          <TabsContent value="completed" className="mt-8"><CompletedPanel userId={user.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
