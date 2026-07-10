# Decidely — AI-Powered Decision Workspace

A web application that helps you make better decisions faster. Enter your question, list your options, add context, and let the AI analyze trade-offs, generate comparison charts, and recommend the best path forward — or just hit the Panic Selector for an instant pick when you're stuck.

**Live Demo:** [decidely-433457314030.asia-southeast1.run.app](https://decidely-433457314030.asia-southeast1.run.app/)

> **Note:** This app runs on the Gemini API free tier, which has a daily request limit. If the live demo shows a rate-limit error, please try again later, or reach out and I can walk through it locally.

## Overview

Decidely turns an open-ended decision into a structured analysis. Instead of just picking based on gut feeling, you get pros/cons, comparison matrices, weighted scoring, and psychological frameworks for breaking through hesitation — all generated dynamically based on your specific inputs.

## Features

- **Binary Choice Analyzer** — deep, structured comparison between exactly two options, with pros/cons for each, a comparison matrix, and a confidence-scored recommendation
- **Multi-Vector Matrix** — compares three or more options side-by-side, ranking them by suitability with clear justifications
- **Weighted Wheel** — score three options against custom-weighted criteria (importance, cost, time) to match your specific priorities
- **Panic Selector** — an instant random pick from your options when you just want to start, paired with a rationale for why that choice makes sense
- **Paradox Filter** — when you're stuck on a decision, get three practical decision-making frameworks (like the 10-10-10 Rule) applied directly to your specific hesitation
- **Graceful offline fallback** — if no API key is available, the app automatically switches to a built-in local reasoning engine so it never fully breaks

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Express.js (Node.js)
- **AI:** Google Gemini API (`gemini-3.1-flash-lite`)
- **Deployment:** Google Cloud Run
- **Built with:** Google AI Studio

## How It Works

1. Enter your core question or decision
2. Add two or more options you're considering
3. Optionally add context — priorities, constraints, or preferences
4. Choose an analysis mode:
   - **Analyze Binary Choices** (for exactly 2 options)
   - **Panic Selector** (instant random pick with reasoning)
5. Review the AI-generated breakdown, comparison matrix, and recommendation

## Environment Setup (for local development)

This project requires a Gemini API key to use live AI analysis. Create a `.env` file based on `.env.example`:

GEMINI_API_KEY=your_key_here

If no key is set, the app automatically falls back to a built-in offline reasoning engine, so it still runs and returns results — just without live Gemini-generated analysis.

## Running Locally

```bash
npm install
npm run dev
```

## Author

Hussain Sabir
