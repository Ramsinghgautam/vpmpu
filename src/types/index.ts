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

// =============================================================================
// RISK FREE INVESTOR SYSTEM TYPES
// =============================================================================

export interface RiskFreeInvestorPlan {
  id?: string;
  purchaseRate: number; // e.g., 1050, 1120, ..., 2150
  plotSizeSqft: number; // 900
  investmentAmount: number; // Rate * 900
  commissionRate: number; // % e.g., 16.5, 32
  interestRate: number; // % e.g., 16.5, 32
  principalAmount: number; // Rate * 900
  interestAmount: number; // Principal * (InterestRate / 100)
  recoveryTarget: number; // Principal + InterestAmount
  badgeLabel?: string;
}

export interface RiskFreeInvestorSale {
  id: string;
  investorId: string;
  date: string;
  plotNo: string;
  projectName: string;
  saleValue: number;
  commissionRateUsed: number;
  commissionEarned: number;
  remainingRecoveryBalanceAfter: number;
  buyerName?: string;
  buyerPhone?: string;
  notes?: string;
}

export interface RiskFreeInvestorRecord {
  id: string; // e.g. RFI-1001
  userId: string; // Refers to user.id or user phone
  investorName: string;
  phone: string;
  email: string;
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  
  // Plan Details
  purchaseRate: number; // e.g. 1450
  plotSizeSqft: number; // 900
  commissionRate: number; // e.g. 22.5
  interestRate: number; // e.g. 22.5
  
  // Financial Math
  principalAmount: number; // purchaseRate * 900
  interestAmount: number; // principalAmount * (interestRate/100)
  recoveryTarget: number; // principalAmount + interestAmount
  
  // Real-time Trackers
  totalSalesValue: number;
  totalCommissionEarned: number;
  remainingRecoveryBalance: number;
  recoveryPercentage: number;
  
  // Statuses
  isRecovered: boolean; // totalCommissionEarned >= recoveryTarget
  convertedToStandardCustomer: boolean;
  status: 'Active' | 'Approved' | 'Recovered' | 'Pending Approval' | 'Closed';
  enrolledDate: string;
  
  salesLedger: RiskFreeInvestorSale[];
}

export interface RiskFreeSystemSummary {
  totalInvestors: number;
  activeInvestors: number;
  completedInvestors: number;
  totalPrincipalInvested: number;
  totalInterestLiability: number;
  totalRecoveryTargetLiability: number;
  totalCommissionPaid: number;
  remainingLiability: number;
}

// =============================================================================
// AGENT PLOT SALES & COMMISSION SYSTEM TYPES
// =============================================================================

export interface AgentSlab {
  slabIndex: number;
  label: string;
  minSales: number;
  maxSales: number | null; // null for 37+
  percentage: number;
}

export interface AgentEMIRecord {
  plotNo: string;
  plotSizeSqft: number; // 900
  totalPlotValue: number; // 900000
  emiDurationMonths: number; // 60
  monthlyEmiAmount: number; // 15000
  totalEmiPaidDirectly: number; // Direct cash EMI payments
  emiAdjustedFromCommission: number; // EMI paid via 50% commission split
  remainingEmiLiability: number; // Total Plot Value - (Paid + Adjusted)
  emiCompletionPercentage: number;
}

export interface AgentSaleRecord {
  id: string;
  agentId: string;
  date: string;
  customerName: string;
  customerPhone: string;
  plotNo: string;
  plotSizeSqft: number;
  saleType: 'Standard Plot' | 'Risk Free Investor Plot' | 'Lump Sum Sale';
  saleValue: number; // e.g. 900000 or Risk Free Investor value (e.g. 1305000)
  slabPercentageUsed: number; // Active slab percentage at time of sale (8%, 7.5%, etc.)
  grossCommissionEarned: number;
  emiDeductionAmount: number; // 50% allocated to EMI reduction if EMI liability exists
  netWalletAmount: number; // Amount credited to cash wallet (50% or 100% if liability = 0)
  investorPlanRate?: number; // e.g. 1050, 1450, 2150
  notes?: string;
}

