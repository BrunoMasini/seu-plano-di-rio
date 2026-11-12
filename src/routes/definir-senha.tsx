import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/definir-senha")({
  head: () => ({
    meta: [
      { title: "Criar senha — North Note" },
      { name: "description", content: "Defina sua senha de acesso ao North Note." },
      { property: "og:title", content: "Criar senha — North Note" },
      { property: "og:description", content: "Defina sua senha de acesso ao North Note." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SetPasswordPage,
});

function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("As senhas não coincidem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Senha criada! Bem-vindo.");
    navigate({ to: "/app", replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl">North Note<span className="text-muted-foreground">.</span></Link>
      </header>
      <main className="mx-auto flex max-w-md flex-col px-6 pt-16">
        <h1 className="font-display text-5xl">Crie sua senha</h1>
        <p className="mt-2 text-muted-foreground">Você usará esta senha junto com seu email para entrar.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="pw">Nova senha</Label>
            <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" />
          </div>
          <div>
            <Label htmlFor="pw2">Confirmar senha</Label>
            <Input id="pw2" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1.5 h-11" />
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full">{loading ? "..." : "Salvar senha"}</Button>
        </form>
      </main>
    </div>
  );
}
