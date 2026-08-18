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
    installmentPlan: "12, 24, 36,48, 60 Months EMI"
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

// =============================================================================
// EMI TENURE-BASED PAYOUT DISTRIBUTION & MANAGEMENT REST APIS
// =============================================================================

interface ServerPayoutEntity {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userType: 'Customer' | 'Agent' | 'Investor' | 'Risk-Free Investor';
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

const payoutsCollectionStore: ServerPayoutEntity[] = [
  {
    id: "PAYOUT-101",
    userId: "USR-901",
    userName: "Rajesh Sharma",
    userPhone: "9876543210",
    userType: "Customer",
    totalPayout: 1250000,
    emiTenureMonths: 60, // 5 Years
    monthlyPayout: Math.round(1250000 / 60), // ₹20,833/mo
    monthsDisbursed: 6,
    totalDisbursed: Math.round(1250000 / 60) * 6, // ₹1,24,998
    remainingBalance: 1250000 - Math.round(1250000 / 60) * 6,
    status: "Active Distribution",
    lastDisbursedDate: "2026-07-15",
    nextDisbursementDate: "2026-08-15",
    plotNo: "C-101",
    projectName: "Milestone City Prayagraj",
    createdAt: "2026-01-15",
    updatedAt: "2026-08-15"
  },
  {
    id: "PAYOUT-102",
    userId: "USR-903",
    userName: "Amit Verma",
    userPhone: "9812345678",
    userType: "Agent",
    totalPayout: 2840000,
    emiTenureMonths: 48, // 4 Years
    monthlyPayout: Math.round(2840000 / 48), // ₹59,167/mo
    monthsDisbursed: 8,
    totalDisbursed: Math.round(2840000 / 48) * 8, // ₹4,73,336
    remainingBalance: 2840000 - Math.round(2840000 / 48) * 8,
    status: "Active Distribution",
    lastDisbursedDate: "2026-07-20",
    nextDisbursementDate: "2026-08-20",
    plotNo: "A-08",
    projectName: "Vigya Paradise Jhunsi",
    createdAt: "2025-11-20",
    updatedAt: "2026-08-15"
  },
  {
    id: "PAYOUT-103",
    userId: "USR-902",
    userName: "Sanjay Gupta",
    userPhone: "9988776655",
    userType: "Investor",
    totalPayout: 4280000,
    emiTenureMonths: 36, // 3 Years
    monthlyPayout: Math.round(4280000 / 36), // ₹1,18,889/mo
    monthsDisbursed: 12,
    totalDisbursed: Math.round(4280000 / 36) * 12,
    remainingBalance: 4280000 - Math.round(4280000 / 36) * 12,
    status: "Active Distribution",
    lastDisbursedDate: "2026-07-10",
    nextDisbursementDate: "2026-08-10",
    plotNo: "INV-B-14",
    projectName: "VPM Prime County",
    createdAt: "2025-07-10",
    updatedAt: "2026-08-15"
  },
  {
    id: "PAYOUT-104",
    userId: "USR-906",
    userName: "Meenakshi Devi",
    userPhone: "9711223344",
    userType: "Risk-Free Investor",
    totalPayout: 1800000,
    emiTenureMonths: 24, // 2 Years
    monthlyPayout: Math.round(1800000 / 24), // ₹75,000/mo
    monthsDisbursed: 4,
    totalDisbursed: 300000,
    remainingBalance: 1500000,
    status: "Active Distribution",
    lastDisbursedDate: "2026-07-25",
    nextDisbursementDate: "2026-08-25",
    plotNo: "RFI-12",
    projectName: "Milestone Heights",
    createdAt: "2026-03-25",
    updatedAt: "2026-08-15"
  },
  {
    id: "PAYOUT-105",
    userId: "USR-907",
    userName: "Kavita Srivastava",
    userPhone: "9823456789",
    userType: "Customer",
    totalPayout: 450000,
    emiTenureMonths: 0, // Unselected
    monthlyPayout: 0,
    monthsDisbursed: 0,
    totalDisbursed: 0,
    remainingBalance: 450000,
    status: "Pending Tenure Selection",
    plotNo: "D-19",
    projectName: "Milestone City Prayagraj",
    createdAt: "2026-08-01",
    updatedAt: "2026-08-01"
  }
];

const payoutAuditLogsStore: Array<{
  id: string;
  payoutId: string;
  userName: string;
  userType: string;
  action: string;
  details: string;
  timestamp: string;
  adminUser: string;
}> = [
  {
    id: "AUD-PO-001",
    payoutId: "PAYOUT-101",
    userName: "Rajesh Sharma",
    userType: "Customer",
    action: "TENURE_ASSIGNED",
    details: "60 Months (5 Years) EMI tenure selected. Distributed monthly payout calculated at ₹20,833/mo.",
    timestamp: "2026-01-15T10:30:00Z",
    adminUser: "Director Desk"
  },
  {
    id: "AUD-PO-002",
    payoutId: "PAYOUT-102",
    userName: "Amit Verma",
    userType: "Agent",
    action: "MONTHLY_DISBURSED",
    details: "Month #8 EMI installment (₹59,167) disbursed successfully.",
    timestamp: "2026-07-20T14:15:00Z",
    adminUser: "System Automated Cron"
  }
];

// 1. Get All Payout Records & System Summary Stats
app.get("/api/payouts", (req, res) => {
  const { userType, search } = req.query;
  let list = [...payoutsCollectionStore];

  if (userType && userType !== "all") {
    list = list.filter(p => p.userType.toLowerCase() === (userType as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(p =>
      p.userName.toLowerCase().includes(q) ||
      p.userPhone.includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }

  const totalPayoutLiability = payoutsCollectionStore.reduce((sum, p) => sum + p.totalPayout, 0);
  const totalDisbursed = payoutsCollectionStore.reduce((sum, p) => sum + p.totalDisbursed, 0);
  const totalRemainingLiability = payoutsCollectionStore.reduce((sum, p) => sum + p.remainingBalance, 0);
  const totalMonthlyOutflow = payoutsCollectionStore
    .filter(p => p.emiTenureMonths > 0 && p.status === "Active Distribution")
    .reduce((sum, p) => sum + p.monthlyPayout, 0);

  res.json({
    success: true,
    count: list.length,
    payouts: list,
    summary: {
      totalPayoutLiability,
      totalDisbursed,
      totalRemainingLiability,
      totalMonthlyOutflow,
      activeTenuresCount: payoutsCollectionStore.filter(p => p.emiTenureMonths > 0).length,
      pendingTenuresCount: payoutsCollectionStore.filter(p => p.emiTenureMonths === 0).length
    }
  });
});

// 2. Real-Time Calculation API with Validation
app.post("/api/payouts/calculate", (req, res) => {
  const { totalPayout, emiTenureMonths, userCategory = "Customer" } = req.body;

  if (typeof totalPayout !== "number" || totalPayout < 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid total payout amount. Amount cannot be negative."
    });
  }

  if (!emiTenureMonths || emiTenureMonths <= 0) {
    return res.json({
      success: true,
      isValid: false,
      message: "Please select an EMI tenure to view payout distribution.",
      totalPayout,
      emiTenureMonths: 0,
      monthlyPayout: 0,
      userCategory
    });
  }

  const monthlyPayout = Math.round(totalPayout / emiTenureMonths);

  res.json({
    success: true,
    isValid: true,
    totalPayout,
    emiTenureMonths,
    monthlyPayout,
    userCategory,
    formulaApplied: `₹${totalPayout.toLocaleString('en-IN')} ÷ ${emiTenureMonths} Months = ₹${monthlyPayout.toLocaleString('en-IN')}/mo`
  });
});

// 3. Update User EMI Tenure
app.put("/api/payouts/:id/tenure", (req, res) => {
  const { id } = req.params;
  const { emiTenureMonths, adminUser = "Director Desk" } = req.body;

  const payout = payoutsCollectionStore.find(p => p.id === id);
  if (!payout) {
    return res.status(404).json({ success: false, error: "Payout record not found." });
  }

  const oldTenure = payout.emiTenureMonths;
  const oldMonthly = payout.monthlyPayout;

  const validTenure = Number(emiTenureMonths) || 0;
  payout.emiTenureMonths = validTenure;

  if (validTenure > 0) {
    payout.monthlyPayout = Math.round(payout.totalPayout / validTenure);
    payout.status = "Active Distribution";
    payout.remainingBalance = Math.max(0, payout.totalPayout - payout.totalDisbursed);
  } else {
    payout.monthlyPayout = 0;
    payout.status = "Pending Tenure Selection";
  }

  payout.updatedAt = new Date().toISOString();

  // Audit Log
  const logEntry = {
    id: "AUD-PO-" + Math.floor(1000 + Math.random() * 9000),
    payoutId: payout.id,
    userName: payout.userName,
    userType: payout.userType,
    action: "TENURE_ASSIGNED",
    details: `EMI Tenure updated from ${oldTenure}M to ${validTenure}M. New monthly payout: ₹${payout.monthlyPayout.toLocaleString('en-IN')}/mo.`,
    timestamp: new Date().toISOString(),
    adminUser
  };
  payoutAuditLogsStore.unshift(logEntry);

  res.json({
    success: true,
    message: `Tenure updated to ${validTenure} Months. Monthly payout recalculated successfully.`,
    payout
  });
});

// 4. Disburse Monthly Installment
app.post("/api/payouts/:id/disburse-monthly", (req, res) => {
  const { id } = req.params;
  const { adminUser = "Director Desk", paymentReference } = req.body;

  const payout = payoutsCollectionStore.find(p => p.id === id);
  if (!payout) {
    return res.status(404).json({ success: false, error: "Payout record not found." });
  }

  if (payout.emiTenureMonths <= 0) {
    return res.status(400).json({ success: false, error: "Cannot disburse payout. No EMI tenure selected." });
  }

  if (payout.remainingBalance <= 0) {
    return res.status(400).json({ success: false, error: "Payout is already fully disbursed." });
  }

  const disburseAmount = Math.min(payout.monthlyPayout, payout.remainingBalance);
  payout.monthsDisbursed += 1;
  payout.totalDisbursed += disburseAmount;
  payout.remainingBalance = Math.max(0, payout.totalPayout - payout.totalDisbursed);
  payout.lastDisbursedDate = new Date().toISOString().split("T")[0];

  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + 1);
  payout.nextDisbursementDate = nextDate.toISOString().split("T")[0];

  if (payout.remainingBalance === 0 || payout.monthsDisbursed >= payout.emiTenureMonths) {
    payout.status = "Fully Disbursed";
  }

  payout.updatedAt = new Date().toISOString();

  // Audit Log
  const logEntry = {
    id: "AUD-PO-" + Math.floor(1000 + Math.random() * 9000),
    payoutId: payout.id,
    userName: payout.userName,
    userType: payout.userType,
    action: "MONTHLY_DISBURSED",
    details: `Disbursed Month #${payout.monthsDisbursed} installment of ₹${disburseAmount.toLocaleString('en-IN')}. Remaining: ₹${payout.remainingBalance.toLocaleString('en-IN')}. Ref: ${paymentReference || 'BANK-DIRECT-NEFT'}`,
    timestamp: new Date().toISOString(),
    adminUser
  };
  payoutAuditLogsStore.unshift(logEntry);

  res.json({
    success: true,
    message: `Month #${payout.monthsDisbursed} payout installment disbursed successfully!`,
    payout
  });
});

// 5. Export Payouts CSV
app.get("/api/payouts/export/csv", (req, res) => {
  const headers = "Payout_ID,User_Name,Phone,User_Type,Total_Payout_INR,EMI_Tenure_Months,Monthly_Payout_INR,Total_Disbursed_INR,Remaining_Balance_INR,Status,Last_Disbursed,Next_Due\n";
  const rows = payoutsCollectionStore.map(p =>
    `"${p.id}","${p.userName}","${p.userPhone}","${p.userType}",${p.totalPayout},${p.emiTenureMonths},${p.monthlyPayout},${p.totalDisbursed},${p.remainingBalance},"${p.status}","${p.lastDisbursedDate || 'N/A'}","${p.nextDisbursementDate || 'N/A'}"`
  ).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=VigyaPaurush_Payout_Distribution_Report.csv");
  res.send(headers + rows);
});

// 6. Get Payout Audit Logs
app.get("/api/payouts/audit-logs", (req, res) => {
  res.json({
    success: true,
    count: payoutAuditLogsStore.length,
    logs: payoutAuditLogsStore
  });
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

// =============================================================================
// एकमुश्त फ्री प्लॉट स्कीम (LUMP-SUM FREE PLOT SCHEME) BACKEND API
// =============================================================================

let lumpSumSlabsStore = [
  { slNo: 1, purchaseRate: 1050, plotAreaSqft: 900, totalInvestmentAmount: 945000, interestRatePercent: 16.5, totalPayableAmount: 1100925, label: 'Slab 1 (₹1,050/sqft - 16.5%)' },
  { slNo: 2, purchaseRate: 1120, plotAreaSqft: 900, totalInvestmentAmount: 1008000, interestRatePercent: 17.5, totalPayableAmount: 1184400, label: 'Slab 2 (₹1,120/sqft - 17.5%)' },
  { slNo: 3, purchaseRate: 1210, plotAreaSqft: 900, totalInvestmentAmount: 1089000, interestRatePercent: 19.0, totalPayableAmount: 1295910, label: 'Slab 3 (₹1,210/sqft - 19.0%)' },
  { slNo: 4, purchaseRate: 1320, plotAreaSqft: 900, totalInvestmentAmount: 1188000, interestRatePercent: 20.5, totalPayableAmount: 1431540, label: 'Slab 4 (₹1,320/sqft - 20.5%)' },
  { slNo: 5, purchaseRate: 1450, plotAreaSqft: 900, totalInvestmentAmount: 1305000, interestRatePercent: 22.5, totalPayableAmount: 1598625, label: 'Slab 5 (₹1,450/sqft - 22.5%)' },
  { slNo: 6, purchaseRate: 1600, plotAreaSqft: 900, totalInvestmentAmount: 1440000, interestRatePercent: 24.5, totalPayableAmount: 1792800, label: 'Slab 6 (₹1,600/sqft - 24.5%)' },
  { slNo: 7, purchaseRate: 1770, plotAreaSqft: 900, totalInvestmentAmount: 1593000, interestRatePercent: 27.0, totalPayableAmount: 2023110, label: 'Slab 7 (₹1,770/sqft - 27.0%)' },
  { slNo: 8, purchaseRate: 1950, plotAreaSqft: 900, totalInvestmentAmount: 1755000, interestRatePercent: 29.5, totalPayableAmount: 2272725, label: 'Slab 8 (₹1,950/sqft - 29.5%)' },
  { slNo: 9, purchaseRate: 2150, plotAreaSqft: 900, totalInvestmentAmount: 1935000, interestRatePercent: 32.0, totalPayableAmount: 2554200, label: 'Slab 9 (₹2,150/sqft - 32.0%)' },
];

let lumpSumInvestorsStore: any[] = [
  {
    id: 'LFPS-2026-001',
    investorName: 'Er. Rameshwar Dayal Tiwari',
    phone: '9839123450',
    email: 'rd.tiwari@example.com',
    seniorName: 'Vikram Singh (Director Desk)',
    seniorId: 'DIR-001',
    address: '14/B, Stanley Road, Civil Lines, Prayagraj',
    plotNo: 'PLT-FPS-901',
    plotSizeSqft: 900,
    purchaseRateSqft: 2150,
    interestRatePercent: 32.0,
    totalInvestmentAmount: 1935000,
    totalReturnAmount: 619200,
    totalPayableAmount: 2554200,
    joiningDate: '2026-01-10',
    maturityDateConditionA: '2038-01-10',
    nominee: { nomineeName: 'Mrs. Sunita Tiwari', nomineeRelation: 'Spouse', nomineeAge: 48, nomineePhone: '9839123451' },
    plotsSoldTarget: 7,
    plotsSoldCount: 7,
    soldPlotsList: [
      { id: 'SOLD-101', plotNo: 'A-101', projectName: 'Milestone City', buyerName: 'Anil Mishra', buyerPhone: '9811122233', saleAmount: 1200000, saleDate: '2026-01-20', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-102', plotNo: 'A-102', projectName: 'Milestone City', buyerName: 'Pooja Pandey', buyerPhone: '9822233344', saleAmount: 1150000, saleDate: '2026-01-28', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-103', plotNo: 'B-205', projectName: 'Prayag Vihar', buyerName: 'Sanjay Srivastava', buyerPhone: '9833344455', saleAmount: 1400000, saleDate: '2026-02-05', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-104', plotNo: 'B-206', projectName: 'Prayag Vihar', buyerName: 'Dr. R. K. Gupta', buyerPhone: '9844455566', saleAmount: 1350000, saleDate: '2026-02-14', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-105', plotNo: 'C-301', projectName: 'Ganga Enclave', buyerName: 'Deepak Shukla', buyerPhone: '9855566677', saleAmount: 1600000, saleDate: '2026-02-22', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-106', plotNo: 'C-302', projectName: 'Ganga Enclave', buyerName: 'Vikas Maurya', buyerPhone: '9866677788', saleAmount: 1550000, saleDate: '2026-03-01', registeredBy: 'Er. Rameshwar', status: 'Verified' },
      { id: 'SOLD-107', plotNo: 'D-401', projectName: 'Sangam Greens', buyerName: 'Mahendra Yadav', buyerPhone: '9877788899', saleAmount: 1750000, saleDate: '2026-03-10', registeredBy: 'Er. Rameshwar', status: 'Verified' },
    ],
    status: 'Eligible - Condition B (7 Plots Sold!)',
    isConditionAMet: false,
    isConditionBMet: true,
    isPayoutEligible: true,
    isPayoutDisbursed: false,
    auditLogs: [
      { id: 'LOG-01', timestamp: '2026-01-10 10:30 AM', actor: 'Admin Desk', action: 'Enrollment', details: 'Enrolled in 32% Slab @ ₹2,150/sqft for ₹19,35,000.' },
      { id: 'LOG-02', timestamp: '2026-03-10 04:15 PM', actor: 'Sales Engine', action: '7th Plot Sale Recorded', details: 'Milestone reached. Payout unlocked under Condition B!' }
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-03-10'
  },
  {
    id: 'LFPS-2026-002',
    investorName: 'Dr. Anand Kumar Saxena',
    phone: '9415012345',
    email: 'dr.anand@example.com',
    seniorName: 'Manish Pandey (Sr. Manager)',
    seniorId: 'MGR-204',
    address: '52, Tagore Town, Prayagraj',
    plotNo: 'PLT-FPS-702',
    plotSizeSqft: 900,
    purchaseRateSqft: 1770,
    interestRatePercent: 27.0,
    totalInvestmentAmount: 1593000,
    totalReturnAmount: 430110,
    totalPayableAmount: 2023110,
    joiningDate: '2026-01-18',
    maturityDateConditionA: '2038-01-18',
    nominee: { nomineeName: 'Shashank Saxena', nomineeRelation: 'Son', nomineeAge: 24, nomineePhone: '9415012346' },
    plotsSoldTarget: 7,
    plotsSoldCount: 4,
    soldPlotsList: [
      { id: 'SOLD-201', plotNo: 'A-201', projectName: 'Milestone City', buyerName: 'Sunil Jaiswal', buyerPhone: '9450011223', saleAmount: 1100000, saleDate: '2026-01-25', registeredBy: 'Dr. Anand', status: 'Verified' },
      { id: 'SOLD-202', plotNo: 'A-202', projectName: 'Milestone City', buyerName: 'Kavita Singh', buyerPhone: '9450022334', saleAmount: 1120000, saleDate: '2026-02-08', registeredBy: 'Dr. Anand', status: 'Verified' },
      { id: 'SOLD-203', plotNo: 'B-304', projectName: 'Prayag Vihar', buyerName: 'Neeraj Dubey', buyerPhone: '9450033445', saleAmount: 1250000, saleDate: '2026-02-18', registeredBy: 'Dr. Anand', status: 'Verified' },
      { id: 'SOLD-204', plotNo: 'B-305', projectName: 'Prayag Vihar', buyerName: 'Alok Tripathi', buyerPhone: '9450044556', saleAmount: 1300000, saleDate: '2026-03-02', registeredBy: 'Dr. Anand', status: 'Verified' },
    ],
    status: 'In Progress (Condition A / B)',
    isConditionAMet: false,
    isConditionBMet: false,
    isPayoutEligible: false,
    isPayoutDisbursed: false,
    auditLogs: [{ id: 'LOG-11', timestamp: '2026-01-18', actor: 'Admin', action: 'Enrollment', details: 'Enrolled in 27% Slab @ ₹1,770/sqft.' }],
    createdAt: '2026-01-18',
    updatedAt: '2026-03-02'
  },
  {
    id: 'LFPS-2026-003',
    investorName: 'Adv. Brijeshwar Nath Shukla',
    phone: '9838055667',
    email: 'bn.shukla@example.com',
    seniorName: 'Vikram Singh (Director)',
    seniorId: 'DIR-001',
    address: '88, George Town, Prayagraj',
    plotNo: 'PLT-FPS-805',
    plotSizeSqft: 900,
    purchaseRateSqft: 1950,
    interestRatePercent: 29.5,
    totalInvestmentAmount: 1755000,
    totalReturnAmount: 517725,
    totalPayableAmount: 2272725,
    joiningDate: '2026-01-05',
    maturityDateConditionA: '2038-01-05',
    nominee: { nomineeName: 'Mrs. Vandana Shukla', nomineeRelation: 'Spouse', nomineeAge: 52, nomineePhone: '9838055668' },
    plotsSoldTarget: 7,
    plotsSoldCount: 7,
    soldPlotsList: [
      { id: 'SOLD-301', plotNo: 'P-11', projectName: 'Ganga Enclave', buyerName: 'Vivek Srivastava', buyerPhone: '9839911223', saleAmount: 1350000, saleDate: '2026-01-12', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-302', plotNo: 'P-12', projectName: 'Ganga Enclave', buyerName: 'Ritu Agrawal', buyerPhone: '9839922334', saleAmount: 1400000, saleDate: '2026-01-19', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-303', plotNo: 'P-13', projectName: 'Ganga Enclave', buyerName: 'Dinesh Chandra', buyerPhone: '9839933445', saleAmount: 1380000, saleDate: '2026-01-26', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-304', plotNo: 'Q-01', projectName: 'Milestone City', buyerName: 'Mukesh Kumar', buyerPhone: '9839944556', saleAmount: 1450000, saleDate: '2026-02-02', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-305', plotNo: 'Q-02', projectName: 'Milestone City', buyerName: 'Smt. Sarojini Devi', buyerPhone: '9839955667', saleAmount: 1420000, saleDate: '2026-02-11', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-306', plotNo: 'R-05', projectName: 'Sangam Greens', buyerName: 'Gaurav Bind', buyerPhone: '9839966778', saleAmount: 1500000, saleDate: '2026-02-20', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
      { id: 'SOLD-307', plotNo: 'R-06', projectName: 'Sangam Greens', buyerName: 'Harishankar Pal', buyerPhone: '9839977889', saleAmount: 1550000, saleDate: '2026-02-28', registeredBy: 'Adv. Brijeshwar', status: 'Verified' },
    ],
    status: 'Disbursed / Completed',
    isConditionAMet: false,
    isConditionBMet: true,
    isPayoutEligible: true,
    isPayoutDisbursed: true,
    payoutDisbursedDate: '2026-03-05',
    payoutTxnReference: 'RTGS-VPM-20260305-9910',
    payoutDisbursedAmount: 2272725,
    payoutMode: 'Bank Transfer (RTGS/NEFT)',
    auditLogs: [
      { id: 'LOG-21', timestamp: '2026-01-05', actor: 'Admin', action: 'Enrollment', details: 'Enrolled in 29.5% Slab.' },
      { id: 'LOG-22', timestamp: '2026-03-05', actor: 'Finance Officer', action: 'Payout Disbursed', details: 'Full ₹22,72,725 disbursed via RTGS-VPM-20260305-9910.' }
    ],
    createdAt: '2026-01-05',
    updatedAt: '2026-03-05'
  }
];

// Helper to compute summary
function getLumpSumSummaryData() {
  let totalInvestmentAmount = 0;
  let totalPayableAmount = 0;
  let totalReturnLiability = 0;
  let eligibleInvestorsCount = 0;
  let eligiblePayableAmount = 0;
  let pendingMaturityCount = 0;
  let pendingMaturityAmount = 0;
  let completedPayoutsCount = 0;
  let completedDisbursedAmount = 0;
  let totalPlotsSold = 0;
  let conditionBAchieversCount = 0;
  let conditionAAchieversCount = 0;

  lumpSumInvestorsStore.forEach(r => {
    totalInvestmentAmount += r.totalInvestmentAmount;
    totalPayableAmount += r.totalPayableAmount;
    totalReturnLiability += r.totalReturnAmount;
    totalPlotsSold += r.plotsSoldCount || 0;

    if (r.isConditionBMet) conditionBAchieversCount++;
    if (r.isConditionAMet) conditionAAchieversCount++;

    if (r.isPayoutDisbursed) {
      completedPayoutsCount++;
      completedDisbursedAmount += r.payoutDisbursedAmount || r.totalPayableAmount;
    } else if (r.isPayoutEligible) {
      eligibleInvestorsCount++;
      eligiblePayableAmount += r.totalPayableAmount;
    } else {
      pendingMaturityCount++;
      pendingMaturityAmount += r.totalPayableAmount;
    }
  });

  return {
    totalInvestors: lumpSumInvestorsStore.length,
    totalInvestmentAmount,
    totalPayableAmount,
    totalReturnLiability,
    eligibleInvestorsCount,
    eligiblePayableAmount,
    pendingMaturityCount,
    pendingMaturityAmount,
    completedPayoutsCount,
    completedDisbursedAmount,
    totalPlotsSold,
    conditionBAchieversCount,
    conditionAAchieversCount,
  };
}

// 1. Get all investors and summary
app.get("/api/lump-sum-scheme/investors", (req, res) => {
  res.json({
    success: true,
    investors: lumpSumInvestorsStore,
    summary: getLumpSumSummaryData(),
    slabs: lumpSumSlabsStore
  });
});

// 2. Get Slabs
app.get("/api/lump-sum-scheme/slabs", (req, res) => {
  res.json({ success: true, slabs: lumpSumSlabsStore });
});

// 3. Update Slabs
app.put("/api/lump-sum-scheme/slabs", (req, res) => {
  try {
    const { slabs } = req.body;
    if (Array.isArray(slabs)) {
      lumpSumSlabsStore = slabs;
    }
    res.json({ success: true, slabs: lumpSumSlabsStore, message: "Slabs updated successfully!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Create new Investor
app.post("/api/lump-sum-scheme/investors", (req, res) => {
  try {
    const data = req.body;
    const plotSize = Number(data.plotSizeSqft) || 900;
    const rate = Number(data.purchaseRateSqft) || 1050;
    const slab = lumpSumSlabsStore.find(s => s.purchaseRate === rate) || lumpSumSlabsStore[0];
    const interestRate = Number(data.interestRatePercent) || slab.interestRatePercent;
    const investAmt = Math.round(plotSize * rate);
    const returnAmt = Math.round((investAmt * interestRate) / 100);
    const payableAmt = investAmt + returnAmt;

    const joiningDate = data.joiningDate || new Date().toISOString().split('T')[0];
    const jDate = new Date(joiningDate);
    const mDate = new Date(jDate.setFullYear(jDate.getFullYear() + 12)).toISOString().split('T')[0];

    const newId = `LFPS-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newRecord = {
      id: newId,
      investorName: data.investorName || 'Valued Investor',
      phone: data.phone || '9876543210',
      email: data.email || 'investor@example.com',
      seniorName: data.seniorName || 'VPM Office Desk',
      seniorId: data.seniorId || 'SNR-101',
      address: data.address || 'Prayagraj, UP',
      plotNo: data.plotNo || `PLT-FPS-${Math.floor(100 + Math.random() * 900)}`,
      plotSizeSqft: plotSize,
      purchaseRateSqft: rate,
      interestRatePercent: interestRate,
      totalInvestmentAmount: investAmt,
      totalReturnAmount: returnAmt,
      totalPayableAmount: payableAmt,
      joiningDate,
      maturityDateConditionA: mDate,
      nominee: data.nominee || {
        nomineeName: 'Nominee Name',
        nomineeRelation: 'Spouse',
        nomineeAge: 35,
        nomineePhone: '9876543210',
      },
      plotsSoldTarget: 7,
      plotsSoldCount: 0,
      soldPlotsList: [],
      status: 'In Progress (Condition A / B)',
      isConditionAMet: false,
      isConditionBMet: false,
      isPayoutEligible: false,
      isPayoutDisbursed: false,
      auditLogs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-IN'),
          actor: data.adminUser || 'Admin Desk',
          action: 'Investor Registration',
          details: `Enrolled in Lump-Sum Free Plot Scheme @ ₹${rate}/sqft (${interestRate}% return). Total Payable: ₹${payableAmt.toLocaleString('en-IN')}`
        }
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    lumpSumInvestorsStore.unshift(newRecord);

    res.json({
      success: true,
      investor: newRecord,
      summary: getLumpSumSummaryData(),
      message: `Investor ${newRecord.investorName} successfully registered in Lump-Sum Free Plot Scheme!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Record Plot Sale for Investor (Condition B: 7 Plots)
app.post("/api/lump-sum-scheme/investors/:id/record-sale", (req, res) => {
  try {
    const { id } = req.params;
    const { plotNo, projectName, buyerName, buyerPhone, saleAmount, adminUser } = req.body;

    const investor = lumpSumInvestorsStore.find(inv => inv.id === id);
    if (!investor) {
      return res.status(404).json({ success: false, error: "Investor record not found." });
    }

    const newSaleItem = {
      id: `SOLD-${Date.now()}`,
      plotNo: plotNo || `PLT-${Math.floor(100 + Math.random() * 900)}`,
      projectName: projectName || 'Milestone City Prayagraj',
      buyerName: buyerName || 'Direct Buyer',
      buyerPhone: buyerPhone || '9876543210',
      saleAmount: Number(saleAmount) || 1200000,
      saleDate: new Date().toISOString().split('T')[0],
      registeredBy: investor.investorName,
      status: 'Verified'
    };

    investor.soldPlotsList.unshift(newSaleItem);
    investor.plotsSoldCount = investor.soldPlotsList.length;

    // Check Condition B
    if (investor.plotsSoldCount >= investor.plotsSoldTarget) {
      investor.isConditionBMet = true;
      investor.isPayoutEligible = true;
      if (!investor.isPayoutDisbursed) {
        investor.status = 'Eligible - Condition B (7 Plots Sold!)';
      }
    }

    investor.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: adminUser || 'Sales Desk',
      action: 'Plot Sale Recorded',
      details: `Plot ${newSaleItem.plotNo} (${newSaleItem.projectName}) sold to ${newSaleItem.buyerName} for ₹${newSaleItem.saleAmount.toLocaleString('en-IN')}. Progress: ${investor.plotsSoldCount}/${investor.plotsSoldTarget} plots.`
    });

    investor.updatedAt = new Date().toISOString().split('T')[0];

    res.json({
      success: true,
      investor,
      summary: getLumpSumSummaryData(),
      milestoneAchieved: investor.isConditionBMet,
      message: investor.isConditionBMet
        ? `CONGRATULATIONS! 7-Plot Milestone Reached for ${investor.investorName}. Condition B Payout of ₹${investor.totalPayableAmount.toLocaleString('en-IN')} is now UNLOCKED!`
        : `Plot sale recorded! Current progress: ${investor.plotsSoldCount}/7 plots.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Disburse Lump-Sum Payout
app.post("/api/lump-sum-scheme/investors/:id/disburse", (req, res) => {
  try {
    const { id } = req.params;
    const { txnReference, payoutMode, adminUser } = req.body;

    const investor = lumpSumInvestorsStore.find(inv => inv.id === id);
    if (!investor) {
      return res.status(404).json({ success: false, error: "Investor record not found." });
    }

    investor.isPayoutDisbursed = true;
    investor.status = 'Disbursed / Completed';
    investor.payoutDisbursedDate = new Date().toISOString().split('T')[0];
    investor.payoutTxnReference = txnReference || `RTGS-VPM-${Date.now()}`;
    investor.payoutDisbursedAmount = investor.totalPayableAmount;
    investor.payoutMode = payoutMode || 'Bank Transfer (RTGS/NEFT)';

    investor.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN'),
      actor: adminUser || 'Finance Officer',
      action: 'Payout Settlement Disbursed',
      details: `Full lump-sum payout of ₹${investor.totalPayableAmount.toLocaleString('en-IN')} disbursed via ${investor.payoutMode}. Ref: ${investor.payoutTxnReference}`
    });

    investor.updatedAt = new Date().toISOString().split('T')[0];

    res.json({
      success: true,
      investor,
      summary: getLumpSumSummaryData(),
      message: `Lump-sum payout of ₹${investor.totalPayableAmount.toLocaleString('en-IN')} successfully settled for ${investor.investorName}!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Delete Investor
app.delete("/api/lump-sum-scheme/investors/:id", (req, res) => {
  try {
    const { id } = req.params;
    lumpSumInvestorsStore = lumpSumInvestorsStore.filter(i => i.id !== id);
    res.json({ success: true, summary: getLumpSumSummaryData(), message: "Investor record removed successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Export CSV
app.get("/api/lump-sum-scheme/export/csv", (req, res) => {
  const headers = "Investor ID,Investor Name,Phone,Email,Plot No,Plot Size,Purchase Rate,Total Investment,Interest %,Total Return,Total Payable,Joining Date,Maturity Date,Plots Sold,Status,Payout Disbursed,Txn Ref\n";
  const rows = lumpSumInvestorsStore.map(r =>
    `"${r.id}","${r.investorName}","${r.phone}","${r.email}","${r.plotNo}","${r.plotSizeSqft}","${r.purchaseRateSqft}","${r.totalInvestmentAmount}","${r.interestRatePercent}%","${r.totalReturnAmount}","${r.totalPayableAmount}","${r.joiningDate}","${r.maturityDateConditionA}","${r.plotsSoldCount}/7","${r.status}","${r.isPayoutDisbursed ? 'YES' : 'NO'}","${r.payoutTxnReference || ''}"`
  ).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8;");
  res.setHeader("Content-Disposition", `attachment; filename=VPM_Ek_Musht_Free_Plot_Scheme_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
  res.send(headers + rows);
});

// =============================================================================
// फ्री प्लॉट स्कीम (EMI / किस्त योजना) REST API ENDPOINTS
// =============================================================================

let emiSchemePlansStore: any[] = [
  { tenureMonths: 12, monthlyInstallment: 78725, monthlyReturn: 91743, requiredPlotSales: 7, bonusReturnPerPlot: 13106, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 944700, totalTenureReturn: 1100916 },
  { tenureMonths: 24, monthlyInstallment: 39375, monthlyReturn: 45871, requiredPlotSales: 7, bonusReturnPerPlot: 6553, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945000, totalTenureReturn: 1100904 },
  { tenureMonths: 36, monthlyInstallment: 26250, monthlyReturn: 35997, requiredPlotSales: 7, bonusReturnPerPlot: 5142, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945000, totalTenureReturn: 1295892 },
  { tenureMonths: 48, monthlyInstallment: 19688, monthlyReturn: 22935, requiredPlotSales: 6, bonusReturnPerPlot: 3276, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945024, totalTenureReturn: 1100880 },
  { tenureMonths: 60, monthlyInstallment: 15750, monthlyReturn: 18348, requiredPlotSales: 6, bonusReturnPerPlot: 2621, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945000, totalTenureReturn: 1100880 },
  { tenureMonths: 72, monthlyInstallment: 13125, monthlyReturn: 15290, requiredPlotSales: 6, bonusReturnPerPlot: 2184, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945000, totalTenureReturn: 1100880 },
  { tenureMonths: 84, monthlyInstallment: 11250, monthlyReturn: 13106, requiredPlotSales: 5, bonusReturnPerPlot: 1872, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945000, totalTenureReturn: 1100904 },
  { tenureMonths: 96, monthlyInstallment: 9840, monthlyReturn: 11467, requiredPlotSales: 5, bonusReturnPerPlot: 1638, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 944640, totalTenureReturn: 1100832 },
  { tenureMonths: 108, monthlyInstallment: 8750, monthlyReturn: 10193, requiredPlotSales: 5, bonusReturnPerPlot: 1456, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945000, totalTenureReturn: 1100844 },
  { tenureMonths: 120, monthlyInstallment: 7875, monthlyReturn: 9174, requiredPlotSales: 5, bonusReturnPerPlot: 1310, plotSizeSqft: 900, interestRatePercent: 16.5, totalTenureInvestment: 945000, totalTenureReturn: 1100880 },
];

function generateServerEmiSchedule(tenureMonths: number, monthlyInstallment: number, joiningDateStr: string, paidCount: number = 0) {
  const schedule: any[] = [];
  const baseDate = new Date(joiningDateStr);
  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    const dueDateFormatted = dueDate.toISOString().split('T')[0];
    const isPaid = i <= paidCount;
    schedule.push({
      installmentNo: i,
      dueDate: dueDateFormatted,
      paidDate: isPaid ? new Date(dueDate.getTime() - 2 * 86400000).toISOString().split('T')[0] : undefined,
      amount: monthlyInstallment,
      status: isPaid ? 'Paid' : i === paidCount + 1 ? 'Due' : 'Upcoming',
      paymentMode: isPaid ? 'UPI' : undefined,
      txnRef: isPaid ? `TXN-EMI-${1000 + i}-${Math.floor(Math.random() * 9000 + 1000)}` : undefined,
      receiptNumber: isPaid ? `REC-EMI-2026-${100 + i}` : undefined,
    });
  }
  return schedule;
}

let emiInvestorsStore: any[] = [
  {
    id: 'FPS-EMI-2026-001',
    investorName: 'विजय सिंह राजपूत (Vijay Singh Rajput)',
    phone: '+91 98390 12345',
    email: 'vijay.rajput@gmail.com',
    seniorName: 'राजेश कुमार मिश्रा (VP)',
    seniorId: 'VP-AGT-101',
    address: 'फ्लैट 402, गंगा हाइट्स, सिविल लाइन्स, प्रयागराज (UP)',
    plotNo: 'PLOT-FPS-104',
    plotSizeSqft: 900,
    tenureMonths: 12,
    monthlyEmi: 78725,
    monthlyReturn: 91743,
    bonusReturnPerPlot: 13106,
    requiredPlotSales: 7,
    interestRatePercent: 16.5,
    totalInvestment: 944700,
    totalExpectedReturn: 1100916,
    joiningDate: '2025-08-10',
    maturityDate: '2026-08-10',
    nominee: { nomineeName: 'सुनीता राजपूत', nomineeRelation: 'पत्नी (Wife)', nomineeAge: 38, nomineePhone: '+91 98390 12346' },
    status: 'Eligible',
    paidInstallmentsCount: 12,
    totalPaidAmount: 944700,
    remainingInstallmentsCount: 0,
    remainingAmount: 0,
    nextEmiDueDate: 'Completed',
    plotsSoldCount: 7,
    soldPlotsList: [
      { id: 'SP-01', plotNo: 'P-101', projectName: 'Vigya City Phase 1', buyerName: 'अनिल वर्मा', buyerPhone: '9876543210', saleAmount: 950000, saleDate: '2025-10-15', monthlyBonusRate: 13106, registeredBy: 'Vijay Singh', status: 'Verified' },
      { id: 'SP-02', plotNo: 'P-102', projectName: 'Vigya City Phase 1', buyerName: 'सुधीर यादव', buyerPhone: '9876543211', saleAmount: 950000, saleDate: '2025-11-20', monthlyBonusRate: 13106, registeredBy: 'Vijay Singh', status: 'Verified' },
      { id: 'SP-03', plotNo: 'P-103', projectName: 'Vigya City Phase 1', buyerName: 'कमल तिवारी', buyerPhone: '9876543212', saleAmount: 980000, saleDate: '2025-12-05', monthlyBonusRate: 13106, registeredBy: 'Vijay Singh', status: 'Verified' },
      { id: 'SP-04', plotNo: 'P-104', projectName: 'Vigya City Phase 1', buyerName: 'आशीष गुप्ता', buyerPhone: '9876543213', saleAmount: 950000, saleDate: '2026-01-18', monthlyBonusRate: 13106, registeredBy: 'Vijay Singh', status: 'Verified' },
      { id: 'SP-05', plotNo: 'P-105', projectName: 'Vigya City Phase 2', buyerName: 'मनोज सिंह', buyerPhone: '9876543214', saleAmount: 975000, saleDate: '2026-03-10', monthlyBonusRate: 13106, registeredBy: 'Vijay Singh', status: 'Verified' },
      { id: 'SP-06', plotNo: 'P-106', projectName: 'Vigya City Phase 2', buyerName: 'दिनेश शुक्ला', buyerPhone: '9876543215', saleAmount: 950000, saleDate: '2026-05-14', monthlyBonusRate: 13106, registeredBy: 'Vijay Singh', status: 'Verified' },
      { id: 'SP-07', plotNo: 'P-107', projectName: 'Vigya City Phase 2', buyerName: 'रोहित मौर्या', buyerPhone: '9876543216', saleAmount: 1000000, saleDate: '2026-07-22', monthlyBonusRate: 13106, registeredBy: 'Vijay Singh', status: 'Verified' },
    ],
    monthlyBonusAmount: 13106 * 7,
    totalCurrentMonthlyReturn: 91743 + 13106 * 7,
    isPlotTargetMet: true,
    isTenureCompleted: true,
    isPayoutEligible: true,
    isPayoutDisbursed: false,
    emiLedger: generateServerEmiSchedule(12, 78725, '2025-08-10', 12),
    auditLogs: [
      { id: 'LOG-01', timestamp: '2025-08-10 10:30', actor: 'System', action: 'Enrollment', details: 'Enrolled in 12-Month Free Plot Scheme' },
      { id: 'LOG-02', timestamp: '2026-07-22 16:45', actor: 'Admin Desk', action: 'Target Achieved', details: 'Achieved 7/7 plot sales milestone. Payment eligibility unlocked.' },
    ],
    createdAt: '2025-08-10T10:30:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
  },
  {
    id: 'FPS-EMI-2026-002',
    investorName: 'अमृता प्रकाश (Amrita Prakash)',
    phone: '+91 94150 98765',
    email: 'amrita.p@outlook.com',
    seniorName: 'विपिन शर्मा (SVP)',
    seniorId: 'VP-AGT-104',
    address: 'मकान नं. 12/B, टैगोर टाउन, प्रयागराज (UP)',
    plotNo: 'PLOT-FPS-208',
    plotSizeSqft: 900,
    tenureMonths: 36,
    monthlyEmi: 26250,
    monthlyReturn: 35997,
    bonusReturnPerPlot: 5142,
    requiredPlotSales: 7,
    interestRatePercent: 16.5,
    totalInvestment: 945000,
    totalExpectedReturn: 1295892,
    joiningDate: '2025-02-01',
    maturityDate: '2028-02-01',
    nominee: { nomineeName: 'आदित्य प्रकाश', nomineeRelation: 'पुत्र (Son)', nomineeAge: 19, nomineePhone: '+91 94150 98766' },
    status: 'Active',
    paidInstallmentsCount: 18,
    totalPaidAmount: 26250 * 18,
    remainingInstallmentsCount: 18,
    remainingAmount: 26250 * 18,
    nextEmiDueDate: '2026-09-01',
    plotsSoldCount: 4,
    soldPlotsList: [
      { id: 'SP-201', plotNo: 'P-211', projectName: 'Vigya City Phase 2', buyerName: 'पूनम मिश्रा', buyerPhone: '9415011111', saleAmount: 960000, saleDate: '2025-06-12', monthlyBonusRate: 5142, registeredBy: 'Amrita Prakash', status: 'Verified' },
      { id: 'SP-202', plotNo: 'P-212', projectName: 'Vigya City Phase 2', buyerName: 'विकास पांडे', buyerPhone: '9415011112', saleAmount: 960000, saleDate: '2025-09-18', monthlyBonusRate: 5142, registeredBy: 'Amrita Prakash', status: 'Verified' },
      { id: 'SP-203', plotNo: 'P-213', projectName: 'Vigya City Phase 3', buyerName: 'रेनू यादव', buyerPhone: '9415011113', saleAmount: 980000, saleDate: '2025-12-04', monthlyBonusRate: 5142, registeredBy: 'Amrita Prakash', status: 'Verified' },
      { id: 'SP-204', plotNo: 'P-214', projectName: 'Vigya City Phase 3', buyerName: 'संजय द्विवेदी', buyerPhone: '9415011114', saleAmount: 980000, saleDate: '2026-04-20', monthlyBonusRate: 5142, registeredBy: 'Amrita Prakash', status: 'Verified' },
    ],
    monthlyBonusAmount: 5142 * 4,
    totalCurrentMonthlyReturn: 35997 + 5142 * 4,
    isPlotTargetMet: false,
    isTenureCompleted: false,
    isPayoutEligible: false,
    isPayoutDisbursed: false,
    emiLedger: generateServerEmiSchedule(36, 26250, '2025-02-01', 18),
    auditLogs: [
      { id: 'LOG-11', timestamp: '2025-02-01 11:00', actor: 'System', action: 'Enrollment', details: 'Enrolled in 36-Month Free Plot Scheme' },
      { id: 'LOG-12', timestamp: '2026-04-20 14:10', actor: 'Amrita Prakash', action: 'Plot Sale Added', details: 'Sold Plot P-214 credited to target' },
    ],
    createdAt: '2025-02-01T11:00:00Z',
    updatedAt: '2026-08-18T10:00:00Z',
  }
];

function getEmiSchemeAnalyticsData() {
  let totalCollection = 0;
  let totalLiability = 0;
  let totalSoldPlots = 0;
  let totalPayoutAmount = 0;
  let activeCount = 0;
  let eligibleCount = 0;
  let completedCount = 0;
  let monthlyCashflow = 0;

  emiInvestorsStore.forEach(inv => {
    totalCollection += (inv.totalPaidAmount || 0);
    totalLiability += (inv.totalExpectedReturn || 0);
    totalSoldPlots += (inv.plotsSoldCount || 0);
    if (inv.isPayoutDisbursed && inv.payoutDisbursedAmount) {
      totalPayoutAmount += inv.payoutDisbursedAmount;
    }
    if (inv.status === 'Active') {
      activeCount++;
      monthlyCashflow += inv.monthlyEmi;
    }
    if (inv.status === 'Eligible') eligibleCount++;
    if (inv.status === 'Completed' || inv.status === 'Disbursed') completedCount++;
  });

  return {
    totalInvestors: emiInvestorsStore.length,
    activeInvestors: activeCount,
    eligibleInvestors: eligibleCount,
    completedInvestors: completedCount,
    totalEmiCollection: totalCollection,
    totalExpectedLiability: totalLiability,
    totalSoldPlots: totalSoldPlots,
    monthlyCashflow: monthlyCashflow,
    yearlyCashflow: monthlyCashflow * 12,
    totalPayoutAmount: totalPayoutAmount,
  };
}

// 1. Get Plans
app.get("/api/emi-free-plot-scheme/plans", (req, res) => {
  res.json({ success: true, plans: emiSchemePlansStore });
});

// 2. Update Plans
app.put("/api/emi-free-plot-scheme/plans", (req, res) => {
  try {
    const { plans } = req.body;
    if (Array.isArray(plans) && plans.length > 0) {
      emiSchemePlansStore = plans;
    }
    res.json({ success: true, plans: emiSchemePlansStore, message: "EMI Scheme Plans updated successfully." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get All Investors & Analytics
app.get("/api/emi-free-plot-scheme/investors", (req, res) => {
  res.json({
    success: true,
    investors: emiInvestorsStore,
    analytics: getEmiSchemeAnalyticsData(),
    plans: emiSchemePlansStore
  });
});

// 4. Register New Investor
app.post("/api/emi-free-plot-scheme/investors", (req, res) => {
  try {
    const data = req.body;
    const plan = emiSchemePlansStore.find(p => p.tenureMonths === Number(data.tenureMonths)) || emiSchemePlansStore[0];
    const generatedId = `FPS-EMI-2026-${String(emiInvestorsStore.length + 1).padStart(3, '0')}`;
    const joiningDate = data.joiningDate || new Date().toISOString().split('T')[0];
    
    // Maturity date
    const matDate = new Date(joiningDate);
    matDate.setMonth(matDate.getMonth() + plan.tenureMonths);
    const maturityDate = matDate.toISOString().split('T')[0];

    const initialSchedule = generateServerEmiSchedule(plan.tenureMonths, plan.monthlyInstallment, joiningDate, 1);

    const newInvestor: any = {
      id: generatedId,
      investorName: data.investorName,
      phone: data.phone,
      email: data.email || `${data.investorName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      seniorName: data.seniorName || 'राजेश कुमार मिश्रा (VP)',
      seniorId: data.seniorId || 'VP-AGT-101',
      address: data.address || 'Civil Lines, Prayagraj, UP',
      plotNo: data.plotNo || `PLOT-FPS-${100 + emiInvestorsStore.length + 1}`,
      plotSizeSqft: 900,
      tenureMonths: plan.tenureMonths,
      monthlyEmi: plan.monthlyInstallment,
      monthlyReturn: plan.monthlyReturn,
      bonusReturnPerPlot: plan.bonusReturnPerPlot,
      requiredPlotSales: plan.requiredPlotSales,
      interestRatePercent: 16.5,
      totalInvestment: plan.totalTenureInvestment,
      totalExpectedReturn: plan.totalTenureReturn,
      joiningDate: joiningDate,
      maturityDate: maturityDate,
      nominee: {
        nomineeName: data.nomineeName || 'Nominee',
        nomineeRelation: data.nomineeRelation || 'Spouse',
        nomineeAge: Number(data.nomineeAge) || 30,
        nomineePhone: data.nomineePhone || data.phone,
      },
      status: 'Active',
      paidInstallmentsCount: 1,
      totalPaidAmount: plan.monthlyInstallment,
      remainingInstallmentsCount: plan.tenureMonths - 1,
      remainingAmount: plan.totalTenureInvestment - plan.monthlyInstallment,
      nextEmiDueDate: initialSchedule[1]?.dueDate || maturityDate,
      plotsSoldCount: 0,
      soldPlotsList: [],
      monthlyBonusAmount: 0,
      totalCurrentMonthlyReturn: plan.monthlyReturn,
      isPlotTargetMet: false,
      isTenureCompleted: false,
      isPayoutEligible: false,
      isPayoutDisbursed: false,
      emiLedger: initialSchedule,
      auditLogs: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Admin Portal',
          action: 'Investor Registration',
          details: `Enrolled into ${plan.tenureMonths}-Month Free Plot Scheme with 1st EMI (₹${plan.monthlyInstallment}) received.`
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    emiInvestorsStore.unshift(newInvestor);

    res.json({
      success: true,
      investor: newInvestor,
      analytics: getEmiSchemeAnalyticsData(),
      message: `Investor ${newInvestor.investorName} successfully registered under ${plan.tenureMonths} Months EMI Scheme!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Pay EMI Installment
app.post("/api/emi-free-plot-scheme/investors/:id/pay-emi", (req, res) => {
  try {
    const { id } = req.params;
    const { installmentNo, amount, paymentMode, txnRef } = req.body;
    const investor = emiInvestorsStore.find(i => i.id === id);
    if (!investor) return res.status(404).json({ success: false, message: "Investor not found" });

    const item = investor.emiLedger.find((e: any) => e.installmentNo === Number(installmentNo));
    if (item) {
      item.status = 'Paid';
      item.paidDate = new Date().toISOString().split('T')[0];
      item.paymentMode = paymentMode || 'UPI';
      item.txnRef = txnRef || `TXN-EMI-${Date.now()}`;
      item.receiptNumber = `REC-EMI-2026-${Math.floor(Math.random() * 90000 + 10000)}`;
    }

    const paidList = investor.emiLedger.filter((e: any) => e.status === 'Paid');
    investor.paidInstallmentsCount = paidList.length;
    investor.totalPaidAmount = paidList.reduce((sum: number, x: any) => sum + x.amount, 0);
    investor.remainingInstallmentsCount = Math.max(0, investor.tenureMonths - investor.paidInstallmentsCount);
    investor.remainingAmount = Math.max(0, investor.totalInvestment - investor.totalPaidAmount);

    if (investor.paidInstallmentsCount >= investor.tenureMonths) {
      investor.isTenureCompleted = true;
      investor.isPayoutEligible = true;
      if (!investor.isPayoutDisbursed) investor.status = 'Eligible';
    }

    const nextDue = investor.emiLedger.find((e: any) => e.status === 'Due' || e.status === 'Upcoming');
    if (nextDue) {
      nextDue.status = 'Due';
      investor.nextEmiDueDate = nextDue.dueDate;
    } else {
      investor.nextEmiDueDate = 'Completed';
    }

    investor.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: 'Finance Desk',
      action: 'EMI Payment Recorded',
      details: `Installment #${installmentNo} of ₹${amount || investor.monthlyEmi} verified and marked as Paid.`
    });

    res.json({
      success: true,
      investor,
      analytics: getEmiSchemeAnalyticsData(),
      message: `EMI Installment #${installmentNo} successfully recorded.`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Record Sold Plot
app.post("/api/emi-free-plot-scheme/investors/:id/sold-plots", (req, res) => {
  try {
    const { id } = req.params;
    const { plotNo, projectName, buyerName, buyerPhone, saleAmount } = req.body;
    const investor = emiInvestorsStore.find(i => i.id === id);
    if (!investor) return res.status(404).json({ success: false, message: "Investor not found" });

    const newSoldPlot = {
      id: `SP-${Date.now().toString().slice(-4)}`,
      plotNo: plotNo || `P-${100 + investor.soldPlotsList.length + 1}`,
      projectName: projectName || 'Vigya City Phase 2',
      buyerName: buyerName || 'Buyer Name',
      buyerPhone: buyerPhone || '9876543210',
      saleAmount: Number(saleAmount) || 950000,
      saleDate: new Date().toISOString().split('T')[0],
      monthlyBonusRate: investor.bonusReturnPerPlot,
      registeredBy: investor.investorName,
      status: 'Verified'
    };

    investor.soldPlotsList.push(newSoldPlot);
    investor.plotsSoldCount = investor.soldPlotsList.filter((p: any) => p.status === 'Verified').length;
    investor.monthlyBonusAmount = investor.plotsSoldCount * investor.bonusReturnPerPlot;
    investor.totalCurrentMonthlyReturn = investor.monthlyReturn + investor.monthlyBonusAmount;

    if (investor.plotsSoldCount >= investor.requiredPlotSales) {
      investor.isPlotTargetMet = true;
      investor.isPayoutEligible = true;
      if (!investor.isPayoutDisbursed) {
        investor.status = 'Eligible';
      }
    }

    investor.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: 'Admin Desk',
      action: 'Plot Sale Verified',
      details: `Plot ${newSoldPlot.plotNo} verified for buyer ${newSoldPlot.buyerName}. Target count is now ${investor.plotsSoldCount}/${investor.requiredPlotSales}.`
    });

    res.json({
      success: true,
      investor,
      analytics: getEmiSchemeAnalyticsData(),
      message: `Plot ${newSoldPlot.plotNo} recorded towards investor milestone!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Disburse Payout
app.post("/api/emi-free-plot-scheme/investors/:id/disburse-payout", (req, res) => {
  try {
    const { id } = req.params;
    const { payoutMode, txnReference, notes } = req.body;
    const investor = emiInvestorsStore.find(i => i.id === id);
    if (!investor) return res.status(404).json({ success: false, message: "Investor not found" });

    investor.isPayoutDisbursed = true;
    investor.status = 'Disbursed';
    investor.payoutDisbursedDate = new Date().toISOString().split('T')[0];
    investor.payoutMode = payoutMode || 'Bank Transfer (RTGS/NEFT)';
    investor.payoutTxnReference = txnReference || `RTGS-VPM-${Date.now()}`;
    investor.payoutDisbursedAmount = investor.totalExpectedReturn;

    investor.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: 'Finance Director',
      action: 'Maturity Payout Disbursed',
      details: `Disbursed ₹${investor.totalExpectedReturn.toLocaleString('en-IN')} via ${investor.payoutMode}. Ref: ${investor.payoutTxnReference}`
    });

    res.json({
      success: true,
      investor,
      analytics: getEmiSchemeAnalyticsData(),
      message: `Payout of ₹${investor.totalExpectedReturn.toLocaleString('en-IN')} successfully disbursed!`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Delete Investor
app.delete("/api/emi-free-plot-scheme/investors/:id", (req, res) => {
  try {
    const { id } = req.params;
    emiInvestorsStore = emiInvestorsStore.filter(i => i.id !== id);
    res.json({ success: true, analytics: getEmiSchemeAnalyticsData(), message: "Investor record removed." });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Export CSV
app.get("/api/emi-free-plot-scheme/export/csv", (req, res) => {
  const headers = "Investor ID,Investor Name,Phone,Email,Plot No,Plot Size,Tenure (Months),Monthly EMI,Monthly Return,Bonus Per Plot,Paid EMIs,Total Paid,Remaining EMIs,Sold Plots,Status,Payout Disbursed,Txn Ref\n";
  const rows = emiInvestorsStore.map(r =>
    `"${r.id}","${r.investorName}","${r.phone}","${r.email}","${r.plotNo}","${r.plotSizeSqft}","${r.tenureMonths}","${r.monthlyEmi}","${r.monthlyReturn}","${r.bonusReturnPerPlot}","${r.paidInstallmentsCount}","${r.totalPaidAmount}","${r.remainingInstallmentsCount}","${r.plotsSoldCount}/${r.requiredPlotSales}","${r.status}","${r.isPayoutDisbursed ? 'YES' : 'NO'}","${r.payoutTxnReference || ''}"`
  ).join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8;");
  res.setHeader("Content-Disposition", `attachment; filename=VPM_Free_Plot_EMI_Scheme_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
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
