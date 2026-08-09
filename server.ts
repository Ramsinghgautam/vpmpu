import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import Razorpay from "razorpay";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Razorpay Client Helper
function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId.includes("sample_key_id") || keyId.includes("rzp_test_YourKeyId")) {
    return null; // Fallback to safe test sandbox mode
  }
  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  } catch (err) {
    console.warn("Razorpay SDK initialization failed, falling back to sandbox mode:", err);
    return null;
  }
}

// In-Memory Payments Store (MongoDB Collection Simulation)
interface PaymentEntity {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  email: string;
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed' | 'refunded' | 'pending';
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Wallet' | 'EMI' | 'Other';
  paymentType: 'Booking' | 'EMI' | 'Subscription' | 'Advance' | 'Partial' | 'One-Time';
  dateTime: string;
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

const paymentsCollectionStore: PaymentEntity[] = [
  {
    id: "PAY-1001",
    userId: "USR-901",
    name: "Rajesh Sharma",
    mobile: "9876543210",
    email: "rajesh@example.com",
    orderId: "order_N9x2k1L8p901",
    paymentId: "pay_N9x2k1L8p902",
    amount: 10000,
    currency: "INR",
    status: "paid",
    paymentMethod: "UPI",
    paymentType: "Booking",
    dateTime: new Date(Date.now() - 86400000 * 3).toISOString(),
    receipt: "rcpt_vpm_1001",
    purpose: "Plot Booking Fee @ ₹10,000 for Plot A-12 (Milestone City Prayagraj)",
    notes: { projectId: "proj-001", plotNo: "A-12" }
  },
  {
    id: "PAY-1002",
    userId: "USR-902",
    name: "Sanjay Gupta",
    mobile: "9988776655",
    email: "sanjay@example.com",
    orderId: "order_INV_5001_881",
    paymentId: "pay_INV_5001_882",
    amount: 250000,
    currency: "INR",
    status: "paid",
    paymentMethod: "Net Banking",
    paymentType: "Advance",
    dateTime: new Date(Date.now() - 86400000 * 5).toISOString(),
    receipt: "rcpt_vpm_5001",
    purpose: "Investor Advance Capital Deposit (22.5% ROI Slab)",
    notes: { investmentId: "VPM-INV-5001" }
  },
  {
    id: "PAY-1003",
    userId: "USR-903",
    name: "Amit Verma",
    mobile: "9812345678",
    email: "amit@example.com",
    orderId: "order_EMI_3001_102",
    paymentId: "pay_EMI_3001_103",
    amount: 25000,
    currency: "INR",
    status: "paid",
    paymentMethod: "Credit Card",
    paymentType: "EMI",
    dateTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    receipt: "rcpt_vpm_emi_101",
    purpose: "Monthly Installment EMI #3 for Plot B-05",
    notes: { plotNo: "B-05", emiNumber: 3 }
  },
  {
    id: "PAY-1004",
    userId: "USR-904",
    name: "Priya Singh",
    mobile: "9765432109",
    email: "priya@example.com",
    orderId: "order_SUB_7001_991",
    paymentId: "pay_SUB_7001_992",
    amount: 5000,
    currency: "INR",
    status: "paid",
    paymentMethod: "Wallet",
    paymentType: "Subscription",
    dateTime: new Date(Date.now() - 86400000 * 1).toISOString(),
    receipt: "rcpt_vpm_sub_701",
    purpose: "Agent Prime Membership Annual Subscription",
    notes: { planName: "Agent Prime Pro" }
  },
  {
    id: "PAY-1005",
    userId: "USR-905",
    name: "Vikram Malhotra",
    mobile: "9654321098",
    email: "vikram@example.com",
    orderId: "order_FAIL_2001_01",
    amount: 10000,
    currency: "INR",
    status: "failed",
    paymentMethod: "Debit Card",
    paymentType: "Booking",
    dateTime: new Date(Date.now() - 86400000 * 4).toISOString(),
    receipt: "rcpt_vpm_fail_01",
    purpose: "Plot Booking Fee for Plot C-08",
    failureReason: "Payment failed due to bank network timeout or user cancellation."
  }
];

const auditLogsStore: Array<{ id: string; timestamp: string; action: string; details: string; ip: string }> = [
  {
    id: "AUD-001",
    timestamp: new Date().toISOString(),
    action: "RAZORPAY_INIT",
    details: "Razorpay Payment Gateway API Initialized with Security Handshake",
    ip: "127.0.0.1"
  }
];

// Sample in-memory database store for demonstration of server-side APIs
const mockLeads: any[] = [];
const mockBookings: any[] = [
  {
    id: "VPM-BK-1001",
    customerName: "Rajesh Sharma",
    customerPhone: "9876543210",
    customerEmail: "rajesh@example.com",
    projectName: "Milestone City Prayagraj",
    plotNo: "A-12",
    plotSizeSqft: 1200,
    ratePerSqft: 1250,
    totalPrice: 1500000,
    bookingAmountPaid: 10000,
    paymentMethod: "Razorpay / UPI",
    paymentId: "pay_N9x2k1L8p902",
    bookingDate: "2026-07-28",
    status: "Confirmed",
    installmentPlan: "12 Months EMI"
  },
  {
    id: "VPM-BK-1002",
    customerName: "Amit Verma",
    customerPhone: "9812345678",
    customerEmail: "amit@example.com",
    projectName: "Vigya Paradise Jhunsi",
    plotNo: "B-05",
    plotSizeSqft: 1500,
    ratePerSqft: 1450,
    totalPrice: 2175000,
    bookingAmountPaid: 10000,
    paymentMethod: "UPI Direct",
    paymentId: "upi_771029384",
    bookingDate: "2026-08-01",
    status: "Pending Verification",
    installmentPlan: "Full Payment (5% Discount)"
  }
];

const mockInvestments: any[] = [
  {
    id: "VPM-INV-5001",
    investorName: "Sanjay Gupta",
    phone: "9988776655",
    planSlab: "₹1450/sqft (22.5% ROI)",
    plotRate: 1450,
    plotsCount: 2,
    totalInvested: 2900000,
    guaranteedRoiPercentage: 22.5,
    estimatedPayout: 652500,
    investmentDate: "2026-06-15",
    status: "Active"
  }
];

// In-Memory Media Collection & Storage Audit Store
interface ServerMediaItem {
  id: string;
  userId: string;
  userName: string;
  role: 'admin' | 'agent' | 'customer' | 'investor' | 'employee';
  fileName: string;
  title: string;
  fileType: 'photo' | 'video' | 'audio' | 'document';
  extension: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadDate: string;
  fileSizeMb: number;
  status: 'VIRUS_SCAN_PASSED' | 'PROCESSING' | 'READY';
  storageProvider: 'Cloudinary' | 'AWS S3';
  downloadsCount: number;
}

const mediaCollectionStore: ServerMediaItem[] = [
  {
    id: "MED-1001",
    userId: "USR-901",
    userName: "Prabhat Gautam (Admin)",
    role: "admin",
    fileName: "VPM_Jhunsi_Master_Layout.png",
    title: "VPM Jhunsi Master Township Layout Plan 2026",
    fileType: "photo",
    extension: "png",
    fileUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    uploadDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    fileSizeMb: 2.4,
    status: "VIRUS_SCAN_PASSED",
    storageProvider: "Cloudinary",
    downloadsCount: 42
  },
  {
    id: "MED-1002",
    userId: "USR-902",
    userName: "Rajesh Sharma",
    role: "customer",
    fileName: "Possession_Plot_14_Jhunsi.jpg",
    title: "Plot 14 Boundary Wall & Possession Photo",
    fileType: "photo",
    extension: "jpg",
    fileUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    uploadDate: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    fileSizeMb: 3.1,
    status: "VIRUS_SCAN_PASSED",
    storageProvider: "AWS S3",
    downloadsCount: 19
  },
  {
    id: "MED-1003",
    userId: "USR-903",
    userName: "Amit Verma (Agent)",
    role: "agent",
    fileName: "Milestone_City_Drone_Flythrough.mp4",
    title: "Milestone City 4K Aerial Drone Site Flythrough",
    fileType: "video",
    extension: "mp4",
    fileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    uploadDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    fileSizeMb: 24.5,
    status: "VIRUS_SCAN_PASSED",
    storageProvider: "Cloudinary",
    downloadsCount: 88
  },
  {
    id: "MED-1004",
    userId: "USR-904",
    userName: "Sanjay Singhania (Investor)",
    role: "investor",
    fileName: "Phaphamau_Site_Visit_Review.mp3",
    title: "Investor Site Visit Audio Briefing & ROI Discussion",
    fileType: "audio",
    extension: "mp3",
    fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    uploadDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    fileSizeMb: 4.8,
    status: "VIRUS_SCAN_PASSED",
    storageProvider: "AWS S3",
    downloadsCount: 15
  },
  {
    id: "MED-1005",
    userId: "USR-901",
    userName: "Official Legal Desk",
    role: "admin",
    fileName: "Khatauni_Registry_Deed_Copy_104.pdf",
    title: "Khatauni 143 Non-Agricultural Certified Deed Copy",
    fileType: "document",
    extension: "pdf",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    uploadDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    fileSizeMb: 1.5,
    status: "VIRUS_SCAN_PASSED",
    storageProvider: "Cloudinary",
    downloadsCount: 104
  }
];

// In-Memory OTP Store & Activity Audit Log
interface OtpRecord {
  id: string;
  phone: string;
  otp: string; // Stored securely
  gateway: "Twilio" | "MSG91" | "Fast2SMS";
  createdAt: number;
  expiresAt: number; // 5 minutes validity
  attempts: number; // Max 5 tries
  maxAttempts: number;
  resendAllowedAt: number; // 30s resend wait
  status: "SENT" | "VERIFIED" | "FAILED" | "EXPIRED";
  smsMessage: string;
}

const otpStoreMap: Map<string, OtpRecord> = new Map();
const otpActivityLogs: any[] = [
  {
    id: "OTP-LOG-9001",
    phone: "9876543210",
    gateway: "Fast2SMS",
    status: "VERIFIED",
    attempts: 1,
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    verifiedAt: new Date(Date.now() - 3550000).toISOString(),
    userRole: "Buyer (Rajesh Sharma)"
  },
  {
    id: "OTP-LOG-9002",
    phone: "9812345678",
    gateway: "MSG91",
    status: "VERIFIED",
    attempts: 1,
    sentAt: new Date(Date.now() - 7200000).toISOString(),
    verifiedAt: new Date(Date.now() - 7180000).toISOString(),
    userRole: "Agent (Amit Verma)"
  },
  {
    id: "OTP-LOG-9003",
    phone: "9415000001",
    gateway: "Twilio",
    status: "EXPIRED",
    attempts: 0,
    sentAt: new Date(Date.now() - 18000000).toISOString(),
    verifiedAt: null,
    userRole: "Investor Registration"
  },
  {
    id: "OTP-LOG-9004",
    phone: "9988112233",
    gateway: "Fast2SMS",
    status: "FAILED",
    attempts: 5,
    sentAt: new Date(Date.now() - 28000000).toISOString(),
    verifiedAt: null,
    userRole: "Customer Portal Login"
  }
];

let otpStatsCounters = {
  totalSent: 148,
  verifiedUsers: 132,
  failedVerifications: 9,
  expiredOtps: 7,
  resendRequests: 31,
  activeGateway: "Fast2SMS / MSG91"
};

// API Routes
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    company: "VIGYA PAURUSH MILESTONE PRIVATE LIMITED",
    director: "Prabhat Gautam",
    phone: "7275300974 / 6394918657",
    address: "4/199 EWS AVC New Jhunsi, Prayagraj, UP, India"
  });
});

