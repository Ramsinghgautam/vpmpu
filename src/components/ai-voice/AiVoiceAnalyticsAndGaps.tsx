import React from 'react';
import { BarChart2, TrendingUp, AlertCircle, CheckCircle, FileText, Bot } from 'lucide-react';
import { CallSession, KnowledgeGapLog } from '../../types/aiVoice';

interface AiVoiceAnalyticsAndGapsProps {
  callSessions: CallSession[];
  knowledgeGaps: KnowledgeGapLog[];
}

export const AiVoiceAnalyticsAndGaps: React.FC<AiVoiceAnalyticsAndGapsProps> = ({
  callSessions,
  knowledgeGaps,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-indigo-950">Analytics & AI Knowledge Gaps Report</h2>
        <p className="text-xs text-slate-500">Monitor AI call performance metrics, response accuracy, and unanswered customer queries to improve RAG documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call History & Transcripts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-900" /> Completed Call Sessions & Transcripts
          </h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {callSessions.map(cs => (
              <div key={cs.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-950">{cs.customerName} ({cs.customerPhone})</span>
                  <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded font-mono text-[10px] font-bold">{cs.callSessionId}</span>
                </div>
                <p className="text-xs text-slate-700 italic font-medium">"{cs.aiSummary}"</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {cs.kbChunksUsed.map((chk, i) => (
                    <span key={i} className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-mono">{chk}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200/60">
                  <span>Property: {cs.propertyName}</span>
                  <span>Duration: {cs.durationSeconds}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Gaps */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" /> AI Knowledge Gaps Report
          </h3>
          <p className="text-xs text-slate-500">List of customer questions where the AI triggered the safety guardrail fallback due to missing knowledge chunks.</p>

          <div className="space-y-3">
            {knowledgeGaps.map(gap => (
              <div key={gap.id} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-950">{gap.propertyName}</span>
                  <span className="text-[10px] text-slate-500">{gap.timestamp}</span>
                </div>
                <p className="text-xs font-semibold text-slate-900">"{gap.customerQuestion}"</p>
                <div className="flex justify-between items-center text-[11px] pt-1 border-t border-amber-200/50">
                  <span className="text-amber-800 italic">Fallback: "I don't have verified information..."</span>
                  <button onClick={() => alert("Redirecting to KB Manager to add chunk.")} className="text-indigo-600 font-bold hover:underline">Add Chunk</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
