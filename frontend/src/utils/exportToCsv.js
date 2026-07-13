// Builds a CSV file from headers + row arrays and triggers a download.
// Plain Blob + anchor click — no library needed, works in every modern
// browser. Used by the "Export as CSV" option wherever ExportMenu appears.
export function exportToCsv(filename, headers, rows) {
  function escapeCell(value) {
    const str = String(value ?? "");
    // Quote any cell containing a comma, quote, or newline, and escape
    // internal quotes by doubling them — standard CSV escaping.
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  // Leading BOM so Excel opens the ₱ symbol (and other non-ASCII text)
  // correctly instead of showing mojibake.
  const csvContent = "\uFEFF" + lines.join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
