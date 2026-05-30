import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Task = { id: string; title: string; completed: boolean; due_date: string | null; notes: string | null };

export function TasksPanel({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data, error } = await supabase
      .from("tasks").select("*")
      .order("completed", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from("tasks").insert({ user_id: userId, title: title.trim() });
    if (error) return toast.error(error.message);
    setTitle(""); load();
  };

  const toggle = async (t: Task) => {
    await supabase.from("tasks").update({ completed: !t.completed }).eq("id", t.id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("tasks").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <form onSubmit={add} className="flex gap-2">
        <Input
          placeholder="O que você quer fazer hoje?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-12 border-0 border-b border-border rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg"
        />
        <Button type="submit" className="h-12">Adicionar</Button>
      </form>

      <ul className="mt-8 divide-y divide-border">
        {loading && <li className="py-6 text-muted-foreground">Carregando…</li>}
        {!loading && tasks.length === 0 && (
          <li className="py-12 text-center text-muted-foreground">Nada por aqui ainda. Comece pelo primeiro passo.</li>
        )}
        {tasks.map((t) => (
          <li key={t.id} className="group flex items-center gap-4 py-4">
            <Checkbox checked={t.completed} onCheckedChange={() => toggle(t)} />
            <span className={"flex-1 " + (t.completed ? "text-muted-foreground line-through" : "")}>{t.title}</span>
            <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition">
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
