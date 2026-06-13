"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TerminalWindow, Typewriter } from "@/components/terminal-ui";

const BOOT_LINES = [
  "BIOS v2.4.1 — Initializing...",
  "Loading security awareness module...",
  "Scanning threat database... OK",
  "Mounting simulation environment... OK",
  "WARNING: Simulated attack content ahead",
  "All payloads are INERT and for educational use only.",
  "Ready.",
];

export default function LandingPage() {
  const router = useRouter();
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(() => setReady(true), 400);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header glitch title */}
      <div className="mb-10 text-center space-y-2">
        <div className="text-xs text-terminal-gray tracking-[0.3em] uppercase mb-4">
          ⚠ Security Awareness Training ⚠
        </div>
        <h1 className="text-3xl md:text-5xl font-mono font-bold text-terminal-green green-glow leading-tight">
          FAKE INTERVIEW
          <br />
          <span className="text-terminal-red" style={{ textShadow: "0 0 16px rgba(255,51,51,0.5)" }}>
            ATTACK
          </span>
        </h1>
        <p className="text-terminal-gray-light text-sm mt-3 max-w-md mx-auto">
          How hackers use fake job offers to plant malware on developer machines
        </p>
      </div>

      {/* Boot terminal */}
      <TerminalWindow title="system-boot.log" className="w-full max-w-2xl mb-8">
        <div className="space-y-1 font-mono text-sm min-h-[200px]">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => {
            const isWarning = line.startsWith("WARNING");
            const isReady = line === "Ready.";
            return (
              <div key={i} className={
                isWarning ? "text-terminal-amber" :
                isReady ? "text-terminal-green font-bold" :
                "text-terminal-gray-light"
              }>
                {isReady || isWarning ? "" : "> "}
                {i === visibleLines - 1 && !isReady ? (
                  <Typewriter text={line} speed={20} showCursor={false} />
                ) : (
                  line
                )}
                {i === visibleLines - 1 && isReady && (
                  <Typewriter text={line} speed={60} showCursor />
                )}
              </div>
            );
          })}
        </div>
      </TerminalWindow>

      {/* What you'll learn */}
      <div className="w-full max-w-2xl mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: "💬", title: "Spot fake recruiters", desc: "Recognize red flags in LinkedIn messages" },
          { icon: "📦", title: "Inspect packages", desc: "Analyze malicious npm package.json scripts" },
          { icon: "🔍", title: "Decode payloads", desc: "Uncover obfuscated Base64 exfiltration code" },
        ].map((item) => (
          <div key={item.title} className="terminal-card border border-terminal-border p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-terminal-green text-sm font-bold mb-1">{item.title}</div>
            <div className="text-terminal-gray text-xs">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {ready && (
        <button
          onClick={() => router.push("/recruiter")}
          className="px-8 py-4 border border-terminal-green text-terminal-green font-mono font-bold 
                     hover:bg-terminal-green hover:text-terminal-bg transition-all duration-200
                     text-sm tracking-widest uppercase rounded
                     animate-fade-in-up"
          style={{ animation: "fade-in-up 0.4s ease-out forwards" }}
        >
          ▶ Start Simulation
        </button>
      )}

      <p className="mt-8 text-terminal-gray text-xs text-center max-w-sm">
        This is a fully client-side educational demo. No data is collected. 
        No real malware is used.
      </p>
    </main>
  );
}
