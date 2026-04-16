"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Zap, FileText, Download } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";

interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: number;
}

interface CrewCard {
  id: string;
  persona: string;
  content: string;
  source?: string | null;
  timestamp: number;
  pinned: boolean;
}

interface PodcastSession {
  id: string;
  title: string;
  status: string;
  duration: number | null;
  createdAt: Date;
}

interface SessionReviewProps {
  session: PodcastSession;
  transcriptChunks: TranscriptChunk[];
  crewCards: CrewCard[];
}

const PERSONA_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  "fact-checker": { icon: "🔍", label: "Fact Checker", color: "var(--fact-checker)" },
  context: { icon: "📚", label: "Context", color: "var(--context)" },
  comedy: { icon: "😂", label: "Comedy Writer", color: "var(--comedy)" },
  news: { icon: "📰", label: "News Anchor", color: "var(--news)" },
};

export function SessionReview({ session, transcriptChunks, crewCards }: SessionReviewProps) {
  const handleExport = () => {
    const content = [
      `Session: ${session.title}`,
      `Date: ${formatDate(session.createdAt)}`,
      session.duration ? `Duration: ${formatDuration(session.duration)}` : "",
      "",
      "=== TRANSCRIPT ===",
      "",
      transcriptChunks
        .map((c) => `[${formatTime(c.timestamp)}] ${c.text}`)
        .join("\n"),
      "",
      "=== AI CREW CARDS ===",
      "",
      crewCards
        .map((c) => {
          const p = PERSONA_CONFIG[c.persona];
          return `[${p?.label || c.persona}]\n${c.content}\n`;
        })
        .join("\n"),
    ]
      .filter(Boolean)
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.title.replace(/\s+/g, "-")}-${session.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCards = crewCards.length;
  const pinnedCards = crewCards.filter((c) => c.pinned).length;
  const fullTranscript = transcriptChunks.map((c) => c.text).join(" ");

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10 backdrop-blur-sm"
        style={{ borderColor: "var(--border)", background: "rgba(13,13,15,0.95)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-bold text-lg">{session.title}</h1>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                {formatDate(session.createdAt)}
                {session.duration ? ` · ${formatDuration(session.duration)}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(0,204,102,0.15)", color: "var(--accent-green)" }}
            >
              COMPLETED
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all hover:bg-white/5"
              style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Duration",
              value: session.duration ? formatDuration(session.duration) : "—",
              icon: <Clock className="w-4 h-4" />,
              color: "var(--accent-blue)",
            },
            {
              label: "Transcript Chunks",
              value: transcriptChunks.length,
              icon: <FileText className="w-4 h-4" />,
              color: "var(--accent-green)",
            },
            {
              label: "AI Cards",
              value: totalCards,
              icon: <Zap className="w-4 h-4" />,
              color: "var(--accent-yellow)",
            },
            {
              label: "Pinned Cards",
              value: pinnedCards,
              icon: "📌",
              color: "var(--accent-purple)",
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

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Transcript */}
          <div className="lg:col-span-3">
            <div
              className="rounded-xl border h-[600px] flex flex-col"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div
                className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0"
                style={{ borderColor: "var(--border)" }}
              >
                <FileText className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
                <span className="text-sm font-bold tracking-wider font-mono">TRANSCRIPT</span>
              </div>
              <div
                className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2"
                style={{ color: "var(--text-primary)" }}
              >
                {transcriptChunks.length === 0 ? (
                  <div
                    className="h-full flex items-center justify-center"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No transcript recorded
                  </div>
                ) : (
                  transcriptChunks.map((chunk) => (
                    <div key={chunk.id} className="flex gap-3 group">
                      <span
                        className="text-xs mt-0.5 flex-shrink-0 font-mono"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        [{formatTime(chunk.timestamp)}]
                      </span>
                      <p className="leading-relaxed" style={{ color: "var(--text-primary)" }}>
                        {chunk.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Crew Cards */}
          <div className="lg:col-span-2">
            <div
              className="rounded-xl border h-[600px] flex flex-col"
              style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
            >
              <div
                className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0"
                style={{ borderColor: "var(--border)" }}
              >
                <Zap className="w-4 h-4" style={{ color: "var(--accent-yellow)" }} />
                <span className="text-sm font-bold tracking-wider">AI CREW CARDS</span>
                <span
                  className="ml-auto text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(255,184,0,0.15)",
                    color: "var(--accent-yellow)",
                  }}
                >
                  {totalCards}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {crewCards.length === 0 ? (
                  <div
                    className="h-full flex items-center justify-center text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No crew cards generated
                  </div>
                ) : (
                  crewCards.map((card) => {
                    const p = PERSONA_CONFIG[card.persona] || PERSONA_CONFIG.context;
                    return (
                      <div
                        key={card.id}
                        className="rounded-xl border p-3"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: p.color,
                          borderLeftWidth: "3px",
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span>{p.icon}</span>
                          <span
                            className="text-xs font-bold"
                            style={{ color: p.color }}
                          >
                            {p.label.toUpperCase()}
                          </span>
                          <span
                            className="ml-auto text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatTime(card.timestamp)}
                          </span>
                          {card.pinned && <span className="text-xs">📌</span>}
                        </div>
                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                          {card.content}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
