// Parses a formatted peso string ("₱65,000.00") into a number.
export function parseCurrency(str) {
  return Number(String(str).replace(/[₱,]/g, "")) || 0;
}

// Formats a number as a peso currency string.
export function formatCurrency(num) {
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
