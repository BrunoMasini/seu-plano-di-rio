import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type Status = "active" | "paused" | "done";
type Project = {
  id: string;
  name: string;
  description: string | null;
  status: Status;
  due_date: string | null;
};

const STATUS_LABEL: Record<Status, string> = {
  active: "Em andamento",
  paused: "Pausado",
  done: "Concluído",
};

export function ProjectsPanel({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("active");
  const [dueDate, setDueDate] = useState("");
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setProjects((data as Project[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("projects").insert({
      user_id: userId,
      name: name.trim(),
      description: description.trim() || null,
      status,
      due_date: dueDate || null,
    });
    if (error) return toast.error(error.message);
    setName(""); setDescription(""); setStatus("active"); setDueDate(""); setOpen(false);
    load();
  };

  const updateStatus = async (id: string, s: Status) => {
    const { error } = await supabase.from("projects").update({ status: s }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      {!open ? (
        <Button onClick={() => setOpen(true)} className="h-12">+ Novo projeto</Button>
      ) : (
        <form onSubmit={add} className="space-y-4 border border-border p-6 rounded-md">
          <Input
            placeholder="Nome do projeto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-12 text-lg"
            autoFocus
          />
          <Textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Em andamento</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="done">Concluído</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Criar projeto</Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          </div>
        </form>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <p className="text-muted-foreground">Carregando…</p>}
        {!loading && projects.length === 0 && (
          <p className="py-12 text-center text-muted-foreground md:col-span-2">
            Nenhum projeto ainda. Crie o primeiro para organizar sua jornada.
          </p>
        )}
        {projects.map((p) => (
          <div key={p.id} className="group border border-border p-5 rounded-md hover:border-foreground/40 transition">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-2xl leading-tight">{p.name}</h3>
              <button
                onClick={() => remove(p.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition"
                aria-label="Excluir projeto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {p.description && (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{p.description}</p>
            )}
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v as Status)}>
                <SelectTrigger className="h-8 w-auto gap-2 border-0 bg-secondary px-3 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Em andamento</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                </SelectContent>
              </Select>
              {p.due_date && (
                <Badge variant="outline" className="text-xs font-normal">
                  Prazo: {new Date(p.due_date).toLocaleDateString("pt-BR")}
                </Badge>
              )}
              <span className="sr-only">{STATUS_LABEL[p.status]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
