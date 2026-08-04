import React from 'react';
import { MOCK_BLOG_POSTS } from '../data/mockData';
import { FileText, ArrowRight, Calendar, User } from 'lucide-react';

export const BlogSection: React.FC = () => {
  return (
    <section className="py-20 bg-white text-slate-900 font-sans border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-3 border border-amber-200">
              <FileText className="w-3.5 h-3.5" />
              <span>REAL ESTATE BLOG & NEWS</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Prayagraj Property <span className="text-sky-900">Market Insights</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_BLOG_POSTS.map((post) => (
            <div key={post.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span className="bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full font-bold">{post.category}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug hover:text-sky-900 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-slate-100 mt-4 flex items-center justify-between text-xs font-bold text-sky-900">
                <span className="flex items-center gap-1 text-slate-500 font-normal text-[11px]">
                  <User className="w-3 h-3" /> {post.author}
                </span>
                <button onClick={() => alert(`Reading full article: ${post.title}`)} className="flex items-center gap-1 hover:underline">
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
