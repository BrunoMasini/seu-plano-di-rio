import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TasksPanel } from "@/components/panels/TasksPanel";
import { GoalsPanel } from "@/components/panels/GoalsPanel";
import { RemindersPanel } from "@/components/panels/RemindersPanel";
import { NotesPanel } from "@/components/panels/NotesPanel";
import { ProjectsPanel } from "@/components/panels/ProjectsPanel";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Sua mentoria — North Note" }] }),
  component: AppPage,
});

function AppPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

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
          <Link to="/" className="font-display text-2xl">North Note<span className="text-muted-foreground">.</span></Link>
          <Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()}>Sair</Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{today}</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">Bom te ver de novo.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Comece pelo que importa hoje. Depois, olhe para onde quer chegar.
        </p>

        <Tabs defaultValue="tasks" className="mt-12">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-2 p-0 h-auto">
            {[
              ["tasks", "Hoje"],
              ["goals", "Metas"],
              ["reminders", "Agenda"],
              ["notes", "Notas"],
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
          <TabsContent value="goals" className="mt-8"><GoalsPanel userId={user.id} /></TabsContent>
          <TabsContent value="reminders" className="mt-8"><RemindersPanel userId={user.id} /></TabsContent>
          <TabsContent value="notes" className="mt-8"><NotesPanel userId={user.id} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
