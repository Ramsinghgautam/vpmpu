import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, MapPin, User, Plus } from 'lucide-react';
import { AppointmentEntity, AiProperty } from '../../types/aiVoice';

interface AiVoiceAppointmentsViewProps {
  appointments: AppointmentEntity[];
  properties: AiProperty[];
  onAddAppointment: (apt: AppointmentEntity) => void;
}

export const AiVoiceAppointmentsView: React.FC<AiVoiceAppointmentsViewProps> = ({
  appointments,
  properties,
  onAddAppointment,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [propertyId, setPropertyId] = useState(properties[0]?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('11:00 AM');
  const [meetingType, setMeetingType] = useState<'Site visit' | 'Phone call' | 'Video call' | 'Office meeting'>('Site visit');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !date) return;

    const prop = properties.find(p => p.id === propertyId);

    const newApt: AppointmentEntity = {
      id: `apt_${Date.now()}`,
      organizationId: 'org_vpm_001',
      propertyId,
      propertyName: prop?.name || 'Milestone City',
      customerName,
      customerPhone,
      date,
      time,
      salesAgent: 'Pooja Sharma',
      meetingType,
      status: 'Confirmed',
      notes: 'Booked via AI Voice Agent scheduler.',
    };

    onAddAppointment(newApt);
    setCustomerName('');
    setCustomerPhone('');
    setDate('');
    setShowModal(false);
    alert('Appointment successfully booked and confirmed with sales team!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-950">Appointments & Site Visits Schedule</h2>
          <p className="text-xs text-slate-500">Autonomous appointment bookings coordinated by AI voice agents and sales executives.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map(apt => (
          <div key={apt.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-indigo-50 text-indigo-950 px-2.5 py-1 rounded-lg text-xs font-bold">{apt.meetingType}</span>
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {apt.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-indigo-950">{apt.customerName}</h3>
              <p className="text-xs text-slate-500 font-medium">{apt.customerPhone}</p>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <p className="font-semibold text-indigo-900">Property: {apt.propertyName}</p>
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" /> {apt.date} at {apt.time}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
              <span>Agent: <strong className="text-indigo-950">{apt.salesAgent}</strong></span>
              <button onClick={() => alert("Reschedule modal opened")} className="text-indigo-600 font-bold hover:underline">Reschedule</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-indigo-950">Schedule Site Visit / Call</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Amit Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Property</label>
                  <select
                    value={propertyId}
                    onChange={e => setPropertyId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Meeting Type</label>
                <select
                  value={meetingType}
                  onChange={e => setMeetingType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
                >
                  <option value="Site visit">Site Visit (Township Tour)</option>
                  <option value="Phone call">Phone Call Callback</option>
                  <option value="Video call">Video Call Presentation</option>
                  <option value="Office meeting">Office Meeting</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold px-5 py-2 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Confirm & Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