export interface AgentWalletRecord {
  availableBalance: number;
  pendingBalance: number;
  totalEmiAdjustedBalance: number;
  totalWithdrawn: number;
  totalEarned: number;
}

export interface AgentWithdrawalRequest {
  id: string;
  agentId: string;
  agentName: string;
  requestDate: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Cheque';
  accountDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processedDate?: string;
  transactionId?: string;
}

export interface AgentRecord {
  id: string; // e.g., AGENT-1001
  userId?: string;
  agentName: string;
  phone: string;
  email: string;
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  joiningDate: string;
  assignedPlot?: AgentEMIRecord;
  totalPlotsSold: number;
  currentSlabPercentage: number;
  wallet: AgentWalletRecord;
  salesLedger: AgentSaleRecord[];
  withdrawalHistory: AgentWithdrawalRequest[];
  status: 'Active' | 'Inactive' | 'Pending Approval';
}

export interface AgentSystemSummary {
  totalAgents: number;
  activeAgents: number;
  totalPlotSalesCount: number;
  totalSalesVolume: number;
  totalCommissionDistributed: number;
  totalEmiRecovered: number;
  outstandingEmiLiability: number;
  totalExpencesVolume: number;
  pendingWithdrawalsAmount: number;
}

// =============================================================================
// CUSTOMER PLOT SALES & PROGRESSIVE COMMISSION SYSTEM TYPES
// =============================================================================

export interface CustomerSlab {
  slabIndex: number;
  label: string;
  minSales: number;
  maxSales: number | null; // null for 46+
  percentage: number;
  plotsInSlab: number;
  commissionPerPlot: number; // Based on ₹9,00,000 standard plot
}

export interface CustomerPlotInfo {
  plotNo: string;
  plotSizeSqft: number; // 900
  ratePerSqft: number; // 1000
  totalPlotValue: number; // 900000
  purchaseDate: string;
  paymentStatus: 'Fully Paid' | 'EMI Active' | 'Booked';
}

export interface CustomerSaleRecord {
  id: string;
  customerId: string;
  date: string;
  buyerName: string;
  buyerPhone: string;
  plotNo: string;
  plotSizeSqft: number; // 900
  saleRatePerSqft: number; // 1000
  saleValue: number; // e.g. 900000
  saleNumber: number; // 1st, 2nd, 3rd, ..., 45th, 46th
  slabPercentage: number; // 15.5%, 15.0%, ..., 4.5%
  commissionEarned: number; // Calculated commission
  paymentStatus: 'Credited' | 'Pending Approval';
  notes?: string;
}

export interface CustomerWalletRecord {
  availableBalance: number;
  pendingCommission: number;
  paidCommission: number;
  totalCommissionEarned: number;
}

export interface CustomerWithdrawalRequest {
  id: string;
  customerId: string;
  customerName: string;
  requestDate: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Cheque';
  accountDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processedDate?: string;
  transactionId?: string;
  adminNotes?: string;
}

export interface CustomerRecord {
  id: string; // e.g., CUST-1001
  userId?: string;
  customerName: string;
  phone: string;
  email: string;
  kycStatus: 'Pending' | 'Verified' | 'Rejected';
  registrationDate: string;
  status: 'Active' | 'Inactive';
  
  purchasedPlot: CustomerPlotInfo;
  totalPlotsSold: number;
  currentSlabPercentage: number;
  nextSlabPercentage: number;
  remainingPlotsInCurrentSlab: number;
  
  wallet: CustomerWalletRecord;
  salesLedger: CustomerSaleRecord[];
  withdrawalHistory: CustomerWithdrawalRequest[];
}

