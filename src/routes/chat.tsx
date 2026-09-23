import { createFileRoute } from "@tanstack/react-router";
import { Plus, Send, Trash2, ShieldCheck, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CHAT_SYSTEM, streamAI, type ChatMsg } from "@/lib/ai";
import { bumpStat, readLS, uid, writeLS } from "@/lib/storage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — AI Workplace Assistant" },
      {
        name: "description",
        content: "Chat with a workplace AI assistant. Streamed answers, markdown and memory.",
      },
      { property: "og:title", content: "AI Chat" },
      {
        property: "og:description",
        content: "Ask work questions and get streamed, context-aware answers.",
      },
    ],
  }),
  component: ChatPage,
});

type Conversation = { id: string; title: string; messages: ChatMsg[]; updatedAt: number };

const KEY = "awpa:chats";

const SUGGESTIONS = [
  "Summarise this week's priorities for a busy manager",
  "Help me say no to a meeting politely",
  "Turn these notes into clear action items",
  "How do I structure a project status update?",
];

function ChatPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = readLS<Conversation[]>(KEY, []);
    setConvos(stored);
    setActiveId(stored[0]?.id ?? null);
  }, []);

  const persist = (next: Conversation[]) => {
    setConvos(next);
    writeLS(KEY, next.slice(0, 30));
  };

  const active = convos.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streaming]);

  const newChat = () => {
    setActiveId(null);
    setInput("");
    setError(null);
  };

  const removeChat = (id: string) => {
    const next = convos.filter((c) => c.id !== id);
    persist(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
    toast.success("Conversation deleted");
  };

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || streaming) return;

    let convo = active;
    let list = convos;
    if (!convo) {
      convo = { id: uid(), title: content.slice(0, 48), messages: [], updatedAt: Date.now() };
      list = [convo, ...convos];
      setActiveId(convo.id);
      bumpStat("chats");
    }

    const withUser: ChatMsg[] = [...convo.messages, { role: "user", content }];
    const convoId = convo.id;
    const update = (msgs: ChatMsg[]) => {
      list = list.map((c) => (c.id === convoId ? { ...c, messages: msgs, updatedAt: Date.now() } : c));
      persist(list);
    };

    update(withUser);
    setInput("");
    setError(null);
    setStreaming(true);

    let acc = "";
    try {
      await streamAI({ system: CHAT_SYSTEM, messages: withUser }, (d) => {
        acc += d;
        update([...withUser, { role: "assistant", content: acc }]);
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "The assistant could not respond.";
      setError(msg);
      toast.error(msg);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass h-fit rounded-2xl p-3">
          <Button className="w-full rounded-xl" onClick={newChat}>
            <Plus className="size-4" /> New chat
          </Button>
          <div className="mt-3 space-y-1">
            {convos.length === 0 && (
              <p className="px-2 py-4 text-xs text-muted-foreground">No conversations yet.</p>
            )}
            {convos.map((c) => (
              <div
                key={c.id}
                className={cn(
                  "group flex items-center gap-2 rounded-xl px-3 py-2 text-sm",
                  c.id === activeId ? "bg-primary/15 text-primary" : "hover:bg-accent",
                )}
              >
                <button
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  onClick={() => setActiveId(c.id)}
                >
                  <MessageSquare className="size-3.5 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
                <button onClick={() => removeChat(c.id)} aria-label="Delete conversation">
                  <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </aside>

        <section className="glass flex min-h-[70vh] flex-col rounded-2xl p-4">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
                <h1 className="text-xl font-semibold">Ask me anything about your work</h1>
                <p className="max-w-sm text-sm text-muted-foreground">
                  I remember the conversation, so you can keep refining an answer.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex fade-in-up", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card",
                  )}
                >
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <Markdown>{m.content}</Markdown>
                  )}
                </div>
              </div>
            ))}

            {streaming && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl border border-border bg-card px-4 py-3">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="size-2 animate-bounce rounded-full bg-primary"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div ref={endRef} />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Message your assistant…  (Enter to send, Shift+Enter for a new line)"
                className="max-h-40 min-h-[52px] flex-1 rounded-2xl"
              />
              <Button
                className="size-[52px] shrink-0 rounded-2xl"
                onClick={() => send(input)}
                disabled={streaming || !input.trim()}
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Verification reminder: double-check facts and figures before acting on a reply.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
