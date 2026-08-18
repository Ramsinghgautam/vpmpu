import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  Clock,
  Plus,
  Edit2,
  ShieldCheck,
  Calendar,
  Percent,
  TrendingUp,
  Award,
} from 'lucide-react';
import { EmiFreePlotSchemePlan, EmiMasterConfigAuditLog } from '../../../types';
import { formatINR } from '../../../utils/calculators';
import {
  DEFAULT_EMI_SCHEME_PLANS,
  saveEmiPlansToStorage,
  loadAuditLogsFromStorage,
  saveAuditLogsToStorage,
} from '../../../utils/freePlotEmiSchemeEngine';

interface AdminMasterConfigManagerProps {
  plans: EmiFreePlotSchemePlan[];
  onPlansUpdated: (updatedPlans: EmiFreePlotSchemePlan[]) => void;
  isDarkMode?: boolean;
}

export const AdminMasterConfigManager: React.FC<AdminMasterConfigManagerProps> = ({
  plans,
  onPlansUpdated,
  isDarkMode = false,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<EmiFreePlotSchemePlan | null>(null);
  const [editingPlan, setEditingPlan] = useState<EmiFreePlotSchemePlan | null>(null);
  const [editReason, setEditReason] = useState<string>('');
  const [auditLogs, setAuditLogs] = useState<EmiMasterConfigAuditLog[]>(() => loadAuditLogsFromStorage());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenEdit = (plan: EmiFreePlotSchemePlan) => {
    setSelectedPlan(plan);
    setEditingPlan({ ...plan });
    setEditReason('');
    setSuccessMessage(null);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan || !selectedPlan) return;

    const updated = plans.map((p) =>
      p.tenureMonths === editingPlan.tenureMonths ? { ...editingPlan } : p
    );

    const auditEntry: EmiMasterConfigAuditLog = {
      id: `CFG-AUD-${Date.now()}`,
      changedBy: 'Super Admin',
      tenureMonths: editingPlan.tenureMonths,
      parameterName: `Tenure ${editingPlan.tenureMonths}M Config Update`,
      oldValue: `EMI: ₹${selectedPlan.monthlyInstallment}, Return: ₹${selectedPlan.monthlyReturn}, ReqPlots: ${selectedPlan.requiredPlotSales}, Bonus/Plot: ₹${selectedPlan.bonusReturnPerPlot}`,
      newValue: `EMI: ₹${editingPlan.monthlyInstallment}, Return: ₹${editingPlan.monthlyReturn}, ReqPlots: ${editingPlan.requiredPlotSales}, Bonus/Plot: ₹${editingPlan.bonusReturnPerPlot}`,
      timestamp: new Date().toLocaleString('en-IN'),
      reason: editReason || 'Admin updated master financial scheme parameters',
    };

    saveEmiPlansToStorage(updated);
    const updatedAudit = [auditEntry, ...auditLogs];
    saveAuditLogsToStorage(updatedAudit);
    setAuditLogs(updatedAudit);
    onPlansUpdated(updated);
    setSuccessMessage(`Tenure ${editingPlan.tenureMonths} Months configuration updated successfully!`);
    setSelectedPlan(null);
    setEditingPlan(null);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all 10 tenures back to the official 24.5% master matrix?')) {
      const auditEntry: EmiMasterConfigAuditLog = {
        id: `CFG-AUD-${Date.now()}`,
        changedBy: 'Super Admin',
        tenureMonths: 0,
        parameterName: 'Full Scheme Reset',
        oldValue: 'Custom Plans',
        newValue: '24.5% Default Scheme Matrix',
        timestamp: new Date().toLocaleString('en-IN'),
        reason: 'Restored master defaults for 24.5% Free Plot Scheme',
      };
      saveEmiPlansToStorage(DEFAULT_EMI_SCHEME_PLANS);
      const updatedAudit = [auditEntry, ...auditLogs];
      saveAuditLogsToStorage(updatedAudit);
      setAuditLogs(updatedAudit);
      onPlansUpdated(DEFAULT_EMI_SCHEME_PLANS);
      setSuccessMessage('Reset to 24.5% master parameters completed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 font-bold">
                <Sliders className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Master Scheme Configuration (24.5% ROI Engine)
              </h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Admin-configurable rates for 10 EMI Tenures (12 to 120 Months). All numbers dynamically power investor calculations and ledgers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetToDefaults}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset to 24.5% Defaults
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
      </div>

      {/* 10-Tenure Matrix Table */}
      <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            10 EMI Tenure Configuration Matrix
          </h4>
          <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full">
            Scheme Rate: 24.5% Per Annum
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`text-xs uppercase font-bold ${isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
              <tr>
                <th className="px-4 py-3">Tenure (माह)</th>
                <th className="px-4 py-3">Monthly EMI (किस्त)</th>
                <th className="px-4 py-3">Total Investment</th>
                <th className="px-4 py-3">Monthly Return (प्रति माह)</th>
                <th className="px-4 py-3">Total Return</th>
                <th className="px-4 py-3">Required Plots (पात्रता)</th>
                <th className="px-4 py-3">1 Plot Bonus/Mo</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {plans.map((plan) => (
                <tr
                  key={plan.tenureMonths}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                    editingPlan?.tenureMonths === plan.tenureMonths ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-sans font-bold text-slate-900 dark:text-white">
                    {plan.tenureMonths} Months
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    ₹{formatINR(plan.monthlyInstallment)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    ₹{formatINR(plan.totalTenureInvestment)}
                  </td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{formatINR(plan.monthlyReturn)}
                  </td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300 font-bold">
                    ₹{formatINR(plan.totalTenureReturn)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                      {plan.requiredPlotSales} Plots
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-purple-600 dark:text-purple-400">
                    +₹{formatINR(plan.bonusReturnPerPlot)}/mo
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleOpenEdit(plan)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1 ml-auto transition-colors font-sans"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 space-y-5 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-lg font-bold">Edit Tenure Configuration: {editingPlan.tenureMonths} Months</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Changes will apply to future calculations with an immutable audit log entry.</p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.monthlyInstallment}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingPlan({
                        ...editingPlan,
                        monthlyInstallment: val,
                        totalTenureInvestment: val * editingPlan.tenureMonths,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Monthly Base Return (₹)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.monthlyReturn}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditingPlan({
                        ...editingPlan,
                        monthlyReturn: val,
                        totalTenureReturn: val * editingPlan.tenureMonths,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono font-bold text-emerald-600 dark:text-emerald-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    Required Plot Sales for Eligibility
                  </label>
                  <input
                    type="number"
                    value={editingPlan.requiredPlotSales}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        requiredPlotSales: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                    1 Plot Sale Bonus Return (₹/mo)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.bonusReturnPerPlot}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        bonusReturnPerPlot: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono font-bold text-purple-600 dark:text-purple-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Reason for Modification (Audit Trail)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Revised board approval for 24.5% scheme rate"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Immutable Audit Trail Section */}
      <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm space-y-4`}>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Immutable Configuration Audit Trail
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {auditLogs.length} audit event(s) logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase font-bold ${isDarkMode ? 'bg-slate-800/80 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
              <tr>
                <th className="px-3 py-2">Timestamp</th>
                <th className="px-3 py-2">Changed By</th>
                <th className="px-3 py-2">Parameter</th>
                <th className="px-3 py-2">Old Value</th>
                <th className="px-3 py-2">New Value</th>
                <th className="px-3 py-2">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300">{log.changedBy}</td>
                  <td className="px-3 py-2 text-amber-600 dark:text-amber-400 font-bold">{log.parameterName}</td>
                  <td className="px-3 py-2 text-slate-400 truncate max-w-xs">{log.oldValue}</td>
                  <td className="px-3 py-2 text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-xs">{log.newValue}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300 font-sans">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
