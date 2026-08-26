import React, { useState } from 'react';
import { Settings, Shield, Lock, Cpu, CheckCircle, Save, Key } from 'lucide-react';
import { AiOrganization } from '../../types/aiVoice';

interface AiVoiceSettingsViewProps {
  organization: AiOrganization;
}

export const AiVoiceSettingsView: React.FC<AiVoiceSettingsViewProps> = ({ organization }) => {
  const [orgName, setOrgName] = useState(organization.name);
  const [ownerEmail, setOwnerEmail] = useState(organization.email);
  const [phone, setPhone] = useState(organization.phone);
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSy**************************');
  const [twilioSid, setTwilioSid] = useState('AC**************************');
  const [elevenLabsKey, setElevenLabsKey] = useState('sk_**************************');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-indigo-950">Organization Settings & Voice Provider Abstraction</h2>
        <p className="text-xs text-slate-500">Configure global API credentials, voice gateway parameters, and security policies.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-emerald-600" /> Organization settings successfully saved!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-900" /> Organization Profile
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Organization Name</label>
            <input
              type="text"
              value={orgName}
              onChange={e => setOrgName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 font-medium"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Owner Email</label>
              <input
                type="email"
                value={ownerEmail}
                onChange={e => setOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 font-medium"
              />
            </div>
          </div>
          <div className="pt-2">
            <span className="text-xs bg-indigo-50 text-indigo-900 px-3 py-1.5 rounded-lg font-bold">Subscription: {organization.subscriptionPlan} (Enterprise Tier)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-600" /> Voice Provider API Keys (Encrypted)
          </h3>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Google Gemini API Key (Server-side)</label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={e => setGeminiApiKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Twilio Voice Webhook SID / Secret</label>
            <input
              type="password"
              value={twilioSid}
              onChange={e => setTwilioSid(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">ElevenLabs TTS API Key</label>
            <input
              type="password"
              value={elevenLabsKey}
              onChange={e => setElevenLabsKey(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-900"
            />
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Organization Settings
          </button>
        </div>
      </form>
    </div>
  );
};
