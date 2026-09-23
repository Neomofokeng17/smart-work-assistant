import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/ping")({
  server: {
    handlers: {
      GET: () => new Response("pong"),
    },
  },
});