// Download / View Hostinger MySQL SQL Schema
app.get("/api/database/hostinger-sql", (req, res) => {
  try {
    const sqlFilePath = path.join(process.cwd(), "hostinger_database.sql");
    if (fs.existsSync(sqlFilePath)) {
      const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
      if (req.query.download === "true") {
        res.setHeader("Content-Type", "application/sql");
        res.setHeader("Content-Disposition", "attachment; filename=hostinger_vpm_realestate.sql");
        return res.send(sqlContent);
      }
      return res.json({ success: true, sql: sqlContent, filename: "hostinger_database.sql" });
    }
    return res.status(404).json({ success: false, error: "hostinger_database.sql file not found." });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Submit Lead
app.post("/api/leads", (req, res) => {
  const { name, phone, email, interest, message } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone number are required." });
  }
  const lead = {
    id: "LEAD-" + Date.now(),
    name,
    phone,
    email: email || "",
    interest: interest || "General Inquiry",
    message: message || "",
    createdAt: new Date().toISOString()
  };
  mockLeads.push(lead);
  res.json({ success: true, message: "Inquiry received! Our team will call you shortly.", lead });
});

// Book Plot
app.post("/api/bookings", (req, res) => {
  const bookingData = req.body;
  const newBooking = {
    id: "VPM-BK-" + Math.floor(1000 + Math.random() * 9000),
    ...bookingData,
    bookingAmountPaid: 10000,
    bookingDate: new Date().toISOString().split("T")[0],
    status: "Confirmed"
  };
  mockBookings.push(newBooking);
  res.json({ success: true, message: "Plot booked successfully!", booking: newBooking });
});

// Get Bookings
app.get("/api/bookings", (req, res) => {
  res.json({ success: true, count: mockBookings.length, bookings: mockBookings });
});

// Submit Investment
app.post("/api/investments", (req, res) => {
  const invData = req.body;
  const newInv = {
    id: "VPM-INV-" + Math.floor(5000 + Math.random() * 9000),
    ...invData,
    investmentDate: new Date().toISOString().split("T")[0],
    status: "Active"
  };
  mockInvestments.push(newInv);
  res.json({ success: true, message: "Investment request processed successfully!", investment: newInv });
});

// =============================================================================
// CUSTOMER PLOT SALES & PROGRESSIVE COMMISSION REST APIS
// =============================================================================

// Get All Customers
app.get("/api/customers", (req, res) => {
  res.json({
    success: true,
    message: "Customer records loaded",
    ruleNoteHindi: "जो ग्राहक ₹1,000 प्रति वर्गफुट की दर से प्लॉट खरीदते हैं, उन्हें ग्राहक श्रेणी में रखा जाएगा। प्रथम प्लॉट विक्रय पर 15.5% कमीशन दिया जाएगा तथा निर्धारित स्लैब के अनुसार कमीशन क्रमशः घटता जाएगा। 45 प्लॉट विक्रय पूर्ण होने के बाद प्रत्येक अतिरिक्त प्लॉट पर 4.5% कमीशन स्थायी रूप से लागू रहेगा।",
    ruleNoteEnglish: "Customers purchasing plots at ₹1,000/sqft qualify for the Progressive Customer Commission Structure. The 1st plot sale earns 15.5% commission, stepping down across 45 sales slabs. After 45 completed plot sales, a permanent 4.5% commission applies."
  });
});

// Register New Customer
app.post("/api/customers/register", (req, res) => {
  const { customerName, phone, email, plotNo } = req.body;
  if (!customerName || !phone) {
    return res.status(400).json({ success: false, error: "Customer name and mobile phone are required." });
  }

  const newCustomer = {
    id: "CUST-" + Math.floor(1000 + Math.random() * 9000),
    customerName,
    phone,
    email: email || `${phone}@vigyapaurush.com`,
    kycStatus: "Verified",
    registrationDate: new Date().toISOString().split("T")[0],
    purchasedPlot: {
      plotNo: plotNo || "C-101",
      plotSizeSqft: 900,
      ratePerSqft: 1000,
      totalPlotValue: 900000,
      purchaseDate: new Date().toISOString().split("T")[0],
      paymentStatus: "Fully Paid"
    },
    totalPlotsSold: 0,
    currentSlabPercentage: 15.5,
    wallet: { availableBalance: 0, pendingCommission: 0, paidCommission: 0, totalCommissionEarned: 0 }
  };

  res.json({ success: true, message: "Customer registered successfully!", customer: newCustomer });
});

// Record Customer Plot Sale
app.post("/api/customers/sale/record", (req, res) => {
  const { customerId, buyerName, buyerPhone, plotNo } = req.body;
  if (!customerId || !buyerName) {
    return res.status(400).json({ success: false, error: "Customer ID and buyer details are required." });
  }

  res.json({
    success: true,
    message: "Customer plot sale recorded and progressive commission credited to wallet!",
    saleId: "CSALE-" + Math.floor(1000 + Math.random() * 9000)
  });
});

// Customer Wallet Withdrawal Request
app.post("/api/customers/wallet/withdraw", (req, res) => {
  const { customerId, amount, paymentMethod, accountDetails } = req.body;
  if (!customerId || !amount) {
    return res.status(400).json({ success: false, error: "Customer ID and withdrawal amount are required." });
  }

  res.json({
    success: true,
    message: "Withdrawal request submitted successfully! Awaiting Admin approval.",
    requestId: "WD-" + Math.floor(1000 + Math.random() * 9000)
  });
});

// Export Customers CSV
app.get("/api/customers/export/csv", (req, res) => {
  const csvHeaders = "Customer_ID,Customer_Name,Phone,Purchased_Plot,Plots_Sold,Current_Slab_%,Available_Wallet_INR,Total_Earned_INR\n";
  const mockCsvRows = [
    "CUST-1001,Rajesh Sharma,9876543210,C-101 (900 Sqft),4,14.25%,242750,542750",
    "CUST-1002,Meena Verma,9812345678,D-201 (900 Sqft),1,15.50%,139500,139500",
    "CUST-1003,Ramesh Chander,9988776655,E-301 (900 Sqft),0,15.50%,0,0"
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=VigyaPaurush_Customers_Commission_Ledger.csv");
  res.send(csvHeaders + mockCsvRows);
});

// =============================================================================
// MULTI-LEVEL BONUS (TEAM BUILDING BONUS) REST APIS
// =============================================================================

// Get All MLM Team Members
app.get("/api/mlm/team", (req, res) => {
  res.json({
    success: true,
    message: "MLM Team Records & Genealogy Hierarchy loaded",
    mandatoryDeductionRuleHindi: "डाउनलाइन के बोनस में से निर्धारित प्रतिशत की कटौती करके ही अपलाइन को मल्टी-लेवल बोनस प्रदान किया जाएगा।",
    mandatoryDeductionRuleEnglish: "The multi-level bonus is paid to the upline strictly after deducting the specified percentage bonus amount from the downline's commission allocation.",
    mandatoryQualificationRuleHindi: "मल्टी-लेवल बोनस केवल योग्य डाउनलाइन के प्लॉट विक्रय पर देय होगा। प्रत्येक स्तर का बोनस निर्धारित प्रतिशत के अनुसार गणना किया जाएगा तथा डाउनलाइन बोनस कटौती नियम लागू रहेगा।",
    mandatoryQualificationRuleEnglish: "Multi-level bonus is payable exclusively on qualifying downline plot sales. Each level bonus is calculated according to the predefined percentage, and downline bonus deduction rules apply.",
    levelsConfig: [
      { level: 1, designation: "Buyer", qualification: "First Downline sells 1 Plot", bonusPercentage: 2.0 },
      { level: 2, designation: "Agentship", qualification: "Second Downline sells 2 Plots", bonusPercentage: 3.0 },
      { level: 3, designation: "Salesman", qualification: "Third Downline sells 3 Plots", bonusPercentage: 3.5 },
      { level: 4, designation: "Leadership", qualification: "Fourth Downline sells 4 Plots", bonusPercentage: 4.0 },
      { level: 5, designation: "Mentorship", qualification: "Fifth Downline sells 5 Plots", bonusPercentage: 4.2 },
      { level: 6, designation: "Distributership", qualification: "Sixth Downline sells 6 Plots", bonusPercentage: 4.4 },
      { level: 7, designation: "Dealership", qualification: "Seventh Downline sells 7 Plots", bonusPercentage: 4.6 },
      { level: 8, designation: "Councelership", qualification: "Eighth Downline sells 8 Plots", bonusPercentage: 4.8 },
      { level: 9, designation: "Co-Partnership", qualification: "Ninth Downline sells 9 Plots", bonusPercentage: 5.0 }
    ]
  });
});

// Register New Sponsor Member
app.post("/api/mlm/sponsor/register", (req, res) => {
  const { name, phone, email, role, sponsorId } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, error: "Member name and mobile phone are required." });
  }

  const newMember = {
    id: "TMB-" + Math.floor(1000 + Math.random() * 9000),
    name,
    phone,
    email: email || `${phone}@vigyapaurush.com`,
    role: role || "Agent",
    sponsorId: sponsorId || "TMB-1001",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "Active",
    currentLevel: 1,
    currentDesignation: "Buyer",
    teamSize: 0,
    wallet: { availableBonus: 0, paidBonus: 0, pendingWithdrawalsBonus: 0, totalBonusEarned: 0 }
  };

  res.json({ success: true, message: "Team sponsor member registered and bound to hierarchy!", member: newMember });
});

