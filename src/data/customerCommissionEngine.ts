import {
  CustomerSlab,
  CustomerRecord,
  CustomerSaleRecord,
  CustomerSystemSummary,
  CustomerWithdrawalRequest
} from '../types';

export const STANDARD_CUSTOMER_RATE = 1000; // ₹1,000 / sqft
export const STANDARD_CUSTOMER_PLOT_SIZE = 900; // 900 Sqft
export const STANDARD_CUSTOMER_PLOT_VALUE = 900000; // ₹9,00,000

export const MANDATORY_CUSTOMER_RULE_HINDI =
  "जो ग्राहक ₹1,000 प्रति वर्गफुट की दर से प्लॉट खरीदते हैं, उन्हें ग्राहक श्रेणी में रखा जाएगा। प्रथम प्लॉट विक्रय पर 15.5% कमीशन दिया जाएगा तथा निर्धारित स्लैब के अनुसार कमीशन क्रमशः घटता जाएगा। 45 प्लॉट विक्रय पूर्ण होने के बाद प्रत्येक अतिरिक्त प्लॉट पर 4.5% कमीशन स्थायी रूप से लागू रहेगा।";

export const MANDATORY_CUSTOMER_RULE_ENG =
  "Customers purchasing plots at ₹1,000/sqft qualify for the Progressive Customer Commission Structure. The 1st plot sale earns 15.5% commission, progressively stepping down across 45 sales slabs. After 45 completed plot sales, a permanent 4.5% commission rate applies to all subsequent plot sales.";

// Customer Progressive Commission Slabs Table Definition
export const CUSTOMER_COMMISSION_SLABS: CustomerSlab[] = [
  {
    slabIndex: 1,
    label: "1st Plot Sale",
    minSales: 1,
    maxSales: 1,
    percentage: 15.5,
    plotsInSlab: 1,
    commissionPerPlot: 139500 // 15.5% of 9,00,000
  },
  {
    slabIndex: 2,
    label: "Next 2 Plots (2nd - 3rd)",
    minSales: 2,
    maxSales: 3,
    percentage: 15.0,
    plotsInSlab: 2,
    commissionPerPlot: 135000 // 15.0% of 9,00,000
  },
  {
    slabIndex: 3,
    label: "Next 3 Plots (4th - 6th)",
    minSales: 4,
    maxSales: 6,
    percentage: 14.25,
    plotsInSlab: 3,
    commissionPerPlot: 128250 // 14.25% of 9,00,000
  },
  {
    slabIndex: 4,
    label: "Next 4 Plots (7th - 10th)",
    minSales: 7,
    maxSales: 10,
    percentage: 13.25,
    plotsInSlab: 4,
    commissionPerPlot: 119250 // 13.25% of 9,00,000
  },
  {
    slabIndex: 5,
    label: "Next 5 Plots (11th - 15th)",
    minSales: 11,
    maxSales: 15,
    percentage: 12.0,
    plotsInSlab: 5,
    commissionPerPlot: 108000 // 12.0% of 9,00,000
  },
  {
    slabIndex: 6,
    label: "Next 6 Plots (16th - 21st)",
    minSales: 16,
    maxSales: 21,
    percentage: 10.5,
    plotsInSlab: 6,
    commissionPerPlot: 94500 // 10.5% of 9,00,000
  },
  {
    slabIndex: 7,
    label: "Next 7 Plots (22nd - 28th)",
    minSales: 22,
    maxSales: 28,
    percentage: 8.75,
    plotsInSlab: 7,
    commissionPerPlot: 78750 // 8.75% of 9,00,000
  },
  {
    slabIndex: 8,
    label: "Next 8 Plots (29th - 36th)",
    minSales: 29,
    maxSales: 36,
    percentage: 6.75,
    plotsInSlab: 8,
    commissionPerPlot: 60750 // 6.75% of 9,00,000
  },
  {
    slabIndex: 9,
    label: "Next 9 Plots (37th - 45th)",
    minSales: 37,
    maxSales: 45,
    percentage: 4.5,
    plotsInSlab: 9,
    commissionPerPlot: 40500 // 4.5% of 9,00,000
  },
  {
    slabIndex: 10,
    label: "Permanent Fixed (46th+)",
    minSales: 46,
    maxSales: null,
    percentage: 4.5,
    plotsInSlab: 99999,
    commissionPerPlot: 40500 // 4.5% of 9,00,000
  }
];

/**
 * Determines the slab for a specific sale number (1-indexed).
 */
