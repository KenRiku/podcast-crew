"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mic, MicOff, Square, ArrowLeft, Clock, Loader2 } from "lucide-react";
import { useSessionStore } from "@/stores/session-store";
import { TranscriptPanel } from "./transcript-panel";
import { CrewSidebar } from "./crew-sidebar";
import { formatDuration } from "@/lib/utils";

interface RecordingStudioProps {
  sessionId: string;
  sessionTitle: string;
}

const CHUNK_INTERVAL_MS = 4000; // Record in 4-second chunks
const CREW_TRIGGER_WORDS = 3; // Trigger crew after N new transcript chunks

export function RecordingStudio({ sessionId, sessionTitle }: RecordingStudioProps) {
  const router = useRouter();
  const {
    isRecording,
    elapsedSeconds,
    accumulatedText,
    setSessionId,
    setRecording,
    incrementElapsed,
    resetElapsed,
    addTranscriptChunk,
    addCrewCard,
    appendAccumulatedText,
    clearAccumulatedText,
    reset,
  } = useSessionStore();

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [permissionError, setPermissionError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingPersonas, setLoadingPersonas] = useState<Set<string>>(new Set());
  const [isStopping, setIsStopping] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptCountRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setSessionId(sessionId);
    reset();
    return () => {
      stopAllTimers();
    };
  }, [sessionId]);

  const stopAllTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (chunkIntervalRef.current) clearInterval(chunkIntervalRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const updateMicLevel = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    setMicLevel(avg / 255);
    animFrameRef.current = requestAnimationFrame(updateMicLevel);
  }, []);

  const processAudioChunk = useCallback(
    async (blob: Blob) => {
      if (blob.size < 1000) return; // Skip tiny chunks

      try {
        const formData = new FormData();
        formData.append("audio", blob, "chunk.webm");

        const response = await fetch(`/api/sessions/${sessionId}/transcribe`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) return;

        const data = await response.json();
        const text = data.transcript?.trim();

        if (!text) return;

        const timestamp = elapsedSeconds;
        const chunkId = `chunk-${Date.now()}`;

        // Add to store
        addTranscriptChunk({ id: chunkId, text, timestamp });
        appendAccumulatedText(text);

        // Save to DB
        fetch(`/api/sessions/${sessionId}/transcript`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, timestamp }),
        }).catch(console.error);

        transcriptCountRef.current++;

        // Trigger crew every N chunks
        if (transcriptCountRef.current % CREW_TRIGGER_WORDS === 0) {
          triggerCrew(accumulatedText + " " + text, timestamp);
          clearAccumulatedText();
        }
      } catch (err) {
        console.error("Audio processing error:", err);
      }
    },
    [sessionId, elapsedSeconds, accumulatedText]
  );

  const triggerCrew = useCallback(
    async (transcript: string, timestamp: number) => {
      if (!transcript.trim() || isProcessing) return;

      setIsProcessing(true);
      setLoadingPersonas(new Set(["fact-checker", "context", "comedy", "news"]));

      try {
        const response = await fetch(`/api/sessions/${sessionId}/crew`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: transcript.trim(), timestamp }),
        });

        if (!response.ok || !response.body) {
          setLoadingPersonas(new Set());
          setIsProcessing(false);
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.status === "thinking") {
                // Keep loading state for this persona
              } else if (data.status === "done" && data.content) {
                setLoadingPersonas((prev) => {
                  const next = new Set(prev);
                  next.delete(data.persona);
                  return next;
                });
                addCrewCard({
                  id: `${data.persona}-${Date.now()}`,
                  persona: data.persona,
                  content: data.content,
                  source: data.source,
                  timestamp: data.timestamp || timestamp,
                  pinned: false,
                  isNew: true,
                });
              } else if (data.status === "error") {
                setLoadingPersonas((prev) => {
                  const next = new Set(prev);
                  next.delete(data.persona);
                  return next;
                });
              } else if (data.status === "complete") {
                setLoadingPersonas(new Set());
              }
            } catch {
              // Skip malformed SSE data
            }
          }
        }
      } catch (err) {
        console.error("Crew trigger error:", err);
        setLoadingPersonas(new Set());
      } finally {
        setIsProcessing(false);
      }
    },
    [sessionId, isProcessing, addCrewCard]
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyser for level meter
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      updateMicLevel();

      // Set up MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      resetElapsed();

      // Timer
      timerRef.current = setInterval(() => {
        incrementElapsed();
      }, 1000);

      // Chunk processing interval
      chunkIntervalRef.current = setInterval(() => {
        if (recorder.state === "recording") {
          recorder.stop();
          recorder.start();

          // Process accumulated chunks
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          chunksRef.current = [];
          processAudioChunk(blob);
        }
      }, CHUNK_INTERVAL_MS);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setPermissionError(
          "Microphone access denied. Please allow microphone access in your browser settings."
        );
      } else {
        setPermissionError("Failed to access microphone. Please try again.");
      }
    }
  };

  const stopRecording = async () => {
    setIsStopping(true);

    // Stop all timers
    stopAllTimers();

    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }

    setRecording(false);

    try {
      await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: elapsedSeconds }),
      });

      router.push(`/session/${sessionId}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to complete session:", err);
      setIsStopping(false);
    }
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Top Bar */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0 z-10"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-sm"
              style={{ background: "var(--accent-blue)" }}
            >
              🎙️
            </div>
            <span className="font-semibold text-sm hidden sm:block">{sessionTitle}</span>
          </div>
        </div>

        {/* Center: status + timer */}
        <div className="flex items-center gap-4">
          {isRecording && (
            <>
              <div className="flex items-center gap-2">
                {/* Mic level bars */}
                <div className="flex items-end gap-0.5 h-5">
                  {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-sm transition-all"
                      style={{
                        height: `${20 + i * 10}%`,
                        background:
                          micLevel >= threshold
                            ? "var(--accent-green)"
                            : "var(--border)",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                style={{
                  background: "rgba(255,59,59,0.15)",
                  color: "var(--accent-red)",
                  border: "1px solid rgba(255,59,59,0.3)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 recording-indicator" />
                LIVE
              </div>
            </>
          )}

          <div className="flex items-center gap-1.5 font-mono text-lg font-bold">
            <Clock className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
            <span>{formatDuration(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isStopping}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--accent-red)", color: "#fff" }}
            >
              <Mic className="w-4 h-4" />
              START RECORDING
            </button>
          ) : (
            <button
              onClick={stopRecording}
              disabled={isStopping}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            >
              {isStopping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {isStopping ? "Saving..." : "STOP"}
            </button>
          )}
        </div>
      </header>

      {/* Permission Error */}
      {permissionError && (
        <div
          className="mx-4 mt-3 p-3 rounded-lg text-sm border flex items-center gap-2"
          style={{
            background: "rgba(255,59,59,0.1)",
            borderColor: "rgba(255,59,59,0.3)",
            color: "var(--accent-red)",
          }}
        >
          <MicOff className="w-4 h-4 flex-shrink-0" />
          {permissionError}
        </div>
      )}

      {/* Main content: Transcript + Crew */}
      <div className="flex-1 flex overflow-hidden">
        {/* Transcript panel - 60% */}
        <div
          className="flex-1 min-w-0 border-r relative"
          style={{ borderColor: "var(--border)" }}
        >
          <TranscriptPanel />
        </div>

        {/* Crew sidebar - 40% */}
        <div className="w-80 xl:w-96 flex-shrink-0">
          <CrewSidebar loadingPersonas={loadingPersonas} />
        </div>
      </div>
    </div>
  );
}
