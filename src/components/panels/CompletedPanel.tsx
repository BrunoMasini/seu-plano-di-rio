import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Task = { id: string; title: string; completed: boolean; project_id: string | null };

export function CompletedPanel({ userId: _userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase.from("tasks").select("id,title,completed,project_id")
      .eq("completed", true).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setTasks((data as Task[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reopen = async (id: string) => {
    await supabase.from("tasks").update({ completed: false }).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    load();
  };

  return (
    <ul className="divide-y divide-border">
      {loading && <li className="py-6 text-muted-foreground">Carregando…</li>}
      {!loading && tasks.length === 0 && (
        <li className="py-12 text-center text-muted-foreground">Nenhuma tarefa concluída ainda.</li>
      )}
      {tasks.map((t) => (
        <li key={t.id} className="group flex items-center gap-4 py-4">
          <span className="flex-1 min-w-0 text-muted-foreground line-through">{t.title}</span>
          <Button variant="ghost" size="sm" onClick={() => reopen(t.id)} className="opacity-60 group-hover:opacity-100">
            <RotateCcw className="h-4 w-4 mr-1" /> Reabrir
          </Button>
          <button onClick={() => remove(t.id)} className="opacity-60 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition">
            <Trash2 className="h-4 w-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
