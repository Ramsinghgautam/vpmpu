/**
 * Employee Point-Based Promotion, Honorarium & Work-From-Home Management Engine
 *
 * POINT ALLOCATION SYSTEM:
 * - Agent Joining = 1 Point
 * - Customer Joining = 2 Points
 * - Investor Joining = 3 Points
 * - Risk-Free Investor Joining = 4 Points
 *
 * WORK FROM HOME POLICY:
 * - 0 to 600 points = "Work From Home Eligible" (Home-Based Employee)
 * - 601+ points = "Office / Department Assigned Employee" (Office-Based Employee)
 */

export interface PromotionTier {
  level: number;
  minPoints: number;
  designationHindi: string;
  designationEnglish: string;
  monthlyHonorarium: number;
  department: string;
}

export const PROMOTION_TIERS_HIERARCHY: PromotionTier[] = [
  { level: 1, minPoints: 23, designationHindi: 'तृतीया श्रेणी प्रोडक्ट विक्रय', designationEnglish: '3rd Grade Product Sales Executive', monthlyHonorarium: 3000, department: 'Product Sales' },
  { level: 2, minPoints: 68, designationHindi: 'द्वितीय श्रेणी प्रोडक्ट विक्रय', designationEnglish: '2nd Grade Product Sales Executive', monthlyHonorarium: 4500, department: 'Product Sales' },
  { level: 3, minPoints: 201, designationHindi: 'प्रथम श्रेणी प्रोडक्ट विक्रय', designationEnglish: '1st Grade Product Sales Executive', monthlyHonorarium: 6000, department: 'Product Sales' },
  { level: 4, minPoints: 601, designationHindi: 'प्रोडक्ट विक्रय', designationEnglish: 'Product Sales Officer', monthlyHonorarium: 10000, department: 'Product Sales & Operations' },
  { level: 5, minPoints: 1100, designationHindi: 'सेवा (Service)', designationEnglish: 'Service & Support Officer', monthlyHonorarium: 15000, department: 'Service & Support' },
  { level: 6, minPoints: 1800, designationHindi: 'मानव संसाधन (HR)', designationEnglish: 'Human Resources (HR) Officer', monthlyHonorarium: 20000, department: 'Human Resources' },
  { level: 7, minPoints: 2600, designationHindi: 'मार्केटिंग / विपणन', designationEnglish: 'Marketing & Sales Officer', monthlyHonorarium: 25000, department: 'Marketing & Branding' },
  { level: 8, minPoints: 3500, designationHindi: 'रख-रखाव (Maintenance)', designationEnglish: 'Maintenance & Infrastructure Manager', monthlyHonorarium: 30000, department: 'Maintenance & Infrastructure' },
  { level: 9, minPoints: 4500, designationHindi: 'प्रोडक्ट उत्पादन', designationEnglish: 'Product Production Lead', monthlyHonorarium: 35000, department: 'Product Production' },
  { level: 10, minPoints: 5600, designationHindi: 'प्रबंधन (Management)', designationEnglish: 'Executive Management Officer', monthlyHonorarium: 40000, department: 'Executive Management' },
  { level: 11, minPoints: 6800, designationHindi: 'रिसर्च / विचारण', designationEnglish: 'Research & Strategy Officer', monthlyHonorarium: 45000, department: 'Research & Development' },
  { level: 12, minPoints: 8100, designationHindi: 'वित्तपोषण', designationEnglish: 'Corporate Finance Officer', monthlyHonorarium: 50000, department: 'Finance & Accounts' },
  { level: 13, minPoints: 9500, designationHindi: 'निवेशन', designationEnglish: 'Investment Planning Strategy Head', monthlyHonorarium: 55000, department: 'Investment Planning' },
  { level: 14, minPoints: 11000, designationHindi: 'पूंजी प्रबंधन', designationEnglish: 'Capital Management Lead', monthlyHonorarium: 60000, department: 'Capital Treasury' },
  { level: 15, minPoints: 12600, designationHindi: 'सम्पत्ति प्रबंधन', designationEnglish: 'Asset Management Director', monthlyHonorarium: 65000, department: 'Asset & Real Estate' },
  { level: 16, minPoints: 14300, designationHindi: 'बौद्धिक संपदा प्रबंधन', designationEnglish: 'Intellectual Property Chief', monthlyHonorarium: 70000, department: 'Intellectual Property & Legal' },
];

export interface PointBreakdown {
  agentJoinings: number;
  customerJoinings: number;
  investorJoinings: number;
  riskFreeInvestorJoinings: number;
  agentPoints: number;
  customerPoints: number;
  investorPoints: number;
  riskFreeInvestorPoints: number;
  totalPoints: number;
  monthlyPoints: number;
  quarterlyPoints: number;
  sixMonthlyPoints: number;
  yearlyPoints: number;
}

export interface EmployeePromotionCalculation {
  totalPoints: number;
  pointBreakdown: PointBreakdown;
  currentTier: PromotionTier | null;
  nextTier: PromotionTier | null;
  designationHindi: string;
  designationEnglish: string;
  monthlyHonorarium: number;
  department: string;
  workStatusCategory: 'Work From Home Eligible' | 'Office / Department Assigned Employee';
  workLocationType: 'Home-Based Employee' | 'Office-Based Employee';
  isWfhEligible: boolean;
  pointsToNextPromotion: number;
  progressPercentToNextLevel: number;
  reportingManager: string;
}

/**
 * Calculate total points based on verified joinings
 */
