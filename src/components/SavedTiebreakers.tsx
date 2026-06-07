import React from "react";
import { DecisionResult } from "../types";
import { History, Trash2, Calendar, FileText, ChevronRight, Award } from "lucide-react";

interface SavedTiebreakersProps {
  history: DecisionResult[];
  onSelect: (result: DecisionResult) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  activeId: string | null;
}

export default function SavedTiebreakers({
  history,
  onSelect,
  onDelete,
  onClearAll,
  activeId,
}: SavedTiebreakersProps) {
  const getReadableDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Recent";
    }
  };

  const getFormatLabel = (type: string) => {
    switch (type) {
      case "pros_cons":
        return "⚖️ Pros & Cons";
      case "comparison":
        return "📊 Comparison";
      case "swot":
        return "💡 SWOT Matrix";
      case "verdict":
        return "⚡ Ultimate";
      default:
        return "Analysis";
    }
  };

  return (
    <div id="saved-history-sidebar" className="bg-[#1E293B] border border-[#334155] rounded-3xl p-4 md:p-5 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-[#334155] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-bold tracking-tight text-slate-250">
            Decision Archive
          </h3>
          <span className="text-[10px] font-mono bg-[#0F172A] text-slate-300 px-1.5 py-0.5 rounded border border-[#334155]">
            {history.length}
          </span>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] font-mono tracking-wider font-bold text-slate-500 hover:text-rose-400 uppercase transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] md:max-h-full pr-1 scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-center py-8 text-xs font-sans text-slate-500 space-y-1.5">
            <span className="block italic">No decisions archived yet.</span>
            <span className="block text-[10px] text-slate-650 leading-normal max-w-[180px] mx-auto">
              Analyses you generate will appear here for immediate reference.
            </span>
          </div>
        ) : (
          history.map((item) => {
            const isActive = item.id === activeId;
            return (
              <div
                key={item.id}
                className={`group border rounded-2xl p-3.5 relative transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-[#4F46E5] bg-[#4F46E5]/15 shadow-sm"
                    : "border-[#334155] bg-[#0F172A] hover:border-slate-500 hover:shadow-xs"
                }`}
                onClick={() => onSelect(item)}
              >
                <div className="flex justify-between items-start gap-4 mb-1">
                  <h4 className="text-xs font-bold font-sans text-slate-100 line-clamp-1 flex-1 pr-6 tracking-normal">
                    {item.decisionTitle}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-all duration-150"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[9px] font-mono font-medium tracking-tight bg-[#1E293B] text-slate-300 px-1.5 py-0.5 rounded uppercase border border-[#334155]">
                    {getFormatLabel(item.inputType)}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {getReadableDate(item.timestamp)}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#334155]/30 text-[10px] font-semibold text-slate-300 font-sans">
                  <Award className="w-3 h-3 text-indigo-400" />
                  <span>Recommendation: </span>
                  <span className="text-[#818CF8] truncate font-bold max-w-[120px]">
                    {item.winner}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
