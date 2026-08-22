/**
 * Department and organization hierarchy definitions
 */

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  description: string;
  headEmployeeId: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'dept-eng',
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development, infrastructure, and technical architecture',
    headEmployeeId: 'DF-1001',
  },
  {
    id: 'dept-hr',
    name: 'Human Resources',
    code: 'HR',
    description: 'People operations, recruitment, and employee relations',
    headEmployeeId: 'DF-1002',
  },
  {
    id: 'dept-prod',
    name: 'Product & Design',
    code: 'PRD',
    description: 'Product strategy, UX/UI design, and user research',
    headEmployeeId: 'DF-1003',
  },
  {
    id: 'dept-fin',
    name: 'Finance & Accounts',
    code: 'FIN',
    description: 'Payroll processing, accounting, and compliance',
    headEmployeeId: 'DF-1004',
  },
  {
    id: 'dept-ops',
    name: 'Operations',
    code: 'OPS',
    description: 'Office management, logistics, and vendor management',
    headEmployeeId: 'DF-1005',
  },
];
