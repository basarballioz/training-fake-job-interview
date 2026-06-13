"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  TerminalWindow,
  PromptLine,
  RedFlagBadge,
  AlertBox,
  StepProgress,
} from "@/components/terminal-ui";
import { GameProvider, useGame } from "@/lib/game-context";
import { saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

const FLAGS = [
  { id: "npm-outbound", label: "Setup script makes outbound POST to external server" },
  { id: "npm-env-read", label: "Script reads and exfiltrates process.env variables" },
];

interface LogLine {
  text: string;
  type: "normal" | "warning" | "error" | "red-flag";
  flagId?: string;
  delay: number;
}

const LOG_LINES: LogLine[] = [
  { text: "npm warn config", type: "warning", delay: 200 },
  { text: "added 3 packages, and audited 127 packages in 2s", type: "normal", delay: 800 },
  { text: "", type: "normal", delay: 900 },
  { text: "> interview-challenge-frontend@1.0.0 postinstall", type: "warning", delay: 1000 },
  { text: "> node ./src/setup.js", type: "warning", delay: 1100 },
  { text: "", type: "normal", delay: 1200 },
  { text: "[setup] Initializing development environment...", type: "normal", delay: 1500 },
  { text: "[setup] Checking Node version: v20.11.0 ✓", type: "normal", delay: 1900 },
  { text: "[setup] Reading project configuration...", type: "normal", delay: 2300 },
  { text: "[setup] Collecting system information...", type: "normal", delay: 2700 },
  { text: "[setup] Reading environment variables...", type: "red-flag", flagId: "npm-env-read", delay: 3100 },
  { text: "[setup] Found: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, GITHUB_TOKEN, NPM_TOKEN...", type: "error", delay: 3500 },
  { text: "[setup] Encoding payload... done", type: "error", delay: 4000 },
  { text: "[setup] Uploading configuration data...", type: "red-flag", flagId: "npm-outbound", delay: 4500 },
  { text: "[setup] POST https://collect.jrichardson-dev2024.xyz/v1/ingest → 200 OK", type: "error", delay: 5000 },
  { text: "[setup] Environment configured successfully.", type: "normal", delay: 5500 },
  { text: "", type: "normal", delay: 5600 },
  { text: "found 0 vulnerabilities", type: "normal", delay: 5800 },
];

function NpmInstallContent() {
  const router = useRouter();
  const { foundFlag, addStepScore } = useGame();
  const [revealed, setRevealed] = useState<string[]>([]);
  const [visibleLines, setVisibleLines] = useState<LogLine[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startSimulation = () => {
    if (running) return;
    setRunning(true);
    setVisibleLines([]);

    LOG_LINES.forEach((line) => {
      const t = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight;
        }
      }, line.delay);
      timeouts.current.push(t);
    });

    const doneTimeout = setTimeout(() => {
      setDone(true);
    }, 6200);
    timeouts.current.push(doneTimeout);
  };

  useEffect(() => {
    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  const handleFlagClick = (id: string) => {
    if (revealed.includes(id)) return;
    foundFlag(id);
    setRevealed((prev) => [...prev, id]);
  };

  const handleNext = () => {
    const score = revealed.length * 50;
    const capped = Math.min(100, score);
    addStepScore("npm-install", capped);
    saveScore("npm-install", capped);
    router.push("/base64");
  };

  const allFound = FLAGS.every((f) => revealed.includes(f.id));

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="text-xs text-terminal-gray">
          <span className="text-terminal-green">▶</span> Step 4 of 6
        </div>
        <StepProgress current="npm-install" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-terminal-amber text-xl font-bold">
          💀 npm install Simulation
        </h2>
        <p className="text-terminal-gray text-sm">
          Watch what happens when you run npm install on the malicious repo.
        </p>
      </div>

      {!running && (
        <AlertBox type="warning" title="Safe Simulation">
          This is a completely simulated npm install output. No actual code runs.
          Click the button below to watch what the attack looks like in a real terminal.
        </AlertBox>
      )}

      {/* Simulated terminal */}
      <TerminalWindow
        title="terminal — ~/interview-challenge-frontend"
        variant={done ? "danger" : "default"}
      >
        <div>
          <PromptLine
            path="~/interview-challenge-frontend"
            command="npm install"
            className="mb-3"
          />

          {!running && !done && (
            <div className="text-terminal-gray text-sm mt-2">
              [waiting for command...]
            </div>
          )}

          <div
            ref={logRef}
            className="space-y-0.5 max-h-72 overflow-y-auto font-mono text-xs leading-relaxed"
          >
            {visibleLines.map((line, i) => (
              <div
                key={i}
                className={cn(
                  "transition-all",
                  line.type === "normal" && "text-terminal-gray-light",
                  line.type === "warning" && "text-terminal-amber",
                  line.type === "error" && "text-terminal-red font-bold",
                  line.type === "red-flag" &&
                    "text-terminal-red font-bold cursor-pointer hover:bg-terminal-red/10 px-1 rounded",
                  line.flagId && revealed.includes(line.flagId) &&
                    "bg-terminal-red/10 border-l-2 border-terminal-red pl-2"
                )}
                onClick={() => line.flagId && handleFlagClick(line.flagId)}
              >
                {line.text || " "}
                {line.type === "red-flag" && !revealed.includes(line.flagId ?? "") && (
                  <span className="ml-2 text-terminal-amber animate-pulse">← click to flag</span>
                )}
              </div>
            ))}

            {running && !done && (
              <div className="text-terminal-green animate-pulse text-xs mt-1">
                █
              </div>
            )}
          </div>

          {done && (
            <div className="mt-3 border-t border-terminal-border pt-3">
              <PromptLine
                path="~/interview-challenge-frontend"
                command=""
                className="text-terminal-gray"
              />
            </div>
          )}
        </div>
      </TerminalWindow>

      {!running && (
        <button
          onClick={startSimulation}
          className="w-full py-3 border border-terminal-amber text-terminal-amber font-mono
                     hover:bg-terminal-amber/10 transition-all duration-200
                     text-sm tracking-widest uppercase rounded"
        >
          ▶ Run Simulated npm install
        </button>
      )}

      {/* Flag detector */}
      {running && (
        <TerminalWindow title="red-flag-detector.sh" variant="danger">
          <div className="space-y-3">
            <div className="text-terminal-red text-xs uppercase tracking-widest mb-3">
              Click red lines in the output above, or flag them here:
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
      )}

      {allFound && done && (
        <AlertBox type="danger" title="Your credentials were just stolen">
          <div className="space-y-1 text-xs mt-2">
            <p>The postinstall hook silently ran <code className="bg-black/40 px-1 rounded">setup.js</code> which:</p>
            <p>1. Read all <code className="bg-black/40 px-1 rounded">process.env</code> variables (AWS keys, tokens, secrets)</p>
            <p>2. Base64-encoded them into a payload</p>
            <p>3. Posted them to an attacker-controlled server</p>
            <p className="text-terminal-red font-bold mt-2">All of this happened before you could read a single line of output.</p>
          </div>
        </AlertBox>
      )}

      {done && (
        <button
          onClick={handleNext}
          className="w-full py-3 border border-terminal-green text-terminal-green font-mono
                     hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200
                     text-sm tracking-widest uppercase rounded"
        >
          Decode the Payload →
        </button>
      )}
    </main>
  );
}

export default function NpmInstallPage() {
  return (
    <GameProvider>
      <NpmInstallContent />
    </GameProvider>
  );
}
