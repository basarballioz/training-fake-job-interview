"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  TerminalWindow,
  RedFlagBadge,
  AlertBox,
  StepProgress,
} from "@/components/terminal-ui";
import { GameProvider, useGame } from "@/lib/game-context";
import { saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

const FLAGS = [
  { id: "github-new-account", label: "Account created only 11 days ago" },
  { id: "github-no-history", label: "Only 1 commit — 'Initial commit'" },
  { id: "github-fork-count", label: "0 stars · 0 forks · never used by anyone" },
];

function GitHubContent() {
  const router = useRouter();
  const { foundFlag, addStepScore } = useGame();
  const [revealed, setRevealed] = useState<string[]>([]);

  const handleFlagClick = (id: string) => {
    if (revealed.includes(id)) return;
    foundFlag(id);
    setRevealed((prev) => [...prev, id]);
  };

  const handleNext = () => {
    const score = revealed.length * 33;
    const capped = Math.min(100, score);
    addStepScore("github", capped);
    saveScore("github", capped);
    router.push("/package-json");
  };

  const allFound = FLAGS.every((f) => revealed.includes(f.id));

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="text-xs text-terminal-gray">
          <span className="text-terminal-green">▶</span> Step 2 of 6
        </div>
        <StepProgress current="github" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-terminal-amber text-xl font-bold">
          🔍 GitHub Repository Investigation
        </h2>
        <p className="text-terminal-gray text-sm">
          You opened the GitHub link. Spot the warning signs before cloning.
        </p>
      </div>

      {/* Fake GitHub repo UI */}
      <TerminalWindow title="github.com/jrichardson-dev2024/interview-challenge-frontend" variant="warning">
        {/* Repo header */}
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="text-xs text-terminal-gray">
            <span className="text-terminal-cyan hover:underline cursor-pointer">jrichardson-dev2024</span>
            <span> / </span>
            <span className="text-terminal-green font-bold">interview-challenge-frontend</span>
          </div>

          {/* Stats bar */}
          <div className="flex flex-wrap gap-4 text-xs">
            <span
              className={cn(
                "flex items-center gap-1 cursor-pointer rounded px-2 py-1 border transition-all",
                revealed.includes("github-fork-count")
                  ? "border-terminal-red/60 bg-terminal-red/10 text-terminal-red"
                  : "border-terminal-border text-terminal-gray hover:border-terminal-amber/50"
              )}
              onClick={() => handleFlagClick("github-fork-count")}
              title="Click to investigate"
            >
              ⭐ <strong>0</strong> stars &nbsp;·&nbsp; 🍴 <strong>0</strong> forks &nbsp;·&nbsp; 👁 <strong>1</strong> watching
            </span>
          </div>

          {/* Account info */}
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded border cursor-pointer transition-all",
              revealed.includes("github-new-account")
                ? "border-terminal-red/60 bg-terminal-red/5"
                : "border-terminal-border hover:border-terminal-amber/50"
            )}
            onClick={() => handleFlagClick("github-new-account")}
            title="Click to investigate"
          >
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              JR
            </div>
            <div>
              <div className="text-terminal-green text-sm font-bold">jrichardson-dev2024</div>
              <div className="text-terminal-gray text-xs">
                Member since <span className="text-terminal-amber">11 days ago</span> &nbsp;·&nbsp; 
                <span className="text-terminal-amber"> 1 repository</span>
              </div>
            </div>
          </div>

          {/* Commit history */}
          <div
            className={cn(
              "p-3 rounded border cursor-pointer transition-all",
              revealed.includes("github-no-history")
                ? "border-terminal-red/60 bg-terminal-red/5"
                : "border-terminal-border hover:border-terminal-amber/50"
            )}
            onClick={() => handleFlagClick("github-no-history")}
            title="Click to investigate"
          >
            <div className="text-terminal-gray-light text-xs uppercase tracking-wider mb-2">Commit History</div>
            <div className="flex items-center justify-between">
              <div className="text-terminal-green text-sm">
                📝 Initial commit
              </div>
              <div className="text-terminal-gray text-xs">
                <span className="text-terminal-amber">1 commit</span> &nbsp;·&nbsp; 9 days ago
              </div>
            </div>
            <div className="text-terminal-gray text-xs mt-1">
              by jrichardson-dev2024 &nbsp;|&nbsp; <span className="font-mono">a3f7c2d</span>
            </div>
          </div>

          {/* File tree */}
          <div className="terminal-card border border-terminal-border p-4 font-mono text-sm">
            <div className="text-terminal-gray-light text-xs uppercase tracking-wider mb-3">Repository Files</div>
            <div className="space-y-1.5 text-sm">
              {[
                { icon: "📄", name: "README.md", size: "1.2 KB" },
                { icon: "📦", name: "package.json", size: "876 B", highlight: true },
                { icon: "📁", name: "src/", size: "" },
                { icon: "  📄", name: "src/index.js", size: "234 B" },
                { icon: "  📄", name: "src/setup.js", size: "3.4 KB", highlight: true },
                { icon: "📄", name: ".npmrc", size: "128 B" },
              ].map((f) => (
                <div key={f.name} className={cn(
                  "flex justify-between items-center",
                  f.highlight ? "text-terminal-amber" : "text-terminal-gray-light"
                )}>
                  <span>{f.icon} {f.name}</span>
                  {f.size && <span className="text-terminal-gray text-xs">{f.size}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* README excerpt */}
          <div className="terminal-card border border-terminal-border p-4 text-sm">
            <div className="text-terminal-gray-light text-xs uppercase tracking-wider mb-3">README.md</div>
            <div className="text-terminal-green-dim space-y-2">
              <p className="text-terminal-green font-bold text-base">Frontend Interview Challenge</p>
              <p>Welcome! Please complete the following steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-terminal-gray-light">
                <li>Clone this repository</li>
                <li>Run <code className="text-terminal-amber bg-black/40 px-1 rounded">npm install</code></li>
                <li>Run <code className="text-terminal-amber bg-black/40 px-1 rounded">npm run dev</code></li>
                <li>Complete the task described in <code className="text-terminal-cyan">src/index.js</code></li>
                <li>Submit a PR with your solution</li>
              </ol>
              <p className="text-terminal-gray text-xs pt-2">
                The setup script will configure your local environment automatically. 
                This is standard practice for our dev setup.
              </p>
            </div>
          </div>
        </div>
      </TerminalWindow>

      {/* Flag finder */}
      <TerminalWindow title="red-flag-detector.sh" variant="danger">
        <div className="space-y-3">
          <div className="text-terminal-red text-xs uppercase tracking-widest mb-3">
            Click suspicious elements above, or check flags below:
          </div>
          {FLAGS.map((flag) => (
            <RedFlagBadge
              key={flag.id}
              found={revealed.includes(flag.id)}
              label={flag.label}
              onClick={() => handleFlagClick(flag.id)}
            />
          ))}
        </div>
      </TerminalWindow>

      {allFound && (
        <AlertBox type="warning" title="Repository analysis complete">
          <div className="space-y-1 text-xs mt-2">
            <p>🚩 Legitimate companies don't create fresh GitHub accounts for interviews.</p>
            <p>🚩 A single "Initial commit" suggests the repo was just created as a lure.</p>
            <p>🚩 Zero community engagement means no one has safely vetted this code.</p>
          </div>
        </AlertBox>
      )}

      <button
        onClick={handleNext}
        className="w-full py-3 border border-terminal-green text-terminal-green font-mono
                   hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200
                   text-sm tracking-widest uppercase rounded"
      >
        Open package.json →
      </button>
    </main>
  );
}

export default function GitHubPage() {
  return (
    <GameProvider>
      <GitHubContent />
    </GameProvider>
  );
}
