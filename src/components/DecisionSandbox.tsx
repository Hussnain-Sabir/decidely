import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Loader2, 
  Award, 
  FileText,
  BarChart3,
  Zap,
  Compass
} from "lucide-react";
import { BinaryResult, MultiVectorResult, InstinctiveResult } from "../types";

export default function DecisionSandbox() {
  // Empty default inputs to respect user desire to start with a blank slate
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  
  // States to hold structured analytical outputs
  const [binaryResult, setBinaryResult] = useState<BinaryResult | null>(null);
  const [multiResult, setMultiResult] = useState<MultiVectorResult | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [simulatedReason, setSimulatedReason] = useState<string | null>(null);
  const [activeAnalysisType, setActiveAnalysisType] = useState<"binary" | "multi" | null>(null);

  // Results display tab switcher
  const [resultsViewMode, setResultsViewMode] = useState<"analysis" | "graphs" | "panic">("analysis");
  const [triggeredBy, setTriggeredBy] = useState<"analysis" | "panic" | null>(null);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      return; // Keep at least 2 options
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setOptions(["", ""]);
    setContext("");
    setQuestion("");
    setBinaryResult(null);
    setMultiResult(null);
    setIsSimulated(false);
    setSimulatedReason(null);
    setActiveAnalysisType(null);
    setResultsViewMode("analysis");
    setTriggeredBy(null);
  };

  const handleAnalyze = async () => {
    const activeOptions = options.map(o => o.trim()).filter(o => o !== "");
    if (activeOptions.length < 2) {
      alert("Please provide at least two valid options to evaluate.");
      return;
    }

    setLoading(true);
    setBinaryResult(null);
    setMultiResult(null);
    setIsSimulated(false);
    setSimulatedReason(null);
    setActiveAnalysisType(null);
    setResultsViewMode("analysis"); // Default back to analysis view for the fresh results
    setTriggeredBy("analysis");

    // Context combined with the core question for better prompt conditioning
    const combinedContext = question.trim() 
      ? `Core Decision Question: "${question.trim()}"\n\nSituational Details: ${context.trim() || "None"}`
      : context.trim();

    try {
      if (activeOptions.length === 2) {
        const response = await fetch("/api/analyze-binary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            option1: activeOptions[0], 
            option2: activeOptions[1], 
            context: combinedContext 
          }),
        });
        const json = await response.json();
        setBinaryResult(json.data);
        setActiveAnalysisType("binary");
        if (json.message) {
          setIsSimulated(true);
          setSimulatedReason(json.message);
        }
      } else {
        const response = await fetch("/api/analyze-multivector", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            options: activeOptions, 
            context: combinedContext 
          }),
        });
        const json = await response.json();
        setMultiResult(json.data);
        setActiveAnalysisType("multi");
        if (json.message) {
          setIsSimulated(true);
          setSimulatedReason(json.message);
        }
      }
    } catch (err: any) {
      console.error("Analysis request failed", err);
      setIsSimulated(true);
      setSimulatedReason(err?.message || "Network request failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePanicTrigger = () => {
    const activeOptions = options.map(o => o.trim()).filter(o => o !== "");
    if (activeOptions.length < 2) {
      alert("Please provide at least two valid options to evaluate.");
      return;
    }

    // Activate the results section layout & switch view mode to panic selector
    if (activeOptions.length === 2) {
      setActiveAnalysisType("binary");
    } else {
      setActiveAnalysisType("multi");
    }
    setResultsViewMode("panic");
    setTriggeredBy("panic");

    // Smooth scroll down to target section
    setTimeout(() => {
      const resultsSection = document.getElementById("results-workspace-section");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120);
  };

  const activeOptionsCount = options.map(o => o.trim()).filter(o => o !== "").length;

  return (
    <div className="space-y-8" id="decision-sandbox-workspace">
      {/* Introduction Header */}
      <div className="border-b border-sky-950/40 pb-5">
        <h2 className="text-xl font-bold text-white font-sans tracking-tight">Decision Sandbox</h2>
        <p className="text-sm text-slate-400 mt-1 leading-relaxed">
          Formulate your core inquiry, input your potential options, and let the clarity engine weigh trade-offs, define comparative criteria, and isolate optimal paths forward.
        </p>
      </div>

      {/* Main Form workspace */}
      <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-6 shadow-xl space-y-6">
        
        {/* Core Decision Question */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-sky-400">
            Core Inquiry / Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-[#030a16] border border-sky-950/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/10 transition-all font-sans"
            placeholder="e.g., Which technical direction should our core architecture transition to?"
          />
        </div>

        {/* Dynamic Options list */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-semibold uppercase tracking-wider text-sky-400">
              Potential Options / Directions
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {activeOptionsCount} active {activeOptionsCount === 1 ? "option" : "options"}
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {options.map((opt, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="group relative flex items-center gap-3 p-1 rounded-xl bg-[#030a16]/40 border border-sky-950/60 hover:border-sky-500/25 transition-all overflow-hidden shadow-[0_4px_12px_rgba(3,10,22,0.5)]"
                >
                  {/* Subtle glossy sheen background sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-gloss-sweep pointer-events-none" />

                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500/20 to-sky-600/5 border border-sky-500/30 text-xs font-mono font-black text-sky-300 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-gloss-sweep pointer-events-none" />
                    {String.fromCharCode(65 + i)}
                  </div>
                  
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
                    placeholder={`e.g., Option ${String.fromCharCode(65 + i)}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="p-2 bg-slate-900/50 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 rounded-lg border border-transparent hover:border-rose-950/50 transition-all cursor-pointer mr-1 z-10"
                      title="Remove option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="pt-2 flex justify-start">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleAddOption}
              className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-tr from-sky-500/10 to-indigo-500/5 border border-sky-900/40 hover:border-sky-400/40 text-xs font-semibold text-sky-300 hover:text-sky-200 transition-all overflow-hidden cursor-pointer"
            >
              {/* Button glossy sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-gloss-sweep pointer-events-none" />
              <Plus className="w-4 h-4" /> Add Option
            </motion.button>
          </div>
        </div>

        {/* Situational Context & Preferences */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-sky-400">
            Situational Context & Custom Preferences
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full h-24 bg-[#030a16] border border-sky-950/80 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-all font-sans resize-none"
            placeholder="Specify your core priorities, constraints, timeline limitations, or experience constraints to align the decision metrics."
          />
        </div>

        {/* Action Button Row */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleAnalyze}
            disabled={loading || activeOptionsCount < 2}
            className="flex-[2] py-3.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-[#030a16] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider shadow-lg shadow-sky-500/10 hover:shadow-sky-400/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing Decision Space...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                {activeOptionsCount >= 3 ? "Generate Multi-Option Grid" : "Analyze Binary Choices"}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePanicTrigger}
            disabled={loading || activeOptionsCount < 2}
            className="flex-1 py-3.5 px-5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider shadow-lg shadow-indigo-500/15 hover:shadow-indigo-400/25 border border-indigo-500/30"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" />
            Panic Selector
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-3 rounded-xl bg-slate-900/40 hover:bg-slate-900 text-slate-300 hover:text-white border border-sky-950/60 hover:border-sky-800 text-xs font-semibold transition-all cursor-pointer"
          >
            Clear Fields
          </button>
        </div>
      </div>

      {/* Results Workspace */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-xs text-slate-400 font-mono">CALIBRATING CRITERIA & WEIGHING OUTCOMES...</p>
          </motion.div>
        )}

        {/* RESULTS WORKSPACE (If analysis is complete) */}
        {!loading && activeAnalysisType && (
          <motion.div
            id="results-workspace-section"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Visual Segment Tabs for Results */}
            {triggeredBy === "analysis" ? (
              <div className="flex flex-wrap gap-1.5 p-1 bg-[#060f22]/90 border border-sky-950/80 rounded-xl max-w-md shadow-lg relative z-10">
                <button
                  type="button"
                  onClick={() => setResultsViewMode("analysis")}
                  className={`relative flex-1 py-2 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                    resultsViewMode === "analysis" ? "text-sky-300" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {resultsViewMode === "analysis" && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-gradient-to-tr from-sky-500/15 to-sky-400/5 border border-sky-500/30 rounded-lg -z-10 shadow-[0_0_15px_rgba(56,189,248,0.12)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <FileText className="w-3.5 h-3.5" />
                  Deep Dive
                </button>

                <button
                  type="button"
                  onClick={() => setResultsViewMode("graphs")}
                  className={`relative flex-1 py-2 px-3 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                    resultsViewMode === "graphs" ? "text-sky-300" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {resultsViewMode === "graphs" && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-gradient-to-tr from-sky-500/15 to-sky-400/5 border border-sky-500/30 rounded-lg -z-10 shadow-[0_0_15px_rgba(56,189,248,0.12)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <BarChart3 className="w-3.5 h-3.5" />
                  Show Graphs
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between border-b border-sky-950/30 pb-3">
                <div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 animate-pulse" />
                    Panic Selection System
                  </h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">RAPID SUB-CONSCIOUS INSTINCT EVALUATION</p>
                </div>
              </div>
            )}

            {/* DYNAMIC TAB CONTROLLER */}
            <AnimatePresence mode="wait">
              <motion.div
                key={resultsViewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                
                {/* 1. DEEP DIVE ANALYTICAL DETAILS TAB */}
                {resultsViewMode === "analysis" && (
                  <>
                    {/* BINARY VIEW */}
                    {activeAnalysisType === "binary" && binaryResult && (
                      <div className="space-y-8">
                        {/* Split cards for option A & option B pros/cons */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Option 1 */}
                          <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-5 shadow-sm space-y-5">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-sky-950/40">
                              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
                              <h4 className="font-bold text-white text-sm tracking-wide uppercase">
                                {binaryResult.option1.name}
                              </h4>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h5 className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-2.5 tracking-wider uppercase">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Strengths (Pros)
                                </h5>
                                <ul className="space-y-2.5 text-slate-300 text-xs pl-3 border-l border-emerald-950/40">
                                  {binaryResult.option1.pros.map((pro, index) => (
                                    <li key={index} className="leading-relaxed flex items-start gap-1">
                                      <span className="text-emerald-400 font-bold mr-1">•</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h5 className="text-[10px] font-semibold text-rose-400 flex items-center gap-1.5 mb-2.5 tracking-wider uppercase">
                                  <XCircle className="w-4 h-4 text-rose-400" /> Primary Limitations (Cons)
                                </h5>
                                <ul className="space-y-2.5 text-slate-300 text-xs pl-3 border-l border-rose-950/40">
                                  {binaryResult.option1.cons.map((con, index) => (
                                    <li key={index} className="leading-relaxed flex items-start gap-1">
                                      <span className="text-rose-400 font-bold mr-1">•</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Option 2 */}
                          <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-5 shadow-sm space-y-5">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-sky-950/40">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse"></span>
                              <h4 className="font-bold text-white text-sm tracking-wide uppercase">
                                {binaryResult.option2.name}
                              </h4>
                            </div>

                            <div className="space-y-4">
                              <div>
                                <h5 className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1.5 mb-2.5 tracking-wider uppercase">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Strengths (Pros)
                                </h5>
                                <ul className="space-y-2.5 text-slate-300 text-xs pl-3 border-l border-emerald-950/40">
                                  {binaryResult.option2.pros.map((pro, index) => (
                                    <li key={index} className="leading-relaxed flex items-start gap-1">
                                      <span className="text-emerald-400 font-bold mr-1">•</span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div>
                                <h5 className="text-[10px] font-semibold text-rose-400 flex items-center gap-1.5 mb-2.5 tracking-wider uppercase">
                                  <XCircle className="w-4 h-4 text-rose-400" /> Primary Limitations (Cons)
                                </h5>
                                <ul className="space-y-2.5 text-slate-300 text-xs pl-3 border-l border-rose-950/40">
                                  {binaryResult.option2.cons.map((con, index) => (
                                    <li key={index} className="leading-relaxed flex items-start gap-1">
                                      <span className="text-rose-400 font-bold mr-1">•</span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Binary comparison Matrix */}
                        <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-5 overflow-hidden">
                          <h4 className="text-xs font-semibold text-sky-400 mb-4 tracking-wider uppercase">
                            Direct Comparative Matrix
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-sky-950/60 text-slate-400">
                                  <th className="pb-3.5 font-semibold text-[10px] uppercase tracking-wider">Evaluation Dimension</th>
                                  <th className="pb-3.5 font-semibold text-sky-400 text-[10px] uppercase tracking-wider">{binaryResult.option1.name}</th>
                                  <th className="pb-3.5 font-semibold text-indigo-400 text-[10px] uppercase tracking-wider">{binaryResult.option2.name}</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-sky-950/30">
                                {binaryResult.matrix.map((row, index) => (
                                  <tr key={index} className="hover:bg-sky-500/5 transition-all">
                                    <td className="py-3.5 font-medium text-slate-200 pr-4">{row.criteria}</td>
                                    <td className="py-3.5 text-slate-300 pr-4">{row.option1Val}</td>
                                    <td className="py-3.5 text-slate-300">{row.option2Val}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* AI Suggestion card */}
                        <div className="bg-gradient-to-r from-sky-950/20 to-[#060f22] border border-sky-500/20 rounded-2xl p-6 relative overflow-hidden">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-4">
                            <div>
                              <span className="text-[10px] font-mono text-sky-300 bg-sky-500/10 px-2.5 py-1 border border-sky-500/20 rounded-lg uppercase tracking-widest font-black">
                                Decidely Recommendation
                              </span>
                              <h4 className="font-bold text-lg text-white mt-2 font-sans">Strategic Selection</h4>
                              <p className="text-xl font-extrabold text-sky-300 mt-1">
                                {binaryResult.recommendation.winnerName}
                              </p>
                            </div>

                            <div className="flex items-center gap-3 bg-[#030a16] border border-sky-950 px-4 py-3 rounded-xl">
                              <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-sky-500/30 bg-sky-500/5">
                                <span className="text-xs font-mono font-bold text-sky-300">{binaryResult.recommendation.percentage}%</span>
                              </div>
                              <div>
                                <div className="text-[9px] font-mono text-slate-500 uppercase font-bold">Confidence</div>
                                <div className="text-xs font-semibold text-slate-200">Aligned Score</div>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#030a16]/40 border border-sky-950/40 rounded-xl leading-relaxed">
                            <p className="text-slate-300 text-xs font-sans leading-relaxed">
                              {binaryResult.recommendation.logicSummary}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* MULTI VIEW */}
                    {activeAnalysisType === "multi" && multiResult && (
                      <div className="space-y-8">
                        {/* Leaderboard Rankings */}
                        <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-5 space-y-4">
                          <div className="border-b border-sky-950/40 pb-3">
                            <h4 className="text-xs font-semibold text-sky-400 tracking-wider uppercase">
                              AI-Weighted Leaderboard
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">Options ranked according to contextual fitness models.</p>
                          </div>

                          <div className="space-y-3">
                            {multiResult.rankings.map((rank) => (
                              <div
                                key={rank.rank}
                                className="flex flex-col sm:flex-row sm:items-center justify-between border border-sky-950/30 rounded-xl p-4 bg-[#030a16]/40 gap-4 hover:border-sky-500/25 transition-all"
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 font-mono text-sky-300 font-bold text-xs">
                                    #{rank.rank}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white font-sans text-xs uppercase tracking-wide">{rank.optionName}</h5>
                                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rank.justification}</p>
                                  </div>
                                </div>

                                <div className="flex-shrink-0 flex items-center gap-2 bg-slate-900/60 border border-sky-950 rounded-lg px-3 py-1.5 self-end sm:self-center">
                                  <Award className="w-4 h-4 text-sky-400" />
                                  <div>
                                    <div className="text-[8px] font-mono text-slate-500 uppercase font-bold leading-none">Fitness</div>
                                    <div className="text-xs font-bold text-sky-400 font-mono mt-0.5">{rank.suitabilityScore}%</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Comparison Advantage Grid */}
                        <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-5 space-y-4">
                          <h4 className="text-xs font-semibold text-sky-400 tracking-wider uppercase">
                            Multi-Vector Comparison Grid
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {multiResult.comparisonGrid.map((col, index) => (
                              <div
                                key={index}
                                className="bg-[#030a16]/60 border border-sky-950 rounded-xl p-4 flex flex-col justify-between hover:border-sky-500/20 transition-all space-y-4"
                              >
                                <div>
                                  <h5 className="font-bold text-white text-xs border-b border-sky-950/40 pb-2 mb-3 tracking-wide">
                                    {col.optionName}
                                  </h5>
                                  
                                  <div className="space-y-3">
                                    <div>
                                      <div className="text-[9px] font-mono text-sky-400 uppercase tracking-wider font-bold">Primary Advantage</div>
                                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{col.advantage}</p>
                                    </div>

                                    <div>
                                      <div className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider font-bold">Best Suited For</div>
                                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{col.bestFor}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-sky-950/40">
                                  <div className="text-[9px] font-mono text-rose-400 uppercase tracking-wider font-bold">Critical Trade-off</div>
                                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{col.keyTradeoff}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Defined Criteria Info */}
                        {multiResult.criteriaDefined && multiResult.criteriaDefined.length > 0 && (
                          <div className="bg-[#030a16] border border-sky-950/60 p-4 rounded-xl flex items-start gap-3">
                            <Info className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div className="text-xs text-slate-400 leading-relaxed">
                              <span className="font-semibold text-slate-300 uppercase font-mono mr-1">Evaluative Parameters Imposed:</span>
                              {multiResult.criteriaDefined.join(", ")}. Change situational context details to adjust parameter weightings dynamically.
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 2. SHOW GRAPHS VISUALIZATION TAB */}
                {resultsViewMode === "graphs" && (
                  <>
                    {activeAnalysisType === "binary" && binaryResult && (
                      <BinaryGraphsView binaryResult={binaryResult} />
                    )}
                    {activeAnalysisType === "multi" && multiResult && (
                      <MultiGraphsView multiResult={multiResult} />
                    )}
                  </>
                )}

                {/* 3. PANIC SELECTION INSTINCT TESTER TAB */}
                {resultsViewMode === "panic" && (
                  <PanicSelectionView 
                    options={options.map(o => o.trim()).filter(o => o !== "")} 
                    question={question}
                    context={context}
                  />
                )}

              </motion.div>
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==========================================
   SUB-COMPONENT: BINARY GRAPHS VIEW
   ========================================== */
interface BinaryGraphsViewProps {
  binaryResult: BinaryResult;
}

function BinaryGraphsView({ binaryResult }: BinaryGraphsViewProps) {
  // Determine scores based on AI recommendation percentage
  const winnerIsOpt1 = binaryResult.option1.name.toLowerCase() === binaryResult.recommendation.winnerName.toLowerCase();
  const opt1Score = winnerIsOpt1 ? binaryResult.recommendation.percentage : (100 - binaryResult.recommendation.percentage);
  const opt2Score = winnerIsOpt1 ? (100 - binaryResult.recommendation.percentage) : binaryResult.recommendation.percentage;

  return (
    <div className="space-y-6">
      {/* Decisional Balance Meter */}
      <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-6 space-y-4 shadow-sm">
        <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
          Decisional Balance Vector
        </h4>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          Visual balance of the recommendation confidence weights mapped side-by-side.
        </p>

        <div className="space-y-2 pt-2">
          <div className="relative h-6 bg-[#030a16] border border-sky-950 rounded-full overflow-hidden flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${opt1Score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 relative flex items-center"
            >
              <span className="absolute left-4 text-[10px] font-mono font-black text-slate-950">
                {opt1Score}%
              </span>
            </motion.div>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${opt2Score}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-l from-indigo-600 to-indigo-400 relative ml-auto flex items-center justify-end"
            >
              <span className="absolute right-4 text-[10px] font-mono font-black text-slate-950">
                {opt2Score}%
              </span>
            </motion.div>
          </div>
          <div className="flex justify-between text-xs font-mono font-bold">
            <span className="text-sky-400 uppercase">{binaryResult.option1.name}</span>
            <span className="text-indigo-400 uppercase">{binaryResult.option2.name}</span>
          </div>
        </div>
      </div>

      {/* Dimensional Attribute Comparisons */}
      <div className="space-y-4">
        <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
          Dimension Focus Columns
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {binaryResult.matrix.map((row, idx) => {
            // Give visual weight representations for each dimension
            return (
              <div 
                key={idx} 
                className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-4 space-y-4 hover:border-sky-500/20 transition-all shadow-sm"
              >
                <h5 className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-black">
                  {row.criteria}
                </h5>

                <div className="space-y-3">
                  <div className="bg-[#030a16]/60 border border-sky-950 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1">
                      <span>{binaryResult.option1.name}</span>
                      <span className="text-sky-400">FIT</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{row.option1Val}</p>
                  </div>

                  <div className="bg-[#030a16]/60 border border-sky-950 p-2.5 rounded-xl">
                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-1">
                      <span>{binaryResult.option2.name}</span>
                      <span className="text-indigo-400">FIT</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{row.option2Val}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   SUB-COMPONENT: MULTI GRAPHS VIEW
   ========================================== */
interface MultiGraphsViewProps {
  multiResult: MultiVectorResult;
}

function MultiGraphsView({ multiResult }: MultiGraphsViewProps) {
  return (
    <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-6 space-y-6 shadow-sm">
      <div>
        <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
          Option Suitability Distribution
        </h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
          Comparative fitness indexes generated through primary context priorities.
        </p>
      </div>

      <div className="space-y-6 pt-2">
        {multiResult.rankings.map((rank) => {
          const isWinner = rank.rank === 1;
          return (
            <div key={rank.rank} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className={`font-bold uppercase font-sans tracking-wide ${isWinner ? "text-sky-300" : "text-slate-300"}`}>
                  #{rank.rank} {rank.optionName} {isWinner && "🏆"}
                </span>
                <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 border border-sky-500/25 rounded">
                  {rank.suitabilityScore}%
                </span>
              </div>
              
              <div className="h-4 w-full bg-[#030a16] border border-sky-950/80 rounded-lg overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rank.suitabilityScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-lg ${
                    isWinner
                      ? "bg-gradient-to-r from-sky-500 to-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                      : "bg-gradient-to-r from-indigo-500 to-indigo-400"
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-0.5">
                {rank.justification}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================
   SUB-COMPONENT: PANIC SELECTION INSTINCT VIEW
   ========================================== */
interface PanicSelectionViewProps {
  options: string[];
  question: string;
  context: string;
}

function PanicSelectionView({ options, question, context }: PanicSelectionViewProps) {
  const [spinning, setSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalChoice, setFinalChoice] = useState("");
  const [result, setResult] = useState<InstinctiveResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePulseTrigger = () => {
    if (spinning || loading || options.length < 2) return;

    setSpinning(true);
    setFinalChoice("");
    setResult(null);

    let count = 0;
    const maxCount = 20; // Number of cycle flashes
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % options.length);
      count++;
      
      if (count >= maxCount) {
        clearInterval(interval);
        const settledIndex = Math.floor(Math.random() * options.length);
        setCurrentIndex(settledIndex);
        const choice = options[settledIndex];
        setFinalChoice(choice);
        setSpinning(false);
        fetchInstinctiveAnalysis(choice);
      }
    }, 90);
  };

  const fetchInstinctiveAnalysis = async (choice: string) => {
    setLoading(true);
    const combinedContext = question.trim() 
      ? `Core Decision Question: "${question.trim()}"\n\nSituational Details: ${context.trim() || "None"}`
      : context.trim();

    try {
      const response = await fetch("/api/analyze-instinctive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          options, 
          selectedOption: choice,
          context: combinedContext
        }),
      });
      const json = await response.json();
      setResult(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h4 className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
            Panic Selection Selector
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
            Cut through analysis paralysis instantly. Press the panic button to cycle rapidly through your active options and force a subconscious alignment check-in.
          </p>
        </div>

        {/* Dynamic visual spinner */}
        <div className="flex flex-col items-center justify-center py-8 bg-[#030a16] border border-sky-950 rounded-xl min-h-[160px] relative overflow-hidden shadow-inner">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ scale: 0.92, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.08, opacity: 0.8 }}
              transition={{ duration: 0.08 }}
              className={`text-sm md:text-base font-bold font-mono px-6 py-3 rounded-xl border uppercase tracking-wider text-center relative z-10 transition-all ${
                spinning
                  ? "border-sky-500 text-sky-400 bg-sky-950/20"
                  : finalChoice
                  ? "border-indigo-500 text-indigo-400 bg-indigo-950/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "border-sky-950/50 text-slate-500"
              }`}
            >
              {options[currentIndex] || "Empty Node"}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest relative z-10">
            {spinning ? "RANDOMIZING DECISION VECTOR..." : finalChoice ? "SPIN COMPLETE • EVALUATING INSTINCT" : "READY TO SPIN"}
          </div>
        </div>

        <button
          type="button"
          onClick={handlePulseTrigger}
          disabled={spinning || loading || options.length < 2}
          className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 text-[#030a16] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 uppercase tracking-wider shadow-lg shadow-indigo-500/10"
        >
          <Compass className="w-4 h-4 text-current animate-pulse" />
          Trigger Panic Selector
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Compiling Subconscious Rationale...</p>
        </div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#060f22] border border-sky-950/60 rounded-2xl p-6 space-y-5 shadow-xl"
        >
          <div>
            <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">Subconscious Alignment Check</div>
            <h5 className="text-sm font-bold text-white mt-1 uppercase font-sans">Settle Target: {result.selectedOption}</h5>
            <p className="text-slate-300 text-xs leading-relaxed mt-2.5 font-sans leading-relaxed">{result.instinctiveRationale}</p>
          </div>

          <div>
            <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-bold mb-2.5">Key Subconscious Drivers</div>
            <ul className="space-y-2.5 pl-3 border-l border-sky-950/40 text-xs text-slate-300 font-sans">
              {result.subconsciousFactors.map((fact, idx) => (
                <li key={idx} className="leading-relaxed flex items-start gap-1">
                  <span className="text-sky-400 mr-1.5">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-[#030a16] border border-sky-950 rounded-xl">
            <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-bold">Instinct Check Next Step</div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">{result.nextStep}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
