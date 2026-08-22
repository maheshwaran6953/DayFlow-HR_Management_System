/**
 * CSV Export utility for attendance and payroll records
 */

export function convertToCSV<T extends Record<string, unknown>>(data: T[], headers: { key: keyof T; label: string }[]): string {
  if (!data || data.length === 0) return '';

  const headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
  const dataRows = data.map(item => {
    return headers.map(h => {
      const val = item[h.key];
      const stringVal = val === null || val === undefined ? '' : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}
