import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { RowActions } from "@/components/RowActions";
import { AddToCalendar } from "@/components/AddToCalendar";
import { localDate } from "@/lib/calendar";
import { toast } from "sonner";

type Horizon = "short" | "medium" | "long";
type Goal = { id: string; title: string; description: string | null; horizon: Horizon; target_date: string | null; progress: number };
const horizonLabel: Record<Horizon, string> = { short: "Curto prazo", medium: "Médio prazo", long: "Longo prazo" };

function HorizonSelect({ value, onChange }: { value: Horizon; onChange: (h: Horizon) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Horizon)}>
      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="short">Curto prazo</SelectItem>
        <SelectItem value="medium">Médio prazo</SelectItem>
        <SelectItem value="long">Longo prazo</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function GoalsPanel({ userId, workspaceId }: { userId: string; workspaceId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("short");
  const [targetDate, setTargetDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("goals").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setGoals((data as Goal[]) ?? []);
  };
  useEffect(() => { load(); }, [workspaceId]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from("goals").insert({
      user_id: userId, workspace_id: workspaceId, title: title.trim(),
      description: description.trim() || null, horizon, target_date: targetDate || null,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setDescription(""); setTargetDate(""); load();
  };
  const updateProgress = async (g: Goal, value: number) => {
    await supabase.from("goals").update({ progress: Math.max(0, Math.min(100, value)) }).eq("id", g.id);
    load();
  };
  const remove = async (id: string) => { await supabase.from("goals").delete().eq("id", id); load(); };

  return (
    <div>
      <form onSubmit={add} className="space-y-3 rounded-lg border border-border bg-card p-5">
        <Input placeholder="Onde você quer chegar?" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
        <Textarea placeholder="Por que isso importa? (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <div className="flex flex-wrap gap-2">
          <HorizonSelect value={horizon} onChange={setHorizon} />
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-[180px]" />
          <Button type="submit" className="ml-auto">Adicionar meta</Button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {goals.length === 0 && <p className="py-12 text-center text-muted-foreground">Defina sua primeira meta.</p>}
        {goals.map((g) => editingId === g.id ? (
          <GoalEditor key={g.id} goal={g} onDone={() => { setEditingId(null); load(); }} />
        ) : (
          <div key={g.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {horizonLabel[g.horizon]}{g.target_date ? ` · até ${localDate(g.target_date).toLocaleDateString("pt-BR")}` : ""}
                </p>
                <h3 className="mt-1 font-display text-2xl">{g.title}</h3>
                {g.description && <p className="mt-1 text-muted-foreground">{g.description}</p>}
              </div>
              <div className="flex items-center gap-3">
                {g.target_date && <AddToCalendar event={{ title: `Meta: ${g.title}`, start: localDate(g.target_date), allDay: true, details: g.description ?? "" }} />}
                <RowActions onEdit={() => setEditingId(g.id)} onDelete={() => remove(g.id)} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={g.progress} className="flex-1" />
              <span className="w-12 text-right text-sm tabular-nums">{g.progress}%</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[0, 25, 50, 75, 100].map((v) => (
                <Button key={v} type="button" size="sm" variant={g.progress === v ? "default" : "outline"} onClick={() => updateProgress(g, v)}>{v}%</Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoalEditor({ goal, onDone }: { goal: Goal; onDone: () => void }) {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description ?? "");
  const [horizon, setHorizon] = useState<Horizon>(goal.horizon);
  const [targetDate, setTargetDate] = useState(goal.target_date ?? "");
  const save = async () => {
    if (!title.trim()) return toast.error("Título obrigatório");
    const { error } = await supabase.from("goals").update({
      title: title.trim(), description: description.trim() || null, horizon, target_date: targetDate || null,
    }).eq("id", goal.id);
    if (error) return toast.error(error.message);
    toast.success("Meta atualizada"); onDone();
  };
  return (
    <div className="space-y-3 rounded-lg border border-primary/50 bg-card p-5">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" autoFocus />
      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Descrição" />
      <div className="flex flex-wrap gap-2">
        <HorizonSelect value={horizon} onChange={setHorizon} />
        <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-[180px]" />
        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={save}>Salvar</Button>
          <Button size="sm" variant="ghost" onClick={onDone}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
