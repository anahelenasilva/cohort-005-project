import { describe, it, expect } from "vitest";
import {
  applyTheme,
  isDark,
  themeInitScript,
  toggleTheme,
  type ThemePage,
} from "../index";

function fakePage(
  options: {
    dark?: boolean;
    stored?: string | null;
    storageThrows?: boolean;
  } = {}
) {
  const classes = new Set<string>(options.dark ? ["dark"] : []);
  const stored = new Map<string, string>();
  if (options.stored) stored.set("cadence-theme", options.stored);
  const storage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => void stored.set(key, value),
  };
  const classList = {
    contains: (name: string) => classes.has(name),
    toggle: (name: string, force?: boolean) => {
      if (force) classes.add(name);
      else classes.delete(name);
      return classes.has(name);
    },
    add: (name: string) => void classes.add(name),
  };
  const page: ThemePage = {
    root: { classList },
    storage: () => {
      if (options.storageThrows) throw new Error("storage blocked");
      return storage;
    },
  };
  return { page, classes, stored, storage, classList };
}

function runInitScript(fake: ReturnType<typeof fakePage>, throws = false) {
  const localStorage = throws
    ? {
        getItem: () => {
          throw new Error("storage blocked");
        },
      }
    : fake.storage;
  new Function("localStorage", "document", themeInitScript)(localStorage, {
    documentElement: { classList: fake.classList },
  });
}

describe("applyTheme", () => {
  it("turns dark mode on and remembers it", () => {
    const fake = fakePage();

    applyTheme(true, fake.page);

    expect(isDark(fake.page)).toBe(true);
    expect(fake.stored.get("cadence-theme")).toBe("dark");
  });

  it("turns dark mode off and remembers it", () => {
    const fake = fakePage({ dark: true });

    applyTheme(false, fake.page);

    expect(isDark(fake.page)).toBe(false);
    expect(fake.stored.get("cadence-theme")).toBe("light");
  });

  it("still switches when storage is blocked", () => {
    const fake = fakePage({ storageThrows: true });

    applyTheme(true, fake.page);

    expect(isDark(fake.page)).toBe(true);
  });
});

describe("toggleTheme", () => {
  it("turns a light page dark and remembers it", () => {
    const fake = fakePage();

    expect(toggleTheme(fake.page)).toBe(true);
    expect(isDark(fake.page)).toBe(true);
    expect(fake.stored.get("cadence-theme")).toBe("dark");
  });

  it("turns a dark page light and remembers it", () => {
    const fake = fakePage({ dark: true });

    expect(toggleTheme(fake.page)).toBe(false);
    expect(isDark(fake.page)).toBe(false);
    expect(fake.stored.get("cadence-theme")).toBe("light");
  });
});

describe("themeInitScript", () => {
  it("restores a remembered dark theme", () => {
    const fake = fakePage({ stored: "dark" });

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(true);
  });

  it("leaves a remembered light theme light", () => {
    const fake = fakePage({ stored: "light" });

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(false);
  });

  it("restores what applyTheme remembered", () => {
    const fake = fakePage();
    applyTheme(true, fake.page);
    fake.classes.clear();

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(true);
  });

  it("stays light when storage is blocked", () => {
    const fake = fakePage();

    runInitScript(fake, true);

    expect(fake.classes.has("dark")).toBe(false);
  });
});
