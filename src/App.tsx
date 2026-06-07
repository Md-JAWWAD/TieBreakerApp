import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scale, 
  HelpCircle, 
  Plus, 
  X, 
  Sparkles, 
  LayoutGrid, 
  ListTodo, 
  Share2, 
  Check, 
  Copy, 
  AlertCircle, 
  RotateCcw,
  ChevronRight,
  Lightbulb,
  CheckCircle,
  FileText
} from "lucide-react";
import { AnalysisType, DecisionResult, PRESET_DILEMMAS } from "./types";
import VerdictGauge from "./components/VerdictGauge";
import AlternativesView from "./components/AlternativesView";
import ComparisonMatrixView from "./components/ComparisonMatrixView";
import SwotMatrixView from "./components/SwotMatrixView";
import SavedTiebreakers from "./components/SavedTiebreakers";

export default function App() {
  const [decision, setDecision] = useState("");
  const [inputType, setInputType] = useState<AnalysisType>("pros_cons");
  
  // Custom options list
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");
  
  // Custom criteria list
  const [criteria, setCriteria] = useState<string[]>([]);
  const [newCriterion, setNewCriterion] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [result, setResult] = useState<DecisionResult | null>(null);
  const [history, setHistory] = useState<DecisionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Track action checklist items that are completed
  const [checkedActionSteps, setCheckedActionSteps] = useState<{ [key: string]: boolean }>({});

  // Active sub-tab inside full verdict report
  const [verdictSubTab, setVerdictSubTab] = useState<"pros_cons" | "comparison" | "swot">("pros_cons");

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem("tiebreaker_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing history from localStorage", e);
      }
    }
  }, []);

  // Update loading steps during progress
  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;
    
    if (loading) {
      setLoadingStep(1);
      timer1 = setTimeout(() => setLoadingStep(2), 2000);
      timer2 = setTimeout(() => setLoadingStep(3), 4200);
      timer3 = setTimeout(() => setLoadingStep(4), 6500);
    }
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [loading]);

  const saveToHistory = (newResult: DecisionResult) => {
    const updated = [newResult, ...history.filter(h => h.id !== newResult.id)].slice(0, 30);
    setHistory(updated);
    localStorage.setItem("tiebreaker_history", JSON.stringify(updated));
  };

  const handleApplyPreset = (preset: typeof PRESET_DILEMMAS[0]) => {
    setDecision(preset.dilemma);
    setInputType(preset.type);
    setOptions(preset.options);
    setCriteria(preset.criteria);
    setError(null);
  };

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    setOptions(options.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddCriterion = () => {
    if (newCriterion.trim() && !criteria.includes(newCriterion.trim())) {
      setCriteria([...criteria, newCriterion.trim()]);
      setNewCriterion("");
    }
  };

  const handleRemoveCriterion = (indexToRemove: number) => {
    setCriteria(criteria.filter((_, idx) => idx !== indexToRemove));
  };

  const handleResetInputs = () => {
    setDecision("");
    setOptions([]);
    setCriteria([]);
    setNewOption("");
    setNewCriterion("");
    setError(null);
  };

  const executeDecisionAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision.trim()) {
      setError("Please describe the decision dilemma you are facing.");
      return;
    }

    setLoading(true);
    setError(null);
    setCheckedActionSteps({});

    try {
      const response = await fetch("/api/decide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          decision: decision.trim(),
          type: inputType,
          options: options.length > 0 ? options : undefined,
          criteria: criteria.length > 0 ? criteria : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unexpected error occurred during analysis.");
      }

      const rawResult = await response.json();
      
      const newResult: DecisionResult = {
        ...rawResult,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        inputType,
        originalDilemma: decision,
      };

      setResult(newResult);
      saveToHistory(newResult);
      
      // Auto switch verdict tab based on what's available
      if (inputType === "comparison") {
        setVerdictSubTab("comparison");
      } else if (inputType === "swot") {
        setVerdictSubTab("swot");
      } else {
        setVerdictSubTab("pros_cons");
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact sever. Please verify connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: DecisionResult) => {
    setResult(item);
    setDecision(item.originalDilemma);
    setInputType(item.inputType);
    setOptions(item.alternatives?.map((a) => a.name) || []);
    setCriteria(item.comparison?.criteria || []);
    setError(null);
    setCheckedActionSteps({});
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("tiebreaker_history", JSON.stringify(updated));
    if (result && result.id === id) {
      setResult(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear your decision archive?")) {
      setHistory([]);
      localStorage.removeItem("tiebreaker_history");
      setResult(null);
    }
  };

  const handleCopyVerdict = () => {
    if (!result) return;
    const text = `The Tiebreaker recommendation for "${result.originalDilemma}":
Winner: ${result.winner} (${result.confidenceScore}% confidence)
Verdict: ${result.tiebreakerVerdict}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLoadingMessage = () => {
    switch (loadingStep) {
      case 1:
        return "Parsing choice factors & isolating constraints...";
      case 2:
        return "Calibrating dynamic weights & friction thresholds...";
      case 3:
        return "Running game-theoretic strategic simulations...";
      case 4:
        return "Determining definitive tie-breaker verdict...";
      default:
        return "Aligning priorities...";
    }
  };

  const toggleActionStep = (stepText: string) => {
    setCheckedActionSteps(prev => ({
      ...prev,
      [stepText]: !prev[stepText]
    }));
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50 antialiased font-sans flex flex-col selection:bg-indigo-950 selection:text-indigo-200">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 border-b border-[#1E293B] backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#4F46E5] to-[#3730A3] rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden font-bold">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                THE TIEBREAKER<span className="text-[#818CF8]">.AI</span>
              </h1>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
                AI Decisionist Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#1E293B] px-3 py-1 rounded-full border border-[#334155]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Core Node Online</span>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Archive and Presets (3 Cols) */}
          <section className="lg:col-span-3 space-y-6">
            
            {/* Saved Archive */}
            <SavedTiebreakers
              history={history}
              onSelect={handleSelectHistoryItem}
              onDelete={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
              activeId={result ? result.id : null}
            />

            {/* Prompt presets */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 md:p-5 shadow-lg">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                Dilemma Samples
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-normal mb-4">
                Click a preset to instantly deploy the variables and view analytical models:
              </p>
              
              <div className="space-y-2.5">
                {PRESET_DILEMMAS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full text-left text-xs bg-[#0F172A] border border-[#334155] p-2.5 hover:bg-[#1E293B] hover:border-slate-500 rounded-xl transition-all block group relative cursor-pointer"
                  >
                    <span className="font-bold text-slate-200 block mb-0.5 group-hover:text-white truncate">
                      {preset.title}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1 italic">
                      "{preset.dilemma}"
                    </span>
                    <span className="absolute top-1 right-2 inline-flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Right Column: Input & Results (9 Cols) */}
          <section className="lg:col-span-9 space-y-8">
            
            {/* Input Form Card */}
            <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-5 md:p-6 shadow-lg">
              <form onSubmit={executeDecisionAnalysis} className="space-y-6">
                
                {/* Text Dilemma area */}
                <div className="space-y-2">
                  <label htmlFor="dilemma-input" className="block text-sm font-bold tracking-tight text-white">
                    What critical decision are you trying to break a tie on?
                  </label>
                  <div className="relative">
                    <textarea
                      id="dilemma-input"
                      value={decision}
                      onChange={(e) => setDecision(e.target.value)}
                      placeholder="e.g., Should I buy the 3-year used AWD crossover SUV or a brand new fully electric compact hatchback?"
                      className="w-full min-h-[90px] text-sm bg-[#0F172A] border border-[#334155] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-950 p-4 rounded-xl transition-all resize-y placeholder:text-slate-500 focus:outline-none text-white text-base font-medium"
                    />
                  </div>
                </div>

                {/* Additional custom factors row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Options items */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Specify Options (Optional)
                      </label>
                      <span className="text-[10px] text-slate-500 italic">Leaves AI to deduce if empty</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder="Add alternative (e.g. Electric Hatchback)"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(); } }}
                        className="flex-1 text-xs bg-[#0F172A] border border-[#334155] focus:border-indigo-500 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-950 text-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white border border-[#334155] p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 p-2 bg-[#0F172A]/40 rounded-xl border border-[#334155]">
                        {options.map((opt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E293B] border border-[#334155] text-slate-200 shadow-xs"
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(idx)}
                              className="text-slate-400 hover:text-white rounded-full transition-colors p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Criteria of choice items */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Evaluation Criteria (Optional)
                      </label>
                      <span className="text-[10px] text-slate-500 italic">Self-curated priorities</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCriterion}
                        onChange={(e) => setNewCriterion(e.target.value)}
                        placeholder="Add key factor (e.g. Resale value)"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCriterion(); } }}
                        className="flex-1 text-xs bg-[#0F172A] border border-[#334155] focus:border-indigo-500 px-3 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-950 text-white font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddCriterion}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white border border-[#334155] p-2.5 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {criteria.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 p-2 bg-[#0F172A]/40 rounded-xl border border-[#334155]">
                        {criteria.map((crt, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E293B] border border-[#334155] text-slate-200 shadow-xs animate-fade-in"
                          >
                            <span>{crt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(idx)}
                              className="text-slate-400 hover:text-white rounded-full transition-colors p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Format selection */}
                <div className="space-y-2.5 pt-2">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Analysis Protocol Format
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    
                    <button
                      type="button"
                      onClick={() => setInputType("pros_cons")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        inputType === "pros_cons"
                          ? "border-[#4F46E5] bg-[#4F46E5] text-white!"
                          : "border-[#334155] bg-[#0F172A] hover:bg-[#1E293B] hover:border-slate-500 text-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                        ⚖️
                        <span>Pros & Cons</span>
                      </div>
                      <span className="text-[10px] block leading-snug opacity-75">
                        Weighed gravity lists side-by-side
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setInputType("comparison")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        inputType === "comparison"
                           ? "border-[#4F46E5] bg-[#4F46E5] text-white!"
                           : "border-[#334155] bg-[#0F172A] hover:bg-[#1E293B] hover:border-slate-500 text-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                        📊
                        <span>Matrix Grid</span>
                      </div>
                      <span className="text-[10px] block leading-snug opacity-75">
                        Scores across evaluation criteria
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setInputType("swot")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        inputType === "swot"
                           ? "border-[#4F46E5] bg-[#4F46E5] text-white!"
                           : "border-[#334155] bg-[#0F172A] hover:bg-[#1E293B] hover:border-slate-500 text-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                        💡
                        <span>SWOT Layout</span>
                      </div>
                      <span className="text-[10px] block leading-snug opacity-75">
                        Assess strategic forces & triggers
                      </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setInputType("verdict")}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        inputType === "verdict"
                           ? "border-[#4F46E5] bg-[#4F46E5] text-white!"
                           : "border-[#334155] bg-[#0F172A] hover:bg-[#1E293B] hover:border-slate-500 text-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs flex items-center gap-1.5 mb-1">
                        ⚡
                        <span>Full Verdict</span>
                      </div>
                      <span className="text-[10px] block leading-snug opacity-75">
                        Comprehensive deep-dive compound report
                      </span>
                    </button>

                  </div>
                </div>

                {/* Form Action Controls */}
                <div className="pt-4 flex items-center justify-between gap-4 border-t border-[#334155]/60">
                  <button
                    type="button"
                    onClick={handleResetInputs}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Dilemma
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !decision.trim()}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold text-white transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                      loading || !decision.trim()
                        ? "bg-[#334155] text-slate-500 shadow-none cursor-not-allowed"
                        : "bg-[#4F46E5] hover:bg-[#3730A3] hover:shadow-lg hover:scale-101 border-none focus:outline-none"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Solving Trade-Offs...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                        <span>Break The Tie</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="bg-rose-950/20 border border-rose-500/20 rounded-3xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-sm font-bold text-rose-300">
                    Analytical Core Exception
                  </span>
                  <p className="text-xs text-rose-400 mt-1 font-sans">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Loading State Portal */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="bg-[#1E293B] border border-[#334155] rounded-3xl p-12 text-center shadow-lg space-y-6 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  {/* Backdrop lights */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-950/40 rounded-full blur-3xl opacity-60 animate-pulse" />
                  
                  {/* Verdict Spinner mechanism */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                    <Scale className="w-8 h-8 text-indigo-400 animate-bounce" />
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[#818CF8] font-mono">
                      Running Tie-Breaking Protocols
                    </h3>
                    <p className="text-base text-white font-bold transition-all duration-300">
                      {getLoadingMessage()}
                    </p>
                    <span className="block text-xs text-slate-500 font-mono">
                      Step {loadingStep} of 4 • Calibrating models
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decision Analysis Results suite */}
            {result && !loading && (
              <div className="space-y-8">
                
                {/* Result header controller */}
                <div className="bg-[#1E293B] p-2 border border-[#334155] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-slate-450 font-sans">
                      Dilemma Analyzed:
                    </span>
                    <strong className="text-xs text-slate-200 font-semibold max-w-[250px] md:max-w-md truncate">
                      "{result.originalDilemma}"
                    </strong>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={handleCopyVerdict}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] border border-[#334155] rounded-xl hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300">Copied Recommendation</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Verdict</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Verdict Gauge Portal */}
                <VerdictGauge
                  winner={result.winner}
                  confidenceScore={result.confidenceScore}
                  synopsis={result.synopsis}
                  verdictText={result.tiebreakerVerdict}
                />

                {/* Compound / Ultimate verdict sub-tabs structure if multi-tab formats evaluated */}
                {(result.inputType === "verdict") && (
                  <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-1.5 flex items-center justify-between gap-2 overflow-x-auto">
                    <div className="flex bg-[#0F172A] p-1 rounded-xl w-full">
                      <button
                        onClick={() => setVerdictSubTab("pros_cons")}
                        className={`flex-1 text-center py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          verdictSubTab === "pros_cons"
                            ? "bg-[#1E293B] text-white shadow-xs border border-[#334155]"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        ⚖️ Pros & Cons Comparison
                      </button>
                      <button
                        onClick={() => setVerdictSubTab("comparison")}
                        className={`flex-1 text-center py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          verdictSubTab === "comparison"
                            ? "bg-[#1E293B] text-white shadow-xs border border-[#334155]"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        📊 Metrics Evaluation Table
                      </button>
                      <button
                        onClick={() => setVerdictSubTab("swot")}
                        className={`flex-1 text-center py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          verdictSubTab === "swot"
                            ? "bg-[#1E293B] text-white shadow-xs border border-[#334155]"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        💡 Strategic SWOT Grid
                      </button>
                    </div>
                  </div>
                )}

                {/* Model display router based on format protocol */}
                <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-lg">
                  {result.inputType === "pros_cons" && result.alternatives && (
                    <AlternativesView alternatives={result.alternatives} />
                  )}

                  {result.inputType === "comparison" && result.comparison && (
                    <ComparisonMatrixView comparison={result.comparison} />
                  )}

                  {result.inputType === "swot" && result.swot && (
                    <SwotMatrixView swotData={result.swot} />
                  )}

                  {/* Verdict mode routing helper tabs */}
                  {result.inputType === "verdict" && (
                    <div>
                      {verdictSubTab === "pros_cons" && result.alternatives && (
                        <AlternativesView alternatives={result.alternatives} />
                      )}
                      
                      {verdictSubTab === "comparison" && result.comparison && (
                        <ComparisonMatrixView comparison={result.comparison} />
                      )}
                      
                      {verdictSubTab === "swot" && result.swot && (
                        <SwotMatrixView swotData={result.swot} />
                      )}
                    </div>
                  )}
                </div>

                {/* Priority Action steps roadmap */}
                <div id="execution-action-plan" className="bg-[#1E293B] border border-[#334155] rounded-3xl p-6 shadow-lg">
                  <div className="pb-3 border-b border-[#334155]/60 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      Priority Action Roadmap
                    </h3>
                    <p className="text-xs text-slate-500 font-sans mt-0.5">
                      Your immediate step-by-step roadmap to execute the recommendations and break structural analysis paralysis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.actionPlan.map((stepText, idx) => {
                      const isChecked = !!checkedActionSteps[stepText];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleActionStep(stepText)}
                          className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? "bg-[#0F172A]/40 border-[#334155] opacity-60"
                              : "bg-indigo-950/10 border-indigo-950/40 hover:border-indigo-500 hover:bg-indigo-950/20"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-slate-600 bg-[#0F172A]"
                          }`}>
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                          </div>
                          
                          <div>
                            <span className="text-[10px] font-mono font-bold tracking-widest text-[#818CF8] block uppercase leading-none mb-1">
                              Step 0{idx + 1}
                            </span>
                            <p className={`text-xs md:text-sm ${isChecked ? 'line-through text-slate-500 font-normal' : 'font-semibold text-slate-205'}`}>
                              {stepText}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* Default Landing card when result is empty */}
            {!result && !loading && (
              <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-12 text-center shadow-lg max-w-2xl mx-auto space-y-6">
                <div className="w-16 h-16 bg-[#0F172A] border border-[#334155] rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <Scale className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Welcome to Your Analytical Sanctuary
                  </h2>
                  <p className="text-sm text-slate-300 font-sans leading-relaxed max-w-md mx-auto">
                    Type a complex cross-road decision, optionally refine option names or comparative criteria, choose an analysis format, and let AI reveal your most strategic course.
                  </p>
                </div>

                <div className="inline-flex flex-wrap justify-center gap-2 max-w-lg mx-auto pt-2">
                  <span className="text-xs bg-[#0F172A] text-slate-300 px-3 py-1 rounded-full font-mono font-medium border border-[#334155]">⚖️ Side Comparisons</span>
                  <span className="text-xs bg-[#0F172A] text-slate-300 px-3 py-1 rounded-full font-mono font-medium border border-[#334155]">⚡ Compound Verdicts</span>
                  <span className="text-xs bg-[#0F172A] text-slate-300 px-3 py-1 rounded-full font-mono font-medium border border-[#334155]">📊 Score Tables</span>
                  <span className="text-xs bg-[#0F172A] text-slate-300 px-3 py-1 rounded-full font-mono font-medium border border-[#334155]">💡 Strategic SWOTs</span>
                </div>
              </div>
            )}

          </section>

        </div>
      </main>

      <footer className="bg-[#0F172A] border-t border-[#1E293B] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center text-xs font-mono text-slate-500">
          <p>© 2026 The Tiebreaker • Built on full-stack server-side telemetry</p>
        </div>
      </footer>

    </div>
  );
}
