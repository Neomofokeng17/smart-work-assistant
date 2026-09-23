import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ping2")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env["LOVABLE_API_KEY"];
        const t = Date.now();
        const r = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Lovable-API-Key": key ?? "" },
          body: JSON.stringify({ model: "openai/gpt-6-astra", input: "say hi", stream: false, store: false, reasoning: { effort: "low" } }),
        });
        const body = await r.text();
        return new Response(`key:${!!key} status:${r.status} ms:${Date.now() - t} ${body.slice(0, 200)}`);
      },
    },
  },
});
