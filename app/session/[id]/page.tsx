import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordingStudio } from "@/components/recording-studio";
import { SessionReview } from "@/components/session-review";

interface PageProps {
  params: { id: string };
}

export default async function SessionPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

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
    notFound();
  }

  if (podcastSession.status === "completed") {
    return (
      <SessionReview
        session={podcastSession}
        transcriptChunks={podcastSession.transcriptChunks}
        crewCards={podcastSession.crewCards}
      />
    );
  }

  return (
    <RecordingStudio
      sessionId={podcastSession.id}
      sessionTitle={podcastSession.title}
    />
  );
}
