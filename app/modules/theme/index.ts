import { useEffect, useState } from "react";
import { browserPage, isDark, toggleTheme } from "./lib/theme";

export {
  applyTheme,
  toggleTheme,
  isDark,
  themeInitScript,
  type ThemePage,
} from "./lib/theme";

/**
 * Light or dark mode for the whole app. `isDark` starts false on the server
 * and picks up the page's theme once mounted; `toggle` flips it and keeps the
 * choice for the next visit, which `themeInitScript` in the document head
 * restores before the first paint.
 */
export function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDark(browserPage()));
  }, []);

  function toggle() {
    setDark(toggleTheme(browserPage()));
  }

  return { isDark: dark, toggle };
}
