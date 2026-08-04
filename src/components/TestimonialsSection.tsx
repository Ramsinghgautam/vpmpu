import React from 'react';
import { MOCK_TESTIMONIALS } from '../data/mockData';
import { Star, Quote, Award } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 bg-slate-900 text-white font-sans border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3.5 py-1 rounded-full">
            <Award className="w-3.5 h-3.5" />
            <span>CUSTOMER SUCCESS STORIES</span>
          </div>

          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Trusted by <span className="text-amber-400">Plot Buyers, Agents & Investors</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_TESTIMONIALS.map((t) => (
            <div key={t.id} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                <p className="text-slate-300 text-xs italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-amber-400" />
                <div>
                  <h4 className="font-bold text-white text-xs">{t.name}</h4>
                  <p className="text-[10px] text-amber-300">{t.role} ({t.location})</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
