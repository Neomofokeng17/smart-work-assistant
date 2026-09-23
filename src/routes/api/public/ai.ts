import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/public/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI is not configured for this app.", { status: 500 });
        }

        let body: { system?: string; messages?: Msg[]; prompt?: string };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return new Response("Invalid request.", { status: 400 });
        }

        const messages: Msg[] = Array.isArray(body.messages)
          ? body.messages.filter((m) => m && typeof m.content === "string")
          : body.prompt
            ? [{ role: "user", content: String(body.prompt) }]
            : [];

        if (messages.length === 0) {
          return new Response("Nothing to send to the assistant.", { status: 400 });
        }

        const input = messages.map((m) => ({
          role: m.role,
          content: [
            {
              type: m.role === "assistant" ? "output_text" : "input_text",
              text: m.content,
            },
          ],
        }));

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: "openai/gpt-6-astra",
            instructions: body.system ?? undefined,
            input,
            stream: true,
            store: false,
            reasoning: { effort: "low" },
          }),
        });

        if (!upstream.ok || !upstream.body) {
          const detail = await upstream.text().catch(() => "");
          const message =
            upstream.status === 429
              ? "Too many requests right now. Please try again in a moment."
              : upstream.status === 402
                ? "AI credits are exhausted for this workspace."
                : `The assistant could not respond (${upstream.status}). ${detail.slice(0, 300)}`;
          return new Response(message, { status: upstream.status || 500 });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        const reader = upstream.body.getReader();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async pull(controller) {
            const { done, value } = await reader.read();
            if (done) {
              controller.close();
              return;
            }
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const evt = JSON.parse(data) as { type?: string; delta?: string };
                if (evt.type === "response.output_text.delta" && evt.delta) {
                  controller.enqueue(encoder.encode(evt.delta));
                }
              } catch {
                /* ignore partial frames */
              }
            }
          },
          cancel(reason) {
            return reader.cancel(reason);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
