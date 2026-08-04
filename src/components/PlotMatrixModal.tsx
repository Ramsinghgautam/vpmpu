import React, { useState } from 'react';
import { Project, Plot } from '../types';
import { X, ShieldCheck, Check, Info, Download, MapPin, Calculator } from 'lucide-react';
import { getBuyerCommissionPercent, formatINR } from '../utils/calculators';

interface PlotMatrixModalProps {
  project: Project | null;
  onClose: () => void;
  onProceedBooking: (project: Project, plot: Plot) => void;
}

export const PlotMatrixModal: React.FC<PlotMatrixModalProps> = ({
  project,
  onClose,
  onProceedBooking
}) => {
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                RERA: {project.reraNumber}
              </span>
              <span className="text-xs text-slate-300 font-medium">{project.location}</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">{project.name} — Interactive Plot Layout</h3>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Status Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-semibold">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-emerald-500 rounded-sm shadow-xs" />
                <span>Available Plot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-rose-500 rounded-sm shadow-xs" />
                <span>Booked Plot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-purple-600 rounded-sm shadow-xs" />
                <span>Investor Locked</span>
              </div>
            </div>

            <span className="text-slate-500 text-[11px]">Click any available plot card to inspect price & book @ ₹10,000</span>
          </div>

          {/* Plots Layout Matrix Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {project.plotsGrid.map((plot) => {
              const isSelected = selectedPlot?.plotNo === plot.plotNo;
              const isAvailable = plot.status === 'available';
              const buyerCashback = getBuyerCommissionPercent(1);

              let statusBg = 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100';
              if (plot.status === 'booked') statusBg = 'bg-rose-50 border-rose-200 text-rose-800 cursor-not-allowed opacity-75';
              if (plot.status === 'investor_locked') statusBg = 'bg-purple-50 border-purple-200 text-purple-900 cursor-not-allowed opacity-75';
              if (isSelected) statusBg = 'bg-amber-100 border-amber-500 text-amber-950 ring-2 ring-amber-400';

              return (
                <div
                  key={plot.plotNo}
                  onClick={() => isAvailable && setSelectedPlot(plot)}
                  className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${statusBg} ${isAvailable ? 'cursor-pointer shadow-xs hover:shadow-md' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm">{plot.plotNo}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/70 border border-slate-200">
                      {plot.facing}
                    </span>
                  </div>

                  <div className="mt-2 space-y-0.5">
                    <p className="font-bold text-xs">{plot.sizeSqft} sq.ft</p>
                    <p className="text-[11px] opacity-80">{plot.dimensions}</p>
                    <p className="font-semibold text-slate-900 text-[11px] mt-1">₹{plot.ratePerSqft} / sq.ft</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold">
                    <span>{formatINR(plot.totalPrice)}</span>
                    {isAvailable && (
                      <span className="text-emerald-700 bg-emerald-100 px-1 rounded">Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Plot Detailed Inspection Drawer */}
          {selectedPlot && (
            <div className="bg-slate-900 text-white rounded-xl p-5 border border-amber-500/40 space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                    Selected Plot Details
                  </span>
                  <h4 className="text-xl font-extrabold text-white">
                    Plot No: {selectedPlot.plotNo} ({selectedPlot.category})
                  </h4>
                </div>

                <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full">
                  Status: Available for Immediate Booking
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Total Land Area</span>
                  <p className="text-sm font-bold text-white">{selectedPlot.sizeSqft} sq.ft ({selectedPlot.dimensions})</p>
                </div>
                <div>
                  <span className="text-slate-400">Rate per Sq.Ft</span>
                  <p className="text-sm font-bold text-amber-300">₹{selectedPlot.ratePerSqft} / sq.ft</p>
                </div>
                <div>
                  <span className="text-slate-400">Total Plot Value</span>
                  <p className="text-sm font-extrabold text-emerald-400">{formatINR(selectedPlot.totalPrice)}</p>
                </div>
                <div>
                  <span className="text-slate-400">1st Plot Buyer Cash Back</span>
                  <p className="text-sm font-bold text-amber-400">15.5% ({formatINR((selectedPlot.totalPrice * 15.5) / 100)})</p>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                <div className="text-xs text-slate-300">
                  <span>Initial Booking Fee: <strong className="text-amber-400 font-bold">₹10,000</strong></span>
                  <span className="ml-2 text-slate-400">(Balance payable in 12/24/36/48/60 monthly EMIs or full payment)</span>
                </div>

                <button
                  onClick={() => onProceedBooking(project, selectedPlot)}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                  <span>Book Plot {selectedPlot.plotNo} Now @ ₹10,000</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
          <span>Need help choosing a plot? Call Prabhat Gautam at +91 7275300974</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 font-semibold transition-colors"
          >
            Close Map View
          </button>
        </div>

      </div>
    </div>
  );
};
