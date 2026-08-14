import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Mic,
  FileText,
  Upload,
  Search,
  Filter,
  Heart,
  MessageSquare,
  Share2,
  ShieldCheck,
  CheckCircle2,
  X,
  Play,
  Pause,
  Download,
  Eye,
  Award,
  UserCheck,
  MapPin,
  Sparkles,
  AlertTriangle,
  Lock,
  ThumbsUp,
  UserPlus,
  SlidersHorizontal,
  ChevronRight,
  Flag,
  FileCheck,
  CloudUpload
} from 'lucide-react';
import { GalleryItem, MediaCategory, MediaType, MediaStatus, UserRole, UserProfileShowcase, MediaComment } from '../types';

interface MediaGalleryProps {
  items: GalleryItem[];
  currentUserRole: UserRole | null;
  currentUserName: string | null;
  onAddItem: (newItem: Partial<GalleryItem>) => void;
  onUpdateItemStatus: (id: string, status: MediaStatus) => void;
  onDeleteItem: (id: string) => void;
  onToggleLike: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onOpenAuth: () => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  items,
  currentUserRole,
  currentUserName,
  onAddItem,
  onUpdateItemStatus,
  onDeleteItem,
  onToggleLike,
  onAddComment,
  onOpenAuth
}) => {
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'views'>('recent');

  // Modal States
  const [activeMediaItem, setActiveMediaItem] = useState<GalleryItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [selectedCreatorProfile, setSelectedCreatorProfile] = useState<UserProfileShowcase | null>(null);
  const [showAdminModeration, setShowAdminModeration] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<GalleryItem | null>(null);
  const [reportReason, setReportReason] = useState<string>('Spam or misleading content');
  const [reportSubmitted, setReportSubmitted] = useState<boolean>(false);

  // Audio playing simulation state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Followed creators set
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());

  // Upload Form State
  const [uploadName, setUploadName] = useState(currentUserName || '');
  const [uploadPhone, setUploadPhone] = useState('');
  const [uploadRole, setUploadRole] = useState<UserRole | 'customer' | 'team_member'>('customer');
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>('Customer Success Stories');
  const [uploadMediaType, setUploadMediaType] = useState<MediaType>('photo');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadLocation, setUploadLocation] = useState('New Jhunsi, Prayagraj');
  const [uploadProjectName, setUploadProjectName] = useState('Milestone City Prayagraj');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadWatermark, setUploadWatermark] = useState(true);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Direct File Upload State
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const handleDirectFileSelect = (file: File) => {
    setSelectedUploadFile(file);
    const previewUrl = URL.createObjectURL(file);
    setSelectedFilePreview(previewUrl);
    setUploadFileUrl(previewUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleDirectFileSelect(e.target.files[0]);
    }
  };

  const handleGalleryDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleGalleryDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleGalleryDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleDirectFileSelect(e.dataTransfer.files[0]);
    }
  };

  // New Comment Input inside detail modal
  const [newCommentText, setNewCommentText] = useState('');

  const categories: string[] = [
    'All',
    'Customer Success Stories',
    'Plot Holder Gallery',
    'Investor Gallery',
    'Agent Achievement Gallery',
    'Site Visit Gallery',
    'Project Development Gallery',
    'Testimonials Gallery',
    'Video Testimonials',
    'Audio Testimonials',
    'Community Events Gallery'
  ];

  // Filtered Items Logic
  const approvedItems = items.filter(item => {
    if (showAdminModeration) return true; // admin sees all statuses
    return item.status === 'approved';
  });

  const filteredItems = approvedItems.filter(item => {
    // Category match
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    // Type match
    if (selectedType !== 'All' && item.mediaType !== selectedType) return false;
    // Role match
    if (selectedRole !== 'All' && item.userRole !== selectedRole) return false;
    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchUser = item.userName.toLowerCase().includes(q);
      const matchLoc = item.location.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchUser && !matchLoc) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes;
    if (sortBy === 'views') return b.views - a.views;
    return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
  });

  // Handle Form Submission
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadDescription.trim()) {
      alert("Please enter a title and description.");
      return;
    }

    // Default sample media if no file provided
    let defaultMedia = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
    if (uploadMediaType === 'video') {
      defaultMedia = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    } else if (uploadMediaType === 'audio') {
      defaultMedia = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    } else if (uploadMediaType === 'document') {
      defaultMedia = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    }

    const newItem: Partial<GalleryItem> = {
      id: "gal-" + Math.floor(1000 + Math.random() * 9000),
      userId: "USR-" + Math.floor(100 + Math.random() * 900),
      userName: uploadName || "Community Member",
      userRole: uploadRole,
      userPhone: uploadPhone,
      userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      category: uploadCategory,
      mediaType: uploadMediaType,
      mediaUrl: uploadFileUrl || defaultMedia,
      thumbnailUrl: uploadMediaType === 'video' ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" : undefined,
      title: uploadTitle,
      description: uploadDescription,
      location: uploadLocation,
      projectName: uploadProjectName,
      uploadDate: new Date().toISOString().split('T')[0],
      status: currentUserRole === 'admin' ? 'approved' : 'pending',
      views: 1,
      likes: 0,
      likedBy: [],
      comments: [],
      hasWatermark: uploadWatermark,
      spamScore: Math.floor(Math.random() * 5),
      fileSizeMb: Number((Math.random() * 5 + 1).toFixed(1))
    };

    onAddItem(newItem);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      // Reset form
      setUploadTitle('');
      setUploadDescription('');
      setUploadFileUrl('');
      setSelectedUploadFile(null);
      setSelectedFilePreview(null);
    }, 2000);
  };

  const handleToggleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const openCreatorProfile = (item: GalleryItem) => {
    const creatorItems = items.filter(i => i.userId === item.userId);
    const photos = creatorItems.filter(i => i.mediaType === 'photo').length;
    const videos = creatorItems.filter(i => i.mediaType === 'video').length;
    const audios = creatorItems.filter(i => i.mediaType === 'audio').length;
    const totalLikes = creatorItems.reduce((acc, curr) => acc + curr.likes, 0);

    let badge = 'Verified Contributor';
    if (item.userRole === 'admin') badge = 'Director / Official Desk';
    else if (item.userRole === 'agent') badge = 'Star VPM Agent';
    else if (item.userRole === 'investor') badge = 'VIP Investor';
    else if (item.userRole === 'buyer' || item.userRole === 'customer') badge = 'Verified Plot Owner';

    setSelectedCreatorProfile({
      userId: item.userId,
      userName: item.userName,
      userRole: item.userRole,
      avatar: item.userAvatar,
      totalUploads: creatorItems.length || 1,
      videosCount: videos,
      photosCount: photos,
      audiosCount: audios,
      followers: 128 + creatorItems.length * 15,
      followedByCurrentUser: followedUsers.has(item.userId),
      likesReceived: totalLikes,
      badge
    });
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeMediaItem) return;
    onAddComment(activeMediaItem.id, newCommentText);
    setNewCommentText('');
  };

  return (
    <section className="py-12 bg-slate-900 text-slate-100 font-sans border-b border-slate-800" id="gallery-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Top Header & Stats */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-900/80 border border-indigo-700 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>PREMIUM MEDIA GALLERY & COMMUNITY SHOWCASE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-white tracking-tight">
              Prayagraj Township <span className="text-amber-400 italic font-serif">Community Stories & Media</span>
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              Explore customer possession handovers, site visit videos, investor ROI checks, agent achievement trophies, and real township progress photos across Jhunsi, Naini, and Phaphamau.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 4 Distinct Upload Buttons */}
            <button
              onClick={() => {
                setUploadMediaType('photo');
                setShowUploadModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer hover:scale-105"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>

            <button
              onClick={() => {
                setUploadMediaType('video');
                setShowUploadModal(true);
              }}
              className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer hover:scale-105"
            >
              <Video className="w-4 h-4" />
              <span>Upload Video</span>
            </button>

            <button
              onClick={() => {
                setUploadMediaType('audio');
                setShowUploadModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer hover:scale-105"
            >
              <Mic className="w-4 h-4" />
              <span>Upload Audio</span>
            </button>

            <button
              onClick={() => {
                setUploadMediaType('document');
                setShowUploadModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all shrink-0 cursor-pointer hover:scale-105"
            >
              <FileText className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            {/* Admin Toggle button if role is admin */}
            {currentUserRole === 'admin' && (
              <button
                onClick={() => setShowAdminModeration(!showAdminModeration)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                  showAdminModeration
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : 'bg-indigo-950 border-indigo-800 text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{showAdminModeration ? 'Exit Admin' : 'Admin Desk'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Media Upload Direct Bar */}
        <div className="bg-indigo-950/80 p-4 rounded-2xl border border-indigo-800/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-sm font-black text-white">Media Upload Center (Photos, Audio, Video, Documents)</h4>
              <p className="text-[11px] text-slate-400">Supported: JPG, PNG, WEBP, MP4, MOV, MP3, WAV, AAC, PDF, DOCX, XLSX</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setUploadMediaType('photo');
                setShowUploadModal(true);
              }}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Photo</span>
            </button>

            <button
              onClick={() => {
                setUploadMediaType('video');
                setShowUploadModal(true);
              }}
              className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Video className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Video</span>
            </button>

            <button
              onClick={() => {
                setUploadMediaType('audio');
                setShowUploadModal(true);
              }}
              className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span>+ Audio</span>
            </button>

            <button
              onClick={() => {
                setUploadMediaType('document');
                setShowUploadModal(true);
              }}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Document</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-800 scrollbar-track-transparent">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'bg-indigo-950/70 border border-indigo-900 text-slate-300 hover:bg-indigo-900 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Media Type Controls */}
        <div className="bg-indigo-950/90 p-4 rounded-2xl border border-indigo-900/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, location, user..."
              className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl pl-9 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider shrink-0 mr-1">Type:</span>
            <button
              onClick={() => setSelectedType('All')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shrink-0 ${
                selectedType === 'All' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-900/80 text-slate-300 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedType('photo')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                selectedType === 'photo' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              Photos
            </button>
            <button
              onClick={() => setSelectedType('video')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                selectedType === 'video' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <Video className="w-3 h-3" />
              Videos
            </button>
            <button
              onClick={() => setSelectedType('audio')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                selectedType === 'audio' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <Mic className="w-3 h-3" />
              Audio
            </button>
            <button
              onClick={() => setSelectedType('document')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                selectedType === 'document' ? 'bg-amber-400 text-slate-950' : 'bg-indigo-900/80 text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="w-3 h-3" />
              Docs
            </button>
          </div>

          {/* Role Filter & Sort */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="bg-indigo-900/80 border border-indigo-800 rounded-lg px-2.5 py-1.5 text-white text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-amber-400"
            >
              <option value="All">All User Roles</option>
              <option value="customer">Free Plot Scheme / Plot Holders</option>
              <option value="agent">Certified Agents</option>
              <option value="investor">ROI Investors</option>
              <option value="admin">Official VPM Desk</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-indigo-900/80 border border-indigo-800 rounded-lg px-2.5 py-1.5 text-white text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:border-amber-400"
            >
              <option value="recent">Most Recent</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Gallery Items Masonry Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-indigo-950/60 p-12 rounded-2xl border border-indigo-900 text-center space-y-4">
            <ImageIcon className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-serif font-bold text-slate-300">No media items match your search filter</h3>
            <p className="text-xs text-slate-400">Try changing the category or clear your search keywords.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedType('All');
                setSelectedRole('All');
                setSearchQuery('');
              }}
              className="bg-indigo-900 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-indigo-950/80 rounded-2xl border border-indigo-900 overflow-hidden shadow-lg hover:shadow-xl hover:border-indigo-700 transition-all duration-300 flex flex-col group"
              >
                {/* Media Container / Player Preview */}
                <div className="relative bg-slate-950 overflow-hidden aspect-video sm:aspect-square flex items-center justify-center">
                  
                  {item.mediaType === 'photo' && (
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {item.mediaType === 'video' && (
                    <div className="relative w-full h-full">
                      <img
                        src={item.thumbnailUrl || item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 bg-slate-950/80 text-amber-300 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                        VIDEO
                      </span>
                    </div>
                  )}

                  {item.mediaType === 'audio' && (
                    <div className="w-full h-full p-4 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          Audio Note
                        </span>
                        <Mic className="w-5 h-5 text-amber-400" />
                      </div>

                      <div className="space-y-2 my-auto text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPlayingAudioId(playingAudioId === item.id ? null : item.id);
                          }}
                          className="w-12 h-12 mx-auto rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md hover:scale-105 transition-transform"
                        >
                          {playingAudioId === item.id ? (
                            <Pause className="w-5 h-5 fill-slate-950" />
                          ) : (
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          )}
                        </button>
                        
                        {/* Audio Waveform Bars Simulation */}
                        <div className="flex items-center justify-center gap-1 h-6">
                          {[30, 60, 40, 80, 50, 90, 30, 70, 40, 60, 90, 50, 30].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${playingAudioId === item.id ? (h + Math.random() * 20) % 100 : h}%` }}
                              className={`w-1 rounded-full transition-all duration-300 ${
                                playingAudioId === item.id ? 'bg-amber-400' : 'bg-indigo-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-300 font-mono text-center">
                        {playingAudioId === item.id ? 'Playing Voice Note...' : 'Click to Play Audio'}
                      </p>
                    </div>
                  )}

                  {item.mediaType === 'document' && (
                    <div className="w-full h-full p-4 bg-slate-900 flex flex-col items-center justify-center text-center space-y-3">
                      <FileText className="w-10 h-10 text-emerald-400" />
                      <div>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-500/30">
                          Verified Document / Deed
                        </span>
                        <p className="text-xs text-white font-bold mt-1 line-clamp-1">{item.title}</p>
                      </div>
                    </div>
                  )}

                  {/* Watermark Overlay Badge */}
                  {item.hasWatermark && (
                    <div className="absolute top-2 right-2 bg-indigo-950/90 border border-amber-400/40 text-amber-300 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow">
                      VPM Verified
                    </div>
                  )}

                  {/* Admin Status Pill */}
                  {showAdminModeration && (
                    <span className={`absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow ${
                      item.status === 'approved' ? 'bg-emerald-600 text-white' :
                      item.status === 'pending' ? 'bg-amber-500 text-slate-950 font-black' :
                      'bg-rose-600 text-white'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
                  
                  {/* Creator Info Header */}
                  <div className="flex items-center justify-between border-b border-indigo-900 pb-2.5">
                    <button
                      onClick={() => openCreatorProfile(item)}
                      className="flex items-center gap-2 text-left hover:text-amber-300 transition-colors group/user"
                    >
                      <img
                        src={item.userAvatar}
                        alt={item.userName}
                        className="w-7 h-7 rounded-full object-cover border border-amber-400/60"
                      />
                      <div>
                        <p className="font-bold text-white text-[11px] leading-tight group-hover/user:text-amber-300">
                          {item.userName}
                        </p>
                        <span className="text-[9px] text-amber-300 font-semibold uppercase tracking-wider">
                          {item.userRole === 'admin' ? 'Director Desk' : item.userRole}
                        </span>
                      </div>
                    </button>

                    <span className="text-[9px] text-slate-400 font-mono">{item.uploadDate}</span>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <span className="inline-block text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                      {item.category}
                    </span>
                    <h3
                      onClick={() => setActiveMediaItem(item)}
                      className="font-serif font-bold text-white text-sm hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Location Tag */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  {/* Social Action Footer */}
                  <div className="pt-2 border-t border-indigo-900 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                      {/* Like */}
                      <button
                        onClick={() => onToggleLike(item.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          item.likedBy?.length > 0 ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${item.likedBy?.length > 0 ? 'fill-rose-400' : ''}`} />
                        <span>{item.likes}</span>
                      </button>

                      {/* Comments */}
                      <button
                        onClick={() => setActiveMediaItem(item)}
                        className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.comments.length}</span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => {
                          const shareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this VPM Milestone township story: ${item.title} - ${item.location}`)}`;
                          window.open(shareUrl, '_blank');
                        }}
                        className="text-slate-400 hover:text-emerald-400 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveMediaItem(item)}
                      className="text-[10px] text-amber-400 font-bold uppercase tracking-wider hover:underline"
                    >
                      View Story →
                    </button>
                  </div>

                  {/* Admin Quick Action Controls */}
                  {showAdminModeration && (
                    <div className="pt-2 border-t border-indigo-800 flex items-center gap-1 text-[10px]">
                      {item.status !== 'approved' && (
                        <button
                          onClick={() => onUpdateItemStatus(item.id, 'approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded font-bold uppercase"
                        >
                          Approve
                        </button>
                      )}
                      {item.status !== 'rejected' && (
                        <button
                          onClick={() => onUpdateItemStatus(item.id, 'rejected')}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1 rounded font-bold uppercase"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="bg-slate-800 hover:bg-rose-900 text-rose-300 px-2 py-1 rounded font-bold uppercase ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ---------------- MODAL 1: MEDIA DETAIL LIGHTBOX ---------------- */}
      {activeMediaItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-indigo-950 border border-indigo-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row text-xs">
            
            {/* Close Button */}
            <button
              onClick={() => setActiveMediaItem(null)}
              className="absolute top-3 right-3 z-20 bg-indigo-900 hover:bg-indigo-800 text-white p-2 rounded-full border border-indigo-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Media Stage */}
            <div className="md:w-3/5 bg-slate-950 min-h-[300px] flex items-center justify-center relative p-2">
              {activeMediaItem.mediaType === 'photo' && (
                <img
                  src={activeMediaItem.mediaUrl}
                  alt={activeMediaItem.title}
                  className="max-h-[70vh] w-auto object-contain rounded-lg"
                />
              )}

              {activeMediaItem.mediaType === 'video' && (
                <video
                  src={activeMediaItem.mediaUrl}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full rounded-lg"
                />
              )}

              {activeMediaItem.mediaType === 'audio' && (
                <div className="w-full p-8 text-center space-y-4">
                  <Mic className="w-16 h-16 text-amber-400 mx-auto" />
                  <h4 className="text-white font-bold text-sm">{activeMediaItem.title}</h4>
                  <audio src={activeMediaItem.mediaUrl} controls autoPlay className="w-full" />
                </div>
              )}

              {activeMediaItem.mediaType === 'document' && (
                <div className="w-full p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 text-emerald-400 mx-auto" />
                  <p className="text-white font-bold">{activeMediaItem.title}</p>
                  <a
                    href={activeMediaItem.mediaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold uppercase text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Document</span>
                  </a>
                </div>
              )}
            </div>

            {/* Right Story & Comments Feed */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-4 border-t md:border-t-0 md:border-l border-indigo-900">
              
              {/* Creator Card */}
              <div className="flex items-center justify-between border-b border-indigo-900 pb-3">
                <button
                  onClick={() => openCreatorProfile(activeMediaItem)}
                  className="flex items-center gap-3 text-left hover:text-amber-300"
                >
                  <img
                    src={activeMediaItem.userAvatar}
                    alt={activeMediaItem.userName}
                    className="w-10 h-10 rounded-full object-cover border border-amber-400"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{activeMediaItem.userName}</h4>
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                      {activeMediaItem.userRole}
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => handleToggleFollow(activeMediaItem.userId)}
                  className={`px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider transition-all ${
                    followedUsers.has(activeMediaItem.userId)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-900 border border-indigo-700 text-amber-300 hover:bg-amber-500 hover:text-slate-950'
                  }`}
                >
                  {followedUsers.has(activeMediaItem.userId) ? 'Following' : '+ Follow'}
                </button>
              </div>

              {/* Title & Full Description */}
              <div className="space-y-2">
                <span className="bg-indigo-900 text-amber-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded">
                  {activeMediaItem.category}
                </span>
                <h3 className="text-lg font-serif font-bold text-white">{activeMediaItem.title}</h3>
                <p className="text-slate-300 leading-relaxed text-xs">{activeMediaItem.description}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeMediaItem.location}</span>
                </div>
              </div>

              {/* Live Comments Section */}
              <div className="flex-1 border-t border-indigo-900 pt-3 space-y-3 overflow-y-auto max-h-48">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Community Comments ({activeMediaItem.comments.length})</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                </h4>

                {activeMediaItem.comments.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No comments yet. Be the first to share your thoughts!</p>
                ) : (
                  <div className="space-y-2">
                    {activeMediaItem.comments.map((c) => (
                      <div key={c.id} className="bg-indigo-900/60 p-2.5 rounded-xl border border-indigo-800 text-[11px]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-amber-300">{c.userName} ({c.userRole})</span>
                          <span className="text-[9px] text-slate-400">{c.createdAt}</span>
                        </div>
                        <p className="text-slate-200">{c.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handlePostComment} className="pt-2 border-t border-indigo-900 flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-indigo-900/80 border border-indigo-800 rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 text-xs"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider"
                >
                  Post
                </button>
              </form>

              {/* Report Action */}
              <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 border-t border-indigo-900">
                <button
                  onClick={() => setShowReportModal(activeMediaItem)}
                  className="hover:text-rose-400 flex items-center gap-1"
                >
                  <Flag className="w-3 h-3" />
                  <span>Report Content</span>
                </button>

                <span>Uploaded: {activeMediaItem.uploadDate}</span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: UPLOAD STORY & MEDIA ---------------- */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-indigo-950 border border-indigo-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs">
            
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-indigo-900 pb-3">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded">
                Upload Media Showcase
              </span>
              <h3 className="text-xl font-serif font-bold text-white mt-1">Share Your Story or Site Media</h3>
              <p className="text-slate-300 text-xs">All media uploads are scanned and moderated prior to public showcase.</p>
            </div>

            {uploadSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-serif font-bold text-emerald-300 text-base">Media Upload Submitted!</h4>
                <p className="text-xs text-slate-300">
                  {currentUserRole === 'admin'
                    ? 'Your item is published directly as Director Admin.'
                    : 'Your submission has been sent to VPM Director Moderation Desk for instant review.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      placeholder="e.g. Ramesh Tripathi"
                      className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Mobile Phone *</label>
                    <input
                      type="tel"
                      value={uploadPhone}
                      onChange={(e) => setUploadPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">User Account Role *</label>
                    <select
                      value={uploadRole}
                      onChange={(e) => setUploadRole(e.target.value as any)}
                      className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="customer">Plot Holder / Customer</option>
                      <option value="agent">Certified VPM Agent</option>
                      <option value="investor">ROI Investor</option>
                      <option value="admin">Director Desk</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Gallery Category *</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    >
                      {categories.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Media Format Type *</label>
                    <select
                      value={uploadMediaType}
                      onChange={(e) => setUploadMediaType(e.target.value as any)}
                      className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-bold text-amber-300"
                    >
                      <option value="photo">Photo Image (JPG / PNG / WEBP)</option>
                      <option value="video">Video Recording (MP4 / MOV)</option>
                      <option value="audio">Voice Audio Note (MP3 / WAV)</option>
                      <option value="document">PDF Document / Deed Copy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Location / Site *</label>
                    <input
                      type="text"
                      value={uploadLocation}
                      onChange={(e) => setUploadLocation(e.target.value)}
                      placeholder="e.g. New Jhunsi, Prayagraj"
                      className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Showcase Title *</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Plot Possession & Registry Key Ceremony"
                    className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Story / Experience Details *</label>
                  <textarea
                    rows={3}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Describe your plot experience, site visit feedback, or township development progress..."
                    className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                {/* Direct File Upload Option (No Link or URL Required) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px]">
                      Upload File From Device (No URL or Link Needed)
                    </label>
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                      ★ Direct Device Upload
                    </span>
                  </div>

                  <input
                    ref={galleryFileInputRef}
                    type="file"
                    className="hidden"
                    accept={
                      uploadMediaType === 'photo' ? "image/*" :
                      uploadMediaType === 'video' ? "video/*" :
                      uploadMediaType === 'audio' ? "audio/*" :
                      ".pdf,.doc,.docx,.xls,.xlsx"
                    }
                    onChange={handleFileInputChange}
                  />

                  <div
                    onDragOver={handleGalleryDragOver}
                    onDragLeave={handleGalleryDragLeave}
                    onDrop={handleGalleryDrop}
                    onClick={() => galleryFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-amber-400 bg-amber-500/20 scale-[1.01]'
                        : selectedUploadFile
                        ? 'border-emerald-500/80 bg-emerald-950/40'
                        : 'border-amber-500/40 bg-indigo-900/60 hover:border-amber-400 hover:bg-indigo-900/80'
                    }`}
                  >
                    {selectedUploadFile ? (
                      <div className="flex items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {selectedFilePreview && uploadMediaType === 'photo' ? (
                            <img src={selectedFilePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-amber-400/50 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                              <CloudUpload className="w-5 h-5 text-amber-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate">{selectedUploadFile.name}</p>
                            <p className="text-[10px] text-amber-300 font-mono">
                              {(selectedUploadFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedUploadFile.type || uploadMediaType.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUploadFile(null);
                            setSelectedFilePreview(null);
                            setUploadFileUrl('');
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white transition-colors shrink-0"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-1">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto">
                          <CloudUpload className="w-5 h-5 text-amber-400" />
                        </div>
                        <p className="text-xs font-black text-white">
                          Select {uploadMediaType === 'photo' ? 'Photo' : uploadMediaType === 'video' ? 'Video' : uploadMediaType === 'audio' ? 'Audio Recording' : 'Document'} File From Device
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Drag and drop here or click to browse photo, video, audio or document file directly from computer/phone.
                        </p>
                        <span className="inline-block bg-amber-400 hover:bg-amber-300 text-slate-950 px-4 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider mt-1 transition-all shadow-md">
                          📁 Choose File (No Link Needed)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Custom File URL */}
                <div>
                  <label className="block text-slate-200 font-bold uppercase tracking-wider text-[10px] mb-1">Media File URL or Direct Link (Optional)</label>
                  <input
                    type="url"
                    value={uploadFileUrl}
                    onChange={(e) => setUploadFileUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg or leave blank for auto-generated high quality media"
                    className="w-full bg-indigo-900/80 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                  />
                </div>

                {/* Watermark & Virus Scan Checklist */}
                <div className="bg-indigo-900/40 p-3 rounded-xl border border-indigo-800 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadWatermark}
                      onChange={(e) => setUploadWatermark(e.target.checked)}
                      className="w-4 h-4 accent-amber-400 rounded"
                    />
                    <span className="text-[11px] text-slate-200 font-medium">Add VPM Milestone Official Watermark Stamp</span>
                  </label>

                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    Auto Virus Scanned
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Upload className="w-4 h-4 text-slate-950" />
                  <span>Submit Media Showcase</span>
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: CREATOR PROFILE SHOWCASE ---------------- */}
      {selectedCreatorProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-indigo-950 border border-indigo-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-xs">
            
            <button
              onClick={() => setSelectedCreatorProfile(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-indigo-900 pb-6 text-center sm:text-left">
              <img
                src={selectedCreatorProfile.avatar}
                alt={selectedCreatorProfile.userName}
                className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-lg"
              />
              <div className="space-y-1">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded">
                  {selectedCreatorProfile.badge}
                </span>
                <h3 className="text-xl font-serif font-bold text-white">{selectedCreatorProfile.userName}</h3>
                <p className="text-slate-300 text-xs">VPM Community Active Contributor</p>
              </div>

              <button
                onClick={() => handleToggleFollow(selectedCreatorProfile.userId)}
                className={`sm:ml-auto px-5 py-2 rounded-xl font-bold uppercase tracking-wider text-xs shadow ${
                  followedUsers.has(selectedCreatorProfile.userId)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                }`}
              >
                {followedUsers.has(selectedCreatorProfile.userId) ? 'Following' : '+ Follow Creator'}
              </button>
            </div>

            {/* Profile Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-900/60 p-4 rounded-xl border border-indigo-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Media</span>
                <p className="text-lg font-bold text-amber-300">{selectedCreatorProfile.totalUploads}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Followers</span>
                <p className="text-lg font-bold text-white">{selectedCreatorProfile.followers + (followedUsers.has(selectedCreatorProfile.userId) ? 1 : 0)}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Likes</span>
                <p className="text-lg font-bold text-rose-400">{selectedCreatorProfile.likesReceived}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Videos / Photos</span>
                <p className="text-lg font-bold text-emerald-400">{selectedCreatorProfile.videosCount} / {selectedCreatorProfile.photosCount}</p>
              </div>
            </div>

            {/* Items by this creator */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Showcase Media Uploads</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {items.filter(i => i.userId === selectedCreatorProfile.userId).map(i => (
                  <div
                    key={i.id}
                    onClick={() => {
                      setSelectedCreatorProfile(null);
                      setActiveMediaItem(i);
                    }}
                    className="relative aspect-video rounded-lg overflow-hidden border border-indigo-800 cursor-pointer group"
                  >
                    <img src={i.mediaUrl} alt={i.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-950/50 p-2 flex flex-col justify-end text-[10px] text-white">
                      <p className="font-bold truncate">{i.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ---------------- MODAL 4: REPORT CONTENT ---------------- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-indigo-950 border border-indigo-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-xs">
            
            <button
              onClick={() => {
                setShowReportModal(null);
                setReportSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Report Media Item
            </h3>

            {reportSubmitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-emerald-300">Report Logged!</p>
                <p className="text-[11px] text-slate-300">VPM Director Moderation Desk will re-verify this item within 24 hours.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300">Select reason for flagging "{showReportModal.title}":</p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-indigo-900 border border-indigo-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-400 text-xs"
                >
                  <option value="Spam or misleading content">Spam or misleading content</option>
                  <option value="Copyright infringement">Copyright infringement</option>
                  <option value="Inappropriate media file">Inappropriate media file</option>
                  <option value="Incorrect site location">Incorrect site location</option>
                </select>

                <button
                  onClick={() => setReportSubmitted(true)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-widest py-2.5 rounded-xl text-xs"
                >
                  Submit Flag Report
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
