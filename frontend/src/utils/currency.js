// Reads and writes peso amounts.

// Reads a peso string back into a number.
export function parseCurrency(str) {
  return Number(String(str).replace(/[₱,]/g, "")) || 0;
}

// Formats a number as pesos with two decimal places.
export function formatCurrency(num) {
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
