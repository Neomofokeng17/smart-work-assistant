# AI Workplace Productivity Assistant

A modern, responsive AI-powered SaaS web application designed to help users work smarter, organise tasks, communicate professionally, and process information more efficiently.

The **AI Workplace Productivity Assistant** combines four workplace productivity tools in one interface: an AI email generator, task planner, research assistant, and contextual AI chatbot.

## Features

### Smart Email Generator
Generate professional, context-specific workplace emails.

- Recipient and purpose inputs
- Key points and context
- Formal, Friendly, and Persuasive tones
- Client, Manager, and Team audiences
- Editable subject and email body
- Copy, regenerate, and download options

### AI Task Planner
Turn tasks and deadlines into an organised schedule.

- Daily and weekly planning
- Deadline and importance analysis
- Eisenhower Matrix prioritisation
- Suggested task order
- Time-management recommendations
- Editable AI-generated plans

### AI Research Assistant
Transform complex information into clear, useful insights.

- Analyse a research topic or pasted text
- Plain-language summaries
- Key insights
- Recommendations
- Key-term explanations
- Designed to avoid fabricated sources and facts

### AI Chat
A contextual workplace AI assistant.

- Streamed AI responses
- Markdown rendering
- Conversation context
- Suggestion chips
- Typing and loading animations
- New chat functionality
- Conversation history

## AI Integration

The application uses **Lovable AI** to generate dynamic, context-specific responses based on user input.

Each AI tool uses structured prompts containing:

- Role
- User context
- Task
- Expected output format
- Constraints

Users can also expand **“View prompt used”** to understand the application-level instructions used to generate their response.

## Design

The interface follows a modern SaaS design system with:

- Dark Pink `#C2185B`
- Baby Pink `#F8BBD0`
- Light Background `#FFF7FA`
- Deep Plum Dark Background `#1A0B14`
- Inter typography
- Glassmorphism cards
- Gradient accents
- Responsive navigation
- Light and dark modes
- Skeleton loaders
- Hover and fade animations
- Mobile-responsive layouts

## Dashboard

The dashboard provides quick access to all productivity tools and displays estimated usage statistics including:

- Hours saved
- Tasks completed
- Emails drafted

Statistics are calculated from application usage rather than randomly generated values.

## Local Storage

No custom backend is required.

Local storage is used where appropriate to preserve:

- AI output history
- Chat conversations
- Usage statistics
- Theme preference

## AI Output Controls

Generated outputs can be:

- Edited
- Copied
- Regenerated
- Downloaded as `.txt`

The interface also includes loading states, error handling, empty states, and toast confirmations.

## Responsible AI

A persistent notice reminds users:

> **AI-generated content may contain errors; please review before use.**

AI outputs also include a verification reminder encouraging users to check important facts, dates, figures, and workplace information before relying on generated content.

The Research Assistant is instructed not to fabricate sources, references, or factual information.

## Built With

- Lovable
- Lovable AI
- React
- TypeScript
- Tailwind CSS
- Local Storage

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
