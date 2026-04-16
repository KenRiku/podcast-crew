"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Mic } from "lucide-react";

interface NewSessionButtonProps {
  variant?: "default" | "small";
}

export function NewSessionButton({ variant = "default" }: NewSessionButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNewSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled Session" }),
      });

      if (!res.ok) throw new Error("Failed to create session");

      const data = await res.json();
      router.push(`/session/${data.id}`);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  if (variant === "small") {
    return (
      <button
        onClick={handleNewSession}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
        style={{ background: "var(--accent-blue)", color: "#fff" }}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        New Session
      </button>
    );
  }

  return (
    <button
      onClick={handleNewSession}
      disabled={isLoading}
      className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: "var(--accent-red)", color: "#fff" }}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
      {isLoading ? "Creating..." : "New Recording Session"}
    </button>
  );
}
