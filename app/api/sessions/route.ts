import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await prisma.podcastSession.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { crewCards: true, transcriptChunks: true },
        },
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const createSessionSchema = z.object({
  title: z.string().optional().default("Untitled Session"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = createSessionSchema.safeParse(body);

    const title = parsed.success ? parsed.data.title : "Untitled Session";

    const podcastSession = await prisma.podcastSession.create({
      data: {
        title,
        userId: session.user.id,
        status: "recording",
      },
    });

    return NextResponse.json({ id: podcastSession.id, session: podcastSession }, { status: 201 });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
