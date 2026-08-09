export type ManagerRole =
  | 'Super Admin'
  | 'Admin Manager'
  | 'HR Manager'
  | 'Sales Manager'
  | 'Expense Manager'
  | 'Loan Manager'
  | 'Liability Manager'
  | 'Real Estate Manager'
  | 'Investor Manager'
  | 'Finance Manager'
  | 'Accounts Manager'
  | 'Customer Support Manager'
  | 'Marketing Manager'
  | 'Media & Content Manager'
  | 'Legal Manager'
  | 'Training Manager'
  | 'Employee Manager'
  | 'Agent Manager'
  | 'Data Entry Manager';

export type ManagerStatus = 'Active' | 'Inactive' | 'Pending Approval' | 'Suspended';

export type PermissionCategoryKey =
  | 'User Management'
  | 'Employee Management'
  | 'Agent Management'
  | 'Customer Management'
  | 'Investor Management'
  | 'Real Estate Management'
  | 'Finance & Accounts'
  | 'Marketing'
  | 'Media & Content'
  | 'Loan & Liability'
  | 'Legal & RERA'
  | 'Training & Onboarding'
  | 'Customer Support'
  | 'Data Entry & Audit';

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  isHighRisk?: boolean;
}

export interface PermissionCategoryDefinition {
  category: PermissionCategoryKey;
  description: string;
  iconName: string;
  permissions: PermissionDefinition[];
}

export interface PermissionManager {
  id: string;
  managerId: string; // e.g., "VPM-PM-2026-001"
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: ManagerRole;
  department: string;
  status: ManagerStatus;
  permissions: Record<PermissionCategoryKey, string[]>; // Category -> Array of allowed permission keys
  lastLogin: string;
  createdBy: string;
  createdAt: string;
  is2FAEnabled: boolean;
  sessionTimeoutMinutes: number;
  allowedIpRanges?: string[];
  expiryDate?: string;
}

export interface PermissionAuditLog {
  id: string;
  timestamp: string;
  assignedBy: string; // e.g. "Prabhat Gautam (Super Admin)"
  assignedToName: string;
  assignedToRole: ManagerRole;
  actionType:
    | 'Create Manager'
    | 'Grant Permission'
    | 'Modify Permission'
    | 'Revoke Permission'
    | 'Suspend Manager'
    | 'Reactivate Manager'
    | '2FA Toggle'
    | 'Emergency Revoke'
    | 'Delete Manager';
  category: string;
  changesDescription: string;
  ipAddress: string;
  deviceInfo: string;
  status: 'Success' | 'Warning' | 'Revoked';
}

export interface RoleTemplate {
  id: string;
  role: ManagerRole;
  department: string;
  description: string;
  recommendedPermissions: Record<PermissionCategoryKey, string[]>;
  badgeColor: string;
}
