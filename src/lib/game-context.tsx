"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type StepId =
  | "landing"
  | "recruiter"
  | "github"
  | "package-json"
  | "npm-install"
  | "base64"
  | "final-score";

export interface RedFlag {
  id: string;
  step: StepId;
  description: string;
  found: boolean;
}

export interface GameState {
  currentStep: StepId;
  flagsFound: string[];
  totalFlags: number;
  stepScores: Record<string, number>;
}

interface GameContextType {
  state: GameState;
  foundFlag: (flagId: string) => void;
  setStep: (step: StepId) => void;
  addStepScore: (step: StepId, score: number) => void;
  totalScore: number;
  maxScore: number;
}

const GameContext = createContext<GameContextType | null>(null);

export const ALL_FLAGS: RedFlag[] = [
  // Recruiter flags
  { id: "recruiter-no-company", step: "recruiter", description: "Recruiter has no visible company affiliation", found: false },
  { id: "recruiter-urgency", step: "recruiter", description: "Artificial urgency ('respond within 24 hrs')", found: false },
  { id: "recruiter-github-link", step: "recruiter", description: "Suspicious GitHub link in unsolicited message", found: false },
  // GitHub flags
  { id: "github-new-account", step: "github", description: "Repository created < 2 weeks ago", found: false },
  { id: "github-no-history", step: "github", description: "No meaningful commit history", found: false },
  { id: "github-fork-count", step: "github", description: "0 stars, 0 forks — never used by anyone", found: false },
  // package.json flags
  { id: "pkg-postinstall", step: "package-json", description: "postinstall script runs automatically on npm install", found: false },
  { id: "pkg-obfuscated-dep", step: "package-json", description: "Unknown dependency with misspelled name", found: false },
  { id: "pkg-network-dep", step: "package-json", description: "Dependency that requests outbound network access", found: false },
  // npm install flags
  { id: "npm-outbound", step: "npm-install", description: "Package makes outbound HTTP request on install", found: false },
  { id: "npm-env-read", step: "npm-install", description: "Package reads environment variables", found: false },
  // Base64 flags
  { id: "base64-exfil", step: "base64", description: "Decoded payload shows credential exfiltration URL", found: false },
];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>({
    currentStep: "landing",
    flagsFound: [],
    totalFlags: ALL_FLAGS.length,
    stepScores: {},
  });

  const foundFlag = useCallback((flagId: string) => {
    setState((prev) => {
      if (prev.flagsFound.includes(flagId)) return prev;
      return { ...prev, flagsFound: [...prev.flagsFound, flagId] };
    });
  }, []);

  const setStep = useCallback((step: StepId) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const addStepScore = useCallback((step: StepId, score: number) => {
    setState((prev) => ({
      ...prev,
      stepScores: { ...prev.stepScores, [step]: score },
    }));
  }, []);

  const totalScore = Object.values(state.stepScores).reduce((a, b) => a + b, 0);
  const maxScore = 600;

  return (
    <GameContext.Provider value={{ state, foundFlag, setStep, addStepScore, totalScore, maxScore }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