export function getCustomerSlabForSaleNumber(saleNumber: number): CustomerSlab {
  if (saleNumber <= 0) saleNumber = 1;

  for (const slab of CUSTOMER_COMMISSION_SLABS) {
    if (slab.maxSales === null) {
      if (saleNumber >= slab.minSales) return slab;
    } else {
      if (saleNumber >= slab.minSales && saleNumber <= slab.maxSales) {
        return slab;
      }
    }
  }

  // Fallback to last slab (4.5%)
  return CUSTOMER_COMMISSION_SLABS[CUSTOMER_COMMISSION_SLABS.length - 1];
}

/**
 * Calculates current slab details based on total plots already sold.
 */
export function getCustomerSlabDetails(totalPlotsSold: number) {
  const nextSaleNumber = totalPlotsSold + 1;
  const currentSlab = getCustomerSlabForSaleNumber(totalPlotsSold > 0 ? totalPlotsSold : 1);
  const nextSlab = getCustomerSlabForSaleNumber(nextSaleNumber);

  let remainingInCurrentSlab = 0;
  if (nextSlab.maxSales !== null) {
    remainingInCurrentSlab = nextSlab.maxSales - totalPlotsSold;
  } else {
    remainingInCurrentSlab = 999; // Unlimited
  }

  return {
    currentSlabPercentage: totalPlotsSold === 0 ? 15.5 : currentSlab.percentage,
    nextSlabPercentage: nextSlab.percentage,
    remainingPlotsInCurrentSlab: remainingInCurrentSlab > 0 ? remainingInCurrentSlab : 0,
    nextSaleNumber,
    isPermanentSlab: totalPlotsSold >= 45
  };
}

/**
 * Calculate commission for a given sale value and sale number.
 */
export function calculateCustomerSaleCommission(saleValue: number, saleNumber: number) {
  const slab = getCustomerSlabForSaleNumber(saleNumber);
  const slabPercentage = slab.percentage;
  const commissionEarned = Math.round((saleValue * slabPercentage) / 100);

  return {
    saleNumber,
    slabPercentage,
    commissionEarned,
    slabLabel: slab.label
  };
}

