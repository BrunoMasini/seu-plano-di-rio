import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  due_date: string | null;
  notes: string | null;
  project_id: string | null;
};
type ProjectOption = { id: string; name: string };

const NONE = "__none__";

export function TasksPanel({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<string>(NONE);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [tRes, pRes] = await Promise.all([
      supabase.from("tasks").select("*")
        .eq("completed", false)
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id,name").order("created_at", { ascending: false }),
    ]);
    if (tRes.error) toast.error(tRes.error.message);
    else setTasks((tRes.data as Task[]) ?? []);
    if (!pRes.error) setProjects((pRes.data as ProjectOption[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: userId,
      title: title.trim(),
      project_id: projectId === NONE ? null : projectId,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setProjectId(NONE); load();
  };

  const toggle = async (t: Task) => {
    await supabase.from("tasks").update({ completed: !t.completed }).eq("id", t.id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    load();
  };

  const projectName = (id: string | null) =>
    id ? projects.find((p) => p.id === id)?.name ?? null : null;

  return (
    <div>
      <form onSubmit={add} className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="O que você quer fazer hoje?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 border-0 border-b border-border rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg"
        />
        {projects.length > 0 && (
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="h-12 sm:w-48"><SelectValue placeholder="Sem projeto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sem projeto</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button type="submit" className="h-12">Adicionar</Button>
      </form>

      <ul className="mt-8 divide-y divide-border">
        {loading && <li className="py-6 text-muted-foreground">Carregando…</li>}
        {!loading && tasks.length === 0 && (
          <li className="py-12 text-center text-muted-foreground">Nada por aqui ainda. Comece pelo primeiro passo.</li>
        )}
        {tasks.map((t) => {
          const pn = projectName(t.project_id);
          return (
            <li key={t.id} className="group flex items-center gap-4 py-4">
              <Checkbox checked={t.completed} onCheckedChange={() => toggle(t)} />
              <div className="flex-1 min-w-0">
                <span className={t.completed ? "text-muted-foreground line-through" : ""}>{t.title}</span>
                {pn && (
                  <span className="ml-2 text-xs uppercase tracking-wider text-muted-foreground">· {pn}</span>
                )}
              </div>
              <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
