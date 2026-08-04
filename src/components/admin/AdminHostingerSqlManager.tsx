import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  FileCode, 
  Terminal, 
  Layers, 
  ExternalLink, 
  HardDrive, 
  Key, 
  ShieldCheck,
  RefreshCw,
  Search,
  Code2
} from 'lucide-react';

export const AdminHostingerSqlManager: React.FC = () => {
  const [sqlContent, setSqlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchSqlSchema = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/database/hostinger-sql');
      const data = await res.json();
      if (data.success) {
        setSqlContent(data.sql);
      }
    } catch (err) {
      console.error('Error fetching Hostinger SQL schema:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSqlSchema();
  }, []);

  const handleCopySql = () => {
    if (!sqlContent) return;
    navigator.clipboard.writeText(sqlContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    window.open('/api/database/hostinger-sql?download=true', '_blank');
  };

  const tableSummaryList = [
    { name: 'users', desc: 'Admins, Customers, Agents & Investors', icon: '👤' },
    { name: 'projects', desc: 'Real Estate Townships & Layouts', icon: '🏗️' },
    { name: 'plots', desc: 'Plots Inventory & Rate Slabs', icon: '📐' },
    { name: 'bookings', desc: 'Plot Bookings & Installment Plans', icon: '📝' },
    { name: 'payments', desc: 'Razorpay Transactions & Signatures', icon: '💳' },
    { name: 'investment_records', desc: 'Investor High-ROI Deposits', icon: '📈' },
    { name: 'agent_network', desc: 'MLM Referral Tree & Commissions', icon: '👥' },
    { name: 'leads', desc: 'Customer Site Visit Inquiries', icon: '📞' },
    { name: 'financial_transactions', desc: 'Accounting Inflow & Outflow Ledger', icon: '💰' },
    { name: 'gallery_media', desc: 'Customer Success Stories & Videos', icon: '🖼️' },
    { name: 'audit_logs', desc: 'Security & Gateway Handshake Logs', icon: '🛡️' }
  ];

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">Hostinger MySQL Database Script</h2>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MariaDB / MySQL 8.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Production schema & seed dataset ready for Hostinger hPanel & phpMyAdmin import.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={handleCopySql}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-sky-400" />
                <span>Copy SQL Script</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadFile}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download .SQL File</span>
          </button>
        </div>
      </div>

      {/* Database Tables Overview Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Included Relational Database Tables (11 Modules)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {tableSummaryList.map((tbl) => (
            <div key={tbl.name} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-base">{tbl.icon}</span>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">TABLE</span>
              </div>
              <h4 className="font-extrabold text-xs text-white truncate">{tbl.name}</h4>
              <p className="text-[10px] text-slate-400 truncate">{tbl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hostinger Import Guide Accordion */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          <span>Step-by-Step Hostinger phpMyAdmin Import Instructions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">1</span>
            <h4 className="font-bold text-slate-200">Open Hostinger hPanel</h4>
            <p className="text-slate-400 text-[11px]">
              Navigate to <strong>Databases</strong> &gt; <strong>MySQL Databases</strong> in your Hostinger control panel.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">2</span>
            <h4 className="font-bold text-slate-200">Create New Database</h4>
            <p className="text-slate-400 text-[11px]">
              Name: <code className="text-amber-400 font-bold">vpm_realestate</code>. Assign a database user & password.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">3</span>
            <h4 className="font-bold text-slate-200">Launch phpMyAdmin</h4>
            <p className="text-slate-400 text-[11px]">
              Click <strong>Enter phpMyAdmin</strong> next to your new database name.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-black text-xs flex items-center justify-center">4</span>
            <h4 className="font-bold text-slate-200">Import .SQL File</h4>
            <p className="text-slate-400 text-[11px]">
              Click the <strong>Import</strong> tab, select <code className="text-amber-400">hostinger_database.sql</code>, and click <strong>Go</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* SQL Script Viewer */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-xs">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-white">hostinger_database.sql</span>
            <span className="text-slate-500 text-[11px]">({(sqlContent.length / 1024).toFixed(1)} KB)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchSqlSchema}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh SQL"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950 overflow-x-auto max-h-[500px]">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading SQL Schema...</div>
          ) : (
            <pre className="font-mono text-xs text-amber-300/90 leading-relaxed whitespace-pre font-medium">
              {sqlContent}
            </pre>
          )}
        </div>
      </div>

    </div>
  );
};
