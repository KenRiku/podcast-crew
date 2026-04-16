# Podcast Crew - Claude Code Context

## Project Overview
Real-time AI podcast production assistant. Captures microphone audio, transcribes with Deepgram, and routes transcripts to 4 Claude AI personas in real-time.

## Key Architecture Decisions
- **Auth**: NextAuth v5 beta with JWT strategy. Session token verified in middleware via `jose`.
- **DB**: PostgreSQL on Neon via `@prisma/adapter-neon`. No `url` in schema.prisma datasource — configured via `prisma/prisma.config.ts`.
- **AI**: Anthropic Claude (`claude-opus-4-6`) with `thinking: { type: "enabled" }` and streaming.
- **Transcription**: Deepgram REST API (not WebSocket) — client records chunks with MediaRecorder, POSTs to `/api/sessions/[id]/transcribe`.
- **State**: Zustand store at `stores/session-store.ts` for recording state.

## Important Files
- `auth.ts` — NextAuth config
- `middleware.ts` — JWT verification with jose only
- `lib/prisma.ts` — Prisma client with Neon adapter
- `lib/anthropic.ts` — Anthropic client + persona definitions
- `app/api/sessions/[id]/crew/route.ts` — Main AI crew SSE endpoint
- `components/recording-studio.tsx` — Main recording UI
- `stores/session-store.ts` — Zustand store

## AI Model
Always use `claude-opus-4-6` with `thinking: { type: "enabled", budget_tokens: 2000 }`.

## Persona Colors
- Fact Checker: `#FF3B3B` (red)
- Context: `#3B8BFF` (blue)
- Comedy: `#FFB800` (yellow/amber)
- News: `#00CC66` (green)

## Commands
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npx prisma db push` — Push schema to database
- `npx prisma studio` — Open Prisma Studio
