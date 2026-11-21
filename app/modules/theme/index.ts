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
  type ThemePage,
} from "./lib/theme";

/**
 * Light or dark mode for the whole app, following
 * docs/adr/0015-the-theme-follows-the-os-until-the-visitor-picks-the-other-scheme.md.
 * `isDark` starts false on the server and picks up the page's theme once
 * mounted. `themeInitScript` in the document head applies the same rule
 * before the first paint.
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
