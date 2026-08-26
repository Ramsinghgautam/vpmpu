import React, { useState } from 'react';
import { Users, Search, Filter, Flame, Phone, Mail, Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import { AiLead } from '../../types/aiVoice';

interface AiVoiceLeadsCrmProps {
  leads: AiLead[];
  onUpdateLeadStatus: (leadId: string, newStatus: AiLead['status']) => void;
}

export const AiVoiceLeadsCrm: React.FC<AiVoiceLeadsCrmProps> = ({ leads, onUpdateLeadStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<string>('ALL');

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || l.phone.includes(searchTerm) || l.propertyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = filterScore === 'ALL' || l.leadScore === filterScore;
    return matchesSearch && matchesScore;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-950">Lead Management CRM (AI Scored Pipeline)</h2>
          <p className="text-xs text-slate-500">Automatically classified into HOT, WARM, and COLD leads based on AI voice call transcripts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search leads by name or phone..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
          <select
            value={filterScore}
            onChange={e => setFilterScore(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
          >
            <option value="ALL">All Scores</option>
            <option value="HOT">HOT Leads</option>
            <option value="WARM">WARM Leads</option>
            <option value="COLD">COLD Leads</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 text-slate-200 uppercase text-[10px] tracking-wider">
                <th className="p-4">Customer Name & Phone</th>
                <th className="p-4">Property Interested</th>
                <th className="p-4">AI Lead Score</th>
                <th className="p-4">Intent & Budget</th>
                <th className="p-4">Pipeline Status</th>
                <th className="p-4">Assigned Sales Agent</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-indigo-950 space-y-0.5">
                    <p className="text-sm">{lead.name}</p>
                    <p className="text-[11px] text-slate-500 font-normal">{lead.phone}</p>
                  </td>
                  <td className="p-4 text-slate-700 font-semibold">{lead.propertyName}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                      lead.leadScore === 'HOT' ? 'bg-rose-100 text-rose-700' : lead.leadScore === 'WARM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {lead.leadScore === 'HOT' && <Flame className="w-3 h-3 text-rose-600" />}
                      {lead.leadScore} LEAD
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs">{lead.scoreReason}</p>
                  </td>
                  <td className="p-4 text-slate-600 space-y-0.5">
                    <p className="font-medium">{lead.intent}</p>
                    <p className="text-[11px] font-bold text-indigo-900">{lead.budget}</p>
                  </td>
                  <td className="p-4">
                    <select
                      value={lead.status}
                      onChange={e => onUpdateLeadStatus(lead.id, e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Booked">Booked</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-700 font-medium">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-700" /> {lead.assignedAgentName}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => alert(`Opening lead details & call transcripts for ${lead.name}`)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-950 font-bold px-3 py-1.5 rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
