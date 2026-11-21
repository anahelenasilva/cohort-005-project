import { useEffect, useState } from "react";
import {
  browserPage,
  syncTheme,
  toggleTheme,
  watchSystemTheme,
} from "./lib/theme";

export {
  applyTheme,
  toggleTheme,
  isDark,
  syncTheme,
  watchSystemTheme,
  themeInitScript,
  type SystemScheme,
  type ThemePage,
} from "./lib/theme";

/**
 * Light or dark mode for the whole app. The page follows the OS's colour
 * scheme, live, until the visitor picks the other one with `toggle`; picking
 * the OS's scheme again goes back to following it. `isDark` starts false on
 * the server and picks up the page's theme once mounted. `themeInitScript` in
 * the document head applies the same rule before the first paint.
 */
export function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const page = browserPage();
    setDark(syncTheme(page));
    return watchSystemTheme(page, setDark);
  }, []);

  function toggle() {
    setDark(toggleTheme(browserPage()));
  }

  return { isDark: dark, toggle };
}
