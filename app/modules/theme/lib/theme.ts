const STORAGE_KEY = "cadence-theme";
const DARK_CLASS = "dark";

export type ThemePage = {
  root: { classList: Pick<DOMTokenList, "contains" | "toggle"> };
  storage: () => Pick<Storage, "setItem">;
};

export function browserPage(): ThemePage {
  return { root: document.documentElement, storage: () => localStorage };
}

export function isDark(page: ThemePage): boolean {
  return page.root.classList.contains(DARK_CLASS);
}

export function applyTheme(dark: boolean, page: ThemePage) {
  page.root.classList.toggle(DARK_CLASS, dark);
  try {
    page.storage().setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {}
}

/** Flips the page between light and dark, and returns whether it is now dark. */
export function toggleTheme(page: ThemePage): boolean {
  const dark = !isDark(page);
  applyTheme(dark, page);
  return dark;
}

export const themeInitScript = `
(function() {
  try {
    if (localStorage.getItem(${JSON.stringify(STORAGE_KEY)}) === "dark") {
      document.documentElement.classList.add(${JSON.stringify(DARK_CLASS)});
    }
  } catch (e) {}
})();
`;
