"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TerminalWindow, StepProgress, AlertBox } from "@/components/terminal-ui";
import { GameProvider } from "@/lib/game-context";
import { getScores, clearScores } from "@/lib/scores";
import { cn } from "@/lib/utils";

const DEFENSE_TIPS = [
  {
    icon: "🔍",
    title: "Audit before you clone",
    desc: "Always check the GitHub profile age, commit history, and star count before touching any code.",
  },
  {
    icon: "📦",
    title: "Read package.json first",
    desc: "Look for postinstall, preinstall, and install scripts. Run npm install --ignore-scripts if in doubt.",
  },
  {
    icon: "🕵️",
    title: "Check every dependency",
    desc: "Search each package on npmjs.com. One typosquatted character can compromise your entire machine.",
  },
  {
    icon: "🔒",
    title: "Use a sandbox VM",
    desc: "Run suspicious code in a disposable VM or container with no access to real credentials.",
  },
  {
    icon: "🌍",
    title: "Block outbound traffic",
    desc: "Use a firewall or tools like Little Snitch to alert you when new processes connect to the internet.",
  },
  {
    icon: "🔑",
    title: "Rotate credentials immediately",
    desc: "If you ran untrusted code, immediately rotate all API keys, tokens, and SSH keys in your env.",
  },
];

const STEPS = [
  { key: "recruiter", label: "Recruiter Message", max: 100 },
  { key: "github", label: "GitHub Investigation", max: 100 },
  { key: "package-json", label: "package.json Audit", max: 100 },
  { key: "npm-install", label: "npm install Analysis", max: 100 },
  { key: "base64", label: "Base64 Challenge", max: 100 },
];

function getRating(score: number): { label: string; color: string; desc: string } {
  if (score >= 450) return {
    label: "SECURITY EXPERT",
    color: "text-terminal-green",
    desc: "You spotted every attack vector. You would be a nightmare for social engineers.",
  };
  if (score >= 300) return {
    label: "SECURITY AWARE",
    color: "text-terminal-cyan",
    desc: "Good instincts. You would catch most attacks with a bit more practice.",
  };
  if (score >= 150) return {
    label: "AT RISK",
    color: "text-terminal-amber",
    desc: "You missed several red flags. Review the techniques before your next interview.",
  };
  return {
    label: "COMPROMISED",
    color: "text-terminal-red",
    desc: "This attack would have succeeded. Study this demo again from the start.",
  };
}