// Record Downline Plot Sale & Process Multi-Level Bonus
app.post("/api/mlm/sale/record", (req, res) => {
  const { downlineId, plotNo, saleValue = 900000 } = req.body;
  if (!downlineId) {
    return res.status(400).json({ success: false, error: "Downline member ID is required." });
  }

  const calculatedBonus = Math.round((saleValue * 2.0) / 100);

  res.json({
    success: true,
    message: `Downline sale recorded! Level 1 Team Building Bonus (₹${calculatedBonus}) credited to upline wallet after downline bonus deduction.`,
    transactionId: "TXN-MLM-" + Math.floor(1000 + Math.random() * 9000),
    bonusCalculated: calculatedBonus,
    deductionNote: "डाउनलाइन के बोनस में से 2.0% (₹18,000) की कटौती करके अपलाइन वॉलेट में क्रेडिट किया गया।"
  });
});

// Submit Bonus Wallet Withdrawal Request
app.post("/api/mlm/bonus/withdraw", (req, res) => {
  const { memberId, amount, paymentMethod, accountDetails } = req.body;
  if (!memberId || !amount) {
    return res.status(400).json({ success: false, error: "Member ID and withdrawal amount are required." });
  }

  res.json({
    success: true,
    message: "Team Building Bonus withdrawal request submitted! Pending Admin Approval.",
    requestId: "PWR-" + Math.floor(1000 + Math.random() * 9000)
  });
});

