import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { X, ShieldCheck, Phone, Mail, User as UserIcon, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('9876543210');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('123456');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert("Please enter mobile number.");
      return;
    }
    setMode('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const userObj: User = {
        id: "usr-" + Date.now(),
        name: name || (selectedRole === 'admin' ? 'Prabhat Gautam (Admin)' : selectedRole === 'agent' ? 'Certified VPM Agent' : 'Valued Customer'),
        email: email || `${phone}@vpm.com`,
        phone,
        role: selectedRole,
        isVerified: true,
        agentId: selectedRole === 'agent' ? 'VPM-AG-' + Math.floor(100 + Math.random() * 900) : undefined,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      onLoginSuccess(userObj);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans text-slate-900">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div>
            <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
              Secure Authentication
            </span>
            <h3 className="text-lg font-extrabold text-white mt-1">
              Vigya Paurush Milestone Login
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Role Selector Tabs */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">Select Role Portal</label>
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setSelectedRole('buyer')}
                className={`py-1.5 rounded-lg transition-all ${selectedRole === 'buyer' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Buyer
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('agent')}
                className={`py-1.5 rounded-lg transition-all ${selectedRole === 'agent' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Agent
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('investor')}
                className={`py-1.5 rounded-lg transition-all ${selectedRole === 'investor' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Investor
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`py-1.5 rounded-lg transition-all ${selectedRole === 'admin' ? 'bg-slate-900 text-amber-400 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Form Step: Login / Signup */}
          {mode !== 'otp' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prabhat Gautam"
                    className="w-full border border-slate-300 rounded-lg p-2.5 focus:border-sky-700 focus:outline-none"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">Mobile Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:border-sky-700 focus:outline-none font-medium"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@vpm.com"
                      className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 focus:border-sky-700 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-xs"
              >
                <span>Send Mobile OTP Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 text-[11px]">
                {mode === 'login' ? (
                  <span>Don't have an account? <button type="button" onClick={() => setMode('signup')} className="text-sky-800 font-bold hover:underline">Sign up</button></span>
                ) : (
                  <span>Already registered? <button type="button" onClick={() => setMode('login')} className="text-sky-800 font-bold hover:underline">Log in</button></span>
                )}
              </div>
            </form>
          ) : (
            /* Form Step: Mobile OTP Verify */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-center space-y-1">
                <p className="font-bold text-slate-900">OTP Sent to +91 {phone}</p>
                <p className="text-[11px] text-slate-600">Enter code <strong className="font-mono text-amber-800">123456</strong> for instant login.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">6-Digit Verification OTP *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 font-mono text-base font-bold text-center tracking-widest focus:border-emerald-600 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-xs"
              >
                {isVerifying ? (
                  <span>Verifying Token...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify OTP & Enter {selectedRole.toUpperCase()} Portal</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-slate-500 hover:text-slate-800 text-[11px] text-center"
              >
                Change Phone Number
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
