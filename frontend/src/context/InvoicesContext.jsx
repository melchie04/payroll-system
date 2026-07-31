/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { invoices as initialInvoices } from "../assets/data/index.js";
import { parseCurrency } from "../utils/currency.js";

const InvoicesContext = createContext(null);

// nextInvoiceId — one past the highest number already issued, so deleting an invoice
// can never make the next one reuse a number that has been sent to a client.
function nextInvoiceId(list) {
  const highest = list.reduce((max, inv) => {
    const n = Number(String(inv.id).replace(/\D/g, ""));
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `INV-${highest + 1}`;
}

// InvoicesProvider — invoices shared across Billing, the invoice page, the client list
// and a client's profile, so an invoice raised on one screen is visible on all of them.
export function InvoicesProvider({ children }) {
  const [invoices, setInvoices] = useState(initialInvoices);

  function getInvoiceById(id) {
    return invoices.find((inv) => String(inv.id) === String(id));
  }

  // Invoices link to a client by its stable code, so renaming a client leaves every
  // invoice, outstanding total and billing history pointing at the right account.
  function invoicesForClient(clientCode) {
    return invoices.filter((inv) => inv.clientCode === clientCode);
  }

  function outstandingForClient(clientCode) {
    return invoicesForClient(clientCode)
      .filter((inv) => inv.status !== "Paid")
      .reduce((sum, inv) => sum + parseCurrency(inv.amount), 0);
  }

  function hasInvoices(clientCode) {
    return invoices.some((inv) => inv.clientCode === clientCode);
  }

  function addInvoice(data) {
    // Numbered once, so the record stored and the number handed back to the caller
    // for the audit entry are always the same one.
    const created = { id: nextInvoiceId(invoices), ...data };
    setInvoices((prev) => [created, ...prev]);
    return created;
  }

  function setInvoiceStatus(id, status) {
    setInvoices((prev) => prev.map((inv) => (String(inv.id) === String(id) ? { ...inv, status } : inv)));
  }

  const value = { invoices, getInvoiceById, invoicesForClient, outstandingForClient, hasInvoices, addInvoice, setInvoiceStatus };

  return <InvoicesContext.Provider value={value}>{children}</InvoicesContext.Provider>;
}

export function useInvoices() {
  const ctx = useContext(InvoicesContext);
  if (!ctx) {
    throw new Error("useInvoices must be used within an InvoicesProvider");
  }
  return ctx;
}
