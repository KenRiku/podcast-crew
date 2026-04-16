import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const podcastSession = await prisma.podcastSession.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: {
        transcriptChunks: {
          orderBy: { timestamp: "asc" },
        },
        crewCards: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!podcastSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: podcastSession });
  } catch (error) {
    console.error("Failed to fetch session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSessionSchema = z.object({
  title: z.string().optional(),
  status: z.enum(["recording", "completed"]).optional(),
  duration: z.number().int().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const podcastSession = await prisma.podcastSession.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!podcastSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updated = await prisma.podcastSession.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("Failed to update session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
