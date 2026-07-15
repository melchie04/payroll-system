/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

// There's no real authentication in this prototype (Login accepts anything
// and just navigates to "/"), so there's no actual logged-in user to read
// from a session. This context represents "whoever is using the app right
// now" — seeded with the same Admin identity used elsewhere (Settings'
// system users, Activity Log), editable from the My Profile page, and read
// by TopNav so the header reflects it live instead of a hardcoded "Admin".
const CurrentUserContext = createContext(null);

const defaultUser = {
  name: "Admin",
  email: "admin@payrollsys.com",
  role: "Administrator",
  avatarColor: "#1a1a1a",
  avatarImage: null, // data URL once a photo is uploaded, otherwise initials
};

export function CurrentUserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);

  function updateUser(data) {
    setUser((prev) => ({ ...prev, ...data }));
  }

  return (
    <CurrentUserContext.Provider value={{ user, updateUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
