export type ChatMsg = { role: "user" | "assistant"; content: string };

const GUARDRAILS = `Constraints:
- Be accurate and specific to the user's context. Never invent facts, statistics, sources, citations, links or names.
- If information is missing, say what is missing instead of guessing.
- Do not add meta commentary about being an AI.`;

export async function streamAI(
  {
    system,
    messages,
  }: {
    system: string;
    messages: ChatMsg[];
  },
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/public/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "The assistant could not respond. Please try again.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      full += chunk;
      onDelta(chunk);
    }
  }
  if (!full.trim()) throw new Error("The assistant returned an empty response. Try again.");
  return full;
}

/* ---------- Prompt builders (role + context + task + format + constraints) ---------- */

export type EmailInput = {
  recipient: string;
  purpose: string;
  keyPoints: string;
  tone: string;
  audience: string;
};

export function emailPrompt(i: EmailInput) {
  return `Role: You are a senior workplace communication specialist who writes clear, effective business email.

User context:
- Recipient: ${i.recipient || "(not specified)"}
- Audience type: ${i.audience}
- Requested tone: ${i.tone}
- Purpose of the email: ${i.purpose}
- Key points that must appear:
${i.keyPoints || "(none provided)"}

Task: Write one complete, ready-to-send email that achieves the purpose, covers every key point, and matches the requested tone for this audience.

Output format (markdown, exactly this shape):
**Subject:** <one concise subject line>

<email body, including greeting, 2-4 short paragraphs or bullets, a clear call to action, and a sign-off>

${GUARDRAILS}
- Use [placeholders in square brackets] for any detail the user did not provide.`;
}

export type PlannerInput = { tasks: string; horizon: string; hours: string; notes: string };

export function plannerPrompt(i: PlannerInput) {
  return `Role: You are an expert productivity coach specialising in prioritisation and realistic scheduling.

User context:
- Planning horizon: ${i.horizon}
- Available focus hours per day: ${i.hours || "not specified"}
- Tasks with deadlines and importance:
${i.tasks}
- Extra constraints or notes: ${i.notes || "none"}

Task: Turn these tasks into a realistic optimised schedule, classify them in the Eisenhower Matrix, rank priorities, and give tailored time-management advice.

Output format (markdown, use these headings exactly):
## Optimised Schedule
(a markdown table with columns: Time / Slot, Task, Why now)
## Eisenhower Matrix
### Urgent & Important (do now)
### Important, Not Urgent (schedule)
### Urgent, Not Important (delegate)
### Neither (drop or defer)
## Priority Order
(numbered list of the tasks, most important first, one line of reasoning each)
## Time-Management Tips
(3-5 bullets that reference this specific workload)

${GUARDRAILS}
- Only schedule the tasks the user listed; do not invent extra work.`;
}

export type ResearchInput = { topic: string; text: string; goal: string };

export function researchPrompt(i: ResearchInput) {
  return `Role: You are a research analyst who explains complex material in plain, simple language.

User context:
- Topic: ${i.topic || "(derived from the pasted text)"}
- Why they need it: ${i.goal || "general understanding"}
- Source material provided by the user:
${i.text ? i.text.slice(0, 20000) : "(none - work from the topic and your general knowledge, and say clearly where verification is needed)"}

Task: Produce a clear briefing the user can act on.

Output format (markdown, use these headings exactly):
## Simple Summary
(3-5 short sentences, plain language, no jargon)
## Key Insights
(4-6 bullets)
## Recommendations
(3-5 practical, actionable bullets)
## Key Terms
(term - one-line definition, 4-6 items)

${GUARDRAILS}
- Never fabricate sources, citations, URLs, studies or statistics. If a claim needs a source, write "needs verification" instead of inventing one.
- When working only from the topic, clearly flag anything that should be independently checked.`;
}

export const CHAT_SYSTEM = `Role: You are the AI Workplace Productivity Assistant - a pragmatic, friendly workplace copilot for writing, planning, prioritising and analysing work.

Task: Answer the user's questions in context, remembering earlier turns of this conversation.

Output format: concise markdown. Use short paragraphs, bullets, tables or code blocks where they genuinely help. Lead with the answer, then detail.

${GUARDRAILS}`;
