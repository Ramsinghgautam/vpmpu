import React, { useState } from 'react';
import { User, Language } from '../types';
import { Award, Briefcase, CheckCircle2, Copy, ShieldCheck, Sparkles, UserPlus, ArrowRight, Camera, FileText, CreditCard, PenTool, Upload, X } from 'lucide-react';
import { TRANSLATIONS } from '../utils/translations';

interface CareerAgentRegistrationProps {
  currentLang: Language;
  onRegisterAgentSuccess: (user: User) => void;
  onNavigate: (section: string) => void;
}

export const CareerAgentRegistration: React.FC<CareerAgentRegistrationProps> = ({
  currentLang,
  onRegisterAgentSuccess,
  onNavigate
}) => {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [qualification, setQualification] = useState('Graduate');
  const [sponsorId, setSponsorId] = useState('');

  const [photoFile, setPhotoFile] = useState<{ name: string; url: string } | null>(null);
  const [aadharFile, setAadharFile] = useState<{ name: string; url: string } | null>(null);
  const [panFile, setPanFile] = useState<{ name: string; url: string } | null>(null);
  const [signatureFile, setSignatureFile] = useState<{ name: string; url: string } | null>(null);

  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert("Please enter full name and phone number.");
      return;
    }

    const newAgentId = "VPM-AG-" + Math.floor(100 + Math.random() * 900);
    const userObj: User = {
      id: "usr-" + Date.now(),
      name: fullName,
      email: email || `${phone}@agent.vpm.com`,
      phone,
      role: 'agent',
      isVerified: true,
      agentId: newAgentId,
      referralCode: newAgentId.toLowerCase(),
      address,
      joinedDate: new Date().toISOString().split('T')[0],
      totalCommissionsEarned: 0,
      totalPlotsBooked: 0
    };

    setRegisteredUser(userObj);
    onRegisterAgentSuccess(userObj);
  };

  const referralUrl = registeredUser ? `${window.location.origin}?ref=${registeredUser.agentId}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <section className="py-20 bg-white text-slate-900 font-sans border-b border-slate-200" id="career-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-200">
            <Briefcase className="w-4 h-4 text-amber-700" />
            <span>CAREER & AGENT ONBOARDING</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-black text-indigo-950 tracking-tight">
            Become a Certified <span className="text-amber-600 italic font-serif">VPM Real Estate Partner</span>
          </h2>

          <p className="text-slate-600 text-sm leading-relaxed">
            Join Prayagraj's fastest growing real estate network with 8% starting commission, 9-tier team bonus overrides, free marketing collateral, and instant digital portal access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Career Benefits */}
          <div className="lg:col-span-5 space-y-6 font-sans">
            <div className="bg-indigo-950 text-white p-6 rounded-2xl border border-indigo-900 shadow-xl space-y-4">
              <h3 className="text-lg font-serif font-bold text-amber-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Why Join VPM Partner Program?
              </h3>

              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>8% Starting Agent Commission:</strong> Earn ₹96,000+ on a single 1200 sq.ft plot sale.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>9 Level MLM Bonus Growth:</strong> Promote from Agent to Leader, Mentor, and Co-Partner.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Monthly Payout Assurance:</strong> Direct bank transfer or UPI payout without delay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Site Visit Vehicle Support:</strong> Free transport support for customer site visits in Prayagraj.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Agent Registration Form / Success Badge */}
          <div className="lg:col-span-7 bg-slate-50 p-8 rounded-2xl border border-slate-200 shadow-xs font-sans">
            {registeredUser ? (
              <div className="space-y-6 animate-fadeIn">
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-5 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-xl font-serif font-bold text-emerald-950">Registration Successful!</h3>
                  <p className="text-xs text-emerald-800 font-medium">You are now a certified agent of Vigya Paurush Milestone Pvt Ltd.</p>
                </div>

                <div className="bg-indigo-950 text-white p-5 rounded-xl border border-indigo-900 space-y-3 text-xs">
                  <div className="flex justify-between items-center border-b border-indigo-900 pb-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Agent Name</span>
                    <span className="font-bold text-white text-sm">{registeredUser.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-indigo-900 pb-2">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Assigned Agent ID</span>
                    <span className="font-black font-mono text-amber-400 text-base">{registeredUser.agentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Starting Commission Tier</span>
                    <span className="font-bold text-emerald-400">8.0% + Level Bonus</span>
                  </div>
                </div>

                {/* Referral Link Copy */}
                <div className="space-y-1 text-xs">
                  <label className="block font-bold text-slate-800 text-[10px] uppercase tracking-wider">Your Unique Customer Referral Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={referralUrl}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700 font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 rounded-lg font-bold shrink-0 flex items-center gap-1 uppercase text-[10px] tracking-wider"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
                >
                  <span>Open Agent Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                <h3 className="text-lg font-serif font-bold text-indigo-950 flex items-center gap-2 mb-2">
                  <UserPlus className="w-5 h-5 text-amber-600" />
                  Free Agent Onboarding Form
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[10px] text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sunita Yadav"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:border-indigo-950 focus:outline-none font-medium text-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[10px] text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9812345678"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:border-indigo-950 focus:outline-none font-medium text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[10px] text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sunita@example.com"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:border-indigo-950 focus:outline-none font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-[10px] text-slate-700 mb-1">Sponsor Agent ID (Optional)</label>
                    <input
                      type="text"
                      value={sponsorId}
                      onChange={(e) => setSponsorId(e.target.value)}
                      placeholder="e.g. VPM-AG-101"
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:border-indigo-950 focus:outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-[10px] text-slate-700 mb-1">Current City / Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Phaphamau, Prayagraj"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:border-indigo-950 focus:outline-none font-medium text-slate-800"
                  />
                </div>

                {/* Document Upload Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                  {/* Photo Upload */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-slate-900">1. Passport Photo</p>
                        <p className="text-[9px] text-slate-500">JPG, PNG (Optional)</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1.5 px-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors">
                      <label htmlFor="reg-photo-input" className="flex items-center gap-1.5 truncate cursor-pointer flex-1">
                        <Upload className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate max-w-[120px]">{photoFile ? photoFile.name : 'Choose Photo'}</span>
                      </label>
                      {photoFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPhotoFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 p-0.5 ml-2 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <input
                        id="reg-photo-input"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setPhotoFile({ name: file.name, url: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Aadhar Upload */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-slate-900">2. Aadhar Card</p>
                        <p className="text-[9px] text-slate-500">PDF / Image (Optional)</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1.5 px-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors">
                      <label htmlFor="reg-aadhar-input" className="flex items-center gap-1.5 truncate cursor-pointer flex-1">
                        <Upload className="w-3 h-3 text-indigo-600 shrink-0" />
                        <span className="truncate max-w-[120px]">{aadharFile ? aadharFile.name : 'Choose Aadhar'}</span>
                      </label>
                      {aadharFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAadharFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 p-0.5 ml-2 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <input
                        id="reg-aadhar-input"
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setAadharFile({ name: file.name, url: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* PAN Upload */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-slate-900">3. PAN Card</p>
                        <p className="text-[9px] text-slate-500">PDF / Image (Optional)</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1.5 px-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors">
                      <label htmlFor="reg-pan-input" className="flex items-center gap-1.5 truncate cursor-pointer flex-1">
                        <Upload className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[120px]">{panFile ? panFile.name : 'Choose PAN'}</span>
                      </label>
                      {panFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPanFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 p-0.5 ml-2 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <input
                        id="reg-pan-input"
                        type="file"
                        accept="image/*,.pdf"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setPanFile({ name: file.name, url: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Signature Upload */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[11px] text-slate-900">4. Signature Scan</p>
                        <p className="text-[9px] text-slate-500">JPG, PNG (Optional)</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-bold py-1.5 px-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors">
                      <label htmlFor="reg-sig-input" className="flex items-center gap-1.5 truncate cursor-pointer flex-1">
                        <Upload className="w-3 h-3 text-purple-600 shrink-0" />
                        <span className="truncate max-w-[120px]">{signatureFile ? signatureFile.name : 'Choose Signature'}</span>
                      </label>
                      {signatureFile && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSignatureFile(null);
                          }}
                          className="text-red-500 hover:text-red-700 p-0.5 ml-2 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <input
                        id="reg-sig-input"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setSignatureFile({ name: file.name, url: ev.target?.result as string });
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs mt-4"
                >
                  <ShieldCheck className="w-5 h-5 text-slate-950" />
                  <span>Submit Agent Registration (Instant Agent ID)</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
