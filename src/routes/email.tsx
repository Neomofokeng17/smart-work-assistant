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
import { emailPrompt, streamAI, type EmailInput } from "@/lib/ai";
import { bumpStat, saveHistory, uid } from "@/lib/storage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Assistant" },
      {
        name: "description",
        content: "Generate a subject line and full email from a purpose, key points and tone.",
      },
      { property: "og:title", content: "Smart Email Generator" },
      {
        property: "og:description",
        content: "Draft on-tone workplace email in seconds, then edit, copy or download it.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  const [form, setForm] = useState<EmailInput>({
    recipient: "",
    purpose: "",
    keyPoints: "",
    tone: "Formal",
    audience: "Client",
  });
  const [output, setOutput] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastForm = useRef<EmailInput | null>(null);

  const set = (k: keyof EmailInput, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async (input: EmailInput) => {
    if (!input.purpose.trim()) {
      toast.error("Tell the assistant what the email is for.");
      return;
    }
    lastForm.current = input;
    const p = emailPrompt(input);
    setPrompt(p);
    setOutput("");
    setError(null);
    setLoading(true);
    try {
      const full = await streamAI(
        { system: "You write high-quality workplace email.", messages: [{ role: "user", content: p }] },
        (d) => setOutput((o) => o + d),
      );
      bumpStat("emails");
      saveHistory({
        id: uid(),
        tool: "email",
        title: input.purpose.slice(0, 60),
        output: full,
        prompt: p,
        createdAt: Date.now(),
      });
      toast.success("Email drafted");
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
      <h1 className="text-2xl font-bold md:text-3xl">Smart Email Generator</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Give the essentials — get an editable subject line and full email.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <div className="glass h-fit space-y-4 rounded-2xl p-5">
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              placeholder="e.g. Sarah Ndlovu, Head of Operations"
              value={form.recipient}
              onChange={(e) => set("recipient", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              placeholder="e.g. Request a two-week deadline extension"
              value={form.purpose}
              onChange={(e) => set("purpose", e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="points">Key points</Label>
            <Textarea
              id="points"
              placeholder={"One per line:\n- Scope grew after the last review\n- New date: 14 October"}
              value={form.keyPoints}
              onChange={(e) => set("keyPoints", e.target.value)}
              className="min-h-32 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tone</Label>
              <Select value={form.tone} onValueChange={(v) => set("tone", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Formal", "Friendly", "Persuasive"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => set("audience", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Client", "Manager", "Team"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            className="w-full rounded-2xl"
            onClick={() => generate(form)}
            disabled={loading}
          >
            {loading ? "Writing…" : "Generate email"}
          </Button>
        </div>

        <OutputPanel
          value={output}
          onChange={setOutput}
          loading={loading}
          streaming={loading}
          error={error}
          prompt={prompt}
          onRegenerate={() => generate(lastForm.current ?? form)}
          filename="email-draft"
          emptyTitle="No email yet"
          emptyHint="Fill in the purpose and key points, then hit Generate email."
        />
      </div>
    </AppShell>
  );
}
