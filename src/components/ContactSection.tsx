import React, { useState } from 'react';
import { Phone, MapPin, Mail, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface ContactSectionProps {
  currentLang: Language;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert("Please enter name and phone number.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <section className="py-20 bg-indigo-950 text-white font-sans border-b border-indigo-900" id="contact-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-900 border border-indigo-800 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>DIRECT COMPANY CONTACT</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
            Connect With Our <span className="text-amber-400 italic font-serif">Executive Team in Prayagraj</span>
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            Visit our corporate office in New Jhunsi or call Director Prabhat Gautam directly for site visit arrangements, plot bookings, and investor advisory.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-indigo-900/80 p-6 sm:p-8 rounded-2xl border border-indigo-800 shadow-xl space-y-6 text-xs">
              
              <div className="border-b border-indigo-800 pb-4">
                <span className="text-amber-400 font-bold uppercase tracking-widest text-[10px]">
                  VIGYA PAURUSH MILESTONE PRIVATE LIMITED
                </span>
                <h3 className="text-xl font-serif font-bold text-white mt-1">Prabhat Gautam (Director)</h3>
              </div>

              <div className="space-y-4 text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Direct Phone & Support</span>
                    <a href="tel:7275300974" className="font-bold text-white hover:text-amber-300 text-sm block font-mono">
                      +91 7275300974
                    </a>
                    <a href="tel:6394918657" className="font-bold text-slate-300 hover:text-amber-300 text-xs block font-mono">
                      +91 6394918657 (Alternate)
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Registered Office Address</span>
                    <p className="font-medium text-white text-xs leading-relaxed">
                      4/199 EWS AVC New Jhunsi, Prayagraj, Uttar Pradesh, India - 211019
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">Office Working Hours</span>
                    <p className="font-medium text-slate-300">Monday – Sunday: 9:00 AM – 7:30 PM</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-indigo-800 flex flex-col gap-2">
                <a
                  href="https://wa.me/917275300974?text=Hello%20Prabhat%20Gautam,%20I%20want%20to%20inquire%20about%20plots%20in%20Jhunsi."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors text-center flex items-center justify-center gap-2 uppercase tracking-wider text-[11px]"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Direct on WhatsApp</span>
                </a>
              </div>

            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-indigo-900/80 p-6 sm:p-8 rounded-2xl border border-indigo-800 shadow-xl">
            <h3 className="text-lg font-serif font-bold text-white mb-4">Send a Direct Inquiry Message</h3>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-serif font-bold text-emerald-300 text-base">Inquiry Submitted Successfully!</h4>
                <p className="text-xs text-slate-300">
                  Thank you, {name}. Our sales advisory desk in Jhunsi will get in touch with you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Anand Kumar"
                      className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9415001122"
                      className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. email@example.com"
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Message / Requirements</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe plot size preference, location requirement, or investor plan details..."
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-widest py-3.5 rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Submit Inquiry to Director Office</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
