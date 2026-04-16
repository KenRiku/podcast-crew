import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SessionList } from "@/components/session-list";
import { NewSessionButton } from "@/components/new-session-button";
import { LogOut, Mic, User, Zap } from "lucide-react";
import { signOut } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, plan: true },
  });

  const sessions = await prisma.podcastSession.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { crewCards: true, transcriptChunks: true },
      },
    },
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <header
        className="border-b sticky top-0 z-50 backdrop-blur-sm"
        style={{ borderColor: "var(--border)", background: "rgba(13,13,15,0.95)" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: "var(--accent-blue)" }}
            >
              🎙️
            </div>
            <span className="font-bold tracking-tight">Podcast Crew</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {user?.email}
                </div>
              </div>
            </div>

            {user?.plan === "pro" && (
              <div
                className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(59,139,255,0.2)", color: "var(--accent-blue)" }}
              >
                PRO
              </div>
            )}

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all hover:bg-white/5"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome section */}
        <div className="flex items-start justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {sessions.length === 0
                ? "Start your first recording session below"
                : `You have ${sessions.length} recording session${sessions.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <NewSessionButton />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            {
              label: "Total Sessions",
              value: sessions.length,
              icon: <Mic className="w-4 h-4" />,
              color: "var(--accent-blue)",
            },
            {
              label: "AI Cards Generated",
              value: sessions.reduce((a, s) => a + s._count.crewCards, 0),
              icon: <Zap className="w-4 h-4" />,
              color: "var(--accent-yellow)",
            },
            {
              label: "Transcript Chunks",
              value: sessions.reduce((a, s) => a + s._count.transcriptChunks, 0),
              icon: "📝",
              color: "var(--accent-green)",
            },
            {
              label: "Plan",
              value: user?.plan === "pro" ? "Pro" : "Free",
              icon: <User className="w-4 h-4" />,
              color: user?.plan === "pro" ? "var(--accent-blue)" : "var(--text-secondary)",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-sm"
                style={{ background: `${stat.color}20`, color: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Sessions list */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Sessions</h2>
            {sessions.length > 0 && <NewSessionButton variant="small" />}
          </div>

          <SessionList sessions={sessions} />
        </div>
      </main>
    </div>
  );
}