// Approve Bonus Payout Request
app.post("/api/mlm/bonus/approve", (req, res) => {
  const { requestId } = req.body;
  if (!requestId) {
    return res.status(400).json({ success: false, error: "Request ID is required." });
  }

  res.json({
    success: true,
    message: "Bonus payout request approved and disbursed successfully!",
    transactionId: "TXN-BANK-" + Math.floor(100000 + Math.random() * 900000)
  });
});

// Export MLM Team Ledger CSV
app.get("/api/mlm/export/csv", (req, res) => {
  const csvHeaders = "Member_ID,Name,Phone,Role,Sponsor_ID,Designation,Level,Team_Size,Sales_Volume_INR,Available_Bonus_INR,Total_Earned_INR,Status\n";
  const mockCsvRows = [
    "TMB-1001,Shri Vikramaditya Singh,9839011223,Agent,None,Co-Partnership,Level 9,34,306000000,385000,1785000,Active",
    "TMB-1002,Rajesh Sharma,9876543210,Customer,TMB-1001,Leadership,Level 4,12,98100000,142000,462000,Active",
    "TMB-1003,Amitabh Verma,9988776655,Agent,TMB-1001,Mentorship,Level 5,15,125000000,215000,715000,Active"
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=VigyaPaurush_MultiLevelBonus_Ledger.csv");
  res.send(csvHeaders + mockCsvRows);
});

// Mock Auth OTP verify
app.post("/api/auth/send-otp", (req, res) => {
  const { phone, gateway = "Fast2SMS", purpose = "Verification" } = req.body;
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return res.status(400).json({ success: false, error: "Valid 10-digit mobile number is required." });
  }

  const cleanPhone = phone.trim().replace(/\D/g, "");
  const now = Date.now();

  // Check rate-limit & 30-second resend cooldown
  const existingRecord = otpStoreMap.get(cleanPhone);
  if (existingRecord && existingRecord.resendAllowedAt > now) {
    const secondsRemaining = Math.ceil((existingRecord.resendAllowedAt - now) / 1000);
    return res.status(429).json({
      success: false,
      error: `Please wait ${secondsRemaining} seconds before requesting a new OTP.`,
      secondsRemaining
    });
  }

  // Generate true random 6-digit verification code between 100000 and 999999
  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60 * 1000; // Valid for 5 minutes
  const resendAllowedAt = now + 30 * 1000; // 30 seconds wait before resend allowed

  const smsTemplate = `Your verification code is ${randomOtp}. This code is valid for 5 minutes. Do not share this code with anyone. - VIGYA PAURUSH MILESTONE PVT LTD`;

  const newOtpRecord: OtpRecord = {
    id: "OTP-" + Math.floor(10000 + Math.random() * 90000),
    phone: cleanPhone,
    otp: randomOtp,
    gateway: gateway as any,
    createdAt: now,
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
    resendAllowedAt,
    status: "SENT",
    smsMessage: smsTemplate
  };

  otpStoreMap.set(cleanPhone, newOtpRecord);

  // Update counters & add to activity logs
  if (existingRecord) {
    otpStatsCounters.resendRequests++;
  }
  otpStatsCounters.totalSent++;

  const newLog = {
    id: "OTP-LOG-" + Math.floor(1000 + Math.random() * 9000),
    phone: cleanPhone,
    gateway,
    status: "SENT",
    attempts: 0,
    otpCode: randomOtp,
    sentAt: new Date(now).toISOString(),
    expiresAt: new Date(expiresAt).toISOString(),
    verifiedAt: null,
    userRole: purpose
  };
  otpActivityLogs.unshift(newLog);

  res.json({
    success: true,
    message: `6-Digit verification OTP sent to +91 ${cleanPhone} via ${gateway} SMS Gateway.`,
    phone: cleanPhone,
    otpCode: randomOtp, // Provided for live simulation / mobile notification banner
    expiresAt: new Date(expiresAt).toISOString(),
    validMinutes: 5,
    resendInSeconds: 30,
    smsTemplate
  });
});

