import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RowActions } from "@/components/RowActions";
import { AddToCalendar } from "@/components/AddToCalendar";
import { toast } from "sonner";

type Reminder = { id: string; title: string; remind_at: string; done: boolean };

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function RemindersPanel({ userId, workspaceId }: { userId: string; workspaceId: string }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("reminders").select("id,title,remind_at,done").eq("workspace_id", workspaceId).order("remind_at", { ascending: true });
    if (error) toast.error(error.message); else setItems(data ?? []);
  };
  useEffect(() => { load(); }, [workspaceId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !when) return;
    const { error } = await supabase.from("reminders").insert({
      user_id: userId, workspace_id: workspaceId, title: title.trim(), remind_at: new Date(when).toISOString(),
    });
    if (error) return toast.error(error.message);
    setTitle(""); setWhen(""); load();
  };
  const toggle = async (r: Reminder) => { await supabase.from("reminders").update({ done: !r.done }).eq("id", r.id); load(); };
  const remove = async (id: string) => { await supabase.from("reminders").delete().eq("id", id); load(); };
  const fmt = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <Input placeholder="Lembrar de…" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 flex-1 min-w-[200px]" />
        <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-11 w-[220px]" />
        <Button type="submit" className="h-11">Adicionar</Button>
      </form>
      <ul className="mt-8 divide-y divide-border">
        {items.length === 0 && <li className="py-12 text-center text-muted-foreground">Nenhum lembrete agendado.</li>}
        {items.map((r) => editingId === r.id ? (
          <ReminderEditor key={r.id} item={r} onDone={() => { setEditingId(null); load(); }} />
        ) : (
          <li key={r.id} className="flex items-center gap-4 py-4">
            <Checkbox checked={r.done} onCheckedChange={() => toggle(r)} />
            <div className="flex-1">
              <p className={r.done ? "text-muted-foreground line-through" : ""}>{r.title}</p>
              <p className={"text-xs " + (new Date(r.remind_at) < new Date() && !r.done ? "text-destructive" : "text-muted-foreground")}>{fmt(r.remind_at)}</p>
            </div>
            <div className="flex items-center gap-3">
              <AddToCalendar event={{ title: r.title, start: new Date(r.remind_at) }} />
              <RowActions onEdit={() => setEditingId(r.id)} onDelete={() => remove(r.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReminderEditor({ item, onDone }: { item: Reminder; onDone: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [when, setWhen] = useState(toLocalInput(item.remind_at));
  const save = async () => {
    if (!title.trim() || !when) return toast.error("Preencha título e data");
    const { error } = await supabase.from("reminders").update({ title: title.trim(), remind_at: new Date(when).toISOString() }).eq("id", item.id);
    if (error) return toast.error(error.message);
    toast.success("Lembrete atualizado"); onDone();
  };
  return (
    <li className="flex flex-wrap gap-2 py-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 flex-1 min-w-[200px]" autoFocus />
      <Input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-10 w-[220px]" />
      <Button size="sm" className="h-10" onClick={save}>Salvar</Button>
      <Button size="sm" variant="ghost" className="h-10" onClick={onDone}>Cancelar</Button>
    </li>
  );
}
