"use client";

import { useState, useEffect } from "react";
import { Pin, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/stores/session-store";

interface CrewCardProps {
  id: string;
  persona: string;
  content: string;
  source?: string;
  timestamp: number;
  pinned: boolean;
  isNew?: boolean;
  isLoading?: boolean;
}

const PERSONA_CONFIG: Record<string, { icon: string; label: string; color: string; bgColor: string }> = {
  "fact-checker": {
    icon: "🔍",
    label: "FACT-CHECKER",
    color: "var(--fact-checker)",
    bgColor: "rgba(255, 59, 59, 0.08)",
  },
  context: {
    icon: "📚",
    label: "CONTEXT",
    color: "var(--context)",
    bgColor: "rgba(59, 139, 255, 0.08)",
  },
  comedy: {
    icon: "😂",
    label: "COMEDY WRITER",
    color: "var(--comedy)",
    bgColor: "rgba(255, 184, 0, 0.08)",
  },
  news: {
    icon: "📰",
    label: "NEWS ANCHOR",
    color: "var(--news)",
    bgColor: "rgba(0, 204, 102, 0.08)",
  },
};

export function CrewCard({
  id,
  persona,
  content,
  source,
  timestamp,
  pinned,
  isNew = false,
  isLoading = false,
}: CrewCardProps) {
  const { updateCrewCard, removeCrewCard } = useSessionStore();
  const config = PERSONA_CONFIG[persona] || PERSONA_CONFIG["context"];
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Auto-dismiss after 30s unless pinned
  useEffect(() => {
    if (pinned || isLoading) return;
    const timer = setTimeout(() => {
      if (!pinned) {
        setDismissed(true);
        setTimeout(() => removeCrewCard(id), 300);
      }
    }, 30000);
    return () => clearTimeout(timer);
  }, [pinned, id, isLoading, removeCrewCard]);

  const handlePin = () => {
    updateCrewCard(id, { pinned: !pinned });
  };

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => removeCrewCard(id), 300);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all duration-300",
        isNew && "slide-in-right",
        dismissed && "opacity-0 translate-x-4"
      )}
      style={{
        background: config.bgColor,
        borderColor: config.color,
        borderLeftWidth: "3px",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: `${config.color}30` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{config.icon}</span>
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
          {isLoading && (
            <Loader2
              className="w-3 h-3 animate-spin"
              style={{ color: config.color }}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isLoading && (
            <>
              <button
                onClick={handlePin}
                className="p-1 rounded transition-colors hover:bg-white/10"
                title={pinned ? "Unpin" : "Pin card"}
                style={{ color: pinned ? config.color : "var(--text-secondary)" }}
              >
                <Pin className="w-3 h-3" />
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded transition-colors hover:bg-white/10"
                style={{ color: "var(--text-secondary)" }}
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-3">
        {isLoading ? (
          <div className="space-y-2">
            <div
              className="h-2 rounded animate-pulse"
              style={{ background: `${config.color}30`, width: "80%" }}
            />
            <div
              className="h-2 rounded animate-pulse"
              style={{ background: `${config.color}20`, width: "60%" }}
            />
          </div>
        ) : (
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: "var(--text-primary)" }}
          >
            {content}
          </p>
        )}
      </div>

      {/* Pin indicator */}
      {pinned && !isLoading && (
        <div
          className="absolute top-0 right-0 w-0 h-0"
          style={{
            borderStyle: "solid",
            borderWidth: "0 16px 16px 0",
            borderColor: `transparent ${config.color} transparent transparent`,
          }}
        />
      )}
    </div>
  );
}
