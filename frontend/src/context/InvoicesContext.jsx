// Holds invoices and what each client still owes.

import { createContext, useContext, useState } from "react";
import { invoices as initialInvoices } from "../assets/data/index.js";
import { parseCurrency } from "../utils/currency.js";

const InvoicesContext = createContext(null);

// Builds the next invoice number from the highest one already used.
function nextInvoiceId(list) {
  const highest = list.reduce((max, inv) => {
    const n = Number(String(inv.id).replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `INV-${highest + 1}`;
}

// Holds every invoice raised so far.
export function InvoicesProvider({ children }) {
  const [invoices, setInvoices] = useState(initialInvoices);

  // Finds one invoice by id.
  function getInvoiceById(id) {
    return invoices.find((inv) => String(inv.id) === String(id));
  }

  // Lists the invoices belonging to one client.
  function invoicesForClient(clientCode) {
    return invoices.filter((inv) => inv.clientCode === clientCode);
  }

  // Totals what a client still owes across unpaid invoices.
  function outstandingForClient(clientCode) {
    return invoicesForClient(clientCode)
      .filter((inv) => inv.status !== "Paid")
      .reduce((sum, inv) => sum + parseCurrency(inv.amount), 0);
  }

  // Says whether a client has been invoiced for a period yet.
  function hasInvoices(clientCode) {
    return invoices.some((inv) => inv.clientCode === clientCode);
  }

  // Raises a new invoice and returns it.
  function addInvoice(data) {
    const created = { id: nextInvoiceId(invoices), ...data };
    setInvoices((prev) => [created, ...prev]);
    return created;
  }

  // Moves one invoice to a new status.
  function setInvoiceStatus(id, status) {
    setInvoices((prev) => prev.map((inv) => (String(inv.id) === String(id) ? { ...inv, status } : inv)));
  }

  const value = { invoices, getInvoiceById, invoicesForClient, outstandingForClient, hasInvoices, addInvoice, setInvoiceStatus };

  return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
}

// Reads the invoice list from context.
export function useInvoices() {
  const ctx = useContext(InvoicesContext);
  if (!ctx) {
    throw new Error("useInvoices must be used within an InvoicesProvider");
  }
  return ctx;
}
