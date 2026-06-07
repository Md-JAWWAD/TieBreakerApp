import React, { useState } from "react";
import { ComparisonConfig } from "../types";
import { MessageSquare, LayoutGrid, Award, ShieldQuestion } from "lucide-react";

interface ComparisonMatrixViewProps {
  comparison: ComparisonConfig;
}

export default function ComparisonMatrixView({ comparison }: ComparisonMatrixViewProps) {
  // Store clicked cell details to show comment card automatically
  const [selectedCell, setSelectedCell] = useState<{
    criterion: string;
    option: string;
    score: number;
    comment: string;
  } | null>(null);

  if (!comparison || !comparison.matrix || comparison.matrix.length === 0) {
    return (
      <div className="bg-[#1E293B] border border-dashed border-[#334155] rounded-3xl p-8 text-center text-slate-400 font-mono text-sm">
        No comparison matrix available for this analysis.
      </div>
    );
  }

  // Find overall leaders by calculating averages
  const calculateWinner = () => {
    // Collect all options from first matrix item
    const optionsList = comparison.matrix[0]?.scores.map((s) => s.option) || [];
    if (optionsList.length === 0) return null;

    const totals: { [name: string]: { sum: number; count: number } } = {};
    optionsList.forEach((opt) => {
      totals[opt] = { sum: 0, count: 0 };
    });

    comparison.matrix.forEach((row) => {
      row.scores.forEach((s) => {
        if (totals[s.option]) {
          totals[s.option].sum += s.score;
          totals[s.option].count += 1;
        }
      });
    });

    let maxAvg = -1;
    let winnerName = "";
    let isTie = false;

    Object.keys(totals).forEach((opt) => {
      const avg = totals[opt].sum / (totals[opt].count || 1);
      if (avg > maxAvg) {
        maxAvg = avg;
        winnerName = opt;
        isTie = false;
      } else if (avg === maxAvg) {
        isTie = true;
      }
    });

    return isTie ? null : { name: winnerName, average: maxAvg.toFixed(1) };
  };

  const matrixWinner = calculateWinner();

  // Helper utility to style score badges
  const getScoreBadgeStyles = (score: number) => {
    if (score >= 8) return "bg-emerald-950/80 text-emerald-400 border-emerald-800/40";
    if (score >= 5) return "bg-amber-950/80 text-amber-400 border-amber-800/45";
    return "bg-rose-950/80 text-rose-400 border-rose-800/40";
  };

  return (
    <div id="comparison-section-container" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2 border-b border-[#334155] gap-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-400" />
            Criterion Matrix Comparison
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Score matrix rated from 1 to 10. Click any rating cell to inspect the AI's deep comparative rationale.
          </p>
        </div>

        {matrixWinner && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-800/30 text-emerald-300 text-[11px] font-bold rounded-lg uppercase tracking-wider font-mono">
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            Top Matrix Rating: {matrixWinner.name} ({matrixWinner.average}/10 Avg)
          </div>
        )}
      </div>

      {/* Main Table Layout */}
      <div className="border border-[#334155] rounded-3xl overflow-hidden bg-[#1E293B] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="bg-[#0F172A]/80 border-b border-[#334155] text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
              <th className="py-4 px-5 font-semibold">Evaluation Dimension</th>
              {comparison.matrix[0]?.scores.map((s, i) => (
                <th key={i} className="py-4 px-5 text-center font-semibold">
                  {s.option}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]">
            {comparison.matrix.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className="hover:bg-[#0F172A]/40 transition-colors duration-200 text-slate-200 text-sm"
              >
                <td className="py-4 px-5 font-semibold tracking-tight text-slate-100">
                  {row.criterion}
                </td>
                {row.scores.map((scoreObj, colIdx) => {
                  const isSelected = selectedCell?.criterion === row.criterion && selectedCell?.option === scoreObj.option;
                  return (
                    <td 
                      key={colIdx} 
                      className="py-3 px-5 text-center"
                    >
                      <button
                        onClick={() => setSelectedCell({
                          criterion: row.criterion,
                          option: scoreObj.option,
                          score: scoreObj.score,
                          comment: scoreObj.comment
                        })}
                        className={`inline-flex flex-col items-center justify-center w-12 h-12 rounded-xl border font-bold font-mono text-base tracking-tighter transition-all cursor-pointer ${
                          isSelected 
                            ? "ring-2 ring-indigo-400 scale-105 shadow-sm bg-indigo-600 border-indigo-600 text-white" 
                            : `${getScoreBadgeStyles(scoreObj.score)} hover:scale-105`
                        }`}
                        title="Click to view comparative notes"
                      >
                        {scoreObj.score}
                        <span className="text-[8px] font-mono font-normal opacity-70 block -mt-1 leading-none uppercase">
                          / 10
                        </span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Score Explainer Box */}
      <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-[#334155] rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-4 right-4 text-slate-800 pointer-events-none opacity-40">
          <MessageSquare className="w-12 h-12" />
        </div>

        {selectedCell ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#818CF8]">
                AI Rating Explanation
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span className="text-xs text-slate-400 font-mono">
                {selectedCell.criterion}
              </span>
            </div>
            
            <h4 className="text-sm font-bold text-slate-100 mb-1.5 flex items-center gap-1.5">
              <span>Why <strong className="text-[#818CF8]">{selectedCell.option}</strong> scored {selectedCell.score}/10:</span>
            </h4>
            
            <p className="text-sm font-sans text-slate-300 leading-relaxed font-normal">
              {selectedCell.comment}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3 py-1">
            <div className="bg-indigo-950/80 border border-indigo-800/40 text-[#818CF8] p-2.5 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-slate-200">
                Interactive Detailer
              </span>
              <span className="block text-xs text-slate-400 font-sans">
                Select any rating number bubble in the sheet above to expand the comparative reasoning text block.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
