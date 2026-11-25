import { ScheduleFields } from "@/components/ScheduleFields";
import { emptySchedule, scheduleError, reminderColumns, reminderSchedule, scheduleEvent, scheduleLabel } from "@/lib/schedule";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RowActions } from "@/components/RowActions";
import { AddToCalendar } from "@/components/AddToCalendar";
import { toast } from "sonner";

type Reminder = { id: string; title: string; remind_at: string; done: boolean; end_at: string | null; all_day: boolean };

export function RemindersPanel({ userId, workspaceId }: { userId: string; workspaceId: string }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [title, setTitle] = useState("");
  const [schedule, setSchedule] = useState(emptySchedule);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("reminders").select("id,title,remind_at,done,end_at,all_day").eq("workspace_id", workspaceId).order("remind_at", { ascending: true });
    if (error) toast.error(error.message); else setItems(data ?? []);
  };
  useEffect(() => { load(); }, [workspaceId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !schedule.date) return;
    const invalid = scheduleError(schedule); if (invalid) return toast.error(invalid);
    const { error } = await supabase.from("reminders").insert({
      user_id: userId, workspace_id: workspaceId, title: title.trim(), ...reminderColumns(schedule),
    });
    if (error) return toast.error(error.message);
    setTitle(""); setSchedule(emptySchedule()); load();
  };
  const toggle = async (r: Reminder) => { await supabase.from("reminders").update({ done: !r.done }).eq("id", r.id).eq("workspace_id", workspaceId); load(); };
  const remove = async (id: string) => { await supabase.from("reminders").delete().eq("id", id).eq("workspace_id", workspaceId); load(); };

  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap gap-2">
        <Input placeholder="Lembrar de…" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 flex-1 min-w-[200px]" />
        <ScheduleFields value={schedule} onChange={setSchedule} required />
        <Button type="submit" className="h-11">Adicionar</Button>
      </form>
      <ul className="mt-8 divide-y divide-border">
        {items.length === 0 && <li className="py-12 text-center text-muted-foreground">Nenhum lembrete agendado.</li>}
        {items.map((r) => editingId === r.id ? (
          <ReminderEditor key={r.id} workspaceId={workspaceId} item={r} onDone={() => { setEditingId(null); load(); }} />
        ) : (
          <li key={r.id} className="flex items-center gap-4 py-4">
            <Checkbox checked={r.done} onCheckedChange={() => toggle(r)} />
            <div className="flex-1">
              <p className={r.done ? "text-muted-foreground line-through" : ""}>{r.title}</p>
              <p className={"text-xs " + (new Date(r.remind_at) < new Date() && !r.done ? "text-destructive" : "text-muted-foreground")}>{scheduleLabel(reminderSchedule(r.remind_at, r.end_at, r.all_day))}</p>
            </div>
            <div className="flex items-center gap-3">
              <AddToCalendar event={scheduleEvent(r.title, reminderSchedule(r.remind_at, r.end_at, r.all_day))} />
              <RowActions onEdit={() => setEditingId(r.id)} onDelete={() => remove(r.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReminderEditor({ item, onDone, workspaceId }: { workspaceId: string; item: Reminder; onDone: () => void }) {
  const [title, setTitle] = useState(item.title);
  const [schedule, setSchedule] = useState(reminderSchedule(item.remind_at, item.end_at, item.all_day));
  const save = async () => {
    if (!title.trim() || !schedule.date) return toast.error("Preencha título e data");
    const invalid = scheduleError(schedule); if (invalid) return toast.error(invalid);
    const { error } = await supabase.from("reminders").update({ title: title.trim(), ...reminderColumns(schedule) }).eq("id", item.id).eq("workspace_id", workspaceId);
    if (error) return toast.error(error.message);
    toast.success("Lembrete atualizado"); onDone();
  };
  return (
    <li className="flex flex-wrap gap-2 py-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 flex-1 min-w-[200px]" autoFocus />
      <ScheduleFields value={schedule} onChange={setSchedule} required />
      <Button size="sm" className="h-10" onClick={save}>Salvar</Button>
      <Button size="sm" variant="ghost" className="h-10" onClick={onDone}>Cancelar</Button>
    </li>
  );
}
