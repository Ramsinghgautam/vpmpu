import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { Language } from '../types';

interface FAQSectionProps {
  currentLang: Language;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ currentLang }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How does the ₹10,000 plot booking process work?",
      answer: "You can lock your preferred plot in any VPM project with a flat booking deposit of ₹10,000. An official digital receipt is instantly generated. The remaining plot balance can be paid in full (with a 5% discount) or via easy 12 to 24-month EMI installments.",
      category: "Risk-Free Investors"
    },
    {
      question: "Are the plot lands 100% legal with Dakhil Kharij?",
      answer: "Yes, all townships developed by VIGYA PAURUSH MILESTONE PRIVATE LIMITED are 100% freehold land with clear title deeds. Dakhil Kharij and immediate registry are executed at the local Prayagraj sub-registrar office.",
      category: "Risk-Free Investors"
    },
    {
      question: "How does the Risk-Free Investor Commission Cash Back work?",
      answer: "When a customer buys plots directly, VPM provides a progressive commission cash back structure starting at 15.5% on the 1st plot, 15% on the next 2 plots, down to 4.5% on the 9th plot.",
      category: "Risk-Free Investors"
    },
    {
      question: "What is the Agent Commission & Team Bonus structure?",
      answer: "Registered agents earn 8% direct commission on their first plot sale down to 2% on the 9th plot. Additionally, agents earn MLM-style level bonuses ranging from 2% at Risk-Free Investor Level up to 5% at Co-Partner Level.",
      category: "Agents"
    },
    {
      question: "What are the rules and conditions for Risk-Free Investor Plans?",
      answer: "Investor return slabs range from ₹1050/sqft (16.5% ROI) up to ₹2150/sqft (32% ROI). All slabs operate under a standard base plot rate of ₹1,000 per sq.ft. The investor ROI payout cannot exceed the total invested amount, ensuring 100% capital protection backed by land collateral.",
      category: "Investors"
    },
    {
      question: "Where is the main corporate office located in Prayagraj?",
      answer: "Our main office is located at 4/199 EWS AVC New Jhunsi, Prayagraj, Uttar Pradesh, India. Director Prabhat Gautam can be reached directly at +91 7275300974 or +91 6394918657.",
      category: "General"
    }
  ];

  return (
    <section className="py-20 bg-slate-50 text-slate-900 font-sans border-b border-slate-200" id="faq-section">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-200">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>

          <h2 className="text-3xl font-serif font-black text-indigo-950 tracking-tight">
            Got Questions? <span className="text-amber-600 italic font-serif">We Have Answers</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex justify-between items-center gap-4 font-serif font-bold text-indigo-950 text-sm hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="bg-indigo-100 text-indigo-950 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-amber-600' : ''}`} />
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-sans animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
