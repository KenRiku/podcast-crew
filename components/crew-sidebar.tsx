"use client";

import { useSessionStore } from "@/stores/session-store";
import { CrewCard } from "./crew-card";
import { Loader2, Zap } from "lucide-react";

interface CrewSidebarProps {
  loadingPersonas?: Set<string>;
}

export function CrewSidebar({ loadingPersonas = new Set() }: CrewSidebarProps) {
  const { crewCards } = useSessionStore();

  const hasContent = crewCards.length > 0 || loadingPersonas.size > 0;

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--bg-secondary)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: "var(--accent-yellow)" }} />
          <span className="text-sm font-bold tracking-wider">AI CREW</span>
        </div>
        {loadingPersonas.size > 0 && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing...
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {!hasContent ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="text-4xl mb-4">🎙️</div>
            <p className="text-sm font-medium mb-2">Waiting for transcript</p>
            <p className="text-xs max-w-[180px]" style={{ color: "var(--text-secondary)" }}>
              Start recording and your AI crew will analyze your speech in real-time
            </p>

            {/* Persona legend */}
            <div className="mt-8 space-y-2 w-full max-w-[200px]">
              {[
                { icon: "🔍", label: "Fact Checker", color: "var(--fact-checker)" },
                { icon: "📚", label: "Context", color: "var(--context)" },
                { icon: "😂", label: "Comedy Writer", color: "var(--comedy)" },
                { icon: "📰", label: "News Anchor", color: "var(--news)" },
              ].map((p) => (
                <div key={p.label} className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: p.color }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    {p.icon} {p.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Loading placeholders */}
            {Array.from(loadingPersonas).map((persona) => (
              <CrewCard
                key={`loading-${persona}`}
                id={`loading-${persona}`}
                persona={persona}
                content=""
                timestamp={Date.now() / 1000}
                pinned={false}
                isLoading={true}
              />
            ))}

            {/* Actual cards */}
            {crewCards.map((card) => (
              <CrewCard
                key={card.id}
                id={card.id}
                persona={card.persona}
                content={card.content}
                source={card.source}
                timestamp={card.timestamp}
                pinned={card.pinned}
                isNew={card.isNew}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
