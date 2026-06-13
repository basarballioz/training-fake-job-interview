"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Terminal Window Shell ─────────────────────────────────────────────────
interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "danger" | "warning" | "success";
}

export function TerminalWindow({
  title = "terminal",
  children,
  className,
  variant = "default",
}: TerminalWindowProps) {
  const borderColor = {
    default: "border-terminal-border",
    danger: "border-terminal-red/50",
    warning: "border-terminal-amber/50",
    success: "border-terminal-green/30",
  }[variant];

  const dotColors = {
    default: ["bg-red-500", "bg-yellow-500", "bg-green-500"],
    danger: ["bg-terminal-red", "bg-terminal-red/50", "bg-terminal-red/30"],
    warning: ["bg-terminal-amber", "bg-terminal-amber/50", "bg-terminal-amber/30"],
    success: ["bg-terminal-green", "bg-terminal-green-dim", "bg-terminal-green-muted"],
  }[variant];

  return (
    <div className={cn("terminal-card border rounded overflow-hidden", borderColor, className)}>
      {/* Title bar */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-2 border-b",
        borderColor,
        "bg-black/30"
      )}>
        <div className="flex gap-1.5">
          {dotColors.map((c, i) => (
            <div key={i} className={cn("w-3 h-3 rounded-full", c)} />
          ))}
        </div>
        <span className="text-xs text-terminal-gray-light ml-2 tracking-widest uppercase">
          {title}
        </span>
      </div>
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}

// ─── Typewriter Text ───────────────────────────────────────────────────────
interface TypewriterProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
}

export function Typewriter({
  text,
  speed = 30,
  className,
  onComplete,
  showCursor = true,
}: TypewriterProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {showCursor && !done && (
        <span className="animate-blink">█</span>
      )}
    </span>
  );
}

// ─── Prompt Line ───────────────────────────────────────────────────────────
export function PromptLine({
  user = "user",
  host = "dev",
  path = "~",
  command,
  className,
}: {
  user?: string;
  host?: string;
  path?: string;
  command: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-0 font-mono text-sm", className)}>
      <span className="text-terminal-green-dim">{user}@{host}</span>
      <span className="text-terminal-gray">:</span>
      <span className="text-terminal-cyan">{path}</span>
      <span className="text-terminal-gray">$ </span>
      <span className="text-terminal-green">{command}</span>
    </div>
  );
}

// ─── Red Flag Badge ────────────────────────────────────────────────────────
export function RedFlagBadge({
  found,
  label,
  onClick,
}: {
  found: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={found}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded border text-sm font-mono transition-all duration-300 text-left w-full",
        found
          ? "border-terminal-red/60 bg-terminal-red/10 text-terminal-red cursor-default"
          : "border-terminal-gray/40 bg-transparent text-terminal-gray hover:border-terminal-amber/60 hover:text-terminal-amber cursor-pointer"
      )}
    >
      <span className="text-lg leading-none">{found ? "🚩" : "⬜"}</span>
      <span>{label}</span>
    </button>
  );
}

// ─── Score Bar ─────────────────────────────────────────────────────────────
export function ScoreBar({
  score,
  max,
  label,
}: {
  score: number;
  max: number;
  label?: string;
}) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-xs text-terminal-gray-light">
          <span>{label}</span>
          <span>{score}/{max}</span>
        </div>
      )}
      <div className="h-2 bg-terminal-green-muted rounded-full overflow-hidden">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Step Progress Header ──────────────────────────────────────────────────
const STEPS = [
  { id: "recruiter", label: "Recruiter" },
  { id: "github", label: "GitHub" },
  { id: "package-json", label: "package.json" },
  { id: "npm-install", label: "npm install" },
  { id: "base64", label: "Base64" },
  { id: "final-score", label: "Results" },
];

export function StepProgress({ current }: { current: string }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const past = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-xs font-mono whitespace-nowrap",
                active && "text-terminal-green bg-terminal-green-muted",
                past && "text-terminal-green-dim",
                !active && !past && "text-terminal-gray"
              )}
            >
              {past && <span>✓</span>}
              {active && <span className="animate-pulse">▶</span>}
              {!active && !past && <span>○</span>}
              <span>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={cn("text-xs", past ? "text-terminal-green-dim" : "text-terminal-gray")}>
                {" "}—{" "}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Alert Box ─────────────────────────────────────────────────────────────
export function AlertBox({
  type,
  title,
  children,
}: {
  type: "danger" | "warning" | "info" | "success";
  title: string;
  children: React.ReactNode;
}) {
  const styles = {
    danger: "border-terminal-red/50 bg-terminal-red/5 text-terminal-red",
    warning: "border-terminal-amber/50 bg-terminal-amber/5 text-terminal-amber",
    info: "border-terminal-cyan/50 bg-terminal-cyan/5 text-terminal-cyan",
    success: "border-terminal-green/50 bg-terminal-green/5 text-terminal-green",
  }[type];

  const icons = {
    danger: "⛔",
    warning: "⚠️",
    info: "ℹ️",
    success: "✅",
  }[type];

  return (
    <div className={cn("border rounded p-4 font-mono text-sm", styles)}>
      <div className="font-bold mb-1">
        {icons} {title}
      </div>
      <div className="opacity-90">{children}</div>
    </div>
  );
}
