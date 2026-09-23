import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { OutputPanel } from "@/components/OutputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { researchPrompt, streamAI, type ResearchInput } from "@/lib/ai";
import { bumpStat, saveHistory, uid } from "@/lib/storage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Assistant" },
      {
        name: "description",
        content: "Summarise a topic or pasted text into plain-language insights and recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant" },
      {
        property: "og:description",
        content: "Plain-language summaries, key insights, recommendations and key terms.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [form, setForm] = useState<ResearchInput>({ topic: "", text: "", goal: "" });
  const [output, setOutput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<ResearchInput | null>(null);

  const set = (k: keyof ResearchInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async (input: ResearchInput) => {
    if (!input.topic.trim() && !input.text.trim()) {
      toast.error("Add a topic or paste some text.");
      return;
    }
    last.current = input;
    const p = researchPrompt(input);
    setPrompt(p);
    setOutput("");
    setError(null);
    setLoading(true);
    try {
      const full = await streamAI(
        {
          system:
            "You are a careful research analyst. You never fabricate sources, statistics or citations.",
          messages: [{ role: "user", content: p }],
        },
        (d) => setOutput((o) => o + d),
      );
      bumpStat("research");
      saveHistory({
        id: uid(),
        tool: "research",
        title: input.topic.slice(0, 60) || "Pasted text summary",
        output: full,
        prompt: p,
        createdAt: Date.now(),
      });
      toast.success("Briefing ready");
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
      <h1 className="text-2xl font-bold md:text-3xl">AI Research Assistant</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Paste material or name a topic — get a plain-language briefing. Sources are never invented.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="glass h-fit space-y-4 rounded-2xl p-5">
          <div className="space-y-1.5">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              placeholder="e.g. Hybrid work policies in mid-size firms"
              value={form.topic}
              onChange={(e) => set("topic", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="text">Paste text (optional)</Label>
            <Textarea
              id="text"
              placeholder="Paste a report, article, meeting notes or email thread…"
              value={form.text}
              onChange={(e) => set("text", e.target.value)}
              className="min-h-52 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="goal">What do you need it for?</Label>
            <Input
              id="goal"
              placeholder="e.g. Brief my manager before Thursday"
              value={form.goal}
              onChange={(e) => set("goal", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Button className="w-full rounded-2xl" onClick={() => generate(form)} disabled={loading}>
            {loading ? "Analysing…" : "Summarise"}
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
          filename="research-brief"
          emptyTitle="Nothing summarised yet"
          emptyHint="Add a topic or paste text, then press Summarise."
        />
      </div>
    </AppShell>
  );
}
