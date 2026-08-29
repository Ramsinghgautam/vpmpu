import { formatINR } from './calculators';

export type PayoutUserCategory = 'Customer' | 'Agent' | 'Investor' | 'Risk-Free Investor';

export interface PayoutTenureOption {
  months: number;
  years: number;
  label: string;
  shortLabel: string;
}

export const PAYOUT_TENURE_OPTIONS: PayoutTenureOption[] = [
  { months: 12, years: 1, label: '1 Year (12 Months)', shortLabel: '12M' },
  { months: 24, years: 2, label: '2 Years (24 Months)', shortLabel: '24M' },
  { months: 36, years: 3, label: '3 Years (36 Months)', shortLabel: '36M' },
  { months: 48, years: 4, label: '4 Years (48 Months)', shortLabel: '48M' },
  { months: 50, years: 4.2, label: '4.2 Years (50 Months)', shortLabel: '50M' },
  { months: 60, years: 5, label: '5 Years (60 Months)', shortLabel: '60M' },
  { months: 72, years: 6, label: '6 Years (72 Months)', shortLabel: '72M' },
  { months: 84, years: 7, label: '7 Years (84 Months)', shortLabel: '84M' },
  { months: 96, years: 8, label: '8 Years (96 Months)', shortLabel: '96M' },
  { months: 108, years: 9, label: '9 Years (108 Months)', shortLabel: '108M' },
  { months: 120, years: 10, label: '10 Years (120 Months)', shortLabel: '120M' },
];

export interface PayoutScheduleInstallment {
  monthIndex: number;
  monthLabel: string;
  dueDate: string;
  monthlyPayout: number;
  cumulativePaid: number;
  remainingBalance: number;
  status: 'Disbursed' | 'Upcoming' | 'Processing';
}

export interface PayoutCalculationInput {
  totalPayout: number;
  emiTenureMonths: number;
  userCategory: PayoutUserCategory;
  startDate?: string;
}

export interface PayoutCalculationOutput {
  isValid: boolean;
  validationMessage?: string;
  totalPayout: number;
  emiTenureMonths: number;
  tenureYears: number;
  tenureLabel: string;
  monthlyPayout: number;
  userCategory: PayoutUserCategory;
  formattedTotalPayout: string;
  formattedMonthlyPayout: string;
  schedule: PayoutScheduleInstallment[];
}

export interface PayoutEntity {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userType: PayoutUserCategory;
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

/**
 * Validates and Calculates EMI Tenure-Based Distributed Payout
 * Formula: Monthly Payout = Total Payout ÷ Total EMI Months
 */
export function calculateDistributedPayout(input: PayoutCalculationInput): PayoutCalculationOutput {
  const { totalPayout, emiTenureMonths, userCategory, startDate } = input;

  // Validation: Check for non-negative total payout
  if (typeof totalPayout !== 'number' || isNaN(totalPayout) || totalPayout < 0) {
    return {
      isValid: false,
      validationMessage: 'Payout amount cannot be negative or invalid.',
      totalPayout: 0,
      emiTenureMonths: 0,
      tenureYears: 0,
      tenureLabel: 'No Tenure Selected',
      monthlyPayout: 0,
      userCategory,
      formattedTotalPayout: formatINR(0),
      formattedMonthlyPayout: formatINR(0),
      schedule: [],
    };
  }

  // Validation: Check for positive, non-zero tenure (prevent division by zero)
  if (!emiTenureMonths || emiTenureMonths <= 0) {
    return {
      isValid: false,
      validationMessage: 'Please select an EMI tenure to view payout distribution.',
      totalPayout,
      emiTenureMonths: 0,
      tenureYears: 0,
      tenureLabel: 'No Tenure Selected',
      monthlyPayout: 0,
      userCategory,
      formattedTotalPayout: formatINR(totalPayout),
      formattedMonthlyPayout: '—',
      schedule: [],
    };
  }

  // Pure mathematical division
  const monthlyPayout = Math.round(totalPayout / emiTenureMonths);
  const tenureYears = Number((emiTenureMonths / 12).toFixed(1));
  const tenureMatched = PAYOUT_TENURE_OPTIONS.find((t) => t.months === emiTenureMonths);
  const tenureLabel = tenureMatched
    ? tenureMatched.label
    : `${tenureYears} Years (${emiTenureMonths} Months)`;

  // Generate complete distributed monthly schedule
  const schedule: PayoutScheduleInstallment[] = [];
  const baseDate = startDate ? new Date(startDate) : new Date();
  let cumulativePaid = 0;

  for (let i = 1; i <= emiTenureMonths; i++) {
    const installmentDate = new Date(baseDate);
    installmentDate.setMonth(installmentDate.getMonth() + i);

    // Adjust last month for precise rounding balance
    const currentMonthPayout =
      i === emiTenureMonths
        ? Math.max(0, totalPayout - cumulativePaid)
        : monthlyPayout;

    cumulativePaid += currentMonthPayout;
    const remainingBalance = Math.max(0, totalPayout - cumulativePaid);

    schedule.push({
      monthIndex: i,
      monthLabel: `Month ${i} / ${emiTenureMonths}`,
      dueDate: installmentDate.toISOString().split('T')[0],
      monthlyPayout: currentMonthPayout,
      cumulativePaid,
      remainingBalance,
      status: i === 1 ? 'Disbursed' : 'Upcoming',
    });
  }

  return {
    isValid: true,
    totalPayout,
    emiTenureMonths,
    tenureYears,
    tenureLabel,
    monthlyPayout,
    userCategory,
    formattedTotalPayout: formatINR(totalPayout),
    formattedMonthlyPayout: formatINR(monthlyPayout),
    schedule,
  };
}

/**
 * Helper to generate CSV export rows for Payouts
 */
export function generatePayoutsCsv(payouts: PayoutEntity[]): string {
  const headers = [
    'Payout ID',
    'User Name',
    'Phone',
    'User Type',
    'Total Payout (INR)',
    'EMI Tenure (Months)',
    'Monthly Payout (INR)',
    'Total Disbursed (INR)',
    'Remaining Balance (INR)',
    'Status',
    'Last Disbursed Date',
    'Next Due Date',
  ].join(',');

  const rows = payouts.map((p) =>
    [
      `"${p.id}"`,
      `"${p.userName}"`,
      `"${p.userPhone}"`,
      `"${p.userType}"`,
      p.totalPayout,
      p.emiTenureMonths,
      p.monthlyPayout,
      p.totalDisbursed,
      p.remainingBalance,
      `"${p.status}"`,
      `"${p.lastDisbursedDate || 'N/A'}"`,
      `"${p.nextDisbursementDate || 'N/A'}"`,
    ].join(',')
  );

  return [headers, ...rows].join('\n');
}