function FinalScoreContent() {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({});
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getScores();
    const asRecord: Record<string, number> = {};
    Object.entries(saved).forEach(([k, v]) => {
      if (v !== undefined) asRecord[k] = v;
    });
    setScores(asRecord);
    setMounted(true);
  }, []);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxTotal = 500;

  useEffect(() => {
    if (!mounted || total === 0) return;
    let current = 0;
    const step = Math.max(1, Math.floor(total / 40));
    const interval = setInterval(() => {
      current = Math.min(current + step, total);
      setAnimatedTotal(current);
      if (current >= total) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [total, mounted]);

  const rating = getRating(total);
  const pct = Math.round((total / maxTotal) * 100);

  const handleRestart = () => {
    clearScores();
    router.push("/landing");
  };

  const handlePlayAgain = () => {
    clearScores();
    router.push("/recruiter");
  };

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="text-xs text-terminal-gray">
          <span className="text-terminal-green">▶</span> Step 6 of 6
        </div>
        <StepProgress current="final-score" />
      </div>

      {/* Score header */}
      <TerminalWindow title="simulation-report.txt" variant="success">
        <div className="text-center space-y-4 py-4">
          <div className="text-xs text-terminal-gray tracking-widest uppercase">
            Simulation Complete
          </div>

          <div className={cn("text-3xl md:text-4xl font-bold font-mono", rating.color)}>
            {rating.label}
          </div>

          <div className="text-5xl font-bold font-mono text-terminal-green green-glow">
            {animatedTotal}
            <span className="text-xl text-terminal-gray-light font-normal">/{maxTotal}</span>
          </div>

          {/* Progress bar */}
          <div className="mx-auto max-w-xs">
            <div className="h-3 bg-terminal-green-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${pct}%`,
                  background: total >= 450
                    ? "linear-gradient(90deg, #00cc33, #00ff41)"
                    : total >= 300
                      ? "linear-gradient(90deg, #00aacc, #00d4ff)"
                      : total >= 150
                        ? "linear-gradient(90deg, #cc8800, #ffb700)"
                        : "linear-gradient(90deg, #cc0000, #ff3333)",
                }}
              />
            </div>
            <div className="text-xs text-terminal-gray mt-1">{pct}% of maximum score</div>
          </div>

          <p className="text-terminal-gray-light text-sm max-w-sm mx-auto">
            {rating.desc}
          </p>
        </div>
      </TerminalWindow>

      {/* Step-by-step breakdown */}
      <TerminalWindow title="step-breakdown.log" variant="default">
        <div className="space-y-3">
          <div className="text-terminal-gray-light text-xs uppercase tracking-widest mb-4">
            Score Breakdown
          </div>
          {STEPS.map((step) => {
            const s = scores[step.key] ?? 0;
            const stepPct = Math.round((s / step.max) * 100);
            return (
              <div key={step.key} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-terminal-green-dim">{step.label}</span>
                  <span className={cn(
                    s === 0 ? "text-terminal-red" :
                      s >= 90 ? "text-terminal-green" :
                        "text-terminal-amber"
                  )}>
                    {s}/{step.max}
                  </span>
                </div>
                <div className="h-1.5 bg-terminal-green-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-terminal-green transition-all duration-700"
                    style={{ width: `${stepPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </TerminalWindow>

      {/* Defense tips */}
      <TerminalWindow title="how-to-defend-yourself.md" variant="success">
        <div className="space-y-4">
          <div className="text-terminal-green text-sm font-bold mb-4">
            How to Defend Against This Attack:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEFENSE_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="border border-terminal-border rounded p-3 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tip.icon}</span>
                  <span className="text-terminal-green text-xs font-bold">{tip.title}</span>
                </div>
                <p className="text-terminal-gray text-xs leading-relaxed">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </TerminalWindow>

      {/* Attack summary */}
      <AlertBox type="info" title="Attack Summary: The Fake Interview Supply Chain Attack">
        <div className="space-y-1 text-xs mt-2 leading-relaxed">
          <p>This attack, also called the IT Interview or Contagious Interview campaign,
            has been documented targeting developers on LinkedIn and job boards.</p>
          <p className="mt-2">The attacker creates a convincing recruiter profile, shares a GitHub
            repo disguised as a coding challenge, and hides credential-stealing code in npm
            lifecycle hooks. The code runs silently during npm install.</p>
          <p className="mt-2 text-terminal-amber">These attacks are not theoretical. Multiple software developers have been targeted through fake job offers and malicious coding assignments.</p>
        </div>
      </AlertBox>

      {/* Restart */}
      <div className="flex gap-3">
        <button
          onClick={handleRestart}
          className="flex-1 py-3 border border-terminal-gray text-terminal-gray font-mono
                     hover:border-terminal-green hover:text-terminal-green transition-all duration-200
                     text-xs tracking-widest uppercase rounded"
        >
          ↩ Back to Start
        </button>
        <button
          onClick={handlePlayAgain}
          className="flex-1 py-3 border border-terminal-green text-terminal-green font-mono
                     hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200
                     text-xs tracking-widest uppercase rounded"
        >
          ▶ Play Again
        </button>
      </div>

      <div className="text-center text-terminal-gray text-xs pb-4">
        Built for educational purposes only · No data collected · All payloads are inert
      </div>
    </main>
  );
}

export default function FinalScorePage() {
  return (
    <GameProvider>
      <FinalScoreContent />
    </GameProvider>
  );
}
