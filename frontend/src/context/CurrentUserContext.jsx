// Holds the signed-in user's own profile.

import { createContext, useContext, useState } from "react";

const CurrentUserContext = createContext(null);

const defaultUser = {
  name: "Admin",
  email: "admin@payrollsys.com",
  role: "Administrator",
  avatarColor: "#121212",
  avatarImage: null,
  mustChangePassword: true,
};

// Holds the signed-in user's profile.
export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);

  // Merges changes into the signed-in user.
  function updateUser(data) {
    setUser((prev) => ({ ...prev, ...data }));
  }

  return <CurrentUserContext.Provider value={{ user, updateUser }}>{children}</CurrentUserContext.Provider>;
}

// Reads the signed-in user from context.
export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
