import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Reminder = { id: string; title: string; remind_at: string; done: boolean };

export function RemindersPanel({ userId }: { userId: string }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("reminders").select("*").order("remind_at", { ascending: true });
    if (error) toast.error(error.message); else setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !when) return;
    const { error } = await supabase.from("reminders").insert({
      user_id: userId, title: title.trim(), remind_at: new Date(when).toISOString(),
    });
    if (error) return toast.error(error.message);
    setTitle(""); setWhen(""); load();
  };

  const toggle = async (r: Reminder) => {
    await supabase.from("reminders").update({ done: !r.done }).eq("id", r.id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("reminders").delete().eq("id", id);
    load();
  };

  const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <Input placeholder="Lembrar de…" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 flex-1 min-w-[200px]" />
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-11 w-[220px]" />
        <Button type="submit" className="h-11">Adicionar</Button>
      </form>

      <ul className="mt-8 divide-y divide-border">
        {items.length === 0 && <li className="py-12 text-center text-muted-foreground">Nenhum lembrete agendado.</li>}
        {items.map((r) => {
          const past = new Date(r.remind_at) < new Date();
          return (
            <li key={r.id} className="group flex items-center gap-4 py-4">
              <Checkbox checked={r.done} onCheckedChange={() => toggle(r)} />
              <div className="flex-1">
                <p className={r.done ? "text-muted-foreground line-through" : ""}>{r.title}</p>
                <p className={"text-xs " + (past && !r.done ? "text-destructive" : "text-muted-foreground")}>{fmt(r.remind_at)}</p>
              </div>
              <button onClick={() => remove(r.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
