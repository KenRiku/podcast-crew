import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: { id: string };
}

const saveTranscriptSchema = z.object({
  text: z.string().min(1),
  timestamp: z.number(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = saveTranscriptSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const podcastSession = await prisma.podcastSession.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!podcastSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const chunk = await prisma.transcriptChunk.create({
      data: {
        sessionId: params.id,
        text: parsed.data.text,
        timestamp: parsed.data.timestamp,
      },
    });

    return NextResponse.json({ chunk }, { status: 201 });
  } catch (error) {
    console.error("Failed to save transcript:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
