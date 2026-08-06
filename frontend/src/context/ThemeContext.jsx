// Holds the light/dark choice and applies it to the document.

import { useEffect, useRef, useState } from "react";
import { ThemeContext } from "./contexts.js";

// Holds the light/dark choice and writes it onto the document element.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const firstRender = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("theme", theme);

    if (firstRender.current) {
      firstRender.current = false;
      root.setAttribute("data-bs-theme", theme);
      return;
    }

    // Writes the theme onto the document element.
    const apply = () => root.setAttribute("data-bs-theme", theme);

    // A view transition cross-fades two rendered snapshots of the page, so nothing
    // interpolates its own colours and no surface passes through a mid grey.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && typeof document.startViewTransition === "function") {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
