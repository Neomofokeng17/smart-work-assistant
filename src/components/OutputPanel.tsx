import { Copy, Download, RefreshCw, ChevronDown, ShieldCheck, Pencil, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export function OutputSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

export function OutputPanel({
  value,
  onChange,
  loading,
  streaming,
  error,
  prompt,
  onRegenerate,
  filename,
  emptyTitle,
  emptyHint,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  streaming?: boolean;
  error?: string | null;
  prompt: string;
  onRegenerate: () => void;
  filename: string;
  emptyTitle: string;
  emptyHint: string;
}) {
  const [editing, setEditing] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy — select the text and copy manually.");
    }
  };

  const download = () => {
    const blob = new Blob([value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded .txt file");
  };

  if (loading && !value) return <OutputSkeleton />;

  if (error && !value) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5">
        <p className="text-sm font-medium text-destructive">Something went wrong</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Button className="mt-4 rounded-xl" onClick={onRegenerate}>
          Try again
        </Button>
      </div>
    );
  }

  if (!value) return <EmptyState title={emptyTitle} hint={emptyHint} />;

  return (
    <div className="space-y-4 fade-in-up">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" className="rounded-xl" onClick={copy}>
          <Copy className="size-4" /> Copy
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-xl"
          onClick={onRegenerate}
          disabled={loading}
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Regenerate
        </Button>
        <Button size="sm" variant="secondary" className="rounded-xl" onClick={download}>
          <Download className="size-4" /> Download .txt
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="rounded-xl"
          onClick={() => setEditing((e) => !e)}
        >
          {editing ? <Eye className="size-4" /> : <Pencil className="size-4" />}
          {editing ? "Preview" : "Edit"}
        </Button>
      </div>

      {editing ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[360px] rounded-2xl font-mono text-sm"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5">
          <Markdown>{value}</Markdown>
          {streaming && (
            <span className="ml-0.5 inline-block h-4 w-2 animate-pulse rounded-sm bg-primary align-middle" />
          )}
        </div>
      )}

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
        Verification reminder: check names, dates, figures and claims before you send or share this.
      </p>

      <div className="rounded-2xl border border-border">
        <button
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
          onClick={() => setShowPrompt((s) => !s)}
        >
          View prompt used
          <ChevronDown className={`size-4 transition-transform ${showPrompt ? "rotate-180" : ""}`} />
        </button>
        {showPrompt && (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-t border-border p-4 text-xs text-muted-foreground">
            {prompt}
          </pre>
        )}
      </div>
    </div>
  );
}
