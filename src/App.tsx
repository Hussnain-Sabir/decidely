import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronRight,
  Workflow
} from "lucide-react";

import DecisionSandbox from "./components/DecisionSandbox";

export default function App() {
  const [connectionState, setConnectionState] = useState({ active: false, isFreeTier: true });

  // Check server status on load to verify Gemini routing availability
  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setConnectionState({ active: data.available, isFreeTier: !!data.isFreeTier }))
      .catch(() => setConnectionState({ active: false, isFreeTier: true }));
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#030a16] text-slate-100 font-sans overflow-x-hidden border-t-0 md:border-4 border-[#071329] relative">
      
      {/* Ambient background slow currents (Deep Ocean theme) */}
      <div className="absolute top-[-10%] left-[20%] w-[550px] h-[550px] bg-sky-500/5 blur-[130px] rounded-full pointer-events-none animate-ocean-drift animate-pulse" />
      <div className="absolute bottom-[5%] right-[15%] w-[650px] h-[650px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none animate-ocean-drift" />

      {/* Unified Global Top Header */}
      <header className="h-20 border-b border-sky-950/30 flex items-center justify-between px-6 md:px-12 bg-[#060f22]/60 backdrop-blur-md sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/10">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">Decidely</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-400">v1.1</span>
            </div>
            <div className="text-[9px] font-mono text-sky-400/80 tracking-wider font-semibold">DECISION WORKSPACE</div>
          </div>
        </div>

        {/* System Sync state */}
        <div className="flex items-center gap-3 bg-[#030a16]/60 border border-sky-950/60 rounded-xl px-4 py-2">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold hidden sm:inline">Workspace Connection:</div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
            <span className="text-slate-300 text-[11px] font-medium font-mono">
              {connectionState.isFreeTier ? "Gemini Free Tier" : "Gemini Pro Active"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Panel Area */}
      <main className="flex-1 flex flex-col min-h-0 z-10 overflow-hidden">
        {/* Content rendering */}
        <section className="flex-1 p-4 md:p-10 overflow-y-auto smooth-scroll-container max-w-4xl w-full mx-auto">
          <DecisionSandbox />
        </section>

        {/* Minimalist Professional Footer */}
        <footer className="h-12 bg-[#030a16] border-t border-sky-950/40 flex items-center px-6 md:px-12 justify-between text-[10px] tracking-wider text-slate-500 font-mono shrink-0">
          <div className="flex items-center gap-4">
            <span>DECIDELY</span>
            <span>•</span>
            <span>MODEL SYNC: {connectionState.isFreeTier ? "FREE TIER" : "ONLINE"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sky-400/70 font-semibold">DEVELOPED BY HUSSNAIN SABIR</span>
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
          </div>
        </footer>
      </main>
    </div>
  );
}
