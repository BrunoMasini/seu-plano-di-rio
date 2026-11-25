import { ScheduleFields } from "@/components/ScheduleFields";
import { emptySchedule, storedSchedule, scheduleColumns, scheduleError, scheduleEvent, scheduleLabel } from "@/lib/schedule";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RowActions } from "@/components/RowActions";
import { AddToCalendar } from "@/components/AddToCalendar";

import { toast } from "sonner";

type Task = { id: string; title: string; completed: boolean; due_date: string | null; project_id: string | null; start_time: string | null; end_time: string | null };
type ProjectOption = { id: string; name: string };
const NONE = "__none__";

export function TasksPanel({ userId, workspaceId }: { userId: string; workspaceId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [title, setTitle] = useState("");
  const [schedule, setSchedule] = useState(emptySchedule);
  const [projectId, setProjectId] = useState<string>(NONE);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const [tRes, pRes] = await Promise.all([
      supabase.from("tasks").select("id,title,completed,due_date,project_id,start_time,end_time").eq("workspace_id", workspaceId)
        .eq("completed", false).order("created_at", { ascending: false }),
      supabase.from("projects").select("id,name").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    ]);
    if (tRes.error) toast.error(tRes.error.message); else setTasks(tRes.data ?? []);
    if (!pRes.error) setProjects(pRes.data ?? []);
    setLoading(false);
  };
  useEffect(() => { setLoading(true); load(); }, [workspaceId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const invalid = scheduleError(schedule); if (invalid) return toast.error(invalid);
    const { error } = await supabase.from("tasks").insert({
      user_id: userId, workspace_id: workspaceId, title: title.trim(),
      due_date: schedule.date || null, ...scheduleColumns(schedule), project_id: projectId === NONE ? null : projectId,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setSchedule(emptySchedule()); setProjectId(NONE); load();
  };

  const complete = async (t: Task) => {
    await supabase.from("tasks").update({ completed: true }).eq("id", t.id).eq("workspace_id", workspaceId);
    toast.success("Tarefa concluída");
    load();
  };
  const remove = async (id: string) => { await supabase.from("tasks").delete().eq("id", id).eq("workspace_id", workspaceId); load(); };
  const projectName = (id: string | null) => (id ? projects.find((p) => p.id === id)?.name ?? null : null);

  return (
    <div>
      <form onSubmit={add} className="flex flex-wrap gap-3">
        <Input placeholder="O que você quer fazer hoje?" value={title} onChange={(e) => setTitle(e.target.value)}
          className="h-12 border-0 border-b border-border rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary text-lg" />
        <ScheduleFields value={schedule} onChange={setSchedule} />
        {projects.length > 0 && (
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="h-12 sm:w-48"><SelectValue placeholder="Sem projeto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sem projeto</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <Button type="submit" className="h-12">Adicionar</Button>
      </form>

      <ul className="mt-8 divide-y divide-border">
        {loading && <li className="py-6 text-muted-foreground">Carregando…</li>}
        {!loading && tasks.length === 0 && <li className="py-12 text-center text-muted-foreground">Nada por aqui ainda. Comece pelo primeiro passo.</li>}
        {tasks.map((t) => editingId === t.id ? (
          <TaskEditor key={t.id} workspaceId={workspaceId} task={t} projects={projects} onDone={() => { setEditingId(null); load(); }} />
        ) : (
          <li key={t.id} className="flex items-center gap-4 py-4">
            <Checkbox checked={false} onCheckedChange={() => complete(t)} aria-label="Concluir" />
            <div className="flex-1 min-w-0">
              <span>{t.title}</span>
              {projectName(t.project_id) && <span className="ml-2 text-xs uppercase tracking-wider text-muted-foreground">· {projectName(t.project_id)}</span>}
              {t.due_date && <p className="text-xs text-muted-foreground">{scheduleLabel(storedSchedule(t.due_date, t.start_time, t.end_time))}</p>}
            </div>
            <div className="flex items-center gap-3">
              {t.due_date && <AddToCalendar event={scheduleEvent(t.title, storedSchedule(t.due_date, t.start_time, t.end_time))} />}
              <RowActions onEdit={() => setEditingId(t.id)} onDelete={() => remove(t.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskEditor({ task, projects, onDone, workspaceId }: { workspaceId: string; task: Task; projects: ProjectOption[]; onDone: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [schedule, setSchedule] = useState(storedSchedule(task.due_date, task.start_time, task.end_time));
  const [projectId, setProjectId] = useState(task.project_id ?? NONE);
  const save = async () => {
    if (!title.trim()) return toast.error("Título obrigatório");
    const invalid = scheduleError(schedule); if (invalid) return toast.error(invalid);
    const { error } = await supabase.from("tasks").update({
      title: title.trim(), due_date: schedule.date || null, ...scheduleColumns(schedule), project_id: projectId === NONE ? null : projectId,
    }).eq("id", task.id).eq("workspace_id", workspaceId);
    if (error) return toast.error(error.message);
    toast.success("Tarefa atualizada"); onDone();
  };
  return (
    <li className="flex flex-wrap gap-3 py-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 flex-1" autoFocus />
      <ScheduleFields value={schedule} onChange={setSchedule} />
      {projects.length > 0 && (
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="h-10 sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sem projeto</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      <Button size="sm" className="h-10" onClick={save}>Salvar</Button>
      <Button size="sm" variant="ghost" className="h-10" onClick={onDone}>Cancelar</Button>
    </li>
  );
}
