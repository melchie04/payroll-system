// Holds the employee roster and their documents.

import { createContext, useContext, useState } from "react";
import { employees as initialEmployees, employeeDocuments as initialDocuments } from "../assets/data/index.js";

const EmployeesContext = createContext(null);

// Holds the employee roster and their documents.
export function EmployeesProvider({ children }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [documents, setDocuments] = useState(initialDocuments);

  // Appends an employee, giving them a fresh id.
  function addEmployee(data) {
    const newEmployee = { id: Date.now(), ...data };
    setEmployees((prev) => [...prev, newEmployee]);
    return newEmployee;
  }

  // Merges changes into the employee with the matching id.
  function updateEmployee(id, data) {
    setEmployees((prev) => prev.map((e) => (String(e.id) === String(id) ? { ...e, ...data } : e)));
  }

  // Removes an employee outright.
  function deleteEmployee(id) {
    setEmployees((prev) => prev.filter((e) => String(e.id) !== String(id)));
  }

  // Marks an employee inactive without deleting them.
  function archiveEmployee(id) {
    updateEmployee(id, { status: "Inactive" });
  }

  // Returns an archived employee to active.
  function restoreEmployee(id) {
    updateEmployee(id, { status: "Active" });
  }

  // Finds one employee by id.
  function getEmployeeById(id) {
    return employees.find((e) => String(e.id) === String(id));
  }

  // Lists the documents filed against one employee.
  function getDocumentsByEmployee(employeeId) {
    return documents.filter((d) => String(d.employeeId) === String(employeeId));
  }

  // Files a document against an employee.
  function addDocument(employeeId, doc) {
    setDocuments((prev) => [...prev, { id: Date.now(), employeeId: Number(employeeId), ...doc }]);
  }

  // Removes a filed document.
  function deleteDocument(docId) {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  }

  const value = {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    archiveEmployee,
    restoreEmployee,
    getEmployeeById,
    documents,
    getDocumentsByEmployee,
    addDocument,
    deleteDocument,
  };

  return <EmployeesContext.Provider value={value}>{children}</EmployeesContext.Provider>;
}

// Reads the employee roster from context.
export function useEmployees() {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error("useEmployees must be used within an EmployeesProvider");
  return ctx;
}
