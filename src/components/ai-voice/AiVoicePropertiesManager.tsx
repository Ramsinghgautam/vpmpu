import React, { useState } from 'react';
import { Building2, Plus, MapPin, CheckCircle, FileText, Bot, DollarSign, Edit, Trash2 } from 'lucide-react';
import { AiProperty } from '../../types/aiVoice';

interface AiVoicePropertiesManagerProps {
  properties: AiProperty[];
  onAddProperty: (prop: AiProperty) => void;
  onUpdateProperty: (prop: AiProperty) => void;
  onDeleteProperty: (id: string) => void;
}

export const AiVoicePropertiesManager: React.FC<AiVoicePropertiesManagerProps> = ({
  properties,
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [developer, setDeveloper] = useState('Vigya Paurush Milestone Pvt Ltd');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [area, setArea] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    const newProp: AiProperty = {
      id: `prop_${Date.now()}`,
      organizationId: 'org_vpm_001',
      name,
      developer,
      location,
      address: address || location,
      propertyType: 'Residential Plot',
      configurations: ['800 Sqft', '1200 Sqft', '1500 Sqft'],
      priceRange: priceRange || '₹15 Lakh - ₹35 Lakh',
      area: area || '20 Acres Gated Township',
      amenities: ['24x7 Security', 'Wide Roads', 'Electricity', 'Park'],
      possessionDate: 'Ready for Registry',
      reraNumber: reraNumber || 'UPRERAPRJ99999',
      description: description || 'New RERA approved plotting project with modern amenities.',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'],
      status: 'Active',
      knowledgeBaseId: `kb_prop_${Date.now()}`,
      agentId: `agent_prop_${Date.now()}`,
    };

    onAddProperty(newProp);
    setName('');
    setLocation('');
    setAddress('');
    setPriceRange('');
    setArea('');
    setReraNumber('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-indigo-950">Property Management (Multi-Tenant Isolated)</h2>
          <p className="text-xs text-slate-500">Each property maintains its own isolated Knowledge Base & AI Voice Agent.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(prop => (
          <div key={prop.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-44 bg-indigo-950">
                <img src={prop.images[0]} alt={prop.name} className="w-full h-full object-cover opacity-90" />
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  {prop.status}
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-xs font-bold px-3 py-1 rounded-lg">
                  {prop.priceRange}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h3 className="text-base font-bold text-indigo-950">{prop.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  {prop.address}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2">{prop.description}</p>
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[11px]">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-semibold">RERA: {prop.reraNumber}</span>
                  <span className="bg-indigo-50 text-indigo-900 px-2 py-1 rounded font-semibold">{prop.area}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-900 flex items-center gap-1">
                <Bot className="w-4 h-4 text-amber-600" /> KB & Agent Synced
              </span>
              <button
                onClick={() => onDeleteProperty(prop.id)}
                className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete Property"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Property Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-indigo-950">Add New Property & AI Pipeline</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Property Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ganga Greens Phase 2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Location / City</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Jhunsi, Prayagraj"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Price Range</label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={e => setPriceRange(e.target.value)}
                    placeholder="e.g. ₹20 Lakh - ₹50 Lakh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Area / Township Size</label>
                  <input
                    type="text"
                    value={area}
                    onChange={e => setArea(e.target.value)}
                    placeholder="e.g. 15 Acres"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">RERA Number</label>
                  <input
                    type="text"
                    value={reraNumber}
                    onChange={e => setReraNumber(e.target.value)}
                    placeholder="e.g. UPRERAPRJ..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Key highlights, amenities, and connectivity..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
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
                  Save & Initialize KB & Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
