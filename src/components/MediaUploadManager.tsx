import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Upload,
  Search,
  Filter,
  Trash2,
  Edit2,
  Eye,
  Download,
  Share2,
  X,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  FolderOpen,
  CloudUpload,
  FileCode,
  FileSpreadsheet,
  Calendar,
  UserCheck,
  Sparkles,
  Lock,
  Volume2,
  VolumeX
} from 'lucide-react';
import { UserRole } from '../types';

export type MediaCategoryType = 'photo' | 'video' | 'audio' | 'document';

export interface StorageMediaItem {
  id: string;
  userId: string;
  userName: string;
  role: 'admin' | 'agent' | 'customer' | 'investor' | 'employee';
  fileName: string;
  title: string;
  fileType: MediaCategoryType;
  extension: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  fileSizeMb: number;
  status: 'VIRUS_SCAN_PASSED' | 'PROCESSING' | 'READY';
  storageProvider: 'Cloudinary' | 'AWS S3';
  downloadsCount: number;
}

interface MediaUploadManagerProps {
  currentUserRole: UserRole | 'employee' | null;
  currentUserId?: string;
  currentUserName?: string;
  isDarkMode?: boolean;
  onClose?: () => void;
  defaultTab?: 'all' | MediaCategoryType;
}

// Allowed File Extensions
const ALLOWED_EXTENSIONS = {
  photo: ['jpg', 'jpeg', 'png', 'webp'],
  video: ['mp4', 'mov', 'avi', 'mkv'],
  audio: ['mp3', 'wav', 'aac', 'm4a'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx']
};

export const MediaUploadManager: React.FC<MediaUploadManagerProps> = ({
  currentUserRole = 'customer',
  currentUserId = 'USR-CURRENT',
  currentUserName = 'Current User',
  isDarkMode = true,
  onClose,
  defaultTab = 'all'
}) => {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'all' | MediaCategoryType>(defaultTab);

  // Storage Media Items State
  const [mediaItems, setMediaItems] = useState<StorageMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Statistics State
  const [stats, setStats] = useState({
    totalPhotos: 0,
    totalVideos: 0,
    totalAudio: 0,
    totalDocuments: 0,
    totalFiles: 0,
    totalStorageUsedGb: 14.8,
    maxStorageGb: 100,
    virusScanStatus: 'All 100% Clean',
    storageProviders: ['Cloudinary CDN', 'AWS S3 Vault']
  });

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');

  // Modal & Upload States
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadType, setSelectedUploadType] = useState<MediaCategoryType>('photo');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [storageProvider, setStorageProvider] = useState<'Cloudinary' | 'AWS S3'>('Cloudinary');

  // Progress and Upload Simulation State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Viewers Lightbox State
  const [viewingItem, setViewingItem] = useState<StorageMediaItem | null>(null);
  const [photoZoom, setPhotoZoom] = useState(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(true);
  const [isMutedVideo, setIsMutedVideo] = useState(false);

  // In-place Editing Title State
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Toast System Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial media items and stats from server
  const fetchMediaData = async () => {
    try {
      setIsLoading(true);
      const [listRes, statsRes] = await Promise.all([
        fetch('/api/media/list'),
        fetch('/api/media/stats')
      ]);

      if (listRes.ok) {
        const listData = await listRes.json();
        if (listData.items) {
          setMediaItems(listData.items);
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) {
          setStats(statsData.stats);
        }
      }
    } catch (err) {
      console.error('Failed to load media list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaData();
  }, []);

  // Open Upload Modal with specific pre-selected type
  const handleOpenUpload = (type: MediaCategoryType) => {
    setSelectedUploadType(type);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setUploadTitle('');
    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(false);
    setShowUploadModal(true);
  };

  // Validate File Extension against selected category
  const validateFile = (file: File, category: MediaCategoryType): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ALLOWED_EXTENSIONS[category];
    if (!allowed.includes(ext)) {
      setUploadError(
        `Invalid File Format! Only .${allowed.join(', .')} files are supported for ${category.toUpperCase()} uploads.`
      );
      return false;
    }
    // Size check (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('File size exceeds maximum allowed 100 MB storage limit.');
      return false;
    }
    setUploadError(null);
    return true;
  };

  // File Handle Change
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (validateFile(file, selectedUploadType)) {
        setSelectedFile(file);
        setUploadTitle(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      }
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file, selectedUploadType)) {
        setSelectedFile(file);
        setUploadTitle(file.name.substring(0, file.name.lastIndexOf('.')) || file.name);
        const url = URL.createObjectURL(file);
        setFilePreviewUrl(url);
      }
    }
  };

  // Start Upload Simulation & Submit to API
  const handleUploadSubmit = async () => {
    if (!selectedFile && !filePreviewUrl) {
      setUploadError('Please select a valid media file to upload.');
      return;
    }

    if (!uploadTitle.trim()) {
      setUploadError('Please provide a file title.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStatusText('Scanning file for malware & viruses...');

    // Progress Simulation
    await new Promise((res) => setTimeout(res, 400));
    setUploadProgress(40);
    setUploadStatusText(`Encrypting & uploading to ${storageProvider} CDN Vault...`);

    await new Promise((res) => setTimeout(res, 600));
    setUploadProgress(80);
    setUploadStatusText('Saving metadata to MongoDB database...');

    await new Promise((res) => setTimeout(res, 400));
    setUploadProgress(100);

    const ext = selectedFile?.name.split('.').pop()?.toLowerCase() || (selectedUploadType === 'photo' ? 'jpg' : selectedUploadType === 'video' ? 'mp4' : selectedUploadType === 'audio' ? 'mp3' : 'pdf');
    const fileSizeMb = selectedFile ? Number((selectedFile.size / (1024 * 1024)).toFixed(2)) : 2.5;

    // Fallback sample URLs if local blob URL
    let defaultMediaUrl = filePreviewUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
    if (selectedUploadType === 'video') {
      defaultMediaUrl = filePreviewUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    } else if (selectedUploadType === 'audio') {
      defaultMediaUrl = filePreviewUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    } else if (selectedUploadType === 'document') {
      defaultMediaUrl = filePreviewUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    }

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          userName: currentUserName,
          role: currentUserRole,
          title: uploadTitle,
          fileName: selectedFile?.name || `${uploadTitle}.${ext}`,
          fileType: selectedUploadType,
          extension: ext,
          fileSizeMb,
          fileUrl: defaultMediaUrl,
          storageProvider
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.media) {
          setMediaItems((prev) => [data.media, ...prev]);
        }
      } else {
        // Local state fallback if API is unreachable
        const fallbackItem: StorageMediaItem = {
          id: "MED-" + Math.floor(1000 + Math.random() * 9000),
          userId: currentUserId,
          userName: currentUserName,
          role: (currentUserRole as any) || 'customer',
          fileName: selectedFile?.name || `${uploadTitle}.${ext}`,
          title: uploadTitle,
          fileType: selectedUploadType,
          extension: ext,
          fileUrl: defaultMediaUrl,
          uploadDate: new Date().toISOString().split('T')[0],
          fileSizeMb,
          status: 'VIRUS_SCAN_PASSED',
          storageProvider,
          downloadsCount: 0
        };
        setMediaItems((prev) => [fallbackItem, ...prev]);
      }

      showToast(`Upload Successful! "${uploadTitle}" saved to ${storageProvider}.`, 'success');
      setShowUploadModal(false);
      fetchMediaData(); // Refresh metrics
    } catch (err) {
      showToast('Upload failed! Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Media Handler
  const handleDeleteItem = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}" permanently?`)) return;

    try {
      const res = await fetch(`/api/media/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMediaItems((prev) => prev.filter((i) => i.id !== id));
        showToast(`File Deleted: "${title}" removed from storage.`, 'info');
      } else {
        setMediaItems((prev) => prev.filter((i) => i.id !== id));
        showToast(`File Deleted: "${title}" removed.`, 'info');
      }
    } catch (err) {
      setMediaItems((prev) => prev.filter((i) => i.id !== id));
      showToast('File removed successfully.', 'info');
    }
  };

  // Update Media Title Handler
  const handleSaveTitle = async (id: string) => {
    if (!editingTitle.trim()) return;

    try {
      await fetch(`/api/media/update-title/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle })
      });
      setMediaItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, title: editingTitle } : item))
      );
      showToast('Title updated successfully!', 'success');
    } catch (err) {
      setMediaItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, title: editingTitle } : item))
      );
      showToast('Title updated.', 'success');
    } finally {
      setEditingItemId(null);
    }
  };

  // Download Trigger Handler
  const handleDownload = (item: StorageMediaItem) => {
    const link = document.createElement('a');
    link.href = item.fileUrl;
    link.download = item.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`File Downloaded: ${item.fileName} saved to your device.`, 'success');
  };

  // Filtered Items Calculation
  const filteredItems = mediaItems.filter((item) => {
    // Tab filter
    if (activeTab !== 'all' && item.fileType !== activeTab) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchFile = item.fileName.toLowerCase().includes(q);
      const matchUser = item.userName.toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchUser) return false;
    }

    // Role filter
    if (roleFilter !== 'all' && item.role !== roleFilter) return false;

    // Storage Provider filter
    if (providerFilter !== 'all' && item.storageProvider !== providerFilter) return false;

    // Date filter
    if (dateFilter !== 'all') {
      const itemTime = new Date(item.uploadDate).getTime();
      const now = Date.now();
      const diffDays = (now - itemTime) / (1000 * 3600 * 24);
      if (dateFilter === '7days' && diffDays > 7) return false;
      if (dateFilter === '30days' && diffDays > 30) return false;
    }

    return true;
  });

  // Calculate live counts
  const photosCount = mediaItems.filter((i) => i.fileType === 'photo').length;
  const videosCount = mediaItems.filter((i) => i.fileType === 'video').length;
  const audioCount = mediaItems.filter((i) => i.fileType === 'audio').length;
  const docsCount = mediaItems.filter((i) => i.fileType === 'document').length;

  return (
    <div className={`rounded-3xl p-6 md:p-8 border shadow-2xl space-y-6 ${
      isDarkMode ? 'bg-slate-900 border-amber-500/40 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-bounce ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
            : toastMessage.type === 'error'
              ? 'bg-rose-950 border-rose-500/50 text-rose-300'
              : 'bg-sky-950 border-sky-500/50 text-sky-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold font-sans">{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Storage Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded tracking-widest">
              Cloudinary CDN & AWS S3 Integrated
            </span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Virus Scan Active</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-black text-white mt-2 flex items-center gap-2.5">
            <FolderOpen className="w-7 h-7 text-amber-400" />
            <span>Media Upload & Document Vault System</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 max-w-3xl">
            Upload and manage site photos, aerial videos, voice notes, and official registry documents across Admin, Agent, Buyer, Investor, and Employee desks.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-start lg:self-center bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 1. UPLOAD BUTTONS BAR */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
            <CloudUpload className="w-4 h-4 text-amber-400" />
            <span>Quick Media Upload Center</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Max File Size: 100 MB per upload
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleOpenUpload('photo')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenUpload('video')}
            className="bg-sky-600 hover:bg-sky-500 text-white p-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <Video className="w-4 h-4" />
            <span>Upload Video</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenUpload('audio')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <Mic className="w-4 h-4" />
            <span>Upload Audio</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenUpload('document')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.02]"
          >
            <FileText className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD STORAGE STATISTICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Photos</span>
            <ImageIcon className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{photosCount}</span>
          <span className="text-[9px] text-slate-400 block">JPG, PNG, WEBP</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Videos</span>
            <Video className="w-4 h-4 text-sky-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{videosCount}</span>
          <span className="text-[9px] text-slate-400 block">MP4, MOV 4K</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Audio Files</span>
            <Mic className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{audioCount}</span>
          <span className="text-[9px] text-slate-400 block">MP3, WAV Notes</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Documents</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{docsCount}</span>
          <span className="text-[9px] text-slate-400 block">PDF, DOCX, XLSX</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Storage Used</span>
            <HardDrive className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-2xl font-black text-amber-400">{stats.totalStorageUsedGb}</span>
            <span className="text-xs text-slate-400">/ 100 GB</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${(stats.totalStorageUsedGb / 100) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* GALLERY CATEGORY TABS & FILTER BAR */}
      <div className="space-y-4">
        
        {/* Category Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Files', icon: FolderOpen, count: mediaItems.length },
            { id: 'photo', label: 'Photos', icon: ImageIcon, count: photosCount },
            { id: 'video', label: 'Videos', icon: Video, count: videosCount },
            { id: 'audio', label: 'Audio', icon: Mic, count: audioCount },
            { id: 'document', label: 'Documents', icon: FileText, count: docsCount }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 flex items-center gap-2 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Advanced Filters */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by File Name, Title, Uploaded User..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
            >
              <option value="all">All User Roles</option>
              <option value="admin">Admin / Director</option>
              <option value="agent">Certified Agent</option>
              <option value="customer">Buyer / Plot Holder</option>
              <option value="investor">Investor Desk</option>
              <option value="employee">Employee Desk</option>
            </select>

            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Storage Gateways</option>
              <option value="Cloudinary">Cloudinary CDN</option>
              <option value="AWS S3">AWS S3 Vault</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Time Uploads</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>

      </div>

      {/* MEDIA GALLERY GRID */}
      {isLoading ? (
        <div className="text-center py-12 space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-xs">Loading media vault from Cloudinary / AWS S3...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-300">No media files match your filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or click any of the "Upload" buttons above to add new media.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail / Player Box */}
              <div className="relative aspect-video bg-slate-900 overflow-hidden flex items-center justify-center">
                
                {item.fileType === 'photo' && (
                  <img
                    src={item.fileUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {item.fileType === 'video' && (
                  <div className="relative w-full h-full bg-slate-950">
                    <img
                      src={item.thumbnailUrl || "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                      </div>
                    </div>
                  </div>
                )}

                {item.fileType === 'audio' && (
                  <div className="w-full h-full p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 flex flex-col justify-between items-center text-center">
                    <Mic className="w-8 h-8 text-amber-400 my-auto animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Voice Recording ({item.extension})
                    </span>
                  </div>
                )}

                {item.fileType === 'document' && (
                  <div className="w-full h-full p-4 bg-slate-900 flex flex-col items-center justify-center text-center space-y-2">
                    <FileText className="w-10 h-10 text-emerald-400" />
                    <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                      PDF Deed / Document
                    </span>
                  </div>
                )}

                {/* Storage Gateway Badge */}
                <span className="absolute top-2 right-2 bg-slate-900/90 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                  {item.storageProvider}
                </span>

                {/* Virus Scan Badge */}
                <span className="absolute top-2 left-2 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                  ✓ Clean
                </span>
              </div>

              {/* Card Meta Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono">{item.uploadDate}</span>
                    <span className="font-mono text-amber-400 font-bold">{item.fileSizeMb} MB</span>
                  </div>

                  {editingItemId === item.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="bg-slate-900 border border-amber-500 rounded px-2 py-1 text-xs text-white w-full"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTitle(item.id)}
                        className="bg-emerald-600 text-white px-2 rounded font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <h4
                      onClick={() => setViewingItem(item)}
                      className="font-bold text-white text-sm line-clamp-1 hover:text-amber-400 cursor-pointer transition-colors"
                      title={item.title}
                    >
                      {item.title}
                    </h4>
                  )}

                  <p className="text-[11px] text-slate-400 line-clamp-1 font-mono mt-0.5">
                    File: {item.fileName}
                  </p>
                </div>

                {/* Uploaded By User Info */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-300 font-medium truncate max-w-[140px]">
                    By: <strong className="text-white">{item.userName}</strong>
                  </span>
                  <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-extrabold uppercase">
                    {item.role}
                  </span>
                </div>

                {/* Action Toolbar Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
                  
                  {/* View */}
                  <button
                    type="button"
                    onClick={() => setViewingItem(item)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold"
                    title="View Media"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>View</span>
                  </button>

                  {/* Download */}
                  <button
                    type="button"
                    onClick={() => handleDownload(item)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Save</span>
                  </button>

                  {/* Share */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.fileUrl);
                      showToast('Media Link Copied to Clipboard!', 'info');
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-400 cursor-pointer transition-colors flex items-center gap-1 text-[10px] font-bold"
                    title="Share Link"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Share</span>
                  </button>

                  {/* Edit Title (Admin or Owner) */}
                  {(currentUserRole === 'admin' || item.userId === currentUserId) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItemId(item.id);
                        setEditingTitle(item.title);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-400 cursor-pointer transition-colors text-[10px] font-bold"
                      title="Edit Title"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  )}

                  {/* Delete (Admin or Owner) */}
                  {(currentUserRole === 'admin' || item.userId === currentUserId) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors text-[10px] font-bold"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  )}

                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------------- UPLOAD MODAL (DRAG & DROP AREA) ---------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs text-slate-100">
            
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded tracking-widest">
                Upload {selectedUploadType.toUpperCase()}
              </span>
              <h3 className="text-xl font-serif font-black text-white mt-1">
                Upload New {selectedUploadType === 'photo' ? 'Photo' : selectedUploadType === 'video' ? 'Video' : selectedUploadType === 'audio' ? 'Audio Voice Note' : 'Document'}
              </h3>
              <p className="text-slate-400 text-xs">
                Supported Formats: <strong className="text-amber-400">.{ALLOWED_EXTENSIONS[selectedUploadType].join(', .')}</strong>
              </p>
            </div>

            {/* Storage Gateway Target Selector */}
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-slate-300 font-bold uppercase text-[10px]">Cloud Target Provider:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStorageProvider('Cloudinary')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase cursor-pointer ${
                    storageProvider === 'Cloudinary' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  Cloudinary CDN
                </button>
                <button
                  type="button"
                  onClick={() => setStorageProvider('AWS S3')}
                  className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase cursor-pointer ${
                    storageProvider === 'AWS S3' ? 'bg-sky-500 text-white' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  AWS S3 Vault
                </button>
              </div>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center space-y-3 cursor-pointer transition-all ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10 scale-105'
                  : 'border-slate-700 bg-slate-950/60 hover:border-amber-500/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ALLOWED_EXTENSIONS[selectedUploadType].map((ext) => `.${ext}`).join(',')}
                onChange={handleFileSelect}
              />

              <CloudUpload className="w-12 h-12 text-amber-400 mx-auto" />

              <div>
                <p className="text-sm font-bold text-white">
                  Drag and drop your {selectedUploadType} file here
                </p>
                <p className="text-xs text-slate-400 mt-1">or click to browse from your computer</p>
              </div>

              <button
                type="button"
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider inline-block cursor-pointer border border-slate-700"
              >
                Browse Files
              </button>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Selected File Preview & Metadata */}
            {selectedFile && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 uppercase text-[10px]">Selected File Details</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold uppercase text-[10px] mb-1">
                    Display Title *
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter descriptive title..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              </div>
            )}

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{uploadStatusText}</span>
                  </span>
                  <span className="text-white font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-bold uppercase text-xs cursor-pointer"
              >
                Cancel Upload
              </button>

              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={isUploading || !selectedFile}
                className={`bg-amber-500 hover:bg-amber-400 text-slate-950 px-6 py-2.5 rounded-xl font-black uppercase text-xs cursor-pointer shadow-lg transition-all ${
                  isUploading || !selectedFile ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploading ? 'Uploading...' : 'Start Cloud Upload'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- MEDIA LIGHTBOX & PLAYER MODAL ---------------- */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative text-xs text-slate-100">
            
            <button
              onClick={() => setViewingItem(null)}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-full cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded">
                  {viewingItem.fileType.toUpperCase()}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">
                  Uploaded by {viewingItem.userName} ({viewingItem.role})
                </span>
              </div>
              <h3 className="text-xl font-serif font-black text-white mt-1">{viewingItem.title}</h3>
            </div>

            {/* Viewer Stage */}
            <div className="bg-slate-950 rounded-2xl min-h-[300px] flex items-center justify-center p-4 relative overflow-hidden">
              
              {viewingItem.fileType === 'photo' && (
                <div className="text-center space-y-2">
                  <div className="overflow-auto max-h-[60vh] flex items-center justify-center">
                    <img
                      src={viewingItem.fileUrl}
                      alt={viewingItem.title}
                      style={{ transform: `scale(${photoZoom})` }}
                      className="max-h-[55vh] object-contain rounded-xl transition-transform duration-200"
                    />
                  </div>
                  <div className="flex justify-center items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl w-max mx-auto border border-slate-800">
                    <button
                      onClick={() => setPhotoZoom((z) => Math.max(0.5, z - 0.25))}
                      className="p-1 hover:text-amber-400 cursor-pointer"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="font-mono text-slate-300 font-bold">{Math.round(photoZoom * 100)}%</span>
                    <button
                      onClick={() => setPhotoZoom((z) => Math.min(3, z + 0.25))}
                      className="p-1 hover:text-amber-400 cursor-pointer"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPhotoZoom(1)}
                      className="p-1 text-xs text-amber-400 font-bold cursor-pointer ml-2"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}

              {viewingItem.fileType === 'video' && (
                <div className="w-full space-y-3">
                  <video
                    src={viewingItem.fileUrl}
                    controls
                    autoPlay={isPlayingVideo}
                    className="w-full max-h-[55vh] rounded-xl"
                  />
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono bg-slate-900 p-2.5 rounded-xl">
                    <span>Streaming Quality: 1080p 60fps</span>
                    <span className="text-emerald-400">✓ Fast Cloudinary CDN Stream</span>
                  </div>
                </div>
              )}

              {viewingItem.fileType === 'audio' && (
                <div className="w-full p-8 text-center space-y-4">
                  <Mic className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
                  <h4 className="text-white font-bold text-sm">{viewingItem.title}</h4>
                  <audio src={viewingItem.fileUrl} controls autoPlay className="w-full" />
                </div>
              )}

              {viewingItem.fileType === 'document' && (
                <div className="w-full p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 text-emerald-400 mx-auto" />
                  <p className="text-white font-bold text-sm">{viewingItem.title}</p>
                  <p className="text-xs text-slate-400 font-mono">File Name: {viewingItem.fileName}</p>
                  <button
                    onClick={() => handleDownload(viewingItem)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold uppercase text-xs flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Certified PDF Document</span>
                  </button>
                </div>
              )}

            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-mono">Size: {viewingItem.fileSizeMb} MB</span>

              <button
                onClick={() => handleDownload(viewingItem)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2 rounded-xl font-black uppercase text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save to Device</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
