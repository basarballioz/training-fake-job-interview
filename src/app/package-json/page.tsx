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
  { id: "pkg-postinstall", label: "postinstall script runs ./src/setup.js automatically" },
  { id: "pkg-obfuscated-dep", label: "Dependency 'lodahs' is a typosquat of 'lodash'" },
  { id: "pkg-network-dep", label: "'node-env-collector' is not a known npm package" },
];

// Annotated package.json lines
const PKG_LINES = [
  { text: '{', id: null },
  { text: '  "name": "interview-challenge-frontend",', id: null },
  { text: '  "version": "1.0.0",', id: null },
  { text: '  "description": "Frontend interview challenge",', id: null },
  { text: '  "scripts": {', id: null },
  { text: '    "dev": "node src/index.js",', id: null },
  { text: '    "test": "jest",', id: null },
  { text: '    "postinstall": "node ./src/setup.js"', id: "pkg-postinstall" },
  { text: '  },', id: null },
  { text: '  "dependencies": {', id: null },
  { text: '    "express": "^4.18.2",', id: null },
  { text: '    "react": "^18.2.0",', id: null },
  { text: '    "react-dom": "^18.2.0",', id: null },
  { text: '    "lodahs": "^4.17.21",', id: "pkg-obfuscated-dep" },
  { text: '    "node-env-collector": "^1.0.4",', id: "pkg-network-dep" },
  { text: '    "webpack": "^5.88.2"', id: null },
  { text: '  }', id: null },
  { text: '}', id: null },
];

function PackageJsonContent() {
  const router = useRouter();
  const { foundFlag, addStepScore } = useGame();
  const [revealed, setRevealed] = useState<string[]>([]);

  const handleLineClick = (id: string | null) => {
    if (!id || revealed.includes(id)) return;
    foundFlag(id);
    setRevealed((prev) => [...prev, id]);
  };

  const handleNext = () => {
    const score = revealed.length * 33;
    const capped = Math.min(100, score);
    addStepScore("package-json", capped);
    saveScore("package-json", capped);
    router.push("/npm-install");
  };

  const allFound = FLAGS.every((f) => revealed.includes(f.id));

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="text-xs text-terminal-gray">
          <span className="text-terminal-green">▶</span> Step 3 of 6
        </div>
        <StepProgress current="package-json" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-terminal-amber text-xl font-bold">
          📦 package.json Investigation
        </h2>
        <p className="text-terminal-gray text-sm">
          Before running npm install, always audit the package.json. Click suspicious lines.
        </p>
      </div>

      {/* Annotated package.json */}
      <TerminalWindow title="~/interview-challenge-frontend/package.json" variant="warning">
        <div className="font-mono text-sm overflow-x-auto">
          <div className="text-terminal-gray-light text-xs mb-3">
            <span className="text-terminal-green">$</span> cat package.json
          </div>
          {PKG_LINES.map((line, i) => {
            const isFlag = !!line.id;
            const isFound = line.id ? revealed.includes(line.id) : false;
            return (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 px-2 py-0.5 rounded transition-all",
                  isFlag && !isFound && "hover:bg-terminal-amber/10 cursor-pointer",
                  isFound && "bg-terminal-red/10 border-l-2 border-terminal-red",
                  !isFlag && "cursor-default"
                )}
                onClick={() => handleLineClick(line.id)}
                title={isFlag && !isFound ? "Click to investigate this line" : undefined}
              >
                <span className="text-terminal-gray/50 w-5 text-right shrink-0 text-xs">
                  {i + 1}
                </span>
                <span className={cn(
                  isFound ? "text-terminal-red" : "text-terminal-green-dim",
                  isFlag && !isFound && "text-terminal-amber/80"
                )}>
                  {line.text}
                </span>
                {isFound && (
                  <span className="text-terminal-red text-xs ml-auto shrink-0">← 🚩</span>
                )}
              </div>
            );
          })}
        </div>
      </TerminalWindow>

      {/* Explanations that pop up as found */}
      {revealed.includes("pkg-postinstall") && (
        <AlertBox type="danger" title="postinstall Hook Detected">
          <p className="text-xs mt-1">
            The <code className="bg-black/40 px-1 rounded">postinstall</code> script runs{" "}
            <strong>automatically</strong> when you run <code className="bg-black/40 px-1 rounded">npm install</code> —
            before you see any output. Attackers use this to execute malicious code the moment you install dependencies.
          </p>
        </AlertBox>
      )}

      {revealed.includes("pkg-obfuscated-dep") && (
        <AlertBox type="danger" title="Typosquatting Detected: 'lodahs'">
          <p className="text-xs mt-1">
            <strong>lodahs</strong> vs <strong>lodash</strong> — one transposed letter. 
            Typosquatting packages mimic popular libraries and contain malware. 
            Always double-check dependency names against the npm registry.
          </p>
        </AlertBox>
      )}

      {revealed.includes("pkg-network-dep") && (
        <AlertBox type="danger" title="Unknown Package: 'node-env-collector'">
          <p className="text-xs mt-1">
            <strong>node-env-collector</strong> doesn't appear in any legitimate npm package lists. 
            The name strongly implies it reads and exfiltrates your environment variables 
            (API keys, AWS credentials, tokens).
          </p>
        </AlertBox>
      )}

      {/* Flag checklist */}
      <TerminalWindow title="red-flag-detector.sh" variant="danger">
        <div className="space-y-3">
          <div className="text-terminal-red text-xs uppercase tracking-widest mb-3">
            Click suspicious lines in the file above, or check flags here:
          </div>
          {FLAGS.map((flag) => (
            <RedFlagBadge
              key={flag.id}
              found={revealed.includes(flag.id)}
              label={flag.label}
              onClick={() => handleLineClick(flag.id)}
            />
          ))}
        </div>
      </TerminalWindow>

      {allFound && (
        <AlertBox type="warning" title="package.json audit complete">
          <p className="text-xs mt-1">
            This package.json contains a perfect trifecta of supply chain attack techniques: 
            a lifecycle hook for automatic execution, a typosquatted dependency, and a 
            purpose-built data harvesting package.
          </p>
        </AlertBox>
      )}

      <button
        onClick={handleNext}
        className="w-full py-3 border border-terminal-green text-terminal-green font-mono
                   hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200
                   text-sm tracking-widest uppercase rounded"
      >
        Run npm install (simulated) →
      </button>
    </main>
  );
}

export default function PackageJsonPage() {
  return (
    <GameProvider>
      <PackageJsonContent />
    </GameProvider>
  );
}
