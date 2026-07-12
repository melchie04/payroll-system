/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { clients as initialClients, clientDocuments as initialDocuments } from "../assets/data/index.js";

// Same reasoning as EmployeesContext: clients now live across three
// separate routes (list, profile, add/edit form), so their state has to
// live above all three instead of inside the list page's own useState —
// otherwise navigating away and back would lose any adds/edits/deletes.
const ClientsContext = createContext(null);

export function ClientsProvider({ children }) {
  const [clients, setClients] = useState(initialClients);
  const [documents, setDocuments] = useState(initialDocuments);

  function addClient(data) {
    const newClient = { id: Date.now(), employees: 0, billing: "₱0.00", ...data };
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
