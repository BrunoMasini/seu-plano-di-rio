import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RowActions } from "@/components/RowActions";
import { toast } from "sonner";

type Note = { id: string; title: string; content: string | null; updated_at: string };

export function NotesPanel({ userId, workspaceId }: { userId: string; workspaceId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.from("notes").select("id,title,content,updated_at").eq("workspace_id", workspaceId).order("updated_at", { ascending: false });
    if (error) toast.error(error.message); else setNotes(data ?? []);
  };
  useEffect(() => { load(); }, [workspaceId]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editingId) {
      await supabase.from("notes").update({ title: title.trim(), content, updated_at: new Date().toISOString() }).eq("id", editingId);
    } else {
      await supabase.from("notes").insert({ user_id: userId, workspace_id: workspaceId, title: title.trim(), content });
    }
    setTitle(""); setContent(""); setEditingId(null); load();
  };

  const edit = (n: Note) => {
    setEditingId(n.id); setTitle(n.title); setContent(n.content ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: string) => {
    await supabase.from("notes").delete().eq("id", id);
    if (editingId === id) { setEditingId(null); setTitle(""); setContent(""); }
    load();
  };

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
      <form onSubmit={save} className="space-y-3 rounded-lg border border-border bg-card p-5 h-fit">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {editingId ? "Editando nota" : "Nova nota"}
        </p>
        <Input placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11" />
        <Textarea placeholder="Escreva aqui — insights, perguntas, aprendizados…" value={content} onChange={(e) => setContent(e.target.value)} rows={10} />
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">{editingId ? "Salvar" : "Criar nota"}</Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setTitle(""); setContent(""); }}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {notes.length === 0 && <p className="py-12 text-center text-muted-foreground">Suas notas aparecem aqui.</p>}
        {notes.map((n) => (
          <article key={n.id} className="group cursor-pointer rounded-lg border border-border bg-card p-5 hover:border-primary/40 transition" onClick={() => edit(n)}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl">{n.title}</h3>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <RowActions onEdit={() => edit(n)} onDelete={() => remove(n.id)} />
              </div>
            </div>
            {n.content && <p className="mt-2 text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">{n.content}</p>}
            <p className="mt-3 text-xs text-muted-foreground">{new Date(n.updated_at).toLocaleDateString("pt-BR")}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
