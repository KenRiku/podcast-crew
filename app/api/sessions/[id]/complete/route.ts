import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: { id: string };
}

const completeSchema = z.object({
  duration: z.number().int().optional(),
  title: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = completeSchema.safeParse(body);

    const podcastSession = await prisma.podcastSession.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!podcastSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const updateData: any = { status: "completed" };
    if (parsed.success) {
      if (parsed.data.duration !== undefined) updateData.duration = parsed.data.duration;
      if (parsed.data.title) updateData.title = parsed.data.title;
    }

    const updated = await prisma.podcastSession.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ session: updated });
  } catch (error) {
    console.error("Failed to complete session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
