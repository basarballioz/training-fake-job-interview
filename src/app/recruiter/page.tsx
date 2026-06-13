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
  { id: "recruiter-no-company", label: "No company name or LinkedIn company page" },
  { id: "recruiter-urgency", label: "Artificial urgency — 'respond within 24 hours'" },
  { id: "recruiter-github-link", label: "Suspicious GitHub link sent via cold DM" },
];

function RecruiterContent() {
  const router = useRouter();
  const { foundFlag, state, addStepScore } = useGame();
  const [revealed, setRevealed] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleFlagClick = (id: string) => {
    if (revealed.includes(id)) return;
    foundFlag(id);
    setRevealed((prev) => [...prev, id]);
  };

  const handleNext = () => {
    const score = revealed.length * 33;
    const capped = Math.min(100, score);
    addStepScore("recruiter", capped);
    saveScore("recruiter", capped);
    router.push("/github");
  };

  const allFound = FLAGS.every((f) => revealed.includes(f.id));

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-6">
      {/* Top nav */}
      <div className="space-y-2">
        <div className="text-xs text-terminal-gray">
          <span className="text-terminal-green">▶</span> Step 1 of 6
        </div>
        <StepProgress current="recruiter" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-terminal-amber text-xl font-bold">
          ⚠ Suspicious LinkedIn Message
        </h2>
        <p className="text-terminal-gray text-sm">
          You received this message from a recruiter. Find the red flags.
        </p>
      </div>

      {/* Fake LinkedIn DM */}
      <TerminalWindow title="linkedin.com — Direct Message" variant="warning">
        {/* Fake LinkedIn profile header */}
        <div className="flex items-start gap-4 mb-5 pb-4 border-b border-terminal-border">
          <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg shrink-0">
            JR
          </div>
          <div>
            <div className="text-terminal-green font-bold">James Richardson</div>
            <div className="text-terminal-gray text-xs">
              Senior Technical Recruiter • 500+ connections
            </div>
            <div className="text-terminal-gray-light text-xs mt-0.5">
              <span className="bg-green-900/40 text-green-400 px-1 rounded text-[10px]">● Open to connect</span>
            </div>
          </div>
        </div>

        {/* Message body */}
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="text-terminal-green-dim">
            Hi! I came across your profile and I think you'd be a great fit for a 
            <strong className="text-terminal-green"> Senior Frontend Engineer</strong> role 
            we're currently hiring for. Compensation is $180k–$240k + equity.
          </p>

          <p className="text-terminal-green-dim">
            The team is small, the product is exciting, and we move fast. The role involves 
            React, TypeScript, and some Node.js work on the backend. Fully remote.
          </p>

          <p className="text-terminal-green-dim">
            To save time, I've set up a quick technical assessment on GitHub. 
            It's just a few small tasks — shouldn't take more than 30 minutes:
          </p>

          <div
            className={cn(
              "p-3 rounded border cursor-pointer transition-all",
              revealed.includes("recruiter-github-link")
                ? "border-terminal-red/60 bg-terminal-red/5"
                : "border-terminal-border hover:border-terminal-amber/50"
            )}
            onClick={() => handleFlagClick("recruiter-github-link")}
            title="Click to investigate"
          >
            <div className="text-terminal-cyan text-xs">
              🔗 github.com/jrichardson-dev2024/interview-challenge-frontend
            </div>
            <div className="text-terminal-gray text-xs mt-1">
              Clone the repo and follow the README — let me know when you're done!
            </div>
          </div>

          <p
            className={cn(
              "p-2 rounded border cursor-pointer transition-all text-terminal-green-dim",
              revealed.includes("recruiter-urgency")
                ? "border-terminal-red/60 bg-terminal-red/5 text-terminal-red"
                : "border-transparent hover:border-terminal-amber/30"
            )}
            onClick={() => handleFlagClick("recruiter-urgency")}
            title="Click to investigate"
          >
            ⚡ <em>We're moving quickly on this — could you respond within 24 hours? 
            We have several candidates at this stage.</em>
          </p>

          <p className="text-terminal-gray text-xs pt-2 border-t border-terminal-border">
            Best,<br />
            <span
              className={cn(
                "cursor-pointer transition-all",
                revealed.includes("recruiter-no-company")
                  ? "text-terminal-red line-through"
                  : "text-terminal-green-dim hover:text-terminal-amber"
              )}
              onClick={() => handleFlagClick("recruiter-no-company")}
              title="Click to investigate"
            >
              James Richardson — Technical Recruiter
            </span>
          </p>
        </div>
      </TerminalWindow>

      {/* Flag finder panel */}
      <TerminalWindow title="red-flag-detector.sh" variant="danger">
        <div className="space-y-3">
          <div className="text-terminal-red text-xs uppercase tracking-widest mb-3">
            Click suspicious elements in the message above, or check them off below:
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

      {/* Score & explainer */}
      {allFound && !submitted && (
        <AlertBox type="warning" title="All flags found — Analysis complete">
          <div className="space-y-1 text-xs mt-2">
            <p>🚩 Recruiters from legitimate companies always display their employer.</p>
            <p>🚩 Artificial urgency is a pressure tactic to prevent careful analysis.</p>
            <p>🚩 Never clone & run unknown repos sent by strangers — that's the attack vector.</p>
          </div>
        </AlertBox>
      )}

      <button
        onClick={handleNext}
        className="w-full py-3 border border-terminal-green text-terminal-green font-mono
                   hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200
                   text-sm tracking-widest uppercase rounded"
      >
        Investigate the GitHub Repo →
      </button>
    </main>
  );
}

export default function RecruiterPage() {
  return (
    <GameProvider>
      <RecruiterContent />
    </GameProvider>
  );
}
