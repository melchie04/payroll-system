export function parseCurrency(str) {
  return Number(String(str).replace(/[₱,]/g, "")) || 0;
}

export function formatCurrency(num) {
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
