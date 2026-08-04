import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Receipt, 
  Building2, 
  Upload, 
  AlertTriangle,
  FileText,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { formatINR } from '../../utils/calculators';

interface AdminModalsProps {
  activeModal: 'addCustomer' | 'addAgent' | 'addInvestor' | 'addEmployee' | 'addExpense' | 'addLoan' | 'uploadGallery' | 'defaultersList' | null;
  onClose: () => void;
  onSaveCustomer?: (data: any) => void;
  onSaveAgent?: (data: any) => void;
  onSaveInvestor?: (data: any) => void;
  onSaveEmployee?: (data: any) => void;
  onSaveExpense?: (data: any) => void;
  onSaveLoan?: (data: any) => void;
  onUploadMedia?: (data: any) => void;
  defaultersList?: any[];
  isDarkMode: boolean;
}

export const AdminModals: React.FC<AdminModalsProps> = ({
  activeModal,
  onClose,
  onSaveCustomer,
  onSaveAgent,
  onSaveInvestor,
  onSaveEmployee,
  onSaveExpense,
  onSaveLoan,
  onUploadMedia,
  defaultersList = [],
  isDarkMode
}) => {
  if (!activeModal) return null;

  // Form states
  const [formData, setFormData] = useState<any>({});
  const [mediaType, setMediaType] = useState<'photo' | 'video' | 'audio' | 'document'>('photo');

  const handleChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'addCustomer' && onSaveCustomer) onSaveCustomer(formData);
    if (activeModal === 'addAgent' && onSaveAgent) onSaveAgent(formData);
    if (activeModal === 'addInvestor' && onSaveInvestor) onSaveInvestor(formData);
    if (activeModal === 'addEmployee' && onSaveEmployee) onSaveEmployee(formData);
    if (activeModal === 'addExpense' && onSaveExpense) onSaveExpense(formData);
    if (activeModal === 'addLoan' && onSaveLoan) onSaveLoan(formData);
    if (activeModal === 'uploadGallery' && onUploadMedia) onUploadMedia({ ...formData, type: mediaType });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden text-xs my-8 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            {activeModal === 'addCustomer' && <UserPlus className="w-5 h-5 text-amber-400" />}
            {activeModal === 'addAgent' && <Award className="w-5 h-5 text-indigo-400" />}
            {activeModal === 'addInvestor' && <TrendingUp className="w-5 h-5 text-emerald-400" />}
            {activeModal === 'addEmployee' && <UserCheck className="w-5 h-5 text-sky-400" />}
            {activeModal === 'addExpense' && <Receipt className="w-5 h-5 text-rose-400" />}
            {activeModal === 'addLoan' && <Building2 className="w-5 h-5 text-purple-400" />}
            {activeModal === 'uploadGallery' && <Upload className="w-5 h-5 text-amber-400" />}
            {activeModal === 'defaultersList' && <AlertTriangle className="w-5 h-5 text-rose-400" />}

            <h3 className="text-base font-black tracking-tight">
              {activeModal === 'addCustomer' && 'Register New Customer Account'}
              {activeModal === 'addAgent' && 'Add Channel Partner / Agent'}
              {activeModal === 'addInvestor' && 'Add High ROI Capital Investor'}
              {activeModal === 'addEmployee' && 'Add Payroll Staff / Employee'}
              {activeModal === 'addExpense' && 'Record New Company Expenditure'}
              {activeModal === 'addLoan' && 'Add Project Development Bank Loan'}
              {activeModal === 'uploadGallery' && 'Upload Media & Project Files'}
              {activeModal === 'defaultersList' && 'Overdue EMI Defaulters Audit List'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Forms */}
        <div className="p-6">
          
          {/* DEFAULTERS LIST MODAL VIEW */}
          {activeModal === 'defaultersList' ? (
            <div className="space-y-4">
              <p className="text-slate-400 text-xs">
                The following plot buyers have missed EMI payment deadlines by more than 15 days. Formal legal reminder notices can be generated below.
              </p>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {defaultersList.length > 0 ? (
                  defaultersList.map((def, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{def.name}</span>
                          <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded">
                            {def.overdueDays} Days Overdue
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] block mt-0.5">
                          Plot {def.plotNo} ({def.projectName}) • Phone: {def.phone}
                        </span>
                        <span className="text-amber-400 font-bold text-xs mt-1 block">
                          Pending EMI: {formatINR(def.emiAmount)} (Due Date: {def.dueDate})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert(`Notice sent to ${def.phone} & Email!`)}
                        className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shrink-0 cursor-pointer"
                      >
                        Send Notice
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500">No overdue defaulters found.</div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Close Defaulter Audit
                </button>
              </div>
            </div>
          ) : (

            /* STANDARD INPUT FORMS */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Customer Form */}
              {activeModal === 'addCustomer' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Full Name *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g. Anand Kumar Verma"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Mobile Phone *</label>
                      <input
                        required
                        type="tel"
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Allocated Plot No *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('plotNo', e.target.value)}
                        placeholder="e.g. A-18"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Total Land Valuation (₹)</label>
                      <input
                        type="number"
                        onChange={(e) => handleChange('totalPrice', Number(e.target.value))}
                        placeholder="e.g. 1800000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Agent Form */}
              {activeModal === 'addAgent' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Agent Name *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g. Rakesh Singh"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Mobile Phone *</label>
                      <input
                        required
                        type="tel"
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="e.g. 9988112233"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Commission Slab (%)</label>
                      <select
                        onChange={(e) => handleChange('commissionRate', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value={8}>8% Direct Executive Commission</option>
                        <option value={10}>10% Senior Channel Partner</option>
                        <option value={12}>12% Master Regional Director</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Assigned Region</label>
                      <input
                        type="text"
                        onChange={(e) => handleChange('region', e.target.value)}
                        placeholder="e.g. Prayagraj Sadar"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Investor Form */}
              {activeModal === 'addInvestor' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Investor Name *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g. Dr. Alok Tripathi"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Invested Capital Amount (₹) *</label>
                      <input
                        required
                        type="number"
                        onChange={(e) => handleChange('amount', Number(e.target.value))}
                        placeholder="e.g. 2500000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Guaranteed ROI % Slab</label>
                      <select
                        onChange={(e) => handleChange('roi', Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value={22.5}>22.5% p.a. Tier-1 Yield</option>
                        <option value={28.0}>28.0% p.a. Premium Yield</option>
                        <option value={32.0}>32.0% p.a. Master Partner ROI</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Lock-in Period</label>
                      <select
                        onChange={(e) => handleChange('tenure', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="12 Months">12 Months (1 Year)</option>
                        <option value="24 Months">24 Months (2 Years)</option>
                        <option value="36 Months">36 Months (3 Years)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Employee Form */}
              {activeModal === 'addEmployee' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Employee Name *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Designation / Role *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('role', e.target.value)}
                        placeholder="e.g. Senior Site Civil Engineer"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Monthly Base Salary (₹) *</label>
                      <input
                        required
                        type="number"
                        onChange={(e) => handleChange('salary', Number(e.target.value))}
                        placeholder="e.g. 45000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Department</label>
                      <select
                        onChange={(e) => handleChange('department', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="Engineering & Site">Engineering & Site</option>
                        <option value="Legal & RERA Registry">Legal & RERA Registry</option>
                        <option value="Accounts & Finance">Accounts & Finance</option>
                        <option value="Sales & Customer Operations">Sales & Customer Operations</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Expense Form */}
              {activeModal === 'addExpense' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Expense Title *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g. Site Boundary Wall Cement & Steel"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Amount Spent (₹) *</label>
                      <input
                        required
                        type="number"
                        onChange={(e) => handleChange('amount', Number(e.target.value))}
                        placeholder="e.g. 240000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Expense Category *</label>
                      <select
                        onChange={(e) => handleChange('category', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      >
                        <option value="Property Development">Property Development</option>
                        <option value="Marketing">Marketing & Promotion</option>
                        <option value="Office">Office Operations</option>
                        <option value="Salary">Salary & Staff Expenses</option>
                        <option value="Miscellaneous">Miscellaneous Legal/Tax</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Vendor / Recipient</label>
                      <input
                        type="text"
                        onChange={(e) => handleChange('vendor', e.target.value)}
                        placeholder="e.g. UltraTech Cement Distributor"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Loan Form */}
              {activeModal === 'addLoan' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Lender Bank Name *</label>
                      <input
                        required
                        type="text"
                        onChange={(e) => handleChange('bank', e.target.value)}
                        placeholder="e.g. State Bank of India Commercial"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Sanctioned Loan Principal (₹) *</label>
                      <input
                        required
                        type="number"
                        onChange={(e) => handleChange('principal', Number(e.target.value))}
                        placeholder="e.g. 15000000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Monthly EMI Amount (₹) *</label>
                      <input
                        required
                        type="number"
                        onChange={(e) => handleChange('emi', Number(e.target.value))}
                        placeholder="e.g. 345000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1 font-bold">Annual Interest Rate (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        onChange={(e) => handleChange('interest', Number(e.target.value))}
                        placeholder="e.g. 9.25"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Upload Gallery Media Form */}
              {activeModal === 'uploadGallery' && (
                <>
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Select File Type to Upload</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['photo', 'video', 'audio', 'document'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setMediaType(t)}
                          className={`py-2 px-1 rounded-xl font-bold uppercase text-[10px] text-center border cursor-pointer transition-all ${
                            mediaType === t
                              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Media Title / Description *</label>
                    <input
                      required
                      type="text"
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder="e.g. Milestone City Phase 1 Main Gateway HD Construction Aerial Shot"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Upload File (Image / Video / Audio / Doc) *</label>
                    <input
                      required
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            handleChange('url', ev.target?.result);
                            handleChange('fileName', file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-md transition-transform active:scale-95"
                >
                  Save Entry
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
