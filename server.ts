import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

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

// Mock Auth OTP verify
app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp, role } = req.body;
  if (otp === "123456" || otp === "9999" || otp.length === 6) {
    res.json({
      success: true,
      token: "jwt_token_vpm_" + Date.now(),
      user: {
        phone,
        name: "Valued User",
        role: role || "buyer",
        isVerified: true,
        agentId: role === "agent" ? "VPM-AG-998" : undefined
      }
    });
  } else {
    res.status(400).json({ success: false, error: "Invalid OTP code. Try 123456." });
  }
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
