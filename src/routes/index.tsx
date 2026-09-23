import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  CalendarCheck,
  BookOpenText,
  MessagesSquare,
  Clock,
  CheckCircle2,
  Send,
  ArrowRight,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { EMPTY_STATS, STATS_KEY, estimatedHoursSaved, useLocalStorage, type Stats } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Draft emails, plan your week, summarise research and chat with an AI workplace assistant.",
      },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Your AI copilot for email, planning, research and everyday work questions.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Turn a purpose and a few bullet points into a polished, on-tone email.",
  },
  {
    to: "/planner",
    icon: CalendarCheck,
    title: "AI Task Planner",
    desc: "Optimised schedule, Eisenhower Matrix and priorities from your task list.",
  },
  {
    to: "/research",
    icon: BookOpenText,
    title: "AI Research Assistant",
    desc: "Plain-language summaries, insights and recommendations from any topic or text.",
  },
  {
    to: "/chat",
    icon: MessagesSquare,
    title: "AI Chat",
    desc: "Ask anything about your work, with streamed answers and conversation memory.",
  },
] as const;

function Dashboard() {
  const [stats] = useLocalStorage<Stats>(STATS_KEY, EMPTY_STATS);
  const tasksCompleted = stats.plans + stats.research;

  const cards = [
    {
      icon: Clock,
      label: "Hours saved",
      value: `${estimatedHoursSaved(stats)}`,
      hint: "Estimate based on your usage",
    },
    {
      icon: CheckCircle2,
      label: "Tasks completed",
      value: `${tasksCompleted}`,
      hint: "Plans & research briefs generated",
    },
    {
      icon: Send,
      label: "Emails drafted",
      value: `${stats.emails}`,
      hint: "Estimate based on your usage",
    },
  ];

  return (
    <AppShell>
      <section className="animated-gradient relative overflow-hidden rounded-3xl border border-border p-8 md:p-12 fade-in-up">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
          <span className="gradient-text">Your AI workplace assistant</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          Write better email, plan a realistic week, understand dense material fast — all in one
          place, with answers streamed live.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild className="rounded-2xl">
            <Link to="/email">
              Draft an email <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" className="rounded-2xl">
            <Link to="/planner">Plan my day</Link>
          </Button>
          <Button asChild variant="secondary" className="rounded-2xl">
            <Link to="/research">Summarise something</Link>
          </Button>
          <Button asChild variant="secondary" className="rounded-2xl">
            <Link to="/chat">Start a chat</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="glass hover-lift rounded-2xl p-5 fade-in-up">
            <div className="flex items-center gap-2 text-muted-foreground">
              <c.icon className="size-4 text-primary" />
              <span className="text-xs font-medium uppercase tracking-wide">{c.label}</span>
            </div>
            <p className="mt-3 text-3xl font-semibold">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="glass hover-lift group rounded-2xl p-6 fade-in-up"
          >
            <div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary">
              <t.icon className="size-5" />
            </div>
            <h2 className="mt-4 text-base font-semibold">{t.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
