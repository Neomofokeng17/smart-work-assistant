import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  CalendarCheck,
  BookOpenText,
  MessagesSquare,
  Menu,
  Moon,
  Sun,
  Sparkles,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research", label: "Research Assistant", icon: BookOpenText },
  { to: "/chat", label: "AI Chat", icon: MessagesSquare },
] as const;

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("awpa:theme");
    const initial = stored === "dark" || stored === "light" ? stored : "light";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem("awpa:theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
      return next;
    });
  };

  return { theme, toggle };
}

export function AppShell({ children }: { children: ReactNode }) {
  const { theme, toggle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            title={label}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* soft blurred pink background shapes */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-24 top-1/3 size-[26rem] rounded-full bg-blush/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 size-80 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="flex min-h-screen">
        {/* desktop sidebar */}
        <aside
          className={cn(
            "hidden shrink-0 border-r border-border glass md:flex md:flex-col transition-[width] duration-300",
            collapsed ? "w-[76px]" : "w-64",
          )}
        >
          <div className="flex items-center gap-2 px-4 py-5">
            <div className="grid size-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            {!collapsed && <span className="text-sm font-semibold leading-tight">AI Workplace</span>}
          </div>
          {nav}
        </aside>

        {/* mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card">
              <div className="flex items-center justify-between px-4 py-5">
                <span className="text-sm font-semibold">AI Workplace</span>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="size-5" />
                </button>
              </div>
              {nav}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border glass px-4 py-3">
            <button
              className="grid size-9 place-items-center rounded-xl hover:bg-accent md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <button
              className="hidden size-9 place-items-center rounded-xl hover:bg-accent md:grid"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
            >
              <Menu className="size-5" />
            </button>
            <span className="truncate text-sm font-semibold">
              AI Workplace Productivity Assistant
            </span>
            <button
              className="ml-auto grid size-9 place-items-center rounded-xl hover:bg-accent"
              onClick={toggle}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </header>

          <div className="flex items-start gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-xs text-foreground">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <span>AI-generated content may contain errors; please review before use.</span>
          </div>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
