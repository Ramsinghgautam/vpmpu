import React, { useState } from 'react';
import { Bot, Mic, Volume2, Globe, Clock, ShieldCheck, CheckCircle, Save } from 'lucide-react';
import { AiAgentConfig, AiProperty } from '../../types/aiVoice';

interface AiVoiceAgentBuilderProps {
  properties: AiProperty[];
  agents: AiAgentConfig[];
  onUpdateAgent: (agent: AiAgentConfig) => void;
}

export const AiVoiceAgentBuilder: React.FC<AiVoiceAgentBuilderProps> = ({
  properties,
  agents,
  onUpdateAgent,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const currentAgent = agents.find(a => a.propertyId === selectedPropertyId) || agents[0];

  const [agentName, setAgentName] = useState(currentAgent?.agentName || '');
  const [voice, setVoice] = useState(currentAgent?.voice || 'hi-IN-Neural2-A');
  const [language, setLanguage] = useState(currentAgent?.language || 'Hinglish');
  const [greeting, setGreeting] = useState(currentAgent?.greeting || '');
  const [systemInstructions, setSystemInstructions] = useState(currentAgent?.systemInstructions || '');
  const [voiceProvider, setVoiceProvider] = useState(currentAgent?.voiceProvider || 'Gemini Live');
  const [businessHours, setBusinessHours] = useState(currentAgent?.businessHours || '09:00 AM - 08:00 PM IST');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when property changes
  React.useEffect(() => {
    const ag = agents.find(a => a.propertyId === selectedPropertyId);
    if (ag) {
      setAgentName(ag.agentName);
      setVoice(ag.voice);
      setLanguage(ag.language);
      setGreeting(ag.greeting);
      setSystemInstructions(ag.systemInstructions);
      setVoiceProvider(ag.voiceProvider);
      setBusinessHours(ag.businessHours);
    }
  }, [selectedPropertyId, agents]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAgent) return;

    const updated: AiAgentConfig = {
      ...currentAgent,
      agentName,
      voice,
      language,
      greeting,
      systemInstructions,
      voiceProvider,
      businessHours,
    };

    onUpdateAgent(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-950">AI Voice Agent Builder & Provider Configuration</h2>
          <p className="text-xs text-slate-500">Configure voice parameters, language, system prompts, and voice provider abstraction.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Select Property Agent:</label>
          <select
            value={selectedPropertyId}
            onChange={e => setSelectedPropertyId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> AI Voice Agent settings successfully updated and deployed!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Configuration */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-900" /> Agent Persona & Voice Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Voice Provider Abstraction</label>
              <select
                value={voiceProvider}
                onChange={e => setVoiceProvider(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 font-medium"
              >
                <option value="Gemini Live">Google Gemini Live Voice API</option>
                <option value="Twilio">Twilio Voice + Media Streams</option>
                <option value="ElevenLabs">ElevenLabs Ultra-Realistic TTS</option>
                <option value="Retell">Retell AI Voice Pipeline</option>
                <option value="Vapi">Vapi.ai Real-Time Voice Gateway</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Voice & Accent</label>
              <select
                value={voice}
                onChange={e => setVoice(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
              >
                <option value="hi-IN-Neural2-A">Indian Hindi Female (Neural2)</option>
                <option value="en-IN-Standard-A">Indian English Professional</option>
                <option value="en-US-Neural2-F">US English Corporate</option>
                <option value="ElevenLabs-Rachel">ElevenLabs Rachel (Warm & Empathetic)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Primary Language & Dialect</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
              >
                <option value="Hinglish">Hinglish (Natural Indian Real Estate Dialect)</option>
                <option value="Hindi">Pure Hindi</option>
                <option value="English">English</option>
                <option value="Multi-lingual">Auto-detect (English/Hindi/Hinglish)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Custom Voice Greeting</label>
            <textarea
              rows={2}
              value={greeting}
              onChange={e => setGreeting(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">System Instructions & Hallucination Guardrails</label>
            <textarea
              rows={4}
              value={systemInstructions}
              onChange={e => setSystemInstructions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
            <p className="text-[10px] text-slate-500 mt-1">Rule: If answer is not in Knowledge Base, agent must say: "I don't have verified information about that right now. Let me arrange a callback."</p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save & Deploy AI Agent
            </button>
          </div>
        </div>

        {/* Right Col: Live Agent Status & Preview */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-indigo-950">Active Deployment Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Phone Number</span>
                <span className="font-bold text-indigo-950">{currentAgent?.phoneNumber}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Business Hours</span>
                <span className="font-bold text-indigo-950">{businessHours}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Human Handoff Trigger</span>
                <span className="font-bold text-amber-600">On Request / Unknown Q</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-500">Tenant Isolation</span>
                <span className="font-bold text-emerald-600">Strictly Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
