import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, PERSONAS, PersonaKey } from "@/lib/anthropic";
import { z } from "zod";

interface RouteParams {
  params: { id: string };
}

const crewSchema = z.object({
  transcript: z.string().min(1),
  timestamp: z.number(),
});

async function searchTavily(query: string): Promise<string> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey) return "";

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query,
        search_depth: "basic",
        max_results: 3,
      }),
    });

    if (!response.ok) return "";

    const data = await response.json();
    const results = data.results || [];
    return results
      .slice(0, 3)
      .map((r: any) => `${r.title}: ${r.content?.slice(0, 200)}`)
      .join("\n\n");
  } catch {
    return "";
  }
}

async function extractTopic(transcript: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 50,
      messages: [
        {
          role: "user",
          content: `Extract the main topic from this podcast transcript in 5 words or less: "${transcript}"`,
        },
      ],
    });
    const textContent = response.content.find((c) => c.type === "text");
    return textContent?.text || transcript.slice(0, 100);
  } catch {
    return transcript.slice(0, 100);
  }
}

async function processPersona(
  personaKey: PersonaKey,
  transcript: string,
  sessionId: string,
  timestamp: number,
  searchResults?: string
): Promise<{
  persona: string;
  content: string;
  source?: string;
}> {
  const persona = PERSONAS[personaKey];

  const userContent =
    personaKey === "news" && searchResults
      ? `Transcript segment: "${transcript}"\n\nRecent news search results:\n${searchResults}`
      : `Transcript segment: "${transcript}"`;

  let fullContent = "";

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 500,
    thinking: { type: "enabled", budget_tokens: 2000 },
    system: persona.systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullContent += event.delta.text;
    }
  }

  // Save to DB
  await prisma.crewCard.create({
    data: {
      sessionId,
      persona: personaKey,
      content: fullContent,
      source: personaKey === "news" ? searchResults?.slice(0, 500) : undefined,
      timestamp,
    },
  });

  return {
    persona: personaKey,
    content: fullContent,
    source: personaKey === "news" ? searchResults?.slice(0, 500) : undefined,
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await request.json();
  const parsed = crewSchema.safeParse(body);

  if (!parsed.success) {
    return new Response("Invalid request", { status: 400 });
  }

  // Verify session ownership
  const podcastSession = await prisma.podcastSession.findUnique({
    where: { id: params.id, userId: session.user.id },
  });

  if (!podcastSession) {
    return new Response("Session not found", { status: 404 });
  }

  const { transcript, timestamp } = parsed.data;

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Get news search results in parallel with first AI call
        const topicPromise = extractTopic(transcript);
        const topic = await topicPromise;
        const searchResults = await searchTavily(topic);

        // Process all personas - run sequentially to avoid rate limits but send each as it completes
        const personaKeys: PersonaKey[] = ["fact-checker", "context", "comedy", "news"];

        for (const personaKey of personaKeys) {
          try {
            send({ persona: personaKey, status: "thinking" });

            const result = await processPersona(
              personaKey,
              transcript,
              params.id,
              timestamp,
              personaKey === "news" ? searchResults : undefined
            );

            send({
              persona: result.persona,
              content: result.content,
              source: result.source,
              timestamp,
              status: "done",
            });
          } catch (error) {
            console.error(`Error processing ${personaKey}:`, error);
            send({
              persona: personaKey,
              content: "I encountered an error processing this segment.",
              status: "error",
            });
          }
        }

        send({ status: "complete" });
      } catch (error) {
        console.error("Crew processing error:", error);
        send({ status: "error", message: "Failed to process crew" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
