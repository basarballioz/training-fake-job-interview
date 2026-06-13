"use client";

// Simple sessionStorage-based score tracker
// No database, no auth — just browser session storage

export interface SessionScore {
  recruiter?: number;
  github?: number;
  "package-json"?: number;
  "npm-install"?: number;
  base64?: number;
}

const KEY = "fia-scores";

export function saveScore(step: string, score: number) {
  if (typeof window === "undefined") return;
  try {
    const existing = getScores();
    const updated = { ...existing, [step]: score };
    sessionStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export function getScores(): SessionScore {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function clearScores() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

export function getTotalScore(): number {
  const scores = getScores();
  return Object.values(scores).reduce((a, b) => a + (b ?? 0), 0);
}
