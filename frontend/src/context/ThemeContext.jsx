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

    root.classList.add("theme-transition");
    void root.offsetWidth;
    root.setAttribute("data-bs-theme", theme);

    const id = window.setTimeout(() => root.classList.remove("theme-transition"), 300);
    return () => window.clearTimeout(id);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