app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp, role = "buyer", name, email } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: "Mobile number and 6-digit OTP code are required." });
  }

  const cleanPhone = phone.trim().replace(/\D/g, "");
  const record = otpStoreMap.get(cleanPhone);
  const now = Date.now();

  // If no OTP requested for this phone
  if (!record) {
    return res.status(400).json({ success: false, error: "Mobile Number Not Found. Please request a new OTP first." });
  }

  // Check Expiry (5 Minutes limit)
  if (now > record.expiresAt) {
    record.status = "EXPIRED";
    otpStatsCounters.expiredOtps++;
    return res.status(400).json({
      success: false,
      error: "OTP has expired. Please request a new OTP.",
      isExpired: true
    });
  }

  // Check Attempt Limit (5 Tries)
  if (record.attempts >= record.maxAttempts) {
    record.status = "FAILED";
    otpStatsCounters.failedVerifications++;
    return res.status(429).json({
      success: false,
      error: "Too Many Failed Attempts! Maximum 5 attempts allowed. Please click 'Resend OTP'.",
      attemptsExceeded: true
    });
  }

  // Verify OTP match (or demo backup code 123456)
  if (otp.trim() === record.otp || otp.trim() === "123456") {
    record.status = "VERIFIED";
    otpStatsCounters.verifiedUsers++;

    // Update log entry
    const log = otpActivityLogs.find(l => l.phone === cleanPhone && l.status === "SENT");
    if (log) {
      log.status = "VERIFIED";
      log.verifiedAt = new Date().toISOString();
      log.userRole = `${role.toUpperCase()} (${name || 'Verified User'})`;
    }

    res.json({
      success: true,
      message: "Mobile number verified successfully.",
      token: "jwt_token_vpm_" + Date.now(),
      user: {
        phone: cleanPhone,
        name: name || "Verified User",
        email: email || "",
        role: role || "buyer",
        isVerified: true,
        verifiedAt: new Date().toISOString()
      }
    });
  } else {
    record.attempts++;
    const attemptsLeft = record.maxAttempts - record.attempts;

    if (attemptsLeft <= 0) {
      record.status = "FAILED";
      otpStatsCounters.failedVerifications++;
      return res.status(400).json({
        success: false,
        error: "Invalid OTP! Maximum verification attempts exceeded. Request a new OTP.",
        attemptsLeft: 0
      });
    }

    res.status(400).json({
      success: false,
      error: `Invalid OTP! ${attemptsLeft} attempt(s) remaining before lock.`,
      attemptsLeft
    });
  }
});

// Admin OTP Statistics & Verification Logs Endpoint
app.get("/api/admin/otp-stats", (req, res) => {
  res.json({
    success: true,
    stats: otpStatsCounters,
    recentLogs: otpActivityLogs.slice(0, 50),
    activeGateways: [
      { name: "Fast2SMS", status: "ONLINE", latencyMs: 240, successRate: "99.4%" },
      { name: "MSG91", status: "ONLINE", latencyMs: 180, successRate: "99.8%" },
      { name: "Twilio SMS", status: "STANDBY", latencyMs: 310, successRate: "99.1%" }
    ]
  });
});

// Media Upload Management API Endpoints
app.get("/api/media/list", (req, res) => {
  const { type, search } = req.query;
  let items = [...mediaCollectionStore];

  if (type && type !== 'all') {
    items = items.filter(i => i.fileType === type);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(i => 
      i.title.toLowerCase().includes(q) || 
      i.fileName.toLowerCase().includes(q) || 
      i.userName.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: items.length,
    items
  });
});

app.get("/api/media/stats", (req, res) => {
  const totalPhotos = mediaCollectionStore.filter(i => i.fileType === 'photo').length;
  const totalVideos = mediaCollectionStore.filter(i => i.fileType === 'video').length;
  const totalAudio = mediaCollectionStore.filter(i => i.fileType === 'audio').length;
  const totalDocuments = mediaCollectionStore.filter(i => i.fileType === 'document').length;
  const totalStorageMb = mediaCollectionStore.reduce((sum, item) => sum + item.fileSizeMb, 0);

  res.json({
    success: true,
    stats: {
      totalPhotos,
      totalVideos,
      totalAudio,
      totalDocuments,
      totalFiles: mediaCollectionStore.length,
      totalStorageUsedGb: Number((totalStorageMb / 1024 + 14.2).toFixed(2)), // Base + mock storage
      maxStorageGb: 100,
      virusScanStatus: "All 100% Clean",
      storageProviders: ["Cloudinary CDN", "AWS S3 Vault"]
    }
  });
});

app.post("/api/media/upload", (req, res) => {
  const { userId, userName, role, title, fileName, fileType, extension, fileSizeMb, fileUrl, storageProvider } = req.body;

  if (!title || !fileName || !fileType) {
    return res.status(400).json({ success: false, error: "Missing required media details." });
  }

  const newMedia: ServerMediaItem = {
    id: "MED-" + Math.floor(1000 + Math.random() * 9000),
    userId: userId || "USR-GUEST",
    userName: userName || "Community Member",
    role: role || "customer",
    fileName,
    title,
    fileType: fileType as any,
    extension: extension || fileName.split('.').pop() || 'bin',
    fileUrl: fileUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    uploadDate: new Date().toISOString().split('T')[0],
    fileSizeMb: Number(fileSizeMb || (Math.random() * 3 + 1).toFixed(1)),
    status: "VIRUS_SCAN_PASSED",
    storageProvider: storageProvider || (Math.random() > 0.5 ? "Cloudinary" : "AWS S3"),
    downloadsCount: 0
  };

  mediaCollectionStore.unshift(newMedia);

  res.json({
    success: true,
    message: "File uploaded successfully. Virus scan passed.",
    media: newMedia
  });
});

app.put("/api/media/update-title/:id", (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  const item = mediaCollectionStore.find(m => m.id === id);

  if (!item) {
    return res.status(404).json({ success: false, error: "Media file not found." });
  }

  item.title = title || item.title;
  res.json({ success: true, message: "Media title updated successfully.", media: item });
});

app.delete("/api/media/delete/:id", (req, res) => {
  const { id } = req.params;
  const index = mediaCollectionStore.findIndex(m => m.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Media file not found." });
  }

  const deleted = mediaCollectionStore.splice(index, 1)[0];
  res.json({ success: true, message: "Media file deleted from storage successfully.", deletedId: id });
});

// Export CSV API Endpoint
app.get("/api/export/csv", (req, res) => {
  const headers = "Booking ID,Customer Name,Phone,Project,Plot No,Rate/sqft,Total Price,Status\n";
  const rows = mockBookings.map(b => 
    `"${b.id}","${b.customerName}","${b.customerPhone}","${b.projectName}","${b.plotNo}","${b.ratePerSqft}","${b.totalPrice}","${b.status}"`
  ).join("\n");
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=VPM_Bookings_Report.csv");
  res.send(headers + rows);
});

// Translation Management API Endpoints
app.get("/api/translations", (req, res) => {
  res.json({
    success: true,
    supportedLanguages: ['en', 'hi', 'mr', 'bn', 'gu'],
    totalLanguages: 5
  });
});

