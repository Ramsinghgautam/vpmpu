import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, TrendingUp, Building2, MapPin, Search, Award, CheckCircle2, Calculator, Share2, Send, Check, Copy, MessageCircle, CreditCard, X, Receipt, QrCode, IndianRupee, Lock, Printer, User as UserIcon, Upload, Paperclip, FileText, Trash2 } from 'lucide-react';
import { Language, User } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { formatINR } from '../utils/calculators';
import { isTransactionIdAlreadyUsed, registerCompletedTransactionId } from '../utils/transactionRegistry';

interface HeroSectionProps {
  currentLang: Language;
  onNavigate: (section: string) => void;
  onSelectProjectFilter?: (location: string) => void;
  currentUser?: User | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ currentLang, onNavigate, currentUser }) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const isHi = currentLang === 'hi';

  const [preferredLocation, setPreferredLocation] = useState('all');
  const [length, setLength] = useState<number>(40);
  const [width, setWidth] = useState<number>(25);
  const [rateSqft, setRateSqft] = useState<number>(1000);
  const [selectedTenure, setSelectedTenure] = useState<number>(12);
  const [copiedShare, setCopiedShare] = useState(false);
  const [receiptFile, setReceiptFile] = useState<{ name: string; url: string; size: string } | null>(null);

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
      const url = URL.createObjectURL(file);
      setReceiptFile({
        name: file.name,
        size: `${sizeInMb} MB`,
        url,
      });
    }
  };

  // Pay EMI Modal State
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [emiBookingId, setEmiBookingId] = useState('VPM-BK-1001');
  const [emiCustomerName, setEmiCustomerName] = useState('');
  const [emiPhone, setEmiPhone] = useState('');
  const [emiEmail, setEmiEmail] = useState('');
  const [emiAmount, setEmiAmount] = useState<number>(10000);
  const [emiPaymentMethod, setEmiPaymentMethod] = useState<'upi' | 'razorpay' | 'card' | 'netbanking'>('upi');
  const [emiTransactionId, setEmiTransactionId] = useState('');
  const [emiTransactionDate, setEmiTransactionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [emiPaymentError, setEmiPaymentError] = useState<string | null>(null);
  const [emiReceiptData, setEmiReceiptData] = useState<any | null>(null);
  const [isProcessingEmi, setIsProcessingEmi] = useState(false);

  const calculatedSqft = length * width;
  const calculatedAutoTotal = calculatedSqft * rateSqft;
  const effectiveTotalAmount = calculatedAutoTotal;
  const estimatedMonthlyEmi = Math.round(Math.max(0, effectiveTotalAmount - 10000) / selectedTenure);

  const handlePayEmiSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalTxnId = '';
    if (emiPaymentMethod === 'upi') {
      const cleanDigits = emiTransactionId.trim().replace(/\D/g, '');
      if (!emiTransactionId || !emiTransactionId.trim() || cleanDigits.length !== 12) {
        setEmiPaymentError('Transaction Failed! A valid 12-digit Transaction ID / UTR number is required.');
        return;
      }

      if (isTransactionIdAlreadyUsed(cleanDigits) || isTransactionIdAlreadyUsed(emiTransactionId)) {
        setEmiPaymentError('Transaction Failed! This Transaction ID / UTR has ALREADY been completed in a previous transaction. Duplicate transaction IDs cannot be re-validated or reused.');
        return;
      }
      finalTxnId = cleanDigits;
    } else {
      finalTxnId = `RZP_${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    }

    if (!emiTransactionDate) {
      setEmiPaymentError('Transaction Failed! Date of Transaction is required.');
      return;
    }

    setEmiPaymentError(null);
    setIsProcessingEmi(true);
    setTimeout(() => {
      registerCompletedTransactionId(finalTxnId);
      setEmiReceiptData({
        bookingId: emiBookingId || 'VPM-BK-1001',
        customerName: emiCustomerName || 'Valued Buyer',
        phone: emiPhone || '9876543210',
        amountPaid: emiAmount,
        paymentMethod: emiPaymentMethod === 'upi' ? 'UPI Direct (GPay/PhonePe)' : emiPaymentMethod === 'razorpay' ? 'Razorpay Secure' : emiPaymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking',
        paymentId: finalTxnId,
        date: emiTransactionDate || new Date().toISOString().split('T')[0],
        plotDetails: `Milestone Township (${length}ft × ${width}ft)`,
        remainingBalance: Math.max(0, effectiveTotalAmount - 10000 - emiAmount)
      });
      setIsProcessingEmi(false);
    }, 1000);
  };

  const currentShareUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-nm225nax7ntpt3gypgzx72-47550606502.asia-east1.run.app';
  const shareMessageText = "Vigya Paurush Milestone Real Estate Prayagraj - Prime Clear Title Plots, ₹10,000 Booking, Up to 32% ROI & Direct Commissions!";

  const handleSharePlatform = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareMessageText}\n${currentShareUrl}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    } else {
      alert("Link copied! Share with platform users & clients: " + currentShareUrl);
    }
  };

  return (
    <section id="home-section" className="relative min-h-[85vh] flex items-center bg-indigo-950 text-white">
      {/* Background Image with Dark Indigo Gradient */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80"
          alt="Vigya Paurush Milestone Real Estate Township Prayagraj"
          className="w-full h-full object-cover opacity-20 scale-105 transform transition-transform duration-10000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/95 to-indigo-900/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-indigo-900/80 border border-indigo-800 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-inner">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{t.companyName}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight text-white leading-tight">
              {t.heroTitle || "Prime Plots & Free Plot Scheme in Prayagraj"}
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-sans font-medium">
              We deliver a complete real estate solution in Prayagraj: Prime clear-title plots at fair prices for <strong>Free Plot Scheme</strong>, direct commissions and plot ownership for <strong>Agents</strong>, and guaranteed up to 32% ROI with fast principal recovery for <strong>Investors</strong>.
            </p>

            {/* 3 Core Solutions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl pt-1">
              <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-xs text-slate-200 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1. Free Plot Scheme</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">
                  Prime location plots, clear titles, transparent rates & flat ₹10,000 token booking.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-xs text-slate-200 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. For Agents</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">
                  Fair commission payouts on every deal plus guaranteed plot ownership support.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-950/80 border border-indigo-800/80 text-xs text-slate-200 space-y-1 shadow-sm">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>3. For Investors</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">
                  Up to 32% guaranteed ROI slabs with rapid capital recovery & bank-grade security.
                </p>
              </div>
            </div>

            {/* Value Highlights Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
              <div className="flex items-center gap-2 bg-indigo-900/60 border border-indigo-800 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.flat10kBooking || "Flat ₹10,000 Booking"}</span>
              </div>
              <div className="flex items-center gap-2 bg-indigo-900/60 border border-indigo-800 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{t.upTo32Roi || "Up to 32% Investor ROI"}</span>
              </div>
              <div className="flex items-center gap-2 bg-indigo-900/60 border border-indigo-800 p-3 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{t.upTo15BuyerCash || "Up to 15.5% Buyer Cash"}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                onClick={() => onNavigate('plot-booking')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                <span>{t.bookPlotBtn}</span>
              </button>

              <button
                onClick={() => onNavigate('projects')}
                className="bg-indigo-900 hover:bg-indigo-850 text-white border border-indigo-800 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-indigo-300" />
                <span>{t.exploreProjects}</span>
              </button>

              <button
                onClick={() => onNavigate('investment')}
                className="bg-indigo-900/70 hover:bg-indigo-850 text-amber-300 border border-amber-500/40 px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>{t.viewInvestmentPlans}</span>
              </button>
            </div>

            {/* Share Links to Send WhatsApp, Telegram & Platform Users */}
            <div className="bg-indigo-900/80 border border-indigo-700/80 p-4 rounded-2xl shadow-2xl space-y-2.5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-amber-400 shrink-0" />
                  Share Property Links & Details
                </span>
                {copiedShare && (
                  <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/40 animate-pulse">
                    Link Copied!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-snug">
                Send project details, booking plans, and plot matrix instantly to Free Plot Scheme clients, agents, and platform contacts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-bold pt-1">
                {/* WhatsApp Share Link */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessageText + " " + currentShareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl border border-emerald-400/50 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-[11px] font-bold"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-white" />
                  <span>WhatsApp</span>
                </a>

                {/* Telegram Share Link */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(currentShareUrl)}&text=${encodeURIComponent(shareMessageText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-sky-600 hover:bg-sky-500 text-white p-2.5 rounded-xl border border-sky-400/50 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-[11px] font-bold"
                >
                  <Send className="w-4 h-4 shrink-0 text-white" />
                  <span>Telegram</span>
                </a>

                {/* Platform Users / Copy Link */}
                <button
                  type="button"
                  onClick={handleSharePlatform}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-2.5 rounded-xl border border-amber-300 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 text-[11px] font-black cursor-pointer"
                >
                  {copiedShare ? (
                    <Check className="w-4 h-4 shrink-0 text-slate-950" />
                  ) : (
                    <Copy className="w-4 h-4 shrink-0 text-slate-950" />
                  )}
                  <span>{copiedShare ? 'Link Copied!' : 'Platform Users'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Hero Right Quick Search Widget */}
          <div className="lg:col-span-5 bg-indigo-900/90 border border-indigo-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <div className="border-b border-indigo-800 pb-4 mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-amber-400" />
                  {t.quickSearch || "Quick Property Search"}
                </h3>
                <p className="text-xs text-slate-300 font-sans">
                  {t.searchPlots || "Find residential & commercial plots in Prayagraj"}
                </p>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                {t.instantAvailability || "Instant Availability"}
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onNavigate('projects');
              }}
              className="space-y-4 text-xs font-sans"
            >
              <div>
                <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1.5">Preferred Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  <select
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
                  >
                    <option value="all">All Locations (Prayagraj)</option>
                    <option value="jhunsi">New Jhunsi (GT Road Corridor)</option>
                    <option value="naini">Naini ADA Industrial Zone</option>
                    <option value="phaphamau">Phaphamau Ganga Expressway</option>
                  </select>
                </div>
              </div>

              {/* 4 Selection Buttons / Dropdowns Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Selection for Length */}
                <div>
                  <label className="block text-amber-300 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                    <span>1. Length (Feet)</span>
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
                  >
                    <option value={20}>20 Feet</option>
                    <option value={25}>25 Feet</option>
                    <option value={30}>30 Feet</option>
                    <option value={35}>35 Feet</option>
                    <option value={40}>40 Feet (Standard)</option>
                    <option value={45}>45 Feet</option>
                    <option value={50}>50 Feet</option>
                    <option value={60}>60 Feet</option>
                  </select>
                </div>

                {/* 2. Selection for Width */}
                <div>
                  <label className="block text-amber-300 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                    <span>2. Width (Feet)</span>
                  </label>
                  <select
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
                  >
                    <option value={15}>15 Feet</option>
                    <option value={20}>20 Feet</option>
                    <option value={25}>25 Feet (Standard)</option>
                    <option value={30}>30 Feet</option>
                    <option value={35}>35 Feet</option>
                    <option value={40}>40 Feet</option>
                    <option value={50}>50 Feet</option>
                  </select>
                </div>

                {/* 3. Selection for Rate in Sq.Ft */}
                <div>
                  <label className="block text-amber-300 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                    <span>3. Rate in Sq.Ft (₹)</span>
                  </label>
                  <select
                    value={rateSqft}
                    onChange={(e) => setRateSqft(Number(e.target.value))}
                    className="w-full bg-indigo-950 border border-indigo-800 rounded-lg px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
                  >
                    <option value={1000}>₹1,000 / sq.ft (Base Rate)</option>
                    <option value={1050}>₹1,050 / sq.ft</option>
                    <option value={1120}>₹1,120 / sq.ft</option>
                    <option value={1210}>₹1,210 / sq.ft</option>
                    <option value={1320}>₹1,320 / sq.ft</option>
                    <option value={1450}>₹1,450 / sq.ft</option>
                    <option value={1600}>₹1,600 / sq.ft</option>
                    <option value={1770}>₹1,770 / sq.ft</option>
                    <option value={1950}>₹1,950 / sq.ft</option>
                    <option value={2150}>₹2,150 / sq.ft</option>
                  </select>
                </div>

                {/* 4. Selection for EMI Tenure (Months) */}
                <div>
                  <label className="block text-amber-300 font-bold uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                    <span>4. EMI Tenure</span>
                  </label>
                  <select
                    id="hero-emi-tenure-select"
                    value={selectedTenure}
                    onChange={(e) => setSelectedTenure(Number(e.target.value))}
                    className="w-full bg-indigo-950 border border-amber-500/50 hover:border-amber-400 focus:border-amber-400 rounded-lg px-2 py-2.5 text-amber-300 font-black focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer text-xs transition-all shadow-inner"
                  >
                    <option value={12}>12 months (1 Year)</option>
                    <option value={24}>24 months (2 Years)</option>
                    <option value={36}>36 months (3 Years)</option>
                    <option value={48}>48 months (4 Years)</option>
                    <option value={60}>60 months (5 Years)</option>
                    <option value={72}>72 months (6 Years)</option>
                    <option value={84}>84 months (7 Years)</option>
                    <option value={96}>96 months (8 Years)</option>
                    <option value={108}>108 months (9 Years)</option>
                    <option value={120}>120 months (10 Years)</option>
                  </select>
                </div>
              </div>

              {/* Calculated Area & Price Summary Box */}
              <div className="bg-indigo-900/70 p-3.5 rounded-xl border border-indigo-700/80 space-y-2.5">
                {/* 1. User Name, 2. User ID, & 3. EMI Number details */}
                <div className="bg-indigo-950/80 border border-indigo-800/80 p-2.5 rounded-lg space-y-1.5 shadow-inner">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="text-amber-400 font-extrabold text-[11px]">1.</span>
                      <UserIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      User Name:
                    </span>
                    <strong className="text-amber-300 font-bold">{currentUser?.name || 'Rajesh Sharma'}</strong>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-indigo-900/90">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="text-indigo-400 font-extrabold text-[11px]">2.</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      User ID:
                    </span>
                    <span className="font-mono text-emerald-300 font-bold text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      {currentUser?.id || 'VPM-USR-8821'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-indigo-900/90">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="text-amber-400 font-extrabold text-[11px]">3.</span>
                      <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Extra EMI:
                    </span>
                    <strong className="text-amber-300 font-bold text-[10px] bg-indigo-900/90 px-2 py-0.5 rounded border border-indigo-700/70">
                      {emiBookingId ? `EMI #01 / ${selectedTenure} (${emiBookingId})` : `EMI #01 / ${selectedTenure} (VPM-EMI-1001)`}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px] pt-1 border-t border-indigo-900/90">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <span className="text-amber-400 font-extrabold text-[11px]">4.</span>
                      <Receipt className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Extra EMI Amount:
                    </span>
                    <strong className="text-amber-300 font-bold text-[10px] bg-indigo-900/90 px-2 py-0.5 rounded border border-indigo-700/70">
                      {formatINR(estimatedMonthlyEmi)}
                    </strong>
                  </div>
                </div>

                <div className="flex justify-between items-center text-slate-200 pt-0.5">
                  <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    Plot Area: <strong className="text-white">{length} ft × {width} ft = {calculatedSqft} Sq.Ft</strong>
                  </span>
                  <span className="font-extrabold text-amber-300 text-sm">
                    {formatINR(effectiveTotalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-300 pt-1.5 border-t border-indigo-800/60">
                  <span>Standard Lock Booking Fee</span>
                  <span className="font-bold text-emerald-400">₹10,000</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-indigo-200 pt-1 border-t border-indigo-800/40">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-amber-400" />
                    Est. {selectedTenure}-Month Easy EMI
                  </span>
                  <span className="font-extrabold text-amber-300">{formatINR(estimatedMonthlyEmi)} / mo</span>
                </div>

                {/* 5. Payment / Deposit Receipt Upload Option */}
                <div className="pt-2 border-t border-indigo-800/60 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-200 font-bold flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Attach Payment / Token Receipt:
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80 font-mono font-semibold">
                      {receiptFile ? 'RECEIPT ATTACHED' : 'OPTIONAL PROOF'}
                    </span>
                  </div>

                  {!receiptFile ? (
                    <label className="flex flex-col items-center justify-center p-2.5 bg-indigo-950/90 hover:bg-indigo-900/90 border border-dashed border-indigo-600/80 hover:border-amber-400 rounded-xl cursor-pointer transition-all group">
                      <div className="flex items-center gap-2 text-[11px] text-indigo-200 group-hover:text-amber-300">
                        <Paperclip className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform shrink-0" />
                        <span className="font-semibold">Click or drag receipt file (PDF, JPG, PNG)</span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5">Instant verification & digital ledger logging</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-2 bg-emerald-950/90 border border-emerald-700/80 rounded-xl text-xs">
                      <div className="flex items-center gap-2 overflow-hidden pr-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-600/80 flex items-center justify-center text-emerald-300 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-[11px] font-bold text-white truncate">{receiptFile.name}</p>
                          <p className="text-[9px] text-emerald-300">{receiptFile.size} • Attached</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {receiptFile.url && (
                          <a
                            href={receiptFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-indigo-900 hover:bg-indigo-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 border border-indigo-700"
                          >
                            View
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => setReceiptFile(null)}
                          className="p-1 rounded bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 hover:text-white transition-colors border border-rose-800/80 cursor-pointer"
                          title="Remove receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Bottom Live Counter Stats Bar */}
        <div className="mt-16 pt-8 border-t border-indigo-900 grid grid-cols-2 md:grid-cols-4 gap-6 text-center font-sans">
          <div className="p-4 bg-indigo-900/50 rounded-xl border border-indigo-800">
            <p className="text-2xl lg:text-3xl font-serif font-black text-amber-400">5+ Acres</p>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-bold">Total Land Developed</p>
          </div>
          <div className="p-4 bg-indigo-900/50 rounded-xl border border-indigo-800">
            <p className="text-2xl lg:text-3xl font-serif font-black text-emerald-400">100% Clear</p>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-bold">Legal Title</p>
          </div>
          <div className="p-4 bg-indigo-900/50 rounded-xl border border-indigo-800">
            <p className="text-2xl lg:text-3xl font-serif font-black text-indigo-300">Up to 32%</p>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-bold">Investor Guaranteed ROI</p>
          </div>
          <div className="p-4 bg-indigo-900/50 rounded-xl border border-indigo-800">
            <p className="text-2xl lg:text-3xl font-serif font-black text-amber-300">15.5% / 8%</p>
            <p className="text-[10px] text-slate-300 mt-1 uppercase tracking-widest font-bold">Free Plot Scheme & Agent Commission</p>
          </div>
        </div>

      </div>

      {/* Pay EMI Modal */}
      {showEmiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-indigo-950 to-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Pay Plot EMI Online
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Milestone Real Estate Prayagraj
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmiModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 font-sans">
              {!emiReceiptData ? (
                <form onSubmit={handlePayEmiSubmit} className="space-y-4">
                  <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Current Plot Selection</span>
                      <strong className="text-emerald-300 text-sm font-black">{length}ft × {width}ft ({calculatedSqft} Sq.Ft)</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Price</span>
                      <strong className="text-amber-400 text-sm font-black">{formatINR(effectiveTotalAmount)}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Booking / Plot Registration No. <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={emiBookingId}
                      onChange={(e) => setEmiBookingId(e.target.value)}
                      placeholder="e.g. VPM-BK-1001 or Plot No. A-12"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Customer Name</label>
                      <input
                        type="text"
                        required
                        value={emiCustomerName}
                        onChange={(e) => setEmiCustomerName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={emiPhone}
                        onChange={(e) => setEmiPhone(e.target.value)}
                        placeholder="10-digit phone"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Email ID</label>
                      <input
                        type="email"
                        value={emiEmail}
                        onChange={(e) => setEmiEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Select EMI Installment Amount (₹)
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[5000, 10000, 15000, 25000, 50000, estimatedMonthlyEmi].filter((v, i, a) => a.indexOf(v) === i && v > 0).slice(0, 3).map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setEmiAmount(amt)}
                          className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                            emiAmount === amt
                              ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {formatINR(amt)}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={emiAmount}
                      onChange={(e) => setEmiAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-black text-amber-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { id: 'upi', label: 'UPI (GPay/PhonePe)', icon: QrCode },
                        { id: 'razorpay', label: 'Razorpay Gateway', icon: ShieldCheck },
                        { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                        { id: 'netbanking', label: 'Net Banking', icon: Lock },
                      ].map((method) => {
                        const IconComponent = method.icon;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setEmiPaymentMethod(method.id as any)}
                            className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all cursor-pointer ${
                              emiPaymentMethod === method.id
                                ? 'bg-emerald-950/70 border-emerald-500 text-white font-bold ring-1 ring-emerald-500'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <IconComponent className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-[11px]">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mandatory Transaction ID & Date Fields */}
                  <div className="space-y-3 pt-1 border-t border-slate-800/80">
                    {/* Transaction ID / UTR Input - Visible only for UPI / QR Code */}
                    {emiPaymentMethod === 'upi' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
                          <span>Transaction ID / UTR Number <span className="text-rose-400">*</span></span>
                          <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            Mandatory to Submit
                          </span>
                        </label>
                        <input
                          type="text"
                          required
                          value={emiTransactionId}
                          onChange={(e) => {
                            setEmiTransactionId(e.target.value);
                            if (emiPaymentError) setEmiPaymentError(null);
                          }}
                          placeholder="e.g. 12-digit UTR 423910293841 or TXN98765432"
                          className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none ${
                            emiPaymentError && !emiTransactionId.trim()
                              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-950/30 text-rose-200'
                              : 'border-slate-800 focus:border-emerald-500'
                          }`}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Enter the 12-digit UTR or reference transaction ID from GPay, PhonePe, Paytm, or bank transfer.
                        </p>
                      </div>
                    )}

                    {/* Date of Transaction Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
                        <span>Date of Transaction <span className="text-rose-400">*</span></span>
                        <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                          Payment Date
                        </span>
                      </label>
                      <input
                        type="date"
                        required
                        value={emiTransactionDate}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          setEmiTransactionDate(e.target.value);
                          if (emiPaymentError) setEmiPaymentError(null);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                      />
                    </div>
                  </div>

                  {/* Transaction Status Alert */}
                  {(() => {
                    const cleanEmiDigits = emiTransactionId.trim().replace(/\D/g, '');
                    const isEmiTxnValid12 = cleanEmiDigits.length === 12;
                    const hasEmiTxnInput = emiTransactionId.trim().length > 0;
                    const isAlreadyUsed = isTransactionIdAlreadyUsed(cleanEmiDigits) || isTransactionIdAlreadyUsed(emiTransactionId);

                    if (isAlreadyUsed) {
                      return (
                        <div className="bg-rose-950/90 border-2 border-rose-500 p-3 rounded-xl text-rose-200 text-xs flex items-center gap-2.5 shadow-lg animate-pulse">
                          <X className="w-5 h-5 text-rose-400 shrink-0" />
                          <div>
                            <p className="font-extrabold text-[11px] uppercase tracking-wide text-rose-400">Duplicate Transaction ID Detected!</p>
                            <p className="text-[10px] text-rose-200">
                              This Transaction ID / UTR (<span className="font-mono font-bold text-amber-300">{cleanEmiDigits || emiTransactionId}</span>) has ALREADY been completed in a previous transaction and cannot be reused.
                            </p>
                          </div>
                        </div>
                      );
                    } else if (isEmiTxnValid12 && emiTransactionDate) {
                      return (
                        <div className="bg-emerald-950/80 border border-emerald-500/60 p-3 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5 shadow-inner">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <p className="font-extrabold text-[11px] uppercase tracking-wide">12-Digit Transaction Verified!</p>
                            <p className="text-[10px] text-emerald-200">
                              Transaction UTR (<span className="font-mono font-bold text-amber-300">{cleanEmiDigits}</span>) & Date ({emiTransactionDate}) attached.
                            </p>
                          </div>
                        </div>
                      );
                    } else if (hasEmiTxnInput && !isEmiTxnValid12) {
                      return (
                        <div className="bg-rose-950/80 border border-rose-500/60 p-3 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 shadow-inner">
                          <X className="w-4 h-4 text-rose-400 shrink-0" />
                          <div>
                            <p className="font-extrabold text-[11px] uppercase tracking-wide">Invalid Transaction ID (12 Digits Required)</p>
                            <p className="text-[10px] text-rose-200">
                              Enter a valid 12-digit UTR/Reference ID. Currently entered: <span className="font-bold text-amber-300">{cleanEmiDigits.length}/12</span> digits.
                            </p>
                          </div>
                        </div>
                      );
                    } else if (emiPaymentError) {
                      return (
                        <div className="bg-rose-950/80 border border-rose-500/60 p-3 rounded-xl text-rose-300 text-xs flex items-center gap-2.5 shadow-inner animate-pulse">
                          <X className="w-4 h-4 text-rose-400 shrink-0" />
                          <div>
                            <p className="font-extrabold text-[11px] uppercase tracking-wide">Cannot Submit Transaction!</p>
                            <p className="text-[10px] text-rose-200">{emiPaymentError}</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-xl text-amber-300/90 text-[11px] flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>A unique 12-digit UTR/Transaction ID & Date are strictly required to process this transaction.</span>
                        </div>
                      );
                    }
                  })()}

                  <button
                    type="submit"
                    disabled={isProcessingEmi}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs border border-emerald-400/50 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isProcessingEmi ? (
                      <span>Processing EMI Payment...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Pay {formatINR(emiAmount)} EMI Now</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* EMI Payment Receipt */
                <div className="space-y-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-1">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-base font-black text-white">EMI Payment Successful!</h4>
                    <p className="text-xs text-emerald-300">Transaction ID: {emiReceiptData.paymentId}</p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Booking Ref:</span>
                      <strong className="text-white font-bold">{emiReceiptData.bookingId}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Customer Name:</span>
                      <strong className="text-white">{emiReceiptData.customerName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">EMI Amount Paid:</span>
                      <strong className="text-emerald-400 font-black text-sm">{formatINR(emiReceiptData.amountPaid)}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Payment Gateway:</span>
                      <span className="text-slate-200">{emiReceiptData.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Transaction Date:</span>
                      <strong className="text-amber-300 font-mono">{emiReceiptData.date}</strong>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Est. Remaining Balance:</span>
                      <strong className="text-amber-400 font-bold">{formatINR(emiReceiptData.remainingBalance)}</strong>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Printer className="w-4 h-4 text-slate-300" />
                      <span>Print Receipt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEmiModal(false)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
