export type UserRole = 'buyer' | 'agent' | 'investor' | 'admin';

export type Language = 'en' | 'hi' | 'bn' | 'mr' | 'gu';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  agentId?: string;
  referralCode?: string;
  kycDone?: boolean;
  address?: string;
  joinedDate: string;
  totalCommissionsEarned?: number;
  totalPlotsBooked?: number;
  totalInvested?: number;
}

export interface Plot {
  plotNo: string;
  sizeSqft: number;
  dimensions: string; // e.g., "30 x 40 ft"
  ratePerSqft: number; // e.g., 1250
  totalPrice: number;
  facing: 'North' | 'East' | 'West' | 'South' | 'Corner';
  status: 'available' | 'booked' | 'investor_locked' | 'sold';
  category: 'Residential' | 'Commercial' | 'Corner Premium';
}

export interface Project {
  id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  tagline: string;
  description: string;
  image: string;
  gallery: string[];
  totalPlots: number;
  availablePlots: number;
  plotSizes: string[];
  priceRange: string;
  minPricePerSqft: number;
  reraNumber: string;
  mapEmbedUrl: string;
  latitude: number;
  longitude: number;
  brochureUrl?: string;
  features: string[];
  plotsGrid: Plot[];
  isFeatured?: boolean;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  projectId: string;
  projectName: string;
  plotNo: string;
  plotSizeSqft: number;
  ratePerSqft: number;
  totalPrice: number;
  bookingAmountPaid: number; // ₹10,000
  paymentMethod: string;
  paymentId: string;
  bookingDate: string;
  status: 'Pending Verification' | 'Confirmed' | 'Completed' | 'Cancelled';
  installmentPlan: '12 Months EMI' | '24 Months EMI' | 'Full Payment (5% Discount)';
  agentId?: string;
  agentName?: string;
}

export interface InvestmentPlanSlab {
  ratePerSqft: number;
  roiPercentage: number;
  displayLabel: string;
  minInvestmentSqft?: number;
}

export interface InvestmentRecord {
  id: string;
  investorName: string;
  phone: string;
  email: string;
  ratePerSqft: number;
  roiPercentage: number;
  sqftInvested: number;
  totalInvestedAmount: number; // e.g., 1450 * 2000 = 2,90,00,00
  basePlotCost: number; // calculated at 1000/sqft = 20,00,000
  estimatedRoiPayout: number; // max capped at invested amount
  investmentDate: string;
  status: 'Active' | 'Matured' | 'Paid';
}

export interface BuyerCommissionSlab {
  plotNumber: number; // 1 to 9
  label: string;
  commissionPercent: number;
}

export interface AgentCommissionSlab {
  plotNumber: number; // 1 to 9
  label: string;
  commissionPercent: number;
}

export interface TeamBonusLevel {
  levelName: string;
  bonusPercent: number;
  description: string;
  minPlotsTarget: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // 'Buyer' | 'Agent' | 'Salesman' | 'Leader' etc.
  phone: string;
  totalSales: number;
  commissionEarned: number;
  joinedDate: string;
  sponsorId: string;
  downlineCount: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  interest: string;
  message?: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  image: string;
  readTime: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  avatar: string;
}

// Media Gallery & Community Showcase Types
export type MediaCategory =
  | 'Customer Success Stories'
  | 'Plot Holder Gallery'
  | 'Investor Gallery'
  | 'Agent Achievement Gallery'
  | 'Site Visit Gallery'
  | 'Project Development Gallery'
  | 'Testimonials Gallery'
  | 'Video Testimonials'
  | 'Audio Testimonials'
  | 'Community Events Gallery';

export type MediaType = 'photo' | 'video' | 'audio' | 'document';

export type MediaStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface MediaComment {
  id: string;
  userName: string;
  userRole: string;
  userAvatar?: string;
  comment: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole | 'customer' | 'team_member';
  userPhone?: string;
  userAvatar: string;
  category: MediaCategory;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl?: string;
  title: string;
  description: string;
  location: string;
  projectId?: string;
  projectName?: string;
  uploadDate: string;
  status: MediaStatus;
  views: number;
  likes: number;
  likedBy: string[];
  comments: MediaComment[];
  isFeatured?: boolean;
  hasWatermark?: boolean;
  spamScore?: number;
  fileSizeMb?: number;
}

// Razorpay Payment Gateway & Transaction Types
export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded' | 'pending';
export type PaymentType = 'Booking' | 'EMI' | 'Subscription' | 'Advance' | 'Partial' | 'One-Time';
export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet' | 'EMI' | 'Other';

export interface PaymentRecord {
  id: string; // Database internal or payment_... ID
  userId: string;
  name: string;
  mobile: string;
  email: string;
  orderId: string; // Razorpay Order ID
  paymentId?: string; // Razorpay Payment ID
  signature?: string; // Razorpay Signature
  amount: number; // in INR
  currency: string; // "INR"
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  dateTime: string; // ISO string
  receipt: string;
  purpose: string;
  notes?: Record<string, any>;
  refundDetails?: {
    refundId?: string;
    refundAmount?: number;
    refundDate?: string;
    reason?: string;
  };
  failureReason?: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise (e.g., 1000000 = ₹10,000)
  currency: string; // "INR"
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface UserProfileShowcase {
  userId: string;
  userName: string;
  userRole: string;
  avatar: string;
  totalUploads: number;
  videosCount: number;
  photosCount: number;
  audiosCount: number;
  followers: number;
  followedByCurrentUser?: boolean;
  likesReceived: number;
  badge?: string;
}