export function calculateEmployeePoints(
  agentJoinings: number,
  customerJoinings: number,
  investorJoinings: number,
  riskFreeInvestorJoinings: number,
  monthlyPoints: number = 0,
  quarterlyPoints: number = 0,
  sixMonthlyPoints: number = 0,
  yearlyPoints: number = 0
): PointBreakdown {
  const agentPoints = agentJoinings * 1;
  const customerPoints = customerJoinings * 2;
  const investorPoints = investorJoinings * 3;
  const riskFreeInvestorPoints = riskFreeInvestorJoinings * 4;

  const totalPoints = agentPoints + customerPoints + investorPoints + riskFreeInvestorPoints;

  return {
    agentJoinings,
    customerJoinings,
    investorJoinings,
    riskFreeInvestorJoinings,
    agentPoints,
    customerPoints,
    investorPoints,
    riskFreeInvestorPoints,
    totalPoints,
    monthlyPoints: monthlyPoints || Math.round(totalPoints * 0.25),
    quarterlyPoints: quarterlyPoints || Math.round(totalPoints * 0.55),
    sixMonthlyPoints: sixMonthlyPoints || Math.round(totalPoints * 0.82),
    yearlyPoints: yearlyPoints || totalPoints
  };
}

/**
 * Evaluate Promotion, Honorarium & Work-From-Home Status for an Employee
 */
export function evaluateEmployeePromotionStatus(
  agentJoinings: number,
  customerJoinings: number,
  investorJoinings: number,
  riskFreeInvestorJoinings: number,
  reportingManagerStr: string = 'Prabhat Gautam (VPM Executive Director)'
): EmployeePromotionCalculation {
  const pointBreakdown = calculateEmployeePoints(agentJoinings, customerJoinings, investorJoinings, riskFreeInvestorJoinings);
  const totalPoints = pointBreakdown.totalPoints;

  // Determine achieved tier
  let currentTier: PromotionTier | null = null;
  let nextTier: PromotionTier | null = PROMOTION_TIERS_HIERARCHY[0];

  for (let i = 0; i < PROMOTION_TIERS_HIERARCHY.length; i++) {
    if (totalPoints >= PROMOTION_TIERS_HIERARCHY[i].minPoints) {
      currentTier = PROMOTION_TIERS_HIERARCHY[i];
      nextTier = PROMOTION_TIERS_HIERARCHY[i + 1] || null;
    } else {
      if (!currentTier) {
        nextTier = PROMOTION_TIERS_HIERARCHY[i];
      }
      break;
    }
  }

  // Designation & Honorarium
  const designationHindi = currentTier ? currentTier.designationHindi : 'प्रारंभिक प्रशिक्षु';
  const designationEnglish = currentTier ? currentTier.designationEnglish : 'Junior Trainee Associate';
  const monthlyHonorarium = currentTier ? currentTier.monthlyHonorarium : 0;
  const department = currentTier ? currentTier.department : 'Field Operations & Training';

  // Work From Home Policy Formula:
  // If Total Points < 601 => Work From Home Eligible (Home-Based Employee)
  // If Total Points >= 601 => Office / Department Assigned Employee (Office-Based Employee)
  const isWfhEligible = totalPoints < 601;
  const workStatusCategory: EmployeePromotionCalculation['workStatusCategory'] = isWfhEligible
    ? 'Work From Home Eligible'
    : 'Office / Department Assigned Employee';

  const workLocationType: EmployeePromotionCalculation['workLocationType'] = isWfhEligible
    ? 'Home-Based Employee'
    : 'Office-Based Employee';

  // Points required for next level
  let pointsToNextPromotion = 0;
  let progressPercentToNextLevel = 100;

  if (nextTier) {
    const prevMin = currentTier ? currentTier.minPoints : 0;
    pointsToNextPromotion = Math.max(0, nextTier.minPoints - totalPoints);
    const totalRange = nextTier.minPoints - prevMin;
    const gained = totalPoints - prevMin;
    progressPercentToNextLevel = Math.min(100, Math.max(0, Math.round((gained / totalRange) * 100)));
  }

  return {
    totalPoints,
    pointBreakdown,
    currentTier,
    nextTier,
    designationHindi,
    designationEnglish,
    monthlyHonorarium,
    department,
    workStatusCategory,
    workLocationType,
    isWfhEligible,
    pointsToNextPromotion,
    progressPercentToNextLevel,
    reportingManager: reportingManagerStr
  };
}

export interface EmployeeRecord {
  id: string;
  name: string;
  phone: string;
  joiningDate: string;
  agentJoinings: number;
  customerJoinings: number;
  investorJoinings: number;
  riskFreeInvestorJoinings: number;
  monthlyHonorariumReceived: number;
  pendingHonorarium: number;
  honorariumStatus: 'Paid' | 'Approved' | 'Pending' | 'Processing' | 'Hold' | 'Cancelled';
  bankAccount: string;
  ifscCode: string;
  kycVerified: boolean;
}

export interface PointLedgerEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  category: 'Agent' | 'Customer' | 'Investor' | 'Risk-Free Investor' | 'Point Reversal' | 'Manual Bonus';
  points: number;
  referenceName: string;
  date: string;
  status: 'Approved' | 'Reversed' | 'Pending Approval';
  notes: string;
}

export interface HonorariumSlip {
  slipNo: string;
  monthYear: string;
  employeeId: string;
  employeeName: string;
  designationHindi: string;
  designationEnglish: string;
  department: string;
  totalPoints: number;
  honorariumAmount: number;
  paymentMethod: string;
  utrTransactionId: string;
  disbursementDate: string;
  status: 'Paid' | 'Approved' | 'Pending' | 'Processing' | 'Hold';
}
