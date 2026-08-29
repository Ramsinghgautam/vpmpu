import React, { useState } from 'react';
import { Project, Plot, Language } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { INITIAL_PROJECTS } from '../data/mockData';
import { MapPin, ArrowRight, Download, Calendar, Grid, CheckCircle2, ShieldCheck, FileText, Info } from 'lucide-react';

interface FeaturedProjectsProps {
  currentLang?: Language;
  onSelectPlotForBooking: (project: Project, plot?: Plot) => void;
  onOpenPlotMatrix: (project: Project) => void;
  onBookSiteVisit: (project: Project) => void;
  projects?: Project[];
  selectedLocationFilter?: string;
}

export const FeaturedProjects: React.FC<FeaturedProjectsProps> = ({
  currentLang = 'en',
  onSelectPlotForBooking,
  onOpenPlotMatrix,
  onBookSiteVisit,
  projects = INITIAL_PROJECTS,
  selectedLocationFilter = 'all'
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'jhunsi' | 'naini' | 'phaphamau'>('all');
  const isHi = currentLang === 'hi';
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const sourceProjects = projects && projects.length > 0 ? projects : INITIAL_PROJECTS;

  const filteredProjects = sourceProjects.filter(p => {
    if (selectedLocationFilter && selectedLocationFilter !== 'all') {
      if (p.location !== selectedLocationFilter) return false;
    }
    if (activeTab === 'jhunsi') return p.city.toLowerCase().includes('jhunsi') || p.location.toLowerCase().includes('jhunsi');
    if (activeTab === 'naini') return p.location.toLowerCase().includes('naini');
    if (activeTab === 'phaphamau') return p.location.toLowerCase().includes('phaphamau');
    return true;
  });

  return (
    <section className="py-20 bg-white text-slate-900 font-sans border-b border-slate-200" id="projects-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3 border border-amber-200">
              <Grid className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.propertyProjects || "PROPERTY PROJECTS & TOWNSHIPS"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-indigo-950 tracking-tight">
              {t.primePlotsHeading || "Prime Plots in Prayagraj Growth Corridors"}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl">
              {t.primePlotsSub || "100% Legal Dakhil Kharij plots ready for immediate house construction and high yield appreciation."}
            </p>
          </div>

          {/* Location Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-[11px] font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'all' ? 'bg-indigo-950 text-amber-400 font-bold shadow-xs' : 'text-slate-600 hover:text-indigo-950'}`}
            >
              {t.allProjects || "All Projects"}
            </button>
            <button
              onClick={() => setActiveTab('jhunsi')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'jhunsi' ? 'bg-indigo-950 text-amber-400 font-bold shadow-xs' : 'text-slate-600 hover:text-indigo-950'}`}
            >
              {t.newJhunsi || "New Jhunsi"}
            </button>
            <button
              onClick={() => setActiveTab('naini')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'naini' ? 'bg-indigo-950 text-amber-400 font-bold shadow-xs' : 'text-slate-600 hover:text-indigo-950'}`}
            >
              {t.nainiHub || "Naini Hub"}
            </button>
            <button
              onClick={() => setActiveTab('phaphamau')}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'phaphamau' ? 'bg-indigo-950 text-amber-400 font-bold shadow-xs' : 'text-slate-600 hover:text-indigo-950'}`}
            >
              {t.phaphamau || "Phaphamau"}
            </button>
          </div>
        </div>

        {/* Projects Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Image & Badge Overlay */}
              <div className="relative h-64 overflow-hidden bg-indigo-950">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-transparent to-transparent" />
                
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    RERA: {project.reraNumber}
                  </span>
                  <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                    {project.availablePlots} Plots Left
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] text-amber-300 font-bold tracking-widest uppercase">
                    {project.location}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white group-hover:text-amber-300 transition-colors">
                    {project.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4 font-sans">
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Key Specs */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl text-xs border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rate per Sq.Ft</span>
                    <p className="text-sm font-bold text-indigo-950">{project.priceRange}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Plot Dimensions</span>
                    <p className="text-sm font-bold text-slate-800">{project.plotSizes.slice(0, 2).join(", ")}</p>
                  </div>
                </div>

                {/* Features Pill list */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Township Infrastructure</span>
                  <div className="flex flex-wrap gap-1.5">
                    {project.features.slice(0, 4).map((f, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-950 border border-indigo-200 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenPlotMatrix(project)}
                      className="bg-indigo-950 hover:bg-indigo-900 text-amber-300 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                      <Grid className="w-3.5 h-3.5 text-amber-400" />
                      <span>View Plot Map Grid</span>
                    </button>

                    <button
                      onClick={() => onBookSiteVisit(project)}
                      className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Book Visit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectPlotForBooking(project)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Book @ ₹10k</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
