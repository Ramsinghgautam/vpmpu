import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, User, Bot, Sparkles, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { AiProperty, AiAgentConfig, CallSession, AiLead, AppointmentEntity } from '../../types/aiVoice';

interface AiVoiceLiveSimulatorProps {
  properties: AiProperty[];
  agents: AiAgentConfig[];
  onAddNewCallSession: (session: CallSession) => void;
  onAddNewLead: (lead: AiLead) => void;
  onAddNewAppointment: (appointment: AppointmentEntity) => void;
}

export const AiVoiceLiveSimulator: React.FC<AiVoiceLiveSimulatorProps> = ({
  properties,
  agents,
  onAddNewCallSession,
  onAddNewLead,
  onAddNewAppointment,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const currentProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const currentAgent = agents.find(a => a.propertyId === selectedPropertyId) || agents[0];

  const [callActive, setCallActive] = useState(false);
  const [customerName, setCustomerName] = useState('Rahul Verma');
  const [customerPhone, setCustomerPhone] = useState('+91 9811223344');
  const [inputMessage, setInputMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ speaker: 'customer' | 'ai' | 'system'; text: string; timestamp: string }>>([]);
  const [kbChunksUsed, setKbChunksUsed] = useState<string[]>([]);
  const [leadScoreCalculated, setLeadScoreCalculated] = useState<'HOT' | 'WARM' | 'COLD'>('WARM');
  const [callDuration, setCallDuration] = useState(0);

  const [callIntentStage, setCallIntentStage] = useState<'INITIAL' | 'DETERMINING_INTENT' | 'SELLER_QUALIFICATION' | 'PARTNER_QUALIFICATION' | 'OBJECTION_HANDLING' | 'HUMAN_TRANSFER_READY'>('INITIAL');
  const [leadCategory, setLeadCategory] = useState<'SELLER' | 'ASSOCIATE_PARTNER' | 'BOTH' | 'UNKNOWN'>('UNKNOWN');

  const startCall = () => {
    setCallActive(true);
    setCallDuration(0);
    setCallIntentStage('DETERMINING_INTENT');
    const greetingText = `नमस्कार! मैं Vigya Paurush Milestone Realty से ${currentAgent?.agentName || 'AI Calling Agent'} बोल रहा हूँ। आपने अपनी property को sell करने या Associate Partner के रूप में जुड़ने में interest दिखाया था। क्या अभी 2 मिनट बात करना convenient है?`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    setTranscript([
      { speaker: 'system', text: `Call session initiated (ID: CALL-${Math.floor(Math.random() * 900000 + 100000)})`, timestamp: nowTime },
      { speaker: 'ai', text: greetingText, timestamp: nowTime }
    ]);
    setKbChunksUsed(['chunk_greeting_intro', 'chunk_associates_partner_intro']);
  };

  const endCall = () => {
    if (!callActive) return;
    setCallActive(false);

    // Save session
    const sessionId = `CALL-${Math.floor(Math.random() * 900000 + 100000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    const newSession: CallSession = {
      id: `call_${Date.now()}`,
      callSessionId: sessionId,
      organizationId: 'org_vpm_001',
      propertyId: currentProperty.id,
      propertyName: currentProperty.name,
      agentId: currentAgent.id,
      agentName: currentAgent.agentName,
      customerName,
      customerPhone,
      startTime: nowStr,
      durationSeconds: callDuration || 45,
      status: 'Completed',
      transcript,
      aiSummary: `Customer ${customerName} inquired about ${currentProperty.name}. Discussed pricing and configurations.`,
      leadScore: leadScoreCalculated,
      customerRequirements: `Interested in ${currentProperty.name}, budget discussion completed.`,
      nextAction: leadScoreCalculated === 'HOT' ? 'Schedule site visit' : 'Send brochure on WhatsApp',
      kbChunksUsed,
    };

    onAddNewCallSession(newSession);

    // Also auto-create lead if HOT/WARM
    const newLead: AiLead = {
      id: `lead_${Date.now()}`,
      organizationId: 'org_vpm_001',
      propertyId: currentProperty.id,
      propertyName: currentProperty.name,
      name: customerName,
      phone: customerPhone,
      intent: `Inquiry on ${currentProperty.name}`,
      budget: '₹20 Lakh - ₹30 Lakh',
      configuration: '1200 Sqft Plot',
      location: 'Prayagraj',
      purpose: 'End Use',
      timeline: 'Immediate (0-30 days)',
      leadScore: leadScoreCalculated,
      scoreReason: 'Captured during live AI voice call simulation.',
      status: 'Qualified',
      source: 'AI Voice Call',
      lastCallDate: nowStr,
      nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      assignedAgentName: 'Pooja Sharma',
      notes: `Call ended successfully. Lead score: ${leadScoreCalculated}`,
    };
    onAddNewLead(newLead);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !callActive) return;

    const userText = inputMessage;
    setInputMessage('');
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTranscript(prev => [...prev, { speaker: 'customer', text: userText, timestamp: nowTime }]);
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      const queryLower = userText.toLowerCase();
      let aiResponse = '';
      let chunks = ['chunk_general_kb'];
      let score: 'HOT' | 'WARM' | 'COLD' = leadScoreCalculated;

      if (callIntentStage === 'DETERMINING_INTENT') {
        if (queryLower.includes('sell') || queryLower.includes('property') || queryLower.includes('zameen') || queryLower.includes('plot') || queryLower.includes('bechni')) {
          setLeadCategory('SELLER');
          setCallIntentStage('SELLER_QUALIFICATION');
          aiResponse = `बहुत बढ़िया। आप अपनी खुद की property हमारी कंपनी के माध्यम से sell करना चाहते हैं। कृपया बताएं, आपकी property किस location में है और plot/land का total area कितना है?`;
          chunks = ['chunk_property_seller_qualification_flow'];
          score = 'HOT';
          setLeadScoreCalculated('HOT');
        } else if (queryLower.includes('partner') || queryLower.includes('associate') || queryLower.includes('broker') || queryLower.includes('dealer') || queryLower.includes('kaam')) {
          setLeadCategory('ASSOCIATE_PARTNER');
          setCallIntentStage('PARTNER_QUALIFICATION');
          aiResponse = `Associate Partner वह व्यक्ति होता है जो कंपनी के साथ जुड़कर उपलब्ध प्लॉट या प्रॉपर्टी की बिक्री में सहयोग करता है। क्या आप पहले से real estate में काम करते हैं और आपका working area कौन सा है?`;
          chunks = ['chunk_associate_partner_definition_model'];
          score = 'HOT';
          setLeadScoreCalculated('HOT');
        } else if (queryLower.includes('19%') || queryLower.includes('scheme') || queryLower.includes('installment') || queryLower.includes('plan') || queryLower.includes('emi') || queryLower.includes('mahine') || queryLower.includes('maah') || queryLower.includes('kitस्त') || queryLower.includes('₹') || queryLower.includes('rs') || queryLower.includes('hazar')) {
          aiResponse = `हमारी 19% Free Plot / Installment Scheme में 12 महीने से 120 महीने तक के plans उपलब्ध हैं। उदाहरण के लिए, 72 महीने के plan में मासिक किस्त ₹15,125 है (कुल भुगतान ₹10,89,000)। 6 plots के विक्रय के बाद ₹17,998 की वापसी राशि बताई गई है। आप लगभग कितनी monthly installment या अवधि (12 से 120 महीने) रखना चाहते हैं?`;
          chunks = ['chunk_19_percent_free_plot_scheme_plans', 'chunk_quick_plan_selection'];
          score = 'HOT';
          setLeadScoreCalculated('HOT');
        } else if (queryLower.includes('nahi') || queryLower.includes('no') || queryLower.includes('busy')) {
          aiResponse = `कोई बात नहीं! आपका समय देने के लिए धन्यवाद। आपका दिन शुभ हो।`;
          chunks = ['chunk_polite_exit'];
          score = 'COLD';
          setLeadScoreCalculated('COLD');
        } else {
          aiResponse = `मैं समझ नहीं पाया। क्या आप अपनी खुद की property sell करना चाहते हैं, Associate Partner के रूप में जुड़ना चाहते हैं, या हमारी 19% Free Plot Installment Scheme की जानकारी लेना चाहते हैं?`;
          chunks = ['chunk_clarify_intent'];
        }
      } 
      else if (callIntentStage === 'SELLER_QUALIFICATION') {
        setCallIntentStage('HUMAN_TRANSFER_READY');
        aiResponse = `ठीक है, आपकी expected price और location note कर ली गई है। Final valuation और market suitability property documents की verification के बाद संबंधित team confirm करेगी। इस point पर हमारी concerned team (Pooja Sharma) आपको exact information और आगे की process समझाएगी। मैं आपकी request priority follow-up के लिए note कर रहा हूँ।`;
        chunks = ['chunk_human_agent_transfer_protocol'];
        score = 'HOT';
        setLeadScoreCalculated('HOT');
      }
      else if (callIntentStage === 'PARTNER_QUALIFICATION') {
        setCallIntentStage('HUMAN_TRANSFER_READY');
        aiResponse = `आपकी जानकारी नोट हो गई है। Associate Partner बनने के लिए हमारे relationship manager आपको official agreement और commission guidelines समझाने के लिए कॉल करेंगे।`;
        chunks = ['chunk_partner_transfer'];
        score = 'HOT';
        setLeadScoreCalculated('HOT');
      }
      else {
        if (queryLower.includes('commission') || queryLower.includes('brokerage')) {
          aiResponse = `Commission की exact जानकारी आपकी category और applicable company policy पर depend करती है। मैं बिना verify किए कोई amount नहीं बताना चाहूंगा। हमारी concerned team आपको exact structure confirm कर सकती है।`;
          chunks = ['chunk_guardrail_commission'];
        } else if (queryLower.includes('guarantee') || queryLower.includes('return')) {
          aiResponse = `इसकी सही जानकारी मैं अपने उपलब्ध रिकॉर्ड में verify नहीं कर पा रहा हूँ। मैं आपकी query संबंधित team तक भेज देता हूँ।`;
          chunks = ['chunk_fallback_guardrail'];
        } else {
          aiResponse = `आपकी बात मैंने नोट कर ली है। इस point पर हमारी concerned team आपको exact information और आगे की process समझाएगी।`;
          chunks = ['chunk_human_agent_transfer_protocol'];
          setCallIntentStage('HUMAN_TRANSFER_READY');
        }
      }

      setKbChunksUsed(prev => Array.from(new Set([...prev, ...chunks])));
      setTranscript(prev => [...prev, { speaker: 'ai', text: aiResponse, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
    }, 900);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-950">Live AI Voice Call Simulator & Concurrent Call Center</h2>
          <p className="text-xs text-slate-500">Simulate inbound customer calls with real-time RAG Knowledge Base retrieval & Gemini voice response.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Target Property:</label>
          <select
            value={selectedPropertyId}
            disabled={callActive}
            onChange={e => setSelectedPropertyId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900 disabled:opacity-60"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Call Control Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-indigo-900" /> Caller & Agent Setup
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Name</label>
                <input
                  type="text"
                  disabled={callActive}
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Phone</label>
                <input
                  type="text"
                  disabled={callActive}
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-indigo-950">Active AI Voice Agent</p>
            <p className="text-xs font-semibold text-slate-800">{currentAgent?.agentName}</p>
            <p className="text-[11px] text-slate-500">Voice: {currentAgent?.voice} | Lang: {currentAgent?.language}</p>
          </div>

          <div className="pt-2">
            {!callActive ? (
              <button
                onClick={startCall}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4 fill-white" /> Simulate Inbound Call
              </button>
            ) : (
              <button
                onClick={endCall}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" /> End Call & Save Lead
              </button>
            )}
          </div>

          {callActive && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1 animate-pulse">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> LIVE CALL SESSION ACTIVE
              </span>
              <p className="text-[11px] text-emerald-700 font-mono">Session ID: CALL-{Math.floor(Math.random() * 900000 + 100000)}</p>
            </div>
          )}
        </div>

        {/* Right 2 Cols: Interactive Transcript & RAG Debug Inspector */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 h-[600px]">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-indigo-950">Real-Time Voice Call Transcript & RAG Grounding</h3>
              <p className="text-xs text-slate-500">Property: {currentProperty.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${leadScoreCalculated === 'HOT' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                Lead Score: {leadScoreCalculated}
              </span>
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Mic className="w-10 h-10 stroke-1" />
                <p className="text-xs">Click "Simulate Inbound Call" to start conversing with the AI Voice Agent.</p>
              </div>
            ) : (
              transcript.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${item.speaker === 'customer' ? 'justify-end' : item.speaker === 'ai' ? 'justify-start' : 'justify-center'}`}
                >
                  {item.speaker === 'system' ? (
                    <div className="bg-slate-100 text-slate-500 text-[10px] font-mono px-3 py-1 rounded-full">
                      {item.text} ({item.timestamp})
                    </div>
                  ) : (
                    <div className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                      item.speaker === 'customer'
                        ? 'bg-indigo-950 text-white rounded-br-xs'
                        : 'bg-slate-100 text-indigo-950 rounded-bl-xs border border-slate-200'
                    }`}>
                      <div className="flex justify-between items-center text-[10px] opacity-75">
                        <span className="font-bold">{item.speaker === 'customer' ? customerName : currentAgent.agentName}</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <p className="font-medium leading-relaxed">{item.text}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            {isAiThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 animate-pulse flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-900 animate-spin" />
                  Retrieving KB chunks & generating Gemini voice response...
                </div>
              </div>
            )}
          </div>

          {/* KB Chunks Debug Inspector */}
          {kbChunksUsed.length > 0 && (
            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 flex items-center gap-2 text-[11px]">
              <span className="font-bold text-indigo-900 shrink-0">KB Chunks Used:</span>
              <div className="flex flex-wrap gap-1">
                {kbChunksUsed.map((chk, i) => (
                  <span key={i} className="bg-indigo-900 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">{chk}</span>
                ))}
              </div>
            </div>
          )}

          {/* Customer Input Box */}
          <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              disabled={!callActive}
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={callActive ? "Type customer response (e.g. 'What is the price?' or 'Can I visit Sunday?')..." : "Start call first..."}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-900 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={!callActive || !inputMessage.trim()}
              className="bg-indigo-950 hover:bg-indigo-900 disabled:opacity-50 text-amber-400 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
            >
              Send Speech
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
