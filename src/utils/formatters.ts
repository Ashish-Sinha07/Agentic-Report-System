/**
 * Formatting utilities tailored for Sleepsia Supply Chain Control Tower
 * Primary Currency: INR (₹) - Indian Rupee
 */

export function formatINR(val: number, options?: { compact?: boolean; decimals?: number }): string {
  if (val === undefined || val === null || isNaN(val)) return '₹0';
  
  const compact = options?.compact ?? true;
  const decimals = options?.decimals ?? 1;

  if (compact) {
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 10000000) { // 1 Crore = 10,000,000
      return `${sign}₹${(abs / 10000000).toFixed(decimals)} Cr`;
    }
    if (abs >= 100000) { // 1 Lakh = 100,000
      return `${sign}₹${(abs / 100000).toFixed(decimals)} L`;
    }
    if (abs >= 1000) { // 1 Thousand
      return `${sign}₹${(abs / 1000).toFixed(decimals)}k`;
    }
    return `${sign}₹${abs.toFixed(0)}`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: options?.decimals ?? 0
  }).format(val);
}

export function formatUnits(units: number): string {
  if (units === undefined || units === null || isNaN(units)) return '0';
  return new Intl.NumberFormat('en-IN').format(Math.round(units));
}
