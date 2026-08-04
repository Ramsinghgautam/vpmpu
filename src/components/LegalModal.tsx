import React from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | 'refund' | 'disclaimer' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans text-slate-900">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white capitalize">
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms & Conditions'}
              {type === 'refund' && 'Refund & Cancellation Policy'}
              {type === 'disclaimer' && 'Legal Disclaimer'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
          <p className="font-bold text-slate-900">VIGYA PAURUSH MILESTONE PRIVATE LIMITED</p>
          <p>Registered Office: 4/199 EWS AVC New Jhunsi, Prayagraj, Uttar Pradesh, India - 211019</p>

          {type === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">1. Information Collection</h4>
              <p>We collect personal information such as full name, phone number, email address, and postal address to process plot bookings, issue allotment receipts, and fulfill legal land registry procedures under Uttar Pradesh Real Estate Regulatory Rules.</p>
              <h4 className="font-bold text-slate-900">2. Data Security</h4>
              <p>All transactions, payment IDs, and customer data are protected using standard encryption and strict confidential handling. We do not sell user data to third parties.</p>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">1. Plot Booking Lock Fee</h4>
              <p>The standard booking fee of ₹10,000 reserves the specified plot for 30 calendar days pending document submission and installment setup.</p>
              <h4 className="font-bold text-slate-900">2. Dakhil Kharij & Possession</h4>
              <p>Physical possession and land registry (Dakhil Kharij) are executed upon receipt of full payment or as per agreed EMI contract terms.</p>
            </div>
          )}

          {type === 'refund' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900">1. Cancellation Terms</h4>
              <p>Customers may cancel plot bookings within 30 days of deposit payment. Standard processing charges may apply as detailed in the booking contract.</p>
              <h4 className="font-bold text-slate-900">2. Refund Processing</h4>
              <p>Approved refunds are processed back to the original payment method (Bank Account / UPI) within 5 to 7 business days.</p>
            </div>
          )}

          {type === 'disclaimer' && (
            <div className="space-y-3">
              <p>Property plot dimensions, layout maps, and rate estimations shown on this website are subject to final sub-registrar verification. Investment ROI figures are governed by standard land valuation rules capped at invested capital.</p>
            </div>
          )}
        </div>

        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs">
            I Understand & Accept
          </button>
        </div>

      </div>
    </div>
  );
};
