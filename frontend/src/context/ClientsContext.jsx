/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { clients as initialClients, clientDocuments as initialDocuments } from "../assets/data/index.js";

const ClientsContext = createContext(null);

// ClientsProvider — clients and client documents state shared across the client routes.
export function ClientsProvider({ children }) {
  const [clients, setClients] = useState(initialClients);
  const [documents, setDocuments] = useState(initialDocuments);

  // Live list of client names for the dropdowns that still key on the name
  // (timesheets, invoices, payroll). Rebuilds whenever clients change.
  const clientNames = clients.map((c) => c.name);

  function addClient(data) {
    const newClient = { id: Date.now(), billing: "₱0.00", ...data };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }

  function updateClient(id, data) {
    setClients((prev) => prev.map((c) => (String(c.id) === String(id) ? { ...c, ...data } : c)));
  }

  function deleteClient(id) {
    setClients((prev) => prev.filter((c) => String(c.id) !== String(id)));
  }

  function getClientById(id) {
    return clients.find((c) => String(c.id) === String(id));
  }

  function getClientByCode(code) {
    return clients.find((c) => String(c.code) === String(code));
  }

  // Employees link to their client by this stable code, so a client can be renamed
  // without breaking the link. Falls back to the code itself if nothing matches.
  function clientNameByCode(code) {
    return getClientByCode(code)?.name ?? code ?? "";
  }

  function getDocumentsByClient(clientId) {
    return documents.filter((d) => String(d.clientId) === String(clientId));
  }

  function addDocument(clientId, doc) {
    setDocuments((prev) => [...prev, { id: Date.now(), clientId: Number(clientId), ...doc }]);
  }

  function deleteDocument(docId) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  const value = {
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    getClientByCode,
    clientNameByCode,
    clientNames,
    documents,
    getDocumentsByClient,
    addDocument,
    deleteDocument,
  };

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) {
    throw new Error("useClients must be used within a ClientsProvider");
  }
  return ctx;
}
