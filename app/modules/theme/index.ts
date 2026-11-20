import { useEffect, useState } from "react";
import { applyTheme, browserPage, isDark } from "./lib/theme";

export {
  applyTheme,
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
    const next = !dark;
    setDark(next);
    applyTheme(next, browserPage());
  }

  return { isDark: dark, toggle };
}
