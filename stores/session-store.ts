import { create } from "zustand";

export interface TranscriptChunk {
  id: string;
  text: string;
  timestamp: number;
}

export interface CrewCard {
  id: string;
  persona: string;
  content: string;
  source?: string;
  timestamp: number;
  pinned: boolean;
  isNew?: boolean;
}

interface SessionState {
  sessionId: string | null;
  transcript: TranscriptChunk[];
  crewCards: CrewCard[];
  isRecording: boolean;
  elapsedSeconds: number;
  accumulatedText: string;

  setSessionId: (id: string) => void;
  addTranscriptChunk: (chunk: TranscriptChunk) => void;
  addCrewCard: (card: CrewCard) => void;
  updateCrewCard: (id: string, updates: Partial<CrewCard>) => void;
  removeCrewCard: (id: string) => void;
  setRecording: (recording: boolean) => void;
  incrementElapsed: () => void;
  resetElapsed: () => void;
  appendAccumulatedText: (text: string) => void;
  clearAccumulatedText: () => void;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  transcript: [],
  crewCards: [],
  isRecording: false,
  elapsedSeconds: 0,
  accumulatedText: "",

  setSessionId: (id) => set({ sessionId: id }),

  addTranscriptChunk: (chunk) =>
    set((state) => ({
      transcript: [...state.transcript, chunk],
    })),

  addCrewCard: (card) =>
    set((state) => ({
      crewCards: [{ ...card, isNew: true }, ...state.crewCards],
    })),

  updateCrewCard: (id, updates) =>
    set((state) => ({
      crewCards: state.crewCards.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeCrewCard: (id) =>
    set((state) => ({
      crewCards: state.crewCards.filter((c) => c.id !== id),
    })),

  setRecording: (recording) => set({ isRecording: recording }),

  incrementElapsed: () =>
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 })),

  resetElapsed: () => set({ elapsedSeconds: 0 }),

  appendAccumulatedText: (text) =>
    set((state) => ({
      accumulatedText: state.accumulatedText
        ? `${state.accumulatedText} ${text}`
        : text,
    })),

  clearAccumulatedText: () => set({ accumulatedText: "" }),

  reset: () =>
    set({
      transcript: [],
      crewCards: [],
      isRecording: false,
      elapsedSeconds: 0,
      accumulatedText: "",
    }),
}));
