import React, { useState } from 'react';
import { Database, Upload, FileText, CheckCircle, Search, Cpu, Lock, Layers } from 'lucide-react';
import { PropertyKnowledgeDocument, AiProperty } from '../../types/aiVoice';

interface AiVoiceKnowledgeBaseManagerProps {
  properties: AiProperty[];
  documents: PropertyKnowledgeDocument[];
  onUploadDocument: (doc: PropertyKnowledgeDocument) => void;
}

export const AiVoiceKnowledgeBaseManager: React.FC<AiVoiceKnowledgeBaseManagerProps> = ({
  properties,
  documents,
  onUploadDocument,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{ answer: string; chunksUsed: string[]; confidence: string } | null>(null);
  const [isSimulatingRag, setIsSimulatingRag] = useState(false);

  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileType, setUploadFileType] = useState<'PDF' | 'DOCX' | 'TXT' | 'CSV' | 'BROCHURE' | 'RERA'>('PDF');

  const filteredDocs = documents.filter(d => d.propertyId === selectedPropertyId);
  const currentProperty = properties.find(p => p.id === selectedPropertyId);

  const handleSimulateRag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery) return;
    setIsSimulatingRag(true);
    setTestResult(null);

    setTimeout(() => {
      setIsSimulatingRag(false);
      const queryLower = testQuery.toLowerCase();
      if (queryLower.includes('price') || queryLower.includes('rate') || queryLower.includes('kitna')) {
        setTestResult({
          answer: `According to the verified Knowledge Base for ${currentProperty?.name || 'this property'}, the price starts at ${currentProperty?.priceRange || '₹15 Lakh'} with flexible EMI options available.`,
          chunksUsed: ['chunk_pricing_schedule_row_4', 'chunk_rera_pricing_summary'],
          confidence: '99.4% (Grounded in Verified KB)',
        });
      } else if (queryLower.includes('rera') || queryLower.includes('legal') || queryLower.includes('approval')) {
        setTestResult({
          answer: `Yes, ${currentProperty?.name || 'this property'} is fully RERA approved with Registration Number: ${currentProperty?.reraNumber || 'UPRERAPRJ...'}.`,
          chunksUsed: ['chunk_rera_certificate_legal_clearance'],
          confidence: '100% (Official RERA Document Match)',
        });
      } else {
        setTestResult({
          answer: `I found information related to your query in the ${currentProperty?.name || 'property'} master brochure. Infrastructure includes 40ft wide roads, 24x7 security, and immediate registry.`,
          chunksUsed: ['chunk_master_brochure_amenities_section'],
          confidence: '94.8% (Vector Similarity Match)',
        });
      }
    }, 600);
  };

  const handleFileUploadMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    const newDoc: PropertyKnowledgeDocument = {
      id: `doc_${Date.now()}`,
      organizationId: 'org_vpm_001',
      propertyId: selectedPropertyId,
      title: uploadTitle,
      fileType: uploadFileType,
      fileSize: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      chunksCount: Math.floor(Math.random() * 40) + 15,
      status: 'Indexed',
      summary: 'Successfully parsed text, extracted key entities, generated vector embeddings, and indexed into isolated tenant collection.',
    };

    onUploadDocument(newDoc);
    setUploadTitle('');
    alert('Document successfully uploaded, chunked, and indexed with vector embeddings!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-indigo-950">Property Knowledge Base (RAG Architecture)</h2>
          <p className="text-xs text-slate-500">Strict Isolation: AI agent can ONLY retrieve knowledge filtered by Organization + Property ID.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700">Select Property:</label>
          <select
            value={selectedPropertyId}
            onChange={e => setSelectedPropertyId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
          >
            {properties.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.location})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Documents List & Uploader */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-900" />
                Indexed Documents for {currentProperty?.name}
              </h3>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" /> Isolated KB
              </span>
            </div>

            <div className="space-y-3">
              {filteredDocs.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No documents uploaded for this property yet.</p>
              ) : (
                filteredDocs.map(doc => (
                  <div key={doc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-700 shrink-0" />
                        <span className="text-xs font-bold text-indigo-950">{doc.title}</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">{doc.fileType}</span>
                      </div>
                      <p className="text-xs text-slate-600">{doc.summary}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Size: {doc.fileSize}</span>
                        <span>•</span>
                        <span>Chunks: {doc.chunksCount} vectors</span>
                        <span>•</span>
                        <span>Uploaded: {doc.uploadDate}</span>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0">
                      <CheckCircle className="w-3.5 h-3.5" /> {doc.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upload Document Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" /> Upload New Property Document (PDF, DOCX, CSV, TXT)
            </h3>
            <form onSubmit={handleFileUploadMock} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    placeholder="e.g. Master_Plan_Layout_2026.pdf"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Document Type</label>
                  <select
                    value={uploadFileType}
                    onChange={e => setUploadFileType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-900"
                  >
                    <option value="PDF">PDF (Brochure / Layout)</option>
                    <option value="CSV">CSV (Price List / EMI Table)</option>
                    <option value="RERA">RERA Legal Document</option>
                    <option value="TXT">TXT / FAQ Document</option>
                  </select>
                </div>
              </div>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 space-y-2">
                <Upload className="w-8 h-8 text-indigo-900 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Drag & drop files here, or click to browse</p>
                <p className="text-[10px] text-slate-400">Supports PDF, DOCX, CSV, TXT up to 50MB with automatic text extraction & embedding</p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Cpu className="w-4 h-4" /> Process & Index to Vector DB
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: RAG Retrieval Test Console */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-indigo-950 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-900" />
              RAG Retrieval Test Console
            </h3>
            <p className="text-xs text-slate-500">
              Test how the AI agent searches this property's Knowledge Base without cross-contamination.
            </p>

            <form onSubmit={handleSimulateRag} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Customer Question</label>
                <input
                  type="text"
                  required
                  value={testQuery}
                  onChange={e => setTestQuery(e.target.value)}
                  placeholder="e.g. What is the price of 1200 sqft plot?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-900"
                />
              </div>
              <button
                type="submit"
                disabled={isSimulatingRag}
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isSimulatingRag ? 'Searching Vector Chunks...' : 'Test KB Retrieval & Grounding'}
              </button>
            </form>

            {testResult && (
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center text-[10px] font-bold text-indigo-900">
                  <span>GROUNDED AI RESPONSE</span>
                  <span className="text-emerald-700">{testResult.confidence}</span>
                </div>
                <p className="text-xs text-indigo-950 font-medium leading-relaxed">"{testResult.answer}"</p>
                <div className="pt-2 border-t border-indigo-200/60 space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Retrieved Chunks:</p>
                  <div className="flex flex-wrap gap-1">
                    {testResult.chunksUsed.map((chk, i) => (
                      <span key={i} className="bg-indigo-900 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">{chk}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-indigo-950 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-700" /> Security Guardrail
            </p>
            <p>Queries are strictly filtered by <code className="bg-slate-200 px-1 rounded text-indigo-900">property_id</code> and <code className="bg-slate-200 px-1 rounded text-indigo-900">organization_id</code>. Zero leakage across tenants.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
