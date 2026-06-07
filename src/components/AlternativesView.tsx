import React, { useState } from "react";
import { Alternative, ProConPoint } from "../types";
import { Check, AlertTriangle, Scale, Award } from "lucide-react";

interface AlternativesViewProps {
  alternatives: Alternative[];
}

export default function AlternativesView({ alternatives }: AlternativesViewProps) {
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!alternatives || alternatives.length === 0) {
    return (
      <div className="bg-[#1E293B] border border-dashed border-[#334155] rounded-3xl p-8 text-center text-slate-400 font-mono text-sm">
        No pros/cons data available for this analysis.
      </div>
    );
  }

  const renderDots = (weight: number, colorClass: string) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((dot) => (
          <span
            key={dot}
            className={`w-1.5 h-1.5 rounded-full ${
              dot <= weight ? colorClass : "bg-slate-700"
            }`}
            title={`Weight: ${weight}/5`}
          />
        ))}
      </div>
    );
  };

  const getLeaderAlternative = () => {
    if (alternatives.length < 2) return null;
    let maxScore = -999;
    let leader: Alternative | null = null;
    let isTie = false;

    for (const alt of alternatives) {
      if (alt.score > maxScore) {
        maxScore = alt.score;
        leader = alt;
        isTie = false;
      } else if (alt.score === maxScore) {
        isTie = true;
      }
    }

    return isTie ? null : leader;
  };

  const leader = getLeaderAlternative();

  return (
    <div id="alternatives-wrapper" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#334155] pb-4 gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            Weighted Pros & Cons Assessment
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            AI evaluated each perspective by applying gravity weights (1-5) to critical factors.
          </p>
        </div>

        {/* Tab Selectors for Option-Based Focus */}
        <div id="alt-tab-bar" className="flex items-center gap-1.5 bg-[#0F172A] p-1 rounded-xl w-full sm:w-auto overflow-x-auto border border-[#334155]">
          {alternatives.map((alt, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-250 ${
                activeTab === idx
                  ? "bg-[#1E293B] text-slate-50 shadow-sm border border-[#334155]"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              {alt.name}
              <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                alt.score >= 0 
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/30" 
                  : "bg-red-950/80 text-red-300 border border-red-800/30"
              }`}>
                Net: {alt.score > 0 ? `+${alt.score}` : alt.score}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Comparison Side-by-Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros (Advantages) */}
        <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-emerald-500/25">
            <h4 className="font-bold text-emerald-400 text-sm tracking-wider uppercase flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 bg-emerald-950 rounded-full p-0.5 border border-emerald-500/30" />
              Heavyweight Pros
            </h4>
            <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/20">
              {alternatives[activeTab]?.pros?.length || 0} Factors
            </span>
          </div>

          <div className="space-y-4">
            {alternatives[activeTab]?.pros?.map((item: ProConPoint, idx: number) => (
              <div 
                key={idx} 
                className="bg-[#1E293B] border border-[#334155] rounded-2xl p-3.5 hover:shadow-md transition-shadow duration-250 hover:border-emerald-500/40"
              >
                <div className="flex justify-between items-start gap-4 mb-1.5">
                  <h5 className="font-bold text-slate-150 text-sm leading-tight">
                    {item.point}
                  </h5>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {renderDots(item.weight, "bg-emerald-400")}
                    <span className="text-[9px] font-mono font-semibold text-emerald-400 uppercase">
                      Impact: {item.weight}/5
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {item.explanation}
                </p>
              </div>
            ))}
            {(!alternatives[activeTab]?.pros || alternatives[activeTab].pros.length === 0) && (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                No weighted pros generated.
              </div>
            )}
          </div>
        </div>

        {/* Cons (Disadvantages) */}
        <div className="bg-rose-950/10 border border-rose-500/20 rounded-3xl p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-rose-500/25">
            <h4 className="font-bold text-rose-400 text-sm tracking-wider uppercase flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-300 bg-rose-950 rounded-full p-0.5 border border-rose-500/30" />
              Gravitational Cons
            </h4>
            <span className="text-xs font-mono text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-500/20">
              {alternatives[activeTab]?.cons?.length || 0} Friction Points
            </span>
          </div>

          <div className="space-y-4">
            {alternatives[activeTab]?.cons?.map((item: ProConPoint, idx: number) => (
              <div 
                key={idx} 
                className="bg-[#1E293B] border border-[#334155] rounded-2xl p-3.5 hover:shadow-md transition-shadow duration-250 hover:border-rose-500/40"
              >
                <div className="flex justify-between items-start gap-4 mb-1.5">
                  <h5 className="font-bold text-slate-150 text-sm leading-tight">
                    {item.point}
                  </h5>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {renderDots(item.weight, "bg-rose-400")}
                    <span className="text-[9px] font-mono font-semibold text-rose-400 uppercase">
                      Friction: {item.weight}/5
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {item.explanation}
                </p>
              </div>
            ))}
            {(!alternatives[activeTab]?.cons || alternatives[activeTab].cons.length === 0) && (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                No weighted cons generated.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mini Scoring Explanation Panel */}
      <div className="bg-[#1E293B] border border-[#334155] rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-950 text-indigo-300 font-black px-3 py-2 rounded-xl text-sm leading-none border border-indigo-800/40">
            {alternatives[activeTab]?.score > 0 ? "+" : ""}{alternatives[activeTab]?.score}
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-200">
              Score Logic for "{alternatives[activeTab]?.name}"
            </span>
            <span className="block text-[11px] text-slate-400 font-sans">
              Weighted Pros sum minus Weighted Cons sum. Higher indicates greater tactical merit.
            </span>
          </div>
        </div>

        {leader && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-950 border border-indigo-500/20 rounded-lg text-indigo-300 text-[11px] font-bold self-end md:self-auto uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            Winner on Net Weighted Score: {leader.name}
          </div>
        )}
      </div>
    </div>
  );
}
