# Fake Interview Attack
### Security Awareness Training — Interactive Simulation

> Built voluntarily to help developers at our company recognize a real and increasingly common supply-chain attack vector.

---

## Background

Threat actors actively target developers by posing as recruiters on LinkedIn and cold-messaging them with fake job offers. The pitch is simple: *complete this short coding challenge and we will get back to you.* The repository linked in the message contains a malicious npm package. The moment the developer runs `npm install`, it is already too late.

This project simulates that exact scenario in a safe, guided environment so people can learn to spot the warning signs before they encounter them in the wild.

---

## How It Works

Participants play through six interactive stages, each modelled after a real step in the attack chain. At every stage they are asked to identify **red flags** — suspicious details that a careful developer would (and should) notice. Each correct finding earns points. A final debrief screen shows the score and actionable defence tips.

| # | Stage | What you examine |
|---|---|---|
| 1 | Recruiter DM | A cold LinkedIn-style message packed with social-engineering cues |
| 2 | GitHub Repo | The linked "coding challenge" repository |
| 3 | `npm install` | Live terminal output during package installation |
| 4 | `package.json` | Malicious `postinstall` script hidden in plain sight |
| 5 | Base64 Payload | Obfuscated script — decode it and understand what it does |
| 6 | Final Score | Personal score + a practical defence checklist |

---

## Learning Objectives

After completing the simulation, participants should be able to:

- Recognise social-engineering patterns in unsolicited recruiter messages
- Evaluate a GitHub repository for authenticity before cloning it
- Identify lifecycle scripts (`postinstall`, `preinstall`) that execute code automatically on install
- Spot outbound network calls and environment-variable exfiltration in install logs
- Decode and read basic Base64-obfuscated payloads
- Apply practical mitigations: `--ignore-scripts`, sandbox VMs, dependency auditing

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 — App Router |
| Language | TypeScript |
| Styling | Tailwind CSS with a custom retro terminal theme |
| State | React Context with per-step flag scoring |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start from the landing screen.

---

## About

This project was created entirely on a volunteer basis as a contribution to internal developer education. It is not affiliated with any real company, recruiter, or npm package. All payloads shown are inert and exist solely for educational purposes.

Feedback, suggestions, and pull requests are welcome.