export interface CustomerSystemSummary {
  totalCustomers: number;
  activeCustomers: number;
  totalPlotsSoldByCustomers: number;
  totalSalesVolume: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  totalPendingCommission: number;
  totalPendingWithdrawals: number;
}

// =============================================================================
// MULTI-LEVEL BONUS (TEAM BUILDING BONUS) SYSTEM TYPES
// =============================================================================

export interface MlmLevelConfig {
  level: number; // 1 to 9
  designation: string; // 'Buyer', 'Agentship', 'Salesman', 'Leadership', 'Mentorship', 'Distributership', 'Dealership', 'Councelership', 'Co-Partnership'
  qualificationRule: string; // 'First Downline sells 1 Plot', 'Second Downline sells 2 Plots', etc.
  requiredPlotsSold: number; // 1, 2, 3, 4, 5, 6, 7, 8, 9
  bonusPercentage: number; // 2.0%, 3.0%, 3.5%, 4.0%, 4.20%, 4.40%, 4.60%, 4.80%, 5.00%
  exampleBonusForStandardPlot: number; // For ₹9,00,000 plot: 18000, 27000, 31500, 36000, 37800, 39600, 41400, 43200, 45000
}

export interface GenealogyTreeNode {
  id: string; // Member ID e.g. TMB-1001
  name: string;
  phone: string;
  role: 'Customer' | 'Agent' | 'Investor' | 'RiskFreeInvestor';
  designation: string; // e.g. 'Co-Partnership'
  currentLevel: number; // 1 to 9
  sponsorId: string | null;
  parentId: string | null;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'Frozen';
  
  // Team metrics
  personalPlotsSold: number;
  teamSalesVolume: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  inactiveTeamMembers: number;
  directReferralsCount: number;
  
  // Downlines & Children
  children?: GenealogyTreeNode[];
}

export interface BonusTransactionRecord {
  id: string; // e.g. TXN-MLM-1001
  date: string;
  downlineMemberId: string;
  downlineName: string;
  uplineMemberId: string;
  uplineName: string;
  levelTriggered: number; // Level 1 to 9
  designation: string;
  plotNo: string;
  saleValue: number; // e.g. 9,00,000
  grossCommission: number;
  bonusPercentage: number; // e.g. 2.0%
  bonusAmountEarned: number; // e.g. 18,000
  downlineDeductionAmount: number; // Deducted from downline commission allocation
  netBonusCredited: number;
  status: 'Credited' | 'Pending Approval' | 'Rejected';
  auditNotes: string;
}

export interface BonusWalletRecord {
  memberId: string;
  memberName: string;
  availableBonus: number;
  paidBonus: number;
  pendingWithdrawalsBonus: number;
  totalBonusEarned: number;
  lastUpdated: string;
}

export interface BonusWithdrawalRequest {
  id: string; // e.g. PWR-1001
  memberId: string;
  memberName: string;
  requestDate: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Cheque';
  accountDetails: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processedDate?: string;
  transactionId?: string;
  adminNotes?: string;
}

export interface TeamSalesVolumeMetrics {
  dailySalesVolume: number;
  weeklySalesVolume: number;
  monthlySalesVolume: number;
  quarterlySalesVolume: number;
  annualSalesVolume: number;
  totalTeamSalesVolume: number;
  totalPlotsSoldByTeam: number;
}

export interface TeamMemberRecord {
  id: string; // e.g. TMB-1001
  name: string;
  phone: string;
  email: string;
  role: 'Customer' | 'Agent' | 'Investor' | 'RiskFreeInvestor';
  sponsorId: string | null;
  sponsorName: string | null;
  parentId: string | null;
  parentName: string | null;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'Frozen';
  
  currentLevel: number;
  currentDesignation: string;
  nextLevelRequirement: string;
  remainingPlotsToNextLevel: number;
  
  personalPlotsSold: number;
  teamSize: number;
  activeMembers: number;
  inactiveMembers: number;
  directReferralsCount: number;
  qualifiedDownlinesCount: number;
  
