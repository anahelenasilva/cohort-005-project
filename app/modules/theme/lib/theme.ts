const STORAGE_KEY = "cadence-theme-choice";
const DARK_CLASS = "dark";
const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

/** The operating system's colour scheme, as `matchMedia` reports it. */
type SystemScheme = {
  readonly matches: boolean;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
};

export type ThemePage = {
  root: { classList: Pick<DOMTokenList, "contains" | "toggle"> };
  storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">;
  system: SystemScheme;
};

export function browserPage(): ThemePage {
  return {
    root: document.documentElement,
    storage: () => localStorage,
    system: matchMedia(SYSTEM_DARK_QUERY),
  };
}

export function isDark(page: ThemePage): boolean {
  return page.root.classList.contains(DARK_CLASS);
}

/** The scheme the visitor chose explicitly, or null when they follow the OS. */
function storedChoice(page: ThemePage): boolean | null {
  try {
    const stored = page.storage().getItem(STORAGE_KEY);
    if (stored === "dark") return true;
    if (stored === "light") return false;
  } catch {}
  return null;
}

/**
 * Puts the page in the visitor's explicit choice if they made one, otherwise
 * in the OS's scheme. Returns whether the page is now dark.
 */
function syncTheme(page: ThemePage): boolean {
  const dark = storedChoice(page) ?? page.system.matches;
  page.root.classList.toggle(DARK_CLASS, dark);
  return dark;
}

/** Switches the page to `dark`; docs/adr/0015 says when the choice is remembered. */
export function applyTheme(dark: boolean, page: ThemePage) {
  page.root.classList.toggle(DARK_CLASS, dark);
  try {
    if (dark === page.system.matches) page.storage().removeItem(STORAGE_KEY);
    else page.storage().setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {}
}

/** Flips the page between light and dark, and returns whether it is now dark. */
export function toggleTheme(page: ThemePage): boolean {
  const dark = !isDark(page);
  applyTheme(dark, page);
  return dark;
}

/**
 * Puts the page in the theme it should have now, then keeps it there as the OS
 * switches scheme. Calls `onChange` with whether the page is dark, once now
 * and again after each switch. Returns a function that stops following.
 */
export function followTheme(
  page: ThemePage,
  onChange: (dark: boolean) => void
): () => void {
  const listener = () => onChange(syncTheme(page));
  listener();
  page.system.addEventListener("change", listener);
  return () => page.system.removeEventListener("change", listener);
}

export const themeInitScript = `
(function() {
  var stored = null;
  try {
    stored = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
  } catch (e) {}
  var dark = stored === "dark";
  if (stored !== "dark" && stored !== "light") {
    try {
      dark = matchMedia(${JSON.stringify(SYSTEM_DARK_QUERY)}).matches;
    } catch (e) {}
  }
  if (dark) {
    document.documentElement.classList.add(${JSON.stringify(DARK_CLASS)});
  }
})();
`;
