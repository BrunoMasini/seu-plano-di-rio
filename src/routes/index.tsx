import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Norte — clareza para sua mentoria" },
      { name: "description", content: "Saiba o que fazer hoje e onde quer chegar. Tarefas, metas, lembretes e notas em um só lugar." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="font-display text-2xl tracking-tight">Norte<span className="text-muted-foreground">.</span></div>
        <Link to="/login" className="text-sm underline-offset-4 hover:underline">Entrar</Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-20 pb-32">
        <p className="mb-6 text-xs uppercase tracking-[0.25em] text-muted-foreground">Para sua mentoria</p>
        <h1 className="font-display text-6xl leading-[0.95] md:text-8xl">
          Saiba o que fazer <em>hoje</em>.
          <br />E onde quer chegar.
        </h1>
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Um caderno digital silencioso para tarefas do dia, metas de curto e médio prazo,
          lembretes e notas da mentoria. Sem ruído.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/login" className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
            Começar agora
          </Link>
          <a href="#features" className="rounded-md border border-border px-6 py-3 text-sm font-medium hover:bg-secondary">
            Como funciona
          </a>
        </div>

        <section id="features" className="mt-32 grid grid-cols-1 gap-12 border-t border-border pt-16 md:grid-cols-2">
          {[
            { n: "01", t: "Tarefas de hoje", d: "Liste o que precisa sair do papel agora. Marque conforme termina." },
            { n: "02", t: "Metas curto/médio prazo", d: "Defina objetivos com prazo e acompanhe progresso visualmente." },
            { n: "03", t: "Lembretes & agenda", d: "Programe encontros, deadlines e rituais da mentoria." },
            { n: "04", t: "Notas da mentoria", d: "Capture insights, perguntas e aprendizados em um lugar limpo." },
          ].map((f) => (
            <div key={f.n}>
              <div className="font-display text-3xl text-muted-foreground">{f.n}</div>
              <h3 className="mt-2 font-display text-2xl">{f.t}</h3>
              <p className="mt-2 text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Norte
        </div>
      </footer>
    </div>
  );
}
