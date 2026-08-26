import React from 'react';
import { Phone, Users, Building2, Bot, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, ShieldCheck, Flame } from 'lucide-react';
import { AiProperty, AiAgentConfig, AiLead, CallSession, AppointmentEntity, KnowledgeGapLog } from '../../types/aiVoice';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface AiVoiceOverviewDashboardProps {
  properties: AiProperty[];
  agents: AiAgentConfig[];
  leads: AiLead[];
  callSessions: CallSession[];
  appointments: AppointmentEntity[];
  knowledgeGaps: KnowledgeGapLog[];
  onNavigateTab: (tab: string) => void;
  onOpenLiveSimulator: () => void;
}

export const AiVoiceOverviewDashboard: React.FC<AiVoiceOverviewDashboardProps> = ({
  properties,
  agents,
  leads,
  callSessions,
  appointments,
  knowledgeGaps,
  onNavigateTab,
  onOpenLiveSimulator,
}) => {
  const hotLeads = leads.filter(l => l.leadScore === 'HOT');
  const activeCalls = callSessions.filter(c => c.status === 'Active' || c.status === 'Connecting' || c.status === 'Waiting');
  const totalCalls = callSessions.length;
  const completedCalls = callSessions.filter(c => c.status === 'Completed').length;
  const conversionRate = totalCalls > 0 ? ((leads.filter(l => l.status === 'Site Visit' || l.status === 'Booked').length / totalCalls) * 100).toFixed(1) : '0';

  const chartData = [
    { name: 'Aug 20', calls: 14, leads: 5 },
    { name: 'Aug 21', calls: 22, leads: 8 },
    { name: 'Aug 22', calls: 19, leads: 6 },
    { name: 'Aug 23', calls: 31, leads: 12 },
    { name: 'Aug 24', calls: 28, leads: 10 },
    { name: 'Aug 25', calls: 45, leads: 18 },
    { name: 'Aug 26', calls: 38, leads: 14 },
  ];

  const leadTempData = [
    { name: 'HOT Leads', value: leads.filter(l => l.leadScore === 'HOT').length, color: '#ef4444' },
    { name: 'WARM Leads', value: leads.filter(l => l.leadScore === 'WARM').length, color: '#f59e0b' },
    { name: 'COLD Leads', value: leads.filter(l => l.leadScore === 'COLD').length, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-900/80 border border-indigo-700/50 px-3 py-1 rounded-full text-xs font-bold text-amber-400">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Multi-Tenant Isolated SaaS Workspace
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight font-serif text-white">
            RealEstate AI Voice Control Center
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Autonomous multi-property RAG voice agents handling concurrent customer calls, qualifying leads, and booking site visits securely.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenLiveSimulator}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-5 py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Phone className="w-4 h-4 fill-slate-950" />
            Launch Live AI Call Simulator
          </button>
          <button
            onClick={() => onNavigateTab('leads')}
            className="bg-indigo-800/80 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl text-xs uppercase tracking-wider border border-indigo-700 transition-colors cursor-pointer"
          >
            View Lead CRM ({leads.length})
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Properties</p>
            <p className="text-2xl font-black text-indigo-950">{properties.length}</p>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> RERA Verified
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active AI Agents</p>
            <p className="text-2xl font-black text-indigo-950">{agents.filter(a => a.isActive).length}</p>
            <p className="text-[11px] text-indigo-600 font-bold">RAG Grounded KB Active</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Bot className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hot Leads</p>
            <p className="text-2xl font-black text-rose-600">{hotListCount(leads)}</p>
            <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" /> High Intent & Budget
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversion Rate</p>
            <p className="text-2xl font-black text-emerald-600">{conversionRate}%</p>
            <p className="text-[11px] text-slate-500 font-medium">Site Visits / Total Calls</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-indigo-950">Call Volume & Lead Generation Trend</h3>
              <p className="text-xs text-slate-500">Daily inbound/outbound AI call volume vs qualified leads</p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-950 px-2.5 py-1 rounded-lg">Last 7 Days</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="calls" name="Total Calls" fill="#312e81" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leads" name="New Leads" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Temperature Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-indigo-950">AI Lead Temperature Breakdown</h3>
            <p className="text-xs text-slate-500">Automatic intent & timeline classification</p>
          </div>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadTempData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {leadTempData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
              <p className="font-bold text-rose-600">HOT</p>
              <p className="text-sm font-black">{leads.filter(l => l.leadScore === 'HOT').length}</p>
            </div>
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
              <p className="font-bold text-amber-600">WARM</p>
              <p className="text-sm font-black">{leads.filter(l => l.leadScore === 'WARM').length}</p>
            </div>
            <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
              <p className="font-bold text-blue-600">COLD</p>
              <p className="text-sm font-black">{leads.filter(l => l.leadScore === 'COLD').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Live Call Sessions & Knowledge Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-indigo-950">Recent Call Sessions & Transcripts</h3>
            <button onClick={() => onNavigateTab('calls')} className="text-xs font-bold text-indigo-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {callSessions.map(cs => (
              <div key={cs.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-950">{cs.customerName} ({cs.customerPhone})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cs.leadScore === 'HOT' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {cs.leadScore} LEAD
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">"{cs.aiSummary}"</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Property: <strong className="text-indigo-900">{cs.propertyName}</strong></span>
                  <span>Duration: {cs.durationSeconds}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-indigo-950">AI Knowledge Gaps (Unanswered Queries)</h3>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{knowledgeGaps.length} Gaps</span>
          </div>
          <div className="space-y-3">
            {knowledgeGaps.map(gap => (
              <div key={gap.id} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-indigo-950">{gap.propertyName}</span>
                  <span className="text-[10px] text-slate-500">{gap.timestamp}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">Customer asked: "{gap.customerQuestion}"</p>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-amber-700 italic">No exact KB match found. Guardrail triggered fallback.</span>
                  <button onClick={() => alert("Knowledge Base editor opened to add missing chunk.")} className="text-indigo-600 font-bold hover:underline">Add to KB</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

function hotListCount(leads: AiLead[]) {
  return leads.filter(l => l.leadScore === 'HOT').length;
}
