# Podcast Crew

A real-time AI production assistant for podcasters. Captures microphone audio, transcribes speech, and routes transcripts to 4 AI personas that surface relevant cards in a real-time sidebar.

## Features

- **Real-time transcription** via Deepgram
- **4 AI crew members** powered by Claude (Anthropic):
  - 🔍 Fact Checker
  - 📚 Context Provider
  - 😂 Comedy Writer
  - 📰 News Anchor
- **Authentication** via NextAuth v5 (credentials + Google OAuth)
- **Session history** with transcript and crew card review
- **Dark broadcast studio aesthetic**

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth v5
- PostgreSQL (Neon) via Prisma
- Anthropic Claude API
- Deepgram transcription
- Tavily news search
- Zustand state management

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in values
2. Run `npm install`
3. Run `npx prisma db push` to set up the database
4. Run `npm run dev`

## Environment Variables

See `.env.example` for all required environment variables.
