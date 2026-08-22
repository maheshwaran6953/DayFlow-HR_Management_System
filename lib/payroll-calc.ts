/**
 * Payroll breakdown calculation utility for monthly salary slips
 */

export interface SalaryBreakdown {
  monthlyGross: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  providentFund: number;
  professionalTax: number;
  incomeTaxTds: number;
  totalDeductions: number;
  netPayable: number;
}

export function calculateSalaryBreakdown(monthlyGross: number): SalaryBreakdown {
  const basicSalary = Math.round(monthlyGross * 0.50); // 50% Basic
  const hra = Math.round(basicSalary * 0.40);          // 40% of Basic
  const specialAllowance = Math.max(0, monthlyGross - basicSalary - hra);

  const providentFund = Math.min(Math.round(basicSalary * 0.12), 1800); // 12% PF capped at 1800
  const professionalTax = 200; // Flat monthly PT
  const incomeTaxTds = monthlyGross > 75000 ? Math.round(monthlyGross * 0.05) : 0;

  const totalDeductions = providentFund + professionalTax + incomeTaxTds;
  const netPayable = monthlyGross - totalDeductions;

  return {
    monthlyGross,
    basicSalary,
    hra,
    specialAllowance,
    providentFund,
    professionalTax,
    incomeTaxTds,
    totalDeductions,
    netPayable,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
