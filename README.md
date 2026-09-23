# AI Productivity Hub

Build a polished, responsive SaaS web app called "AI Workplace Productivity Assistant". No custom backend. Use Lovable AI for real, context-specific, streamed responses, never canned or placeholder AI text. All buttons and features must work.

DESIGN: Palette: dark pink #C2185B (buttons, accents) and baby pink #F8BBD0 (highlights, dark-mode text). Light mode background #FFF7FA; dark mode background deep plum #1A0B14 with readable light text. Inter font, glassmorphism cards, gradient accents, rounded-2xl corners, soft shadows, animated gradient hero, soft blurred pink background shapes, hover-lift cards, fade-in transitions, skeleton loaders, empty states, light/dark toggle, collapsible sidebar, top bar, mobile-responsive layout.

DASHBOARD: Hero "Your AI workplace assistant" with quick-action buttons. Stat cards (hours saved, tasks completed, emails drafted) calculated from real usage and labelled as estimates. Feature cards linking to each tool.

TOOLS:

1. Smart Email Generator: recipient, purpose, key points, tone (Formal/Friendly/Persuasive), audience (Client/Manager/Team). Generate an editable subject and email.

2. AI Task Planner: tasks, deadlines, importance → daily/weekly optimised schedule, Eisenhower Matrix (urgent/important), priorities, time-management tips.

3. AI Research Assistant: topic or pasted text → simple-language summary, key insights, recommendations, key terms. Never fabricate sources or facts.

4. AI Chat: modern chat UI with streamed replies, markdown rendering, contextual memory, typing animation, suggestion chips, new chat, conversation history.

AI: Give each tool a structured dynamic prompt (role + user context + task + output format + constraints). Add a collapsible "View prompt used" on every output.

OUTPUTS: All generated content is editable with Copy, Regenerate and Download (.txt) actions. Include loading/error states and toast confirmations. Save history, stats, chats and theme in local storage.

RESPONSIBLE AI: Persistent banner: "AI-generated content may contain errors; please review before use." Add a short verification reminder below every AI output.

Build a functional app, not a mockup. Prioritise, in order: working AI generation, navigation, responsive layout, then visual polish.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/891e0213-c747-49c3-a429-ea00def7d299).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
