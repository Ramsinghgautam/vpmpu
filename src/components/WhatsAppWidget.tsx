import React, { useState } from 'react';
import { MessageSquare, PhoneCall, X } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans">
      {open && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-amber-500/40 w-72 mb-3 animate-fadeIn space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="font-bold text-amber-400">VPM Director Desk</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300">
            Hello! Contact Mr. Prabhat Gautam for instant plot booking support or site visit in Prayagraj.
          </p>

          <a
            href="https://wa.me/917275300974?text=Hello%20Vigya%20Paurush%20Milestone,%20I%20want%20to%20book%20a%20site%20visit."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-center block shadow transition-colors"
          >
            Open WhatsApp Chat
          </a>

          <a
            href="tel:7275300974"
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-center block transition-colors"
          >
            Call +91 7275300974
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 border-2 border-white"
        aria-label="WhatsApp support"
      >
        <MessageSquare className="w-7 h-7" />
      </button>
    </div>
  );
};
