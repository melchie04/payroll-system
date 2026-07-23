/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import { employees as initialEmployees, employeeDocuments as initialDocuments } from "../assets/data/index.js";

const EmployeesContext = createContext(null);

// EmployeesProvider — employees and employee documents state shared across the employee routes.
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

  // Archiving keeps the record so sheets that reference this person still resolve to
  // someone; hard delete is reserved for employees with no timesheet history.
  function archiveEmployee(id) {
    updateEmployee(id, { status: "Inactive" });
  }

  function restoreEmployee(id) {
    updateEmployee(id, { status: "Active" });
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

export function useEmployees() {
  const ctx = useContext(EmployeesContext);
  if (!ctx) throw new Error("useEmployees must be used within an EmployeesProvider");
  return ctx;
}