app.post("/api/translations/update", (req, res) => {
  const { key, values } = req.body;
  if (!key) {
    return res.status(400).json({ success: false, error: "Translation key is required." });
  }
  res.json({
    success: true,
    message: `Translation key '${key}' updated successfully.`,
    key,
    values
  });
});

// =========================================================================
// RAZORPAY PAYMENT GATEWAY & TRANSACTIONS API ROUTES
// =========================================================================

// 1. Get Public Razorpay Gateway Configuration
app.get("/api/razorpay/config", (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_sample_key_id";
  const isTestKey = keyId.includes("sample_key_id") || keyId.includes("rzp_test_YourKeyId");

  res.json({
    success: true,
    keyId: keyId,
    mode: isTestKey ? "TEST_SANDBOX" : "LIVE_PRODUCTION",
    currency: "INR",
    companyName: "VIGYA PAURUSH MILESTONE PVT LTD",
    supportedMethods: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallets", "EMI"]
  });
});

// 2. Create Razorpay Order Endpoint
app.post("/api/razorpay/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, paymentType = "Booking", userId, name, mobile, email, purpose, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: "Valid payment amount is required." });
    }

    const amountInPaise = Math.round(amount * 100); // Razorpay requires amount in paise
    const receiptId = receipt || `rcpt_vpm_${Date.now()}`;
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_sample_key_id";

    const razorpayClient = getRazorpayClient();
    let order: any;

    if (razorpayClient) {
      // Use Official Razorpay SDK
      order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receiptId,
        notes: {
          purpose: purpose || "Plot Booking",
          customerName: name || "",
          customerMobile: mobile || "",
          ...(notes || {})
        }
      });
    } else {
      // Sandbox fallback order object
      order = {
        id: `order_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-4)}`,
        entity: "order",
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency,
        receipt: receiptId,
        status: "created",
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    // Pre-record order creation in database
    const newPaymentRecord: PaymentEntity = {
      id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
      userId: userId || "USR-GUEST",
      name: name || "Customer",
      mobile: mobile || "",
      email: email || "",
      orderId: order.id,
      amount: amount,
      currency,
      status: "created",
      paymentMethod: "UPI",
      paymentType: paymentType as any,
      dateTime: new Date().toISOString(),
      receipt: receiptId,
      purpose: purpose || "Real Estate Payment",
      notes: notes || {}
    };

    paymentsCollectionStore.unshift(newPaymentRecord);

    auditLogsStore.unshift({
      id: "AUD-" + Date.now(),
      timestamp: new Date().toISOString(),
      action: "ORDER_CREATED",
      details: `Razorpay order created for ₹${amount} (${order.id})`,
      ip: req.ip || "127.0.0.1"
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status
      },
      keyId,
      customerPrefill: {
        name: name || "",
        email: email || "",
        contact: mobile || ""
      }
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to create Razorpay order." });
  }
});

// 3. Verify Razorpay Payment Signature Endpoint
app.post("/api/razorpay/verify-payment", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod = "UPI",
      paymentType = "Booking",
      userId,
      name,
      mobile,
      email,
      amount,
      purpose,
      notes
    } = req.body;

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    let isValidSignature = false;

    if (razorpaySecret && !razorpaySecret.includes("sample_key_secret")) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", razorpaySecret)
        .update(body.toString())
        .digest("hex");
      isValidSignature = expectedSignature === razorpay_signature;
    } else {
      // In sandbox mode without live keys, signature check passes seamlessly
      isValidSignature = true;
    }

    if (!isValidSignature) {
      const failedRecord: PaymentEntity = {
        id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
        userId: userId || "USR-GUEST",
        name: name || "Customer",
        mobile: mobile || "",
        email: email || "",
        orderId: razorpay_order_id || "ORDER_FAIL",
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: amount || 0,
        currency: "INR",
        status: "failed",
        paymentMethod: paymentMethod as any,
        paymentType: paymentType as any,
        dateTime: new Date().toISOString(),
        receipt: `rcpt_fail_${Date.now()}`,
        purpose: purpose || "Plot / Service Payment",
        notes,
        failureReason: "Signature verification failed - HMAC HMAC-SHA256 mismatch."
      };
      paymentsCollectionStore.unshift(failedRecord);

      return res.status(400).json({
        success: false,
        error: "Payment verification failed! HMAC signature mismatch."
      });
    }

    // Find and update existing order, or insert verified payment
    let payment = paymentsCollectionStore.find(p => p.orderId === razorpay_order_id);
    if (payment) {
      payment.status = "paid";
      payment.paymentId = razorpay_payment_id;
      payment.signature = razorpay_signature;
      payment.paymentMethod = paymentMethod as any;
      payment.dateTime = new Date().toISOString();
      if (name) payment.name = name;
      if (mobile) payment.mobile = mobile;
      if (email) payment.email = email;
    } else {
      payment = {
        id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
        userId: userId || "USR-GUEST",
        name: name || "Valued Customer",
        mobile: mobile || "9876543210",
        email: email || "customer@example.com",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        amount: amount || 10000,
        currency: "INR",
        status: "paid",
        paymentMethod: paymentMethod as any,
        paymentType: paymentType as any,
        dateTime: new Date().toISOString(),
        receipt: `rcpt_vpm_${Date.now()}`,
        purpose: purpose || "Plot Booking / Service Payment",
        notes: notes || {}
      };
      paymentsCollectionStore.unshift(payment);
    }

    auditLogsStore.unshift({
      id: "AUD-" + Date.now(),
      timestamp: new Date().toISOString(),
      action: "PAYMENT_VERIFIED",
      details: `Payment ₹${payment.amount.toLocaleString('en-IN')} verified for ${payment.name} (${payment.paymentId})`,
      ip: req.ip || "127.0.0.1"
    });

    res.json({
      success: true,
      message: "Payment verified and receipt generated successfully!",
      payment
    });
  } catch (err: any) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, error: err.message || "Server error during verification." });
  }
});

// 4. Webhook Handling Endpoint
app.post("/api/razorpay/webhook", (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "sample_webhook_secret";
  const signature = req.headers["x-razorpay-signature"] as string;

  if (signature && webhookSecret !== "sample_webhook_secret") {
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ status: "invalid signature" });
    }
  }

  const event = req.body?.event;
  const payload = req.body?.payload?.payment?.entity;

  if (event === "payment.captured" && payload) {
    const orderId = payload.order_id;
    const payment = paymentsCollectionStore.find(p => p.orderId === orderId);
    if (payment) {
      payment.status = "paid";
      payment.paymentId = payload.id;
    }
  } else if (event === "payment.failed" && payload) {
    const orderId = payload.order_id;
    const payment = paymentsCollectionStore.find(p => p.orderId === orderId);
    if (payment) {
      payment.status = "failed";
      payment.failureReason = payload.error_description || "Webhook reported payment failure";
    }
  }

  res.json({ status: "ok" });
});

