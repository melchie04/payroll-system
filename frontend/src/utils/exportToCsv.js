// Turns rows of data into a downloadable CSV file.

// Builds a CSV from the rows and triggers the browser download.
export function exportToCsv(filename, headers, rows) {
  // Quotes a value so commas and quotes inside it survive the CSV.
  function escapeCell(value) {
    const str = String(value ?? "");
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
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
