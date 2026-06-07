import React from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

interface VerdictGaugeProps {
  winner: string;
  confidenceScore: number;
  synopsis: string;
  verdictText: string;
}

export default function VerdictGauge({
  winner,
  confidenceScore,
  synopsis,
  verdictText,
}: VerdictGaugeProps) {
  // SVG radius configuration
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidenceScore / 100) * circumference;

  let gaugeColor = "text-emerald-500 stroke-emerald-500";
  let bgGaugeColor = "border-emerald-100 bg-emerald-50/50";
  if (confidenceScore < 60) {
    gaugeColor = "text-amber-500 stroke-amber-500";
    bgGaugeColor = "border-amber-100 bg-amber-50/50";
  } else if (confidenceScore > 85) {
    gaugeColor = "text-indigo-500 stroke-indigo-500";
    bgGaugeColor = "border-indigo-100 bg-indigo-50/50";
  }

  return (
    <div id="verdict-gauge-container" className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-br from-[#4F46E5] to-[#3730A3] border-none rounded-3xl p-6 shadow-lg overflow-hidden relative text-white">
      {/* Decorative accent background blur */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Left circular chart (4 cols) */}
      <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/15 pb-6 md:pb-0 md:pr-6">
        <span className="text-xs font-mono tracking-widest text-white/70 uppercase mb-4">
          Tiebreaker Margin
        </span>
        
        <div className="relative flex items-center justify-center w-32 h-32">
          {/* Circular gradient gauge */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-white/10"
              strokeWidth="10"
              fill="transparent"
            />
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              className="text-white stroke-white"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold font-mono tracking-tighter text-white">
              {confidenceScore}%
            </span>
            <span className="text-[10px] font-mono font-medium text-white/70 uppercase">
              Confidence
            </span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10">
            <Sparkles className="w-3 w-3 text-amber-300" />
            Clear Advantage
          </span>
        </div>
      </div>

      {/* Right verdict commentary (8 cols) */}
      <div className="md:col-span-8 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono font-bold tracking-wider text-indigo-200 uppercase">
              The AI Decisionist's Decree
            </span>
          </div>
          
          <h2 id="winner-announcement" className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-3 leading-tight">
            Recommended Action: <span className="text-amber-200 font-black">{winner}</span>
          </h2>
          
          <p id="decision-synopsis" className="text-sm font-normal text-slate-100 leading-relaxed bg-white/10 rounded-xl p-3 border border-white/5 mb-4">
            {synopsis}
          </p>

          <blockquote className="border-l-4 border-amber-300 pl-4 py-1.5 text-sm md:text-base font-medium italic text-indigo-50 font-sans leading-relaxed">
            "{verdictText}"
          </blockquote>
        </div>

        <div className="mt-6 flex items-center gap-2.5 text-xs font-mono text-indigo-250">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Decision verified with Gemini-3.5-flash analysis</span>
        </div>
      </div>
    </div>
  );
}
