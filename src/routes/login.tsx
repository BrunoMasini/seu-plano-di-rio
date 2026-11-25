import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { SUPPORT_EMAIL } from "@/components/SupportDialog";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Entrar — North Note" },
    { name: "description", content: "Entre no North Note para organizar seus estudos, trabalho e rotina pessoal." },
    { property: "og:title", content: "Entrar — North Note" },
    { property: "og:description", content: "Acesse seus espaços de organização no North Note." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LoginPage,
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/app", replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true, emailRedirectTo: window.location.origin + "/definir-senha" },
        });
        if (error) throw error;
        toast.success("Enviamos um link para seu email para criar sua senha.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/definir-senha",
        });
        if (error) throw error;
        toast.success("Enviamos um link para redefinir sua senha.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
    if (r.error) toast.error("Falha ao entrar com Google");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl">North Note<span className="text-muted-foreground">.</span></Link>
      </header>
      <main className="mx-auto flex max-w-md flex-col px-6 pt-16">
        <h1 className="font-display text-5xl">{mode === "signin" ? "Bem-vindo de volta" : mode === "signup" ? "Primeiro acesso" : "Recuperar senha"}</h1>
        <p className="mt-2 text-muted-foreground">
          {mode === "signin" ? "Entre para continuar sua jornada." : "Informe seu email e enviaremos um link para criar sua senha."}
        </p>

        <Button onClick={google} variant="outline" className="mt-8 h-11">
          Continuar com Google
        </Button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> ou <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11" />
          </div>
          {mode === "signin" && (
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-11" />
          </div>
          )}
          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? "..." : mode === "signin" ? "Entrar" : "Enviar link"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "Primeiro acesso? Cadastre seu email" : "Já tem senha? Entrar"}
        </button>
        {mode === "signin" && (
          <button type="button" onClick={() => setMode("forgot")} className="mt-2 text-sm text-muted-foreground underline-offset-4 hover:underline">
            Esqueci minha senha
          </button>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("North Note — ajuda ou sugestão")}`}
            className="inline-flex items-center gap-2 underline-offset-4 hover:text-foreground hover:underline"
          >
            <Mail className="h-4 w-4" /> Precisa de ajuda? Fale com o suporte
          </a>
        </p>
      </main>
    </div>
  );
}
