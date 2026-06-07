import React, { useState } from "react";
import { SwotItem } from "../types";
import { Sparkles, TrendingUp, HelpCircle, AlertTriangle, Lightbulb } from "lucide-react";

interface SwotMatrixViewProps {
  swotData: SwotItem[];
}

export default function SwotMatrixView({ swotData }: SwotMatrixViewProps) {
  const [activeIdx, setActiveIdx] = useState<number>(0);

  if (!swotData || swotData.length === 0) {
    return (
      <div className="bg-[#1E293B] border border-dashed border-[#334155] rounded-3xl p-8 text-center text-slate-400 font-mono text-sm">
        No SWOT matrix data available for this analysis.
      </div>
    );
  }

  const currentSwot = swotData[activeIdx];

  return (
    <div id="swot-analysis-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#334155] pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Strategic SWOT Matrix
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Evaluates underlying internal realities and external market/situational vectors for each option.
          </p>
        </div>

        {/* Tab switcher for options' SWOTs if multiple */}
        {swotData.length > 1 && (
          <div id="swot-button-tabs" className="flex items-center gap-1.5 bg-[#0F172A] p-1 rounded-xl w-full sm:w-auto overflow-x-auto border border-[#334155]">
            {swotData.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeIdx === idx
                    ? "bg-[#1E293B] text-slate-100 shadow-sm border border-[#334155]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {item.option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2x2 SWOT grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strengths (Internal Positive) */}
        <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-emerald-500/20 pb-2">
            <span className="w-7 h-7 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-sm font-mono shadow-sm">
              S
            </span>
            <span className="font-bold text-sm tracking-widest text-[#A7F3D0] uppercase">
              Strengths
            </span>
            <span className="text-[10px] text-emerald-300 font-mono font-semibold ml-auto uppercase bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/15">
              Internal Advantages
            </span>
          </div>
          <ul className="space-y-2">
            {currentSwot.strengths.map((str, i) => (
              <li key={i} className="text-xs md:text-sm text-slate-350 font-sans flex items-start gap-2">
                <span className="text-emerald-400 font-bold text-xs mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses (Internal Negative) */}
        <div className="bg-amber-950/10 border border-amber-500/20 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-amber-500/20 pb-2">
            <span className="w-7 h-7 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold text-sm font-mono shadow-sm">
              W
            </span>
            <span className="font-bold text-sm tracking-widest text-[#FDE68A] uppercase">
              Weaknesses
            </span>
            <span className="text-[10px] text-amber-300 font-mono font-semibold ml-auto uppercase bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/15">
              Internal Constraints
            </span>
          </div>
          <ul className="space-y-2">
            {currentSwot.weaknesses.map((weak, i) => (
              <li key={i} className="text-xs md:text-sm text-slate-350 font-sans flex items-start gap-2">
                <span className="text-amber-400 font-bold text-xs mt-0.5">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities (External Positive) */}
        <div className="bg-indigo-950/10 border border-indigo-500/20 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-indigo-500/20 pb-2">
            <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm font-mono shadow-sm">
              O
            </span>
            <span className="font-bold text-sm tracking-widest text-[#C7D2FE] uppercase">
              Opportunities
            </span>
            <span className="text-[10px] text-indigo-300 font-mono font-semibold ml-auto uppercase bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/15">
              External Enablers
            </span>
          </div>
          <ul className="space-y-2">
            {currentSwot.opportunities.map((opp, i) => (
              <li key={i} className="text-xs md:text-sm text-slate-350 font-sans flex items-start gap-2">
                <span className="text-indigo-400 font-bold text-xs mt-0.5">•</span>
                <span>{opp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats (External Negative) */}
        <div className="bg-rose-950/10 border border-rose-500/20 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3 border-b border-rose-500/20 pb-2">
            <span className="w-7 h-7 bg-rose-600 text-white rounded-lg flex items-center justify-center font-bold text-sm font-mono shadow-sm">
              T
            </span>
            <span className="font-bold text-sm tracking-widest text-[#FECDD3] uppercase">
              Threats
            </span>
            <span className="text-[10px] text-rose-300 font-mono font-semibold ml-auto uppercase bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/15">
              External Risks
            </span>
          </div>
          <ul className="space-y-2">
            {currentSwot.threats.map((thr, i) => (
              <li key={i} className="text-xs md:text-sm text-slate-350 font-sans flex items-start gap-2">
                <span className="text-rose-400 font-bold text-xs mt-0.5">•</span>
                <span>{thr}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SWOT Insights and Analysis */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 md:p-5 flex items-start gap-4 shadow-sm">
        <div className="bg-amber-950/80 border border-amber-800/30 p-2.5 rounded-xl shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Strategic Takeaway for "{currentSwot.option}"
          </span>
          <p className="text-sm font-sans text-slate-200 font-medium leading-relaxed">
            {currentSwot.insights}
          </p>
        </div>
      </div>
    </div>
  );
}
