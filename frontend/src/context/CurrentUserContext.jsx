/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const CurrentUserContext = createContext(null);

const defaultUser = {
  name: "Admin",
  email: "admin@payrollsys.com",
  role: "Administrator",
  avatarColor: "#1a1a1a",
  avatarImage: null,
  mustChangePassword: true,
};

// CurrentUserProvider — current signed-in user state, editable from My Profile.
export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);

  function updateUser(data) {
    setUser((prev) => ({ ...prev, ...data }));
  }

  return <CurrentUserContext.Provider value={{ user, updateUser }}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
