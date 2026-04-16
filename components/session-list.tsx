"use client";

import Link from "next/link";
import { Clock, Mic, Zap, ChevronRight, Circle } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

interface SessionWithCount {
  id: string;
  title: string;
  status: string;
  duration: number | null;
  createdAt: Date;
  _count: {
    crewCards: number;
    transcriptChunks: number;
  };
}

interface SessionListProps {
  sessions: SessionWithCount[];
}

export function SessionList({ sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div
        className="rounded-2xl border p-12 text-center"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="text-4xl mb-4">🎙️</div>
        <h3 className="font-bold text-lg mb-2">No sessions yet</h3>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Start your first recording session to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/session/${session.id}`}
          className="group block rounded-xl border p-5 transition-all hover:scale-[1.01] hover:border-[var(--accent-blue)]"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="flex items-center gap-1.5 flex-shrink-0"
                  style={{
                    color: session.status === "recording" ? "var(--accent-red)" : "var(--accent-green)",
                  }}
                >
                  <Circle
                    className={`w-2 h-2 fill-current ${session.status === "recording" ? "animate-pulse" : ""}`}
                  />
                  <span className="text-xs font-bold uppercase">
                    {session.status === "recording" ? "Live" : "Completed"}
                  </span>
                </div>
                <h3 className="font-semibold truncate">{session.title}</h3>
              </div>

              <div
                className="flex items-center gap-4 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(session.createdAt)}
                </div>
                {session.duration !== null && (
                  <div className="flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    {formatDuration(session.duration)}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {session._count.crewCards} AI cards
                </div>
                <div className="flex items-center gap-1">
                  📝 {session._count.transcriptChunks} chunks
                </div>
              </div>
            </div>

            <ChevronRight
              className="w-5 h-5 flex-shrink-0 ml-4 transition-transform group-hover:translate-x-1"
              style={{ color: "var(--text-secondary)" }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
