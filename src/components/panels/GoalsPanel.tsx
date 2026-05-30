import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Goal = {
  id: string; title: string; description: string | null;
  horizon: "short" | "medium" | "long"; target_date: string | null; progress: number;
};

const horizonLabel = { short: "Curto prazo", medium: "Médio prazo", long: "Longo prazo" };

export function GoalsPanel({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [horizon, setHorizon] = useState<Goal["horizon"]>("short");
  const [targetDate, setTargetDate] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setGoals(data as Goal[] ?? []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from("goals").insert({
      user_id: userId, title: title.trim(),
      description: description.trim() || null,
      horizon, target_date: targetDate || null,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setDescription(""); setTargetDate(""); load();
  };

  const updateProgress = async (g: Goal, value: number) => {
    await supabase.from("goals").update({ progress: Math.max(0, Math.min(100, value)) }).eq("id", g.id);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("goals").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <form onSubmit={add} className="space-y-3 rounded-lg border border-border bg-card p-5">
        <Input placeholder="Onde você quer chegar?" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
        <Textarea placeholder="Por que isso importa? (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <div className="flex flex-wrap gap-2">
          <Select value={horizon} onValueChange={(v) => setHorizon(v as Goal["horizon"])}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Curto prazo</SelectItem>
              <SelectItem value="medium">Médio prazo</SelectItem>
              <SelectItem value="long">Longo prazo</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-[180px]" />
          <Button type="submit" className="ml-auto">Adicionar meta</Button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {goals.length === 0 && <p className="py-12 text-center text-muted-foreground">Defina sua primeira meta.</p>}
        {goals.map((g) => (
          <div key={g.id} className="group rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {horizonLabel[g.horizon]}{g.target_date ? ` · até ${new Date(g.target_date).toLocaleDateString("pt-BR")}` : ""}
                </p>
                <h3 className="mt-1 font-display text-2xl">{g.title}</h3>
                {g.description && <p className="mt-1 text-muted-foreground">{g.description}</p>}
              </div>
              <button onClick={() => remove(g.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Progress value={g.progress} className="flex-1" />
              <span className="w-12 text-right text-sm tabular-nums">{g.progress}%</span>
              <Input
                type="number" min={0} max={100} value={g.progress}
                onChange={(e) => updateProgress(g, parseInt(e.target.value || "0"))}
                className="w-20 h-9"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