  salesMetrics: TeamSalesVolumeMetrics;
  wallet: BonusWalletRecord;
  bonusLedger: BonusTransactionRecord[];
  withdrawalHistory: BonusWithdrawalRequest[];
}

export interface MlmSystemSummary {
  totalTeamMembers: number;
  activeTeamMembers: number;
  inactiveTeamMembers: number;
  totalTeamSalesVolume: number;
  totalPlotsSold: number;
  totalBonusEarned: number;
  totalBonusPaid: number;
  totalBonusPending: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
}

// =============================================================================
// EMI TENURE-BASED PAYOUT DISTRIBUTION SYSTEM TYPES
// =============================================================================

export type PayoutCategory = 'Customer' | 'Agent' | 'Investor' | 'Risk-Free Investor';

export interface PayoutRecordItem {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userType: PayoutCategory;
  totalPayout: number;
  emiTenureMonths: number;
  monthlyPayout: number;
  monthsDisbursed: number;
  totalDisbursed: number;
  remainingBalance: number;
  status: 'Active Distribution' | 'Pending Tenure Selection' | 'Fully Disbursed' | 'Paused';
  lastDisbursedDate?: string;
  nextDisbursementDate?: string;
  plotNo?: string;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutAuditLogEntry {
  id: string;
  payoutId: string;
  userName: string;
  userType: PayoutCategory;
  action: 'TENURE_ASSIGNED' | 'PAYOUT_RECALCULATED' | 'MONTHLY_DISBURSED' | 'STATUS_CHANGED';
  oldTenure?: number;
  newTenure?: number;
  oldMonthlyPayout?: number;
  newMonthlyPayout?: number;
  disbursedAmount?: number;
  remainingBalanceAfter?: number;
  timestamp: string;
  adminUser: string;
  notes: string;
}

// =============================================================================
// एकमुश्त फ्री प्लॉट स्कीम (LUMP-SUM FREE PLOT SCHEME) TYPES & INTERFACES
// =============================================================================

export interface LumpSumSchemeSlab {
  slNo: number;
  purchaseRate: number; // ₹/sqft: 1050, 1120, 1210, 1320, 1450, 1600, 1770, 1950, 2150
  plotAreaSqft: number; // Standard base: 900 sqft
  totalInvestmentAmount: number; // plotAreaSqft * purchaseRate
  interestRatePercent: number; // 16.5%, 17.5%, 19.0%, 20.5%, 22.5%, 24.5%, 27.0%, 29.5%, 32.0%
  totalPayableAmount: number; // totalInvestmentAmount + (totalInvestmentAmount * interestRatePercent / 100)
  label: string;
  conditionATenureYears: number; // 12 Years
  conditionBTargetPlots: number; // 7 Plots
}

export interface LumpSumSoldPlotRecord {
  id: string;
  plotNo: string;
  projectName: string;
  buyerName: string;
  buyerPhone: string;
  saleAmount: number;
  saleDate: string;
  registeredBy: string;
  status: 'Verified' | 'Pending Verification';
}

export interface LumpSumNomineeDetails {
  nomineeName: string;
  nomineeRelation: string;
  nomineeAge: number;
  nomineePhone: string;
  nomineeAadhar?: string;
}

export type LumpSumEligibilityStatus =
  | 'In Progress (Condition A / B)'
  | 'Eligible - Condition B (7 Plots Sold!)'
  | 'Eligible - Condition A (12 Years Matured)'
  | 'Disbursed / Completed'
  | 'Pending Approval'
  | 'Non-Active';

export interface LumpSumInvestorRecord {
  id: string; // Auto-generated e.g. "LFPS-2026-001"
  investorName: string;
  phone: string;
  email: string;
  seniorName: string;
  seniorId: string;
  address: string;
  plotNo?: string;
  plotSizeSqft: number; // 900 sqft default
  purchaseRateSqft: number; // e.g. 2150
  interestRatePercent: number; // e.g. 32.0%
  totalInvestmentAmount: number; // plotSizeSqft * purchaseRateSqft
  totalReturnAmount: number; // totalInvestmentAmount * (interestRatePercent / 100)
  totalPayableAmount: number; // totalInvestmentAmount + totalReturnAmount
  joiningDate: string; // ISO date string e.g. "2026-01-15"
  maturityDateConditionA: string; // joiningDate + 12 years
  nominee: LumpSumNomineeDetails;
  
