// Holds the client roster and their documents.

import { useState } from "react";
import { clients as initialClients, clientDocuments as initialDocuments } from "../assets/data/index.js";
import { ClientsContext } from "./contexts.js";

// Holds the client roster and their documents.
export function ClientsProvider({ children }) {
  const [clients, setClients] = useState(initialClients);
  const [documents, setDocuments] = useState(initialDocuments);

  const clientNames = clients.map((c) => c.name);

  const activeClients = clients.filter((c) => c.status !== "Inactive");
  const activeClientNames = activeClients.map((c) => c.name);

  // Appends a client, giving it a fresh id.
  function addClient(data) {
    const newClient = { id: Date.now(), ...data };
    setClients((prev) => [...prev, newClient]);
    return newClient;
  }

  // Merges changes into the client with the matching id.
  function updateClient(id, data) {
    setClients((prev) => prev.map((c) => (String(c.id) === String(id) ? { ...c, ...data } : c)));
  }

  // Removes a client outright.
  function deleteClient(id) {
    setClients((prev) => prev.filter((c) => String(c.id) !== String(id)));
  }

  // Marks a client inactive without deleting them.
  function archiveClient(id) {
    updateClient(id, { status: "Inactive" });
  }

  // Returns an archived client to active.
  function restoreClient(id) {
    updateClient(id, { status: "Active" });
  }

  // Finds one client by id.
  function getClientById(id) {
    return clients.find((c) => String(c.id) === String(id));
  }

  // Finds one client by their short code.
  function getClientByCode(code) {
    return clients.find((c) => String(c.code) === String(code));
  }

  // Turns a client code into a display name, falling back to the code.
  function clientNameByCode(code) {
    return getClientByCode(code)?.name ?? code ?? "";
  }

  // Lists the documents filed against one client.
  function getDocumentsByClient(clientId) {
    return documents.filter((d) => String(d.clientId) === String(clientId));
  }

  // Files a document against a client.
  function addDocument(clientId, doc) {
    setDocuments((prev) => [...prev, { id: Date.now(), clientId: Number(clientId), ...doc }]);
  }

  // Removes a filed document.
  function deleteDocument(docId) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  const value = {
    clients,
    addClient,
    updateClient,
    deleteClient,
    archiveClient,
    restoreClient,
    getClientById,
    getClientByCode,
    clientNameByCode,
    clientNames,
    activeClients,
    activeClientNames,
    documents,
    getDocumentsByClient,
    addDocument,
    deleteDocument,
  };

  return <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>;
}
