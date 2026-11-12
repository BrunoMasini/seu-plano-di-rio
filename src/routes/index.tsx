import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, GraduationCap, Briefcase, Home, Check, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "North Note — dê um norte para o seu dia" },
      { name: "description", content: "Notas e tarefas em um só lugar. Organize estudos, trabalho e vida pessoal com clareza e sem complicação." },
      { property: "og:title", content: "North Note — dê um norte para o seu dia" },
      { property: "og:description", content: "Notas e tarefas em um só lugar para estudantes, profissionais e o dia a dia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    key: "estudantes", label: "Estudantes", icon: GraduationCap,
    title: "Para Estudantes",
    text: "Organize aulas, revisões e prazos sem perder o foco.",
    items: ["Revisar capítulo 4 de Biologia", "Entregar trabalho de História — sexta", "Resumo de Cálculo I"],
  },
  {
    key: "profissionais", label: "Profissionais", icon: Briefcase,
    title: "Para Profissionais",
    text: "Priorize entregas, anote reuniões e conduza seus projetos com clareza.",
    items: ["Enviar relatório mensal", "Pauta da reunião de segunda", "Revisar proposta do cliente"],
  },
  {
    key: "pessoal", label: "Dia a dia", icon: Home,
    title: "Para o Dia a Dia",
    text: "De listas de mercado a metas pessoais, mantenha sua vida em ordem.",
    items: ["Comprar café e frutas", "Treino de 30 min", "Planejar a semana"],
  },
];

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!loading && user) navigate({ to: "/app" });
  }, [user, loading, navigate]);
  const p = PILLARS[active];

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-display text-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Compass className="h-4 w-4" /></span>
          North Note
        </div>
        <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">Entrar</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Star className="h-3 w-3 fill-star text-star" /> Clareza para a sua rotina
          </p>
          <h1 className="font-display text-5xl leading-[1.05] md:text-7xl">
            Dê um <span className="text-primary">norte</span> para o seu dia.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Suas notas e tarefas em um só lugar. Organize a rotina de forma simples, sem complicação — e saiba exatamente o que fazer agora.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/login" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90">
              Começar grátis
            </Link>
            <a href="#usos" className="rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary">
              Ver como usar
            </a>
          </div>
        </div>

        <section id="usos" className="mt-28">
          <h2 className="text-center font-display text-3xl md:text-4xl">Feito para cada parte da sua vida</h2>
          <div className="mt-8 flex justify-center gap-2">
            {PILLARS.map((x, i) => (
              <button key={x.key} onClick={() => setActive(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${i === active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                <x.icon className="h-4 w-4" /> {x.label}
              </button>
            ))}
          </div>
          <div className="mt-10 grid items-center gap-10 md:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl">{p.title}</h3>
              <p className="mt-3 text-lg text-muted-foreground">{p.text}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hoje</div>
              <ul className="space-y-3">
                {p.items.map((t, i) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${i === 0 ? "border-success bg-success text-primary-foreground" : "border-border"}`}>
                      {i === 0 && <Check className="h-3 w-3" />}
                    </span>
                    <span className={i === 0 ? "text-muted-foreground line-through" : ""}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-28 grid gap-4 md:grid-cols-3">
          {PILLARS.map((x) => (
            <div key={x.key} className="rounded-xl border border-border bg-card p-6">
              <x.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-display text-xl">{x.title}</h3>
              <p className="mt-2 text-muted-foreground">{x.text}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} North Note
        </div>
      </footer>
    </div>
  );
}
