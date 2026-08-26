import React, { useState } from 'react';
import { Bot, Building2, Database, PhoneCall, Users, Calendar, BarChart3, Settings, ShieldCheck, ArrowLeft, Plus } from 'lucide-react';
import { INITIAL_ORGANIZATION, INITIAL_PROPERTIES, INITIAL_DOCUMENTS, INITIAL_AGENTS, INITIAL_LEADS, INITIAL_CALL_SESSIONS, INITIAL_APPOINTMENTS, INITIAL_KNOWLEDGE_GAPS } from '../../data/aiVoiceData';
import { AiProperty, PropertyKnowledgeDocument, AiAgentConfig, AiLead, CallSession, AppointmentEntity, KnowledgeGapLog } from '../../types/aiVoice';

import { AiVoiceOverviewDashboard } from './AiVoiceOverviewDashboard';
import { AiVoicePropertiesManager } from './AiVoicePropertiesManager';
import { AiVoiceKnowledgeBaseManager } from './AiVoiceKnowledgeBaseManager';
import { AiVoiceAgentBuilder } from './AiVoiceAgentBuilder';
import { AiVoiceLiveSimulator } from './AiVoiceLiveSimulator';
import { AiVoiceLeadsCrm } from './AiVoiceLeadsCrm';
import { AiVoiceAppointmentsView } from './AiVoiceAppointmentsView';
import { AiVoiceAnalyticsAndGaps } from './AiVoiceAnalyticsAndGaps';
import { AiVoiceSettingsView } from './AiVoiceSettingsView';

interface RealEstateAiVoiceHubProps {
  onBackToMain: () => void;
}

export const RealEstateAiVoiceHub: React.FC<RealEstateAiVoiceHubProps> = ({ onBackToMain }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'knowledge' | 'agents' | 'simulator' | 'leads' | 'appointments' | 'analytics' | 'settings'>('dashboard');

  // State management
  const [properties, setProperties] = useState<AiProperty[]>(INITIAL_PROPERTIES);
  const [documents, setDocuments] = useState<PropertyKnowledgeDocument[]>(INITIAL_DOCUMENTS);
  const [agents, setAgents] = useState<AiAgentConfig[]>(INITIAL_AGENTS);
  const [leads, setLeads] = useState<AiLead[]>(INITIAL_LEADS);
  const [callSessions, setCallSessions] = useState<CallSession[]>(INITIAL_CALL_SESSIONS);
  const [appointments, setAppointments] = useState<AppointmentEntity[]>(INITIAL_APPOINTMENTS);
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGapLog[]>(INITIAL_KNOWLEDGE_GAPS);

  // Handlers
  const handleAddProperty = (prop: AiProperty) => {
    setProperties(prev => [prop, ...prev]);
  };

  const handleUpdateProperty = (prop: AiProperty) => {
    setProperties(prev => prev.map(p => p.id === prop.id ? prop : p));
  };

  const handleDeleteProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  const handleUploadDocument = (doc: PropertyKnowledgeDocument) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const handleUpdateAgent = (agent: AiAgentConfig) => {
    setAgents(prev => prev.map(a => a.id === agent.id ? agent : a));
  };

  const handleAddNewCallSession = (session: CallSession) => {
    setCallSessions(prev => [session, ...prev]);
  };

  const handleAddNewLead = (lead: AiLead) => {
    setLeads(prev => [lead, ...prev]);
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: AiLead['status']) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  const handleAddAppointment = (apt: AppointmentEntity) => {
    setAppointments(prev => [apt, ...prev]);
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: BarChart3 },
    { id: 'properties', label: 'Properties & Projects', icon: Building2 },
    { id: 'knowledge', label: 'Knowledge Base (RAG)', icon: Database },
    { id: 'agents', label: 'AI Voice Agents', icon: Bot },
    { id: 'simulator', label: 'Live Call Simulator', icon: PhoneCall },
    { id: 'leads', label: 'Lead CRM Pipeline', icon: Users },
    { id: 'appointments', label: 'Appointments & Visits', icon: Calendar },
    { id: 'analytics', label: 'Analytics & KB Gaps', icon: BarChart3 },
    { id: 'settings', label: 'Org & Voice Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col">
      {/* Top Header */}
      <header className="bg-indigo-950 text-white px-6 py-4 shadow-md flex items-center justify-between border-b border-indigo-900">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToMain}
            className="flex items-center gap-1.5 bg-indigo-900/80 hover:bg-indigo-800 text-amber-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-700/50"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Realty Portal
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight font-serif text-white">
                RealEstate AI Voice <span className="text-amber-400 text-xs font-sans uppercase px-2 py-0.5 bg-indigo-900 rounded-full">SaaS Hub</span>
              </h1>
              <p className="text-[11px] text-slate-300">Tenant: {INITIAL_ORGANIZATION.name} ({INITIAL_ORGANIZATION.subscriptionPlan})</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-xs">
          <span className="bg-indigo-900/80 text-amber-400 px-3 py-1.5 rounded-xl font-bold border border-indigo-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Multi-Tenant Isolation Active
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-64 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1.5 shrink-0 h-fit">
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            AI Voice Platform Menu
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-950 text-amber-400 shadow-sm'
                    : 'text-slate-600 hover:text-indigo-950 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'dashboard' && (
            <AiVoiceOverviewDashboard
              properties={properties}
              agents={agents}
              leads={leads}
              callSessions={callSessions}
              appointments={appointments}
              knowledgeGaps={knowledgeGaps}
              onNavigateTab={setActiveTab}
              onOpenLiveSimulator={() => setActiveTab('simulator')}
            />
          )}

          {activeTab === 'properties' && (
            <AiVoicePropertiesManager
              properties={properties}
              onAddProperty={handleAddProperty}
              onUpdateProperty={handleUpdateProperty}
              onDeleteProperty={handleDeleteProperty}
            />
          )}

          {activeTab === 'knowledge' && (
            <AiVoiceKnowledgeBaseManager
              properties={properties}
              documents={documents}
              onUploadDocument={handleUploadDocument}
            />
          )}

          {activeTab === 'agents' && (
            <AiVoiceAgentBuilder
              properties={properties}
              agents={agents}
              onUpdateAgent={handleUpdateAgent}
            />
          )}

          {activeTab === 'simulator' && (
            <AiVoiceLiveSimulator
              properties={properties}
              agents={agents}
              onAddNewCallSession={handleAddNewCallSession}
              onAddNewLead={handleAddNewLead}
              onAddNewAppointment={handleAddAppointment}
            />
          )}

          {activeTab === 'leads' && (
            <AiVoiceLeadsCrm
              leads={leads}
              onUpdateLeadStatus={handleUpdateLeadStatus}
            />
          )}

          {activeTab === 'appointments' && (
            <AiVoiceAppointmentsView
              appointments={appointments}
              properties={properties}
              onAddAppointment={handleAddAppointment}
            />
          )}

          {activeTab === 'analytics' && (
            <AiVoiceAnalyticsAndGaps
              callSessions={callSessions}
              knowledgeGaps={knowledgeGaps}
            />
          )}

          {activeTab === 'settings' && (
            <AiVoiceSettingsView
              organization={INITIAL_ORGANIZATION}
            />
          )}
        </main>
      </div>
    </div>
  );
};