  // Plots Sold Tracking (Condition B: 7 Plots)
  plotsSoldTarget: number; // 7
  plotsSoldCount: number; // e.g. 0 to 7
  soldPlotsList: LumpSumSoldPlotRecord[];
  
  // Eligibility & Payout State
  status: LumpSumEligibilityStatus;
  isConditionAMet: boolean; // 12 years elapsed
  isConditionBMet: boolean; // >= 7 plots sold
  isPayoutEligible: boolean; // Condition A or B reached
  isPayoutDisbursed: boolean;
  payoutDisbursedDate?: string;
  payoutTxnReference?: string;
  payoutDisbursedAmount?: number;
  payoutMode?: 'Bank Transfer (RTGS/NEFT)' | 'Cheque' | 'Direct Deposit';
  
  // Audit Trail
  auditLogs: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
  
  createdAt: string;
  updatedAt: string;
}

export interface LumpSumSchemeSummary {
  totalInvestors: number;
  totalInvestmentAmount: number;
  totalPayableAmount: number;
  totalReturnLiability: number;
  eligibleInvestorsCount: number;
  eligiblePayableAmount: number;
  pendingMaturityCount: number;
  pendingMaturityAmount: number;
  completedPayoutsCount: number;
  completedDisbursedAmount: number;
  totalPlotsSold: number;
  conditionBAchieversCount: number;
  conditionAAchieversCount: number;
}

// =============================================================================
// 24.5% फ्री प्लॉट स्कीम (EMI / किस्तों में प्लॉट) TYPES & INTERFACES
// =============================================================================

export interface EmiFreePlotSchemePlan {
  id?: string;
  schemeName?: string;
  tenureMonths: number; // 12, 24, 36, 48, 60, 72, 84, 96, 108, 120
  monthlyInstallment: number; // e.g. 120000, 60000, 40000...
  monthlyReturn: number; // e.g. 149400, 74700, 49800...
  requiredPlotSales: number; // 6 for 12-72m, 5 for 84-120m
  bonusReturnPerPlot: number; // e.g. 29294, 29294, 9764...
  plotSizeSqft: number; // 900 sq.ft.
  interestRatePercent: number; // 24.5%
  totalTenureInvestment: number; // monthlyInstallment * tenureMonths
  totalTenureReturn: number; // monthlyReturn * tenureMonths
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface EmiPaymentRecord {
  installmentNo: number;
  dueDate: string;
  paidDate?: string;
  amount: number;
  status: 'Paid' | 'Due' | 'Overdue' | 'Upcoming';
  paymentMode?: 'UPI' | 'Net Banking' | 'Cheque' | 'Cash' | 'Auto-Debit' | 'RTGS/NEFT';
  txnRef?: string;
  receiptNumber?: string;
  notes?: string;
}

export interface EmiSoldPlotRecord {
  id: string; // e.g. "SP-2026-001"
  investorId?: string;
  buyerId?: string;
  plotId?: string;
  plotNo: string;
  projectName: string;
  buyerName: string;
  buyerPhone: string;
  saleAmount: number;
  saleDate: string;
  monthlyBonusRate: number; // from plan's bonusReturnPerPlot
  registeredBy: string;
  agentId?: string;
  seniorId?: string;
  status: 'Verified' | 'Pending Verification' | 'Rejected';
  verifiedBy?: string;
  verificationDate?: string;
  rejectionReason?: string;
}

export interface EmiMasterConfigAuditLog {
  id: string;
  changedBy: string;
  tenureMonths: number;
  parameterName: string;
  oldValue: string | number;
  newValue: string | number;
  timestamp: string;
  reason: string;
}

export interface EmiCollectionLedgerEntry {
  id: string;
  date: string;
  investorId: string;
  investorName: string;
  installmentNo: number;
  amount: number;
  paymentMethod: string;
  txnRef: string;
  receiptNumber: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface EmiPayoutLedgerEntry {
  id: string;
  investorId: string;
  investorName: string;
  scheme: string;
  eligiblePlotSales: number;
  monthlyReturn: number;
  payoutPeriod: string;
  amount: number;
  approvalStatus: 'Approved' | 'Pending' | 'Rejected' | 'Disbursed';
  paidDate?: string;
  transactionReference?: string;
  payoutMode?: string;
}

export interface EmiNomineeDetails {
  nomineeName: string;
  nomineeRelation: string;
  nomineeAge: number;
  nomineePhone: string;
  nomineeAadhar?: string;
}

export type EmiInvestorStatus =
  | 'None Active'
  | 'Active'
  | 'Eligible'
  | 'Disbursed'
  | 'Completed';

export interface EmiInvestorRecord {
  id: string; // e.g. "INV-205-2026-001"
  investorName: string;
  phone: string;
  email: string;
  seniorName: string;
  seniorId: string;
  address: string;
  plotNo?: string;
  plotSizeSqft: number; // 900 sqft default
  tenureMonths: number; // 12, 24, 36, 48, 60, 72, 84, 96, 108, 120
  monthlyEmi: number;
  monthlyReturn: number;
  bonusReturnPerPlot: number;
  requiredPlotSales: number;
  interestRatePercent: number; // 20.5%
  totalInvestment: number; // monthlyEmi * tenureMonths
  totalExpectedReturn: number; // monthlyReturn * tenureMonths
  joiningDate: string;
  maturityDate: string;
  nominee: EmiNomineeDetails;