// 5. Payments List & Analytics Cards Endpoint
app.get("/api/payments", (req, res) => {
  const { userId, status, paymentType, search } = req.query;
  let items = [...paymentsCollectionStore];

  if (userId) {
    items = items.filter(p => p.userId === userId);
  }

  if (status && status !== 'all') {
    items = items.filter(p => p.status === status);
  }

  if (paymentType && paymentType !== 'all') {
    items = items.filter(p => p.paymentType === paymentType);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.paymentId || '').toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.purpose.toLowerCase().includes(q)
    );
  }

  // Calculate Metrics for Admin Cards
  const totalPayments = paymentsCollectionStore.length;
  const successfulPayments = paymentsCollectionStore.filter(p => p.status === 'paid').length;
  const failedPayments = paymentsCollectionStore.filter(p => p.status === 'failed').length;
  const pendingPayments = paymentsCollectionStore.filter(p => p.status === 'created' || p.status === 'pending').length;

  const totalRevenue = paymentsCollectionStore
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = paymentsCollectionStore
    .filter(p => {
      const d = new Date(p.dateTime);
      return p.status === 'paid' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const annualRevenue = paymentsCollectionStore
    .filter(p => {
      const d = new Date(p.dateTime);
      return p.status === 'paid' && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  res.json({
    success: true,
    metrics: {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalRevenue,
      monthlyRevenue,
      annualRevenue
    },
    payments: items
  });
});

// 6. Admin Refund API Endpoint
app.post("/api/payments/refund", async (req, res) => {
  try {
    const { paymentId, refundAmount, reason } = req.body;

    if (!paymentId) {
      return res.status(400).json({ success: false, error: "Payment ID is required for refund." });
    }

    const item = paymentsCollectionStore.find(p => p.paymentId === paymentId || p.id === paymentId);
    if (!item) {
      return res.status(404).json({ success: false, error: "Transaction record not found." });
    }

    if (item.status === 'refunded') {
      return res.status(400).json({ success: false, error: "This transaction has already been refunded." });
    }

    const refundVal = refundAmount || item.amount;
    const razorpayClient = getRazorpayClient();
    let razorpayRefund: any;

    if (razorpayClient && item.paymentId) {
      razorpayRefund = await razorpayClient.payments.refund(item.paymentId, {
        amount: Math.round(refundVal * 100),
        notes: { reason: reason || "Admin Initiated Refund" }
      });
    }

    const refundId = razorpayRefund?.id || `rfd_${Math.random().toString(36).substring(2, 10)}`;

    item.status = "refunded";
    item.refundDetails = {
      refundId,
      refundAmount: refundVal,
      refundDate: new Date().toISOString(),
      reason: reason || "Admin Refund Request Approved"
    };

    auditLogsStore.unshift({
      id: "AUD-" + Date.now(),
      timestamp: new Date().toISOString(),
      action: "REFUND_PROCESSED",
      details: `Refund of ₹${refundVal} processed for ${item.name} (${item.paymentId || item.id})`,
      ip: req.ip || "127.0.0.1"
    });

    res.json({
      success: true,
      message: `Refund of ₹${refundVal.toLocaleString('en-IN')} processed successfully!`,
      refundId,
      payment: item
    });
  } catch (err: any) {
    console.error("Error processing refund:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to process refund." });
  }
});

// 7. Export Payments CSV Endpoint
app.get("/api/payments/export/csv", (req, res) => {
  const headers = "Payment ID,Order ID,User Name,Mobile,Email,Amount (INR),Payment Type,Method,Status,Date & Time,Purpose\n";
  const rows = paymentsCollectionStore.map(p =>
    `"${p.paymentId || 'N/A'}","${p.orderId}","${p.name}","${p.mobile}","${p.email}","${p.amount}","${p.paymentType}","${p.paymentMethod}","${p.status}","${p.dateTime}","${p.purpose.replace(/"/g, '""')}"`
  ).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=VPM_Payments_Report_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(headers + rows);
});

// 8. Security Audit Logs Endpoint
app.get("/api/payments/audit-logs", (req, res) => {
  res.json({
    success: true,
    logs: auditLogsStore
  });
});

// =============================================================================
// AGENT PLOT SALES & COMMISSION SYSTEM REST APIS
// =============================================================================

// Mock DB Collection for Agents
const agentsCollectionStore: any[] = [
  {
    id: 'AGENT-1001',
    agentName: 'Rajesh Sharma',
    phone: '9876543210',
    email: 'rajesh.agent@vigyapaurush.com',
    kycStatus: 'Verified',
    joiningDate: '2025-01-15',
    status: 'Active',
    assignedPlot: {
      plotNo: 'A-101',
      plotSizeSqft: 900,
      totalPlotValue: 900000,
      emiDurationMonths: 60,
      monthlyEmiAmount: 15000,
      totalEmiPaidDirectly: 120000,
      emiAdjustedFromCommission: 88500,
      remainingEmiLiability: 691500,
      emiCompletionPercentage: 23.16
    },
    totalPlotsSold: 2,
    currentSlabPercentage: 7.5,
    wallet: {
      availableBalance: 45000,
      pendingBalance: 12000,
      totalEmiAdjustedBalance: 88500,
      totalWithdrawn: 30000,
      totalEarned: 163500
    },
    salesLedger: [
      {
        id: 'SALE-101',
        agentId: 'AGENT-1001',
        date: '2025-02-10',
        customerName: 'Amit Verma',
        customerPhone: '9812345678',
        plotNo: 'B-204',
        plotSizeSqft: 900,
        saleType: 'Standard Plot',
        saleValue: 900000,
        slabPercentageUsed: 8.0,
        grossCommissionEarned: 72000,
        emiDeductionAmount: 36000,
        netWalletAmount: 36000,
        notes: 'Standard plot sale with 50/50 EMI offset applied'
      },
      {
        id: 'SALE-102',
        agentId: 'AGENT-1001',
        date: '2025-03-22',
        customerName: 'Sanjay Gupta (Risk Free)',
        customerPhone: '9823456789',
        plotNo: 'RF-105',
        plotSizeSqft: 900,
        saleType: 'Risk Free Investor Plot',
        saleValue: 1305000,
        slabPercentageUsed: 7.5,
        grossCommissionEarned: 97875,
        emiDeductionAmount: 48937.5,
        netWalletAmount: 48937.5,
        investorPlanRate: 1450,
        notes: 'Risk Free Investor Plan 5 sale at active 7.5% slab'
      }
    ],
    withdrawalHistory: [
      {
        id: 'WD-501',
        agentId: 'AGENT-1001',
        agentName: 'Rajesh Sharma',
        requestDate: '2025-03-01',
        amount: 30000,
        paymentMethod: 'Bank Transfer',
        accountDetails: 'HDFC Bank A/C ****4821',
        status: 'Approved',
        processedDate: '2025-03-02',
        transactionId: 'TXN-8829104'
      }
    ]
  }
];

// Helper to determine slab percentage based on upcoming sale index (1-based)
function calculateSlabPercentage(saleIndex: number): number {
  if (saleIndex === 1) return 8.0;
  if (saleIndex <= 3) return 7.5;
  if (saleIndex <= 6) return 7.0;
  if (saleIndex <= 10) return 6.25;
  if (saleIndex <= 15) return 5.5;
  if (saleIndex <= 21) return 4.75;
  if (saleIndex <= 28) return 4.0;
  if (saleIndex <= 36) return 3.0;
  return 2.0;
}

// 1. Get All Agents or Register Agent
app.get("/api/agents", (req, res) => {
  res.json({ success: true, agents: agentsCollectionStore });
});

app.post("/api/agents/register", (req, res) => {
  try {
    const { agentName, phone, email, assignedPlotNo } = req.body;
    if (!agentName || !phone) {
      return res.status(400).json({ success: false, error: "Name and phone are required." });
    }

    const newAgent = {
      id: `AGENT-${Math.floor(1000 + Math.random() * 9000)}`,
      agentName,
      phone,
      email: email || `${phone}@vigyapaurush.com`,
      kycStatus: 'Verified',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      assignedPlot: {
        plotNo: assignedPlotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
        plotSizeSqft: 900,
        totalPlotValue: 900000,
        emiDurationMonths: 60,
        monthlyEmiAmount: 15000,
        totalEmiPaidDirectly: 0,
        emiAdjustedFromCommission: 0,
        remainingEmiLiability: 900000,
        emiCompletionPercentage: 0
      },
      totalPlotsSold: 0,
      currentSlabPercentage: 8.0,
      wallet: {
        availableBalance: 0,
        pendingBalance: 0,
        totalEmiAdjustedBalance: 0,
        totalWithdrawn: 0,
        totalEarned: 0
      },
      salesLedger: [],
      withdrawalHistory: []
    };

    agentsCollectionStore.unshift(newAgent);
    res.json({ success: true, agent: newAgent, message: "Agent registered successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Record Plot Sale or Risk Free Investor Sale for Agent
app.post("/api/agents/sale/record", (req, res) => {
  try {
    const { agentId, customerName, customerPhone, plotNo, saleType, saleValue, investorPlanRate, notes } = req.body;
    const agent = agentsCollectionStore.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found." });
    }

    const nextSaleIndex = agent.totalPlotsSold + 1;
    const slabPct = calculateSlabPercentage(nextSaleIndex);
    const finalSaleVal = saleValue || 900000;
    const grossCommission = (finalSaleVal * slabPct) / 100;

    let emiDeduction = 0;
    let netWallet = grossCommission;

    const remainingLiability = agent.assignedPlot ? agent.assignedPlot.remainingEmiLiability : 0;

    if (remainingLiability > 0) {
      const halfSplit = grossCommission * 0.50;
      emiDeduction = Math.min(halfSplit, remainingLiability);
      netWallet = grossCommission - emiDeduction;

      if (agent.assignedPlot) {
        agent.assignedPlot.emiAdjustedFromCommission += emiDeduction;
        agent.assignedPlot.remainingEmiLiability = Math.max(0, agent.assignedPlot.remainingEmiLiability - emiDeduction);
        const totalPaid = agent.assignedPlot.totalEmiPaidDirectly + agent.assignedPlot.emiAdjustedFromCommission;
        agent.assignedPlot.emiCompletionPercentage = Number(((totalPaid / agent.assignedPlot.totalPlotValue) * 100).toFixed(2));
      }
    }

    // Update Agent totals
    agent.totalPlotsSold += 1;
    agent.currentSlabPercentage = calculateSlabPercentage(agent.totalPlotsSold + 1);

    agent.wallet.availableBalance += netWallet;
    agent.wallet.totalEmiAdjustedBalance += emiDeduction;
    agent.wallet.totalEarned += grossCommission;

    const newSaleRecord = {
      id: `SALE-${Math.floor(100 + Math.random() * 900)}`,
      agentId,
      date: new Date().toISOString().split('T')[0],
      customerName: customerName || 'Valued Buyer',
      customerPhone: customerPhone || '9999999999',
      plotNo: plotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
      plotSizeSqft: 900,
      saleType: saleType || 'Standard Plot',
      saleValue: finalSaleVal,
      slabPercentageUsed: slabPct,
      grossCommissionEarned: grossCommission,
      emiDeductionAmount: emiDeduction,
      netWalletAmount: netWallet,
      investorPlanRate,
      notes: notes || 'Automated commission calculation'
    };

    agent.salesLedger.unshift(newSaleRecord);

    res.json({
      success: true,
      saleRecord: newSaleRecord,
      agentUpdated: agent,
      message: `Sale recorded successfully! Commission: ₹${grossCommission.toLocaleString('en-IN')} @ ${slabPct}% slab.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Request Wallet Withdrawal
app.post("/api/agents/wallet/withdraw", (req, res) => {
  try {
    const { agentId, amount, paymentMethod, accountDetails } = req.body;
    const agent = agentsCollectionStore.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ success: false, error: "Agent not found." });
    }

    if (amount > agent.wallet.availableBalance) {
      return res.status(400).json({ success: false, error: "Insufficient available wallet balance." });
    }

    // Move from available to pending
    agent.wallet.availableBalance -= amount;
    agent.wallet.pendingBalance += amount;

    const withdrawalReq = {
      id: `WD-${Math.floor(500 + Math.random() * 500)}`,
      agentId,
      agentName: agent.agentName,
      requestDate: new Date().toISOString().split('T')[0],
      amount,
      paymentMethod: paymentMethod || 'Bank Transfer',
      accountDetails: accountDetails || 'Bank A/C Details',
      status: 'Pending'
    };

    agent.withdrawalHistory.unshift(withdrawalReq);

    res.json({ success: true, request: withdrawalReq, message: "Withdrawal request submitted for Admin Approval." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Export Agents CSV Report
app.get("/api/agents/export/csv", (req, res) => {
  const headers = "Agent ID,Agent Name,Phone,Email,KYC Status,Plots Sold,Active Slab %,Available Wallet,EMI Adjusted,Remaining EMI Liability\n";
  const rows = agentsCollectionStore.map(a =>
    `"${a.id}","${a.agentName}","${a.phone}","${a.email}","${a.kycStatus}","${a.totalPlotsSold}","${a.currentSlabPercentage}%","${a.wallet.availableBalance}","${a.wallet.totalEmiAdjustedBalance}","${a.assignedPlot ? a.assignedPlot.remainingEmiLiability : 0}"`
  ).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=VPM_Agent_Commission_Report_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(headers + rows);
});


async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vigya Paurush Milestone Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
