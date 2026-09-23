import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { plannerPrompt, streamAI, type PlannerInput } from "@/lib/ai";
import { bumpStat, saveHistory, uid } from "@/lib/storage";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Turn tasks, deadlines and importance into an optimised schedule and Eisenhower Matrix.",
      },
      { property: "og:title", content: "AI Task Planner" },
      {
        property: "og:description",
        content: "Daily or weekly plans, priorities and time-management tips for your real workload.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const [form, setForm] = useState<PlannerInput>({
    tasks: "",
    horizon: "Daily",
    hours: "6",
    notes: "",
  });
  const [output, setOutput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<PlannerInput | null>(null);

  const set = (k: keyof PlannerInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async (input: PlannerInput) => {
    if (!input.tasks.trim()) {
      toast.error("Add at least one task first.");
      return;
    }
    last.current = input;
    const p = plannerPrompt(input);
    setPrompt(p);
    setOutput("");
    setError(null);
    setLoading(true);
    try {
      const full = await streamAI(
        {
          system: "You are a pragmatic productivity coach who builds realistic schedules.",
          messages: [{ role: "user", content: p }],
        },
        (d) => setOutput((o) => o + d),
      );
      bumpStat("plans");
      saveHistory({
        id: uid(),
        tool: "planner",
        title: `${input.horizon} plan`,
        output: full,
        prompt: p,
        createdAt: Date.now(),
      });
      toast.success("Schedule ready");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Generation failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-bold md:text-3xl">AI Task Planner</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        List what's on your plate — get a schedule, a matrix and clear priorities.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="glass h-fit space-y-4 rounded-2xl p-5">
          <div className="space-y-1.5">
            <Label htmlFor="tasks">Tasks, deadlines & importance</Label>
            <Textarea
              id="tasks"
              placeholder={
                "One per line:\n- Client proposal — due Friday — high\n- Expense claims — due today — low\n- Team 1:1 prep — tomorrow — medium"
              }
              value={form.tasks}
              onChange={(e) => set("tasks", e.target.value)}
              className="min-h-44 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Horizon</Label>
              <Select value={form.horizon} onValueChange={(v) => set("horizon", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Daily", "Weekly"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hours">Focus hours / day</Label>
              <Input
                id="hours"
                type="number"
                min={1}
                max={16}
                value={form.hours}
                onChange={(e) => set("hours", e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Constraints (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g. meetings 10–12, deep work best in the morning"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              className="min-h-24 rounded-xl"
            />
          </div>
          <Button className="w-full rounded-2xl" onClick={() => generate(form)} disabled={loading}>
            {loading ? "Planning…" : "Build my plan"}
          </Button>
        </div>

        <OutputPanel
          value={output}
          onChange={setOutput}
          loading={loading}
          streaming={loading}
          error={error}
          prompt={prompt}
          onRegenerate={() => generate(last.current ?? form)}
          filename="task-plan"
          emptyTitle="No plan yet"
          emptyHint="Add your tasks with deadlines and importance, then build the plan."
        />
      </div>
    </AppShell>
  );
}