  // Status & Progress
  status: EmiInvestorStatus;
  paidInstallmentsCount: number;
  totalPaidAmount: number;
  remainingInstallmentsCount: number;
  remainingAmount: number;
  nextEmiDueDate: string;

  // Plot Sales & Bonus
  plotsSoldCount: number;
  soldPlotsList: EmiSoldPlotRecord[];
  monthlyBonusAmount: number; // verified plots * bonusReturnPerPlot
  totalCurrentMonthlyReturn: number; // monthlyReturn + monthlyBonusAmount

  // Eligibility & Payout
  isPlotTargetMet: boolean; // plotsSoldCount >= requiredPlotSales
  isTenureCompleted: boolean; // paidInstallmentsCount >= tenureMonths
  isPayoutEligible: boolean; // isPlotTargetMet || isTenureCompleted
  isPayoutDisbursed: boolean;
  payoutDisbursedDate?: string;
  payoutTxnReference?: string;
  payoutDisbursedAmount?: number;
  payoutMode?: 'Bank Transfer (RTGS/NEFT)' | 'Cheque' | 'Direct Deposit';

  // Bank & Payment Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  panNumber?: string;
  aadharNumber?: string;

  // Ledgers & Audit
  emiLedger: EmiPaymentRecord[];
  auditLogs: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

export interface EmiSchemeAnalytics {
  totalInvestors: number;
  activeInvestors: number;
  eligibleInvestors: number;
  completedInvestors: number;
  totalInvestmentAmount?: number;
  totalEmiCollection: number;
  totalOutstandingEmi?: number;
  totalExpectedLiability: number;
  totalSoldPlots: number;
  monthlyCashflow: number;
  yearlyCashflow: number;
  totalPayoutAmount: number;
}

export * from './permissions';

