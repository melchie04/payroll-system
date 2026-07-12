/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { employees as initialEmployees, employeeDocuments as initialDocuments } from "../assets/data/index.js";

// Employees now live across three separate routes (list, profile, add/edit
// form), so their state has to live above all three instead of inside the
// list page's own useState — otherwise navigating away and back would lose
// any adds/edits/deletes. Same reasoning for documents (Upload/Delete on
// the profile page).
const EmployeesContext = createContext(null);

export function EmployeesProvider({ children }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [documents, setDocuments] = useState(initialDocuments);

  function addEmployee(data) {
    const newEmployee = { id: Date.now(), ...data };
    setEmployees((prev) => [...prev, newEmployee]);
    return newEmployee;
  }

  function updateEmployee(id, data) {
    setEmployees((prev) => prev.map((e) => (String(e.id) === String(id) ? { ...e, ...data } : e)));
  }

  function deleteEmployee(id) {
    setEmployees((prev) => prev.filter((e) => String(e.id) !== String(id)));
  }

  function getEmployeeById(id) {
    return employees.find((e) => String(e.id) === String(id));
  }

  function getDocumentsByEmployee(employeeId) {
    return documents.filter((d) => String(d.employeeId) === String(employeeId));
  }

  function addDocument(employeeId, doc) {
    setDocuments((prev) => [...prev, { id: Date.now(), employeeId: Number(employeeId), ...doc }]);
  }

  function deleteDocument(docId) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  const value = {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    documents,
    getDocumentsByEmployee,
    addDocument,
    deleteDocument,
  };

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
}

export function useEmployees() {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error("useEmployees must be used within an EmployeesProvider");
  return ctx;
}
