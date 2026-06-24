import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useIsAdmin, useAppSettings, type AppSettings } from "@/lib/settings";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin(user?.id);
  const { settings, loading: sLoading } = useAppSettings();
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!sLoading) setForm(settings);
  }, [settings, sLoading]);

  if (loading || sLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Carregando…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-4xl">Acesso restrito</h1>
        <p className="text-muted-foreground">Este portal é exclusivo para administradores.</p>
        <Link to="/app" className="underline underline-offset-4">Voltar para o app</Link>
      </div>
    );
  }

  if (!form) return null;

  const update = (k: keyof AppSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("app_settings").update({
      app_name: form.app_name,
      tagline: form.tagline,
      greeting: form.greeting,
      tab_today: form.tab_today,
      tab_projects: form.tab_projects,
      tab_goals: form.tab_goals,
      tab_reminders: form.tab_reminders,
      tab_notes: form.tab_notes,
      tab_completed: form.tab_completed,
    }).eq("id", form.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Configurações salvas. Recarregue para ver em todo o app.");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Link to="/app" className="font-display text-2xl">{form.app_name}<span className="text-muted-foreground">.</span></Link>
          <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Admin</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        <div>
          <h1 className="font-display text-5xl">Portal do administrador</h1>
          <p className="mt-3 text-muted-foreground">Edite o título do app, a saudação e os rótulos das abas. As mudanças valem para todos os usuários.</p>
        </div>

        <section className="space-y-6">
          <h2 className="font-display text-2xl border-b border-border pb-2">Identidade</h2>
          <Field label="Nome do app"><Input value={form.app_name} onChange={update("app_name")} /></Field>
          <Field label="Saudação (home)"><Input value={form.greeting} onChange={update("greeting")} /></Field>
          <Field label="Subtítulo / foco do app"><Textarea value={form.tagline} onChange={update("tagline")} rows={3} /></Field>
        </section>

        <section className="space-y-6">
          <h2 className="font-display text-2xl border-b border-border pb-2">Rótulos das abas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Aba 1 (tarefas de hoje)"><Input value={form.tab_today} onChange={update("tab_today")} /></Field>
            <Field label="Aba 2 (projetos)"><Input value={form.tab_projects} onChange={update("tab_projects")} /></Field>
            <Field label="Aba 3 (metas)"><Input value={form.tab_goals} onChange={update("tab_goals")} /></Field>
            <Field label="Aba 4 (agenda)"><Input value={form.tab_reminders} onChange={update("tab_reminders")} /></Field>
            <Field label="Aba 5 (notas)"><Input value={form.tab_notes} onChange={update("tab_notes")} /></Field>
            <Field label="Aba 6 (concluídas)"><Input value={form.tab_completed} onChange={update("tab_completed")} /></Field>
          </div>
        </section>

        <div className="flex gap-3 pt-4">
          <Button onClick={save} disabled={saving} className="h-12 px-8">
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
          <Button variant="ghost" onClick={() => navigate({ to: "/app" })} className="h-12">Voltar</Button>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