// Initial Mock Seed Data
const INITIAL_CUSTOMER_RECORDS: CustomerRecord[] = [
  {
    id: 'CUST-1001',
    customerName: 'Rajesh Sharma',
    phone: '9876543210',
    email: 'rajesh.sharma@example.com',
    kycStatus: 'Verified',
    registrationDate: '2026-01-15',
    status: 'Active',
    purchasedPlot: {
      plotNo: 'C-101',
      plotSizeSqft: 900,
      ratePerSqft: 1000,
      totalPlotValue: 900000,
      purchaseDate: '2026-01-15',
      paymentStatus: 'Fully Paid'
    },
    totalPlotsSold: 4,
    currentSlabPercentage: 14.25,
    nextSlabPercentage: 14.25,
    remainingPlotsInCurrentSlab: 2,
    wallet: {
      availableBalance: 242750,
      pendingCommission: 0,
      paidCommission: 300000,
      totalCommissionEarned: 542750
    },
    salesLedger: [
      {
        id: 'SALE-C101',
        customerId: 'CUST-1001',
        date: '2026-02-10',
        buyerName: 'Vikram Singh',
        buyerPhone: '9811223344',
        plotNo: 'C-102',
        plotSizeSqft: 900,
        saleRatePerSqft: 1000,
        saleValue: 900000,
        saleNumber: 1,
        slabPercentage: 15.5,
        commissionEarned: 139500,
        paymentStatus: 'Credited'
      },
      {
        id: 'SALE-C102',
        customerId: 'CUST-1001',
        date: '2026-03-05',
        buyerName: 'Anita Gupta',
        buyerPhone: '9822334455',
        plotNo: 'C-103',
        plotSizeSqft: 900,
        saleRatePerSqft: 1000,
        saleValue: 900000,
        saleNumber: 2,
        slabPercentage: 15.0,
        commissionEarned: 135000,
        paymentStatus: 'Credited'
      },
      {
        id: 'SALE-C103',
        customerId: 'CUST-1001',
        date: '2026-04-12',
        buyerName: 'Suresh Patel',
        buyerPhone: '9833445566',
        plotNo: 'C-104',
        plotSizeSqft: 900,
        saleRatePerSqft: 1000,
        saleValue: 900000,
        saleNumber: 3,
        slabPercentage: 15.0,
        commissionEarned: 135000,
        paymentStatus: 'Credited'
      },
      {
        id: 'SALE-C104',
        customerId: 'CUST-1001',
        date: '2026-05-20',
        buyerName: 'Deepak Kumar',
        buyerPhone: '9844556677',
        plotNo: 'C-105',
        plotSizeSqft: 900,
        saleRatePerSqft: 1000,
        saleValue: 900000,
        saleNumber: 4,
        slabPercentage: 14.25,
        commissionEarned: 128250,
        paymentStatus: 'Credited'
      }
    ],
    withdrawalHistory: [
      {
        id: 'WD-C101',
        customerId: 'CUST-1001',
        customerName: 'Rajesh Sharma',
        requestDate: '2026-03-15',
        amount: 300000,
        paymentMethod: 'Bank Transfer',
        accountDetails: 'HDFC Bank - A/C: 501002349811 - IFSC: HDFC0001234',
        status: 'Approved',
        processedDate: '2026-03-16',
        transactionId: 'TXN-99881122'
      }
    ]
  },
  {
    id: 'CUST-1002',
    customerName: 'Meena Verma',
    phone: '9812345678',
    email: 'meena.verma@example.com',
    kycStatus: 'Verified',
    registrationDate: '2026-02-01',
    status: 'Active',
    purchasedPlot: {
      plotNo: 'D-201',
      plotSizeSqft: 900,
      ratePerSqft: 1000,
      totalPlotValue: 900000,
      purchaseDate: '2026-02-01',
      paymentStatus: 'EMI Active'
    },
    totalPlotsSold: 1,
    currentSlabPercentage: 15.5,
    nextSlabPercentage: 15.0,
    remainingPlotsInCurrentSlab: 2,
    wallet: {
      availableBalance: 139500,
      pendingCommission: 0,
      paidCommission: 0,
      totalCommissionEarned: 139500
    },
    salesLedger: [
      {
        id: 'SALE-C201',
        customerId: 'CUST-1002',
        date: '2026-03-22',
        buyerName: 'Praveen Yadav',
        buyerPhone: '9877889900',
        plotNo: 'D-202',
        plotSizeSqft: 900,
        saleRatePerSqft: 1000,
        saleValue: 900000,
        saleNumber: 1,
        slabPercentage: 15.5,
        commissionEarned: 139500,
        paymentStatus: 'Credited'
      }
    ],
    withdrawalHistory: []
  },
  {
    id: 'CUST-1003',
    customerName: 'Ramesh Chander',
    phone: '9988776655',
    email: 'ramesh.c@example.com',
    kycStatus: 'Verified',
    registrationDate: '2026-02-15',
    status: 'Active',
    purchasedPlot: {
      plotNo: 'E-301',
      plotSizeSqft: 900,
      ratePerSqft: 1000,
      totalPlotValue: 900000,
      purchaseDate: '2026-02-15',
      paymentStatus: 'Fully Paid'
    },
    totalPlotsSold: 0,
    currentSlabPercentage: 15.5,
    nextSlabPercentage: 15.5,
    remainingPlotsInCurrentSlab: 1,
    wallet: {
      availableBalance: 0,
      pendingCommission: 0,
      paidCommission: 0,
      totalCommissionEarned: 0
    },
    salesLedger: [],
    withdrawalHistory: []
  }
];

const CUSTOMER_STORAGE_KEY = 'vigya_customer_records_v1';

export function loadCustomerRecordsFromStorage(): CustomerRecord[] {
  try {
    const raw = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(INITIAL_CUSTOMER_RECORDS));
      return INITIAL_CUSTOMER_RECORDS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load customer records:', err);
    return INITIAL_CUSTOMER_RECORDS;
  }
}

export function saveCustomerRecordsToStorage(records: CustomerRecord[]) {
  try {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save customer records:', err);
  }
}

export function computeCustomerSystemSummary(records: CustomerRecord[]): CustomerSystemSummary {
  let totalCustomers = records.length;
  let activeCustomers = records.filter(r => r.status === 'Active').length;
  let totalPlotsSoldByCustomers = 0;
  let totalSalesVolume = 0;
  let totalCommissionEarned = 0;
  let totalCommissionPaid = 0;
  let totalPendingCommission = 0;
  let totalPendingWithdrawals = 0;

  for (const cust of records) {
    totalPlotsSoldByCustomers += cust.totalPlotsSold;
    totalCommissionEarned += cust.wallet.totalCommissionEarned;
    totalCommissionPaid += cust.wallet.paidCommission;
    totalPendingCommission += cust.wallet.pendingCommission;

    for (const sale of cust.salesLedger) {
      totalSalesVolume += sale.saleValue;
    }

    for (const wd of cust.withdrawalHistory) {
      if (wd.status === 'Pending') {
        totalPendingWithdrawals += wd.amount;
      }
    }
  }

  return {
    totalCustomers,
    activeCustomers,
    totalPlotsSoldByCustomers,
    totalSalesVolume,
    totalCommissionEarned,
    totalCommissionPaid,
    totalPendingCommission,
    totalPendingWithdrawals
  };
}
