"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/session-store";
import { Terminal } from "lucide-react";

export function TranscriptPanel() {
  const { transcript, isRecording } = useSessionStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div
      className="h-full flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b flex items-center gap-2 flex-shrink-0"
        style={{ borderColor: "var(--border)" }}
      >
        <Terminal className="w-4 h-4" style={{ color: "var(--accent-green)" }} />
        <span className="text-sm font-bold tracking-wider font-mono">LIVE TRANSCRIPT</span>
        {isRecording && (
          <div
            className="w-2 h-2 rounded-full recording-indicator ml-auto"
            style={{ background: "var(--accent-red)" }}
          />
        )}
      </div>

      {/* Transcript content */}
      <div
        className="flex-1 overflow-y-auto p-4 font-mono text-sm"
        style={{
          background: "var(--bg-primary)",
          color: "var(--accent-green)",
        }}
      >
        {/* Scanline overlay */}
        <div className="scanlines absolute inset-0 pointer-events-none opacity-30" />

        {transcript.length === 0 ? (
          <div
            className="h-full flex flex-col items-center justify-center"
            style={{ color: "var(--text-secondary)" }}
          >
            {isRecording ? (
              <div className="text-center">
                <div
                  className="text-2xl mb-3 font-mono"
                  style={{ color: "var(--accent-green)" }}
                >
                  RECORDING...
                </div>
                <p className="text-sm cursor-blink">Waiting for speech</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl mb-3">🎤</div>
                <p className="text-sm">Press START to begin recording</p>
                <p className="text-xs mt-2 opacity-60">
                  Transcript will appear here in real-time
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {transcript.map((chunk, i) => (
              <div key={chunk.id || i} className="flex gap-2 items-start group">
                <span
                  className="text-xs mt-0.5 flex-shrink-0 opacity-50"
                  style={{ color: "var(--accent-green)" }}
                >
                  {formatTime(chunk.timestamp)}
                </span>
                <p
                  className="leading-relaxed"
                  style={{
                    color: i === transcript.length - 1 ? "var(--accent-green)" : "var(--text-secondary)",
                  }}
                >
                  <span style={{ color: "var(--accent-green)", opacity: 0.5 }}>{">"} </span>
                  {chunk.text}
                </p>
              </div>
            ))}
            {isRecording && (
              <div className="flex gap-2 items-center">
                <span className="text-xs opacity-50">{formatTime(Date.now() / 1000)}</span>
                <span className="cursor-blink opacity-60" />
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
