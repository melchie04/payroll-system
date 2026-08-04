// Holds the signed-in user's own profile.

import { useState } from "react";
import { CurrentUserContext } from "./contexts.js";

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
