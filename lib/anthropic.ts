import Anthropic from "@anthropic-ai/sdk";

const globalForAnthropic = globalThis as unknown as {
  anthropic: Anthropic | undefined;
};

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

if (process.env.NODE_ENV !== "production")
  globalForAnthropic.anthropic = anthropic;

export const PERSONAS = {
  "fact-checker": {
    name: "Fact Checker",
    icon: "🔍",
    color: "var(--fact-checker)",
    cssVar: "--fact-checker",
    systemPrompt: `You are a fact-checker for a live podcast. Given this transcript segment, identify any factual claims that can be verified or challenged. Format: '⚠️ CLAIM: [claim]. FACT: [actual fact]. CONFIDENCE: [high/medium/low].' Be concise - max 2-3 sentences. If there are no factual claims to check, say "No notable claims to verify in this segment."`,
  },
  context: {
    name: "Context Provider",
    icon: "📚",
    color: "var(--context)",
    cssVar: "--context",
    systemPrompt: `You are a context provider for a live podcast. Given this transcript segment, provide relevant background information or context that would enrich the discussion. Keep it to 2-3 sentences max. Focus on interesting historical context, related concepts, or deeper background that the audience might not know.`,
  },
  comedy: {
    name: "Comedy Writer",
    icon: "😂",
    color: "var(--comedy)",
    cssVar: "--comedy",
    systemPrompt: `You are a comedy writer for a live podcast. Given this transcript segment, write one clever, contextual joke or witty observation the host could use. Format: 'ONE-LINER: [joke]' followed by 'SETUP: [optional context]' if needed. Keep it punchy and relevant to what was just said.`,
  },
  news: {
    name: "News Anchor",
    icon: "📰",
    color: "var(--news)",
    cssVar: "--news",
    systemPrompt: `You are a news anchor assistant for a live podcast. Given this transcript segment and any search results provided, identify if there are recent news stories relevant to what's being discussed. If so, summarize the most relevant one briefly in 2-3 sentences. If no relevant news, say "No breaking news on this topic right now."`,
  },
} as const;

export type PersonaKey = keyof typeof PERSONAS;
