/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";

// ThemeProvider — light/dark theme state, persisted to localStorage.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );
  const firstRender = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("theme", theme);

    // Skip the first run so the theme doesn't animate on initial load.
    if (firstRender.current) {
      firstRender.current = false;
      root.setAttribute("data-bs-theme", theme);
      return;
    }

    // Animate the swap for every element, but only for its duration, so hover,
    // focus and normal interactions are never affected. The reflow registers the
    // transition before the colours change, so the swap eases instead of snapping.
    root.classList.add("theme-transition");
    void root.offsetWidth;
    root.setAttribute("data-bs-theme", theme);

    const id = window.setTimeout(
      () => root.classList.remove("theme-transition"),
      300,
    );
    return () => window.clearTimeout(id);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside a ThemeProvider");
  return ctx;
}
