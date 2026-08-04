import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Search,
  Download,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  FileCode,
  Languages,
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Language } from '../../types';

export const AdminTranslationManager: React.FC = () => {
  const {
    language,
    setLanguage,
    t,
    translations,
    updateKey,
    addKey,
    deleteKey,
    importTranslations,
    exportTranslations,
    supportedLanguages
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLangFilter, setSelectedLangFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  // Form states for new key
  const [newKeyName, setNewKeyName] = useState('');
  const [newEnVal, setNewEnVal] = useState('');
  const [newHiVal, setNewHiVal] = useState('');
  const [newMrVal, setNewMrVal] = useState('');
  const [newBnVal, setNewBnVal] = useState('');
  const [newGuVal, setNewGuVal] = useState('');

  // Editing values state
  const [editEnVal, setEditEnVal] = useState('');
  const [editHiVal, setEditHiVal] = useState('');
  const [editMrVal, setEditMrVal] = useState('');
  const [editBnVal, setEditBnVal] = useState('');
  const [editGuVal, setEditGuVal] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Get all unique translation keys across English base dictionary
  const allKeys = Array.from(new Set([
    ...Object.keys(translations.en || {}),
    ...Object.keys(translations.hi || {}),
    ...Object.keys(translations.mr || {}),
    ...Object.keys(translations.bn || {}),
    ...Object.keys(translations.gu || {})
  ])).sort();

  // Filter keys
  const filteredKeys = allKeys.filter(key => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(q) ||
      (translations.en[key] || '').toLowerCase().includes(q) ||
      (translations.hi[key] || '').toLowerCase().includes(q) ||
      (translations.mr[key] || '').toLowerCase().includes(q) ||
      (translations.bn[key] || '').toLowerCase().includes(q) ||
      (translations.gu[key] || '').toLowerCase().includes(q)
    );
  });

  const handleStartEdit = (key: string) => {
    setEditingKey(key);
    setEditEnVal(translations.en[key] || '');
    setEditHiVal(translations.hi[key] || '');
    setEditMrVal(translations.mr[key] || '');
    setEditBnVal(translations.bn[key] || '');
    setEditGuVal(translations.gu[key] || '');
  };

  const handleSaveEdit = (key: string) => {
    updateKey(key, {
      en: editEnVal,
      hi: editHiVal,
      mr: editMrVal,
      bn: editBnVal,
      gu: editGuVal
    });
    setEditingKey(null);
    showToast('success', `Translation key "${key}" updated successfully!`);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      showToast('error', 'Key name is required');
      return;
    }
    const sanitizedKey = newKeyName.trim().replace(/\s+/g, '_');
    addKey(sanitizedKey, {
      en: newEnVal || sanitizedKey,
      hi: newHiVal || '',
      mr: newMrVal || '',
      bn: newBnVal || '',
      gu: newGuVal || ''
    });
    setIsAddModalOpen(false);
    setNewKeyName('');
    setNewEnVal('');
    setNewHiVal('');
    setNewMrVal('');
    setNewBnVal('');
    setNewGuVal('');
    showToast('success', `Key "${sanitizedKey}" added across all 5 languages!`);
  };

  const handleDeleteKey = (key: string) => {
    if (window.confirm(`Are you sure you want to delete translation key "${key}"?`)) {
      deleteKey(key);
      showToast('success', `Translation key "${key}" deleted.`);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportTranslations(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `VPM_Translations_All_Languages_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('success', 'Translations JSON exported successfully!');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          const success = importTranslations(parsed);
          if (success) {
            showToast('success', 'Translations JSON imported and merged successfully!');
          } else {
            showToast('error', 'Invalid translation JSON format.');
          }
        } catch (err) {
          showToast('error', 'Failed to parse JSON file.');
        }
      };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border animate-fadeIn ${
          notification.type === 'success' ? 'bg-emerald-950 text-emerald-200 border-emerald-500' : 'bg-rose-950 text-rose-200 border-rose-500'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/80 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Languages className="w-48 h-48 text-amber-400" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider">
                i18n Engine Active
              </span>
              <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> 5 Native Indian Languages Supported
              </span>
            </div>
            <h2 className="text-2xl font-black font-serif text-white tracking-tight">
              {t('translationManagement', 'Translation & Multi-Language Management')}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              {t('translationSub', 'Manage live text translations for English, Hindi, Marathi, Bengali, and Gujarati. Search keys, add new entries, and export/import JSON files.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="bg-indigo-900/90 hover:bg-indigo-800 text-slate-100 border border-indigo-700/80 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>

            <button
              onClick={handleExportJson}
              className="bg-indigo-900/90 hover:bg-indigo-800 text-slate-100 border border-indigo-700/80 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all shadow-lg"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>Add Key</span>
            </button>
          </div>
        </div>
      </div>

      {/* Language Switcher Quick Test Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>Test Live Language Switching:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {supportedLanguages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as Language)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                language === lang.code
                  ? 'bg-amber-400 text-slate-950 font-black shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName} ({lang.code.toUpperCase()})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search translation key or value in any language..."
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold">
          <span>Showing <strong className="text-amber-400">{filteredKeys.length}</strong> of {allKeys.length} Keys</span>
        </div>
      </div>

      {/* Translation Keys Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 w-48">Key Name</th>
                <th className="py-3 px-4">🇬🇧 English</th>
                <th className="py-3 px-4">🇮🇳 हिन्दी (Hindi)</th>
                <th className="py-3 px-4">🇮🇳 मराठी (Marathi)</th>
                <th className="py-3 px-4">🇮🇳 বাংলা (Bengali)</th>
                <th className="py-3 px-4">🇮🇳 ગુજરાતી (Gujarati)</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 font-bold">
                    No translation keys found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredKeys.map(key => {
                  const isEditing = editingKey === key;
                  return (
                    <tr key={key} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400 text-[11px] break-all">
                        {key}
                      </td>

                      {isEditing ? (
                        <>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={editEnVal}
                              onChange={(e) => setEditEnVal(e.target.value)}
                              className="w-full bg-slate-950 border border-amber-500/80 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={editHiVal}
                              onChange={(e) => setEditHiVal(e.target.value)}
                              className="w-full bg-slate-950 border border-amber-500/80 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={editMrVal}
                              onChange={(e) => setEditMrVal(e.target.value)}
                              className="w-full bg-slate-950 border border-amber-500/80 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={editBnVal}
                              onChange={(e) => setEditBnVal(e.target.value)}
                              className="w-full bg-slate-950 border border-amber-500/80 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={editGuVal}
                              onChange={(e) => setEditGuVal(e.target.value)}
                              className="w-full bg-slate-950 border border-amber-500/80 rounded px-2 py-1 text-xs text-white"
                            />
                          </td>
                          <td className="py-2 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSaveEdit(key)}
                                className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold"
                                title="Save Changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingKey(null)}
                                className="p-1.5 rounded bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4 text-slate-200">{translations.en[key] || <span className="text-slate-600 italic">-</span>}</td>
                          <td className="py-3 px-4 text-slate-200">{translations.hi[key] || <span className="text-slate-600 italic">-</span>}</td>
                          <td className="py-3 px-4 text-slate-200">{translations.mr[key] || <span className="text-slate-600 italic">-</span>}</td>
                          <td className="py-3 px-4 text-slate-200">{translations.bn[key] || <span className="text-slate-600 italic">-</span>}</td>
                          <td className="py-3 px-4 text-slate-200">{translations.gu[key] || <span className="text-slate-600 italic">-</span>}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleStartEdit(key)}
                                className="p-1.5 rounded bg-slate-800 text-indigo-300 hover:bg-indigo-900 hover:text-white transition-colors cursor-pointer"
                                title="Edit Translations"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteKey(key)}
                                className="p-1.5 rounded bg-slate-800 text-rose-400 hover:bg-rose-900 hover:text-white transition-colors cursor-pointer"
                                title="Delete Key"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Key Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 text-white space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold font-serif text-lg text-white">Add New Translation Key</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Key Identifier (camelCase or snake_case)</label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. welcomeMessage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">🇬🇧 English Translation</label>
                  <input
                    type="text"
                    required
                    value={newEnVal}
                    onChange={(e) => setNewEnVal(e.target.value)}
                    placeholder="English text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">🇮🇳 हिन्दी (Hindi) Translation</label>
                  <input
                    type="text"
                    value={newHiVal}
                    onChange={(e) => setNewHiVal(e.target.value)}
                    placeholder="हिंदी अनुवाद"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">🇮🇳 मराठी (Marathi) Translation</label>
                  <input
                    type="text"
                    value={newMrVal}
                    onChange={(e) => setNewMrVal(e.target.value)}
                    placeholder="मराठी भाषांतर"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">🇮🇳 বাংলা (Bengali) Translation</label>
                  <input
                    type="text"
                    value={newBnVal}
                    onChange={(e) => setNewBnVal(e.target.value)}
                    placeholder="বাংলা অনুবাদ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">🇮🇳 ગુજરાતી (Gujarati) Translation</label>
                  <input
                    type="text"
                    value={newGuVal}
                    onChange={(e) => setNewGuVal(e.target.value)}
                    placeholder="ગુજરાતી અનુવાદ"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow"
                >
                  Save Translation Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
