import { describe, it, expect, vi } from "vitest";
import {
  applyTheme,
  followTheme,
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
    systemDark?: boolean;
  } = {}
) {
  const classes = new Set<string>(options.dark ? ["dark"] : []);
  const stored = new Map<string, string>();
  if (options.stored) stored.set("cadence-theme-choice", options.stored);
  const storage = {
    getItem: (key: string) => stored.get(key) ?? null,
    setItem: (key: string, value: string) => void stored.set(key, value),
    removeItem: (key: string) => void stored.delete(key),
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
  const listeners = new Set<() => void>();
  const system = {
    matches: options.systemDark ?? false,
    addEventListener: (type: string, listener: () => void) => {
      if (type === "change") listeners.add(listener);
    },
    removeEventListener: (type: string, listener: () => void) => {
      if (type === "change") listeners.delete(listener);
    },
  };
  function switchSystem(dark: boolean) {
    system.matches = dark;
    for (const listener of listeners) listener();
  }
  const page: ThemePage = {
    root: { classList },
    storage: () => {
      if (options.storageThrows) throw new Error("storage blocked");
      return storage;
    },
    system,
  };
  return { page, classes, stored, storage, classList, listeners, switchSystem };
}

/** Starts following the theme and returns whether the page came up dark. */
function startFollowing(page: ThemePage): boolean {
  const onChange = vi.fn();
  followTheme(page, onChange);
  expect(onChange).toHaveBeenCalledTimes(1);
  return onChange.mock.calls[0][0];
}

function runInitScript(
  fake: ReturnType<typeof fakePage>,
  options: { storageThrows?: boolean; matchMediaThrows?: boolean } = {}
) {
  const localStorage = options.storageThrows
    ? {
        getItem: () => {
          throw new Error("storage blocked");
        },
      }
    : fake.storage;
  const matchMedia = (query: string) => {
    if (options.matchMediaThrows) throw new Error("no matchMedia");
    expect(query).toBe("(prefers-color-scheme: dark)");
    return { matches: fake.page.system.matches };
  };
  new Function("localStorage", "document", "matchMedia", themeInitScript)(
    localStorage,
    { documentElement: { classList: fake.classList } },
    matchMedia
  );
}

describe("applyTheme", () => {
  it("remembers dark when the OS is light", () => {
    const fake = fakePage({ systemDark: false });

    applyTheme(true, fake.page);

    expect(isDark(fake.page)).toBe(true);
    expect(fake.stored.get("cadence-theme-choice")).toBe("dark");
  });

  it("remembers light when the OS is dark", () => {
    const fake = fakePage({ dark: true, systemDark: true });

    applyTheme(false, fake.page);

    expect(isDark(fake.page)).toBe(false);
    expect(fake.stored.get("cadence-theme-choice")).toBe("light");
  });

  it("forgets the choice when it matches the OS", () => {
    const fake = fakePage({ systemDark: false });
    applyTheme(true, fake.page);

    applyTheme(false, fake.page);

    expect(isDark(fake.page)).toBe(false);
    expect(fake.stored.has("cadence-theme-choice")).toBe(false);
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
    expect(fake.stored.get("cadence-theme-choice")).toBe("dark");
  });

  it("turns a dark page light and remembers it", () => {
    const fake = fakePage({ dark: true, systemDark: true });

    expect(toggleTheme(fake.page)).toBe(false);
    expect(isDark(fake.page)).toBe(false);
    expect(fake.stored.get("cadence-theme-choice")).toBe("light");
  });
});

describe("followTheme, as it starts", () => {
  it("follows a dark OS when nothing is remembered", () => {
    const fake = fakePage({ systemDark: true });

    expect(startFollowing(fake.page)).toBe(true);
    expect(isDark(fake.page)).toBe(true);
  });

  it("follows a light OS when nothing is remembered", () => {
    const fake = fakePage({ dark: true, systemDark: false });

    expect(startFollowing(fake.page)).toBe(false);
    expect(isDark(fake.page)).toBe(false);
  });

  it("keeps a remembered dark over a light OS", () => {
    const fake = fakePage({ systemDark: false });
    applyTheme(true, fake.page);
    fake.classes.clear();

    expect(startFollowing(fake.page)).toBe(true);
  });

  it("keeps a remembered light over a dark OS", () => {
    const fake = fakePage({ dark: true, systemDark: true });
    applyTheme(false, fake.page);
    fake.classes.add("dark");

    expect(startFollowing(fake.page)).toBe(false);
  });

  it("ignores a value it did not write", () => {
    const fake = fakePage({ stored: "purple", systemDark: true });

    expect(startFollowing(fake.page)).toBe(true);
  });

  it("follows a light OS over a dark saved before it followed the OS", () => {
    const fake = fakePage({ dark: true, systemDark: false });
    fake.stored.set("cadence-theme", "dark");

    expect(startFollowing(fake.page)).toBe(false);
  });

  it("follows the OS when storage is blocked", () => {
    const fake = fakePage({ storageThrows: true, systemDark: true });

    expect(startFollowing(fake.page)).toBe(true);
  });
});

describe("followTheme, as the OS switches", () => {
  it("follows the OS as it switches", () => {
    const fake = fakePage({ systemDark: false });
    const onChange = vi.fn();
    followTheme(fake.page, onChange);

    fake.switchSystem(true);
    expect(isDark(fake.page)).toBe(true);
    expect(onChange).toHaveBeenLastCalledWith(true);

    fake.switchSystem(false);
    expect(isDark(fake.page)).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps an explicit choice when the OS switches", () => {
    const fake = fakePage({ systemDark: true });
    applyTheme(false, fake.page);
    const onChange = vi.fn();
    followTheme(fake.page, onChange);

    fake.switchSystem(false);
    fake.switchSystem(true);

    expect(isDark(fake.page)).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });

  it("stops watching when told to", () => {
    const fake = fakePage({ systemDark: false });
    const onChange = vi.fn();
    const stop = followTheme(fake.page, onChange);

    stop();
    fake.switchSystem(true);

    expect(fake.listeners.size).toBe(0);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(isDark(fake.page)).toBe(false);
  });
});

describe("themeInitScript", () => {
  it("restores a remembered dark theme over a light OS", () => {
    const fake = fakePage({ systemDark: false });
    applyTheme(true, fake.page);
    fake.classes.clear();

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(true);
  });

  it("keeps a remembered light theme over a dark OS", () => {
    const fake = fakePage({ dark: true, systemDark: true });
    applyTheme(false, fake.page);

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(false);
  });

  it("follows a dark OS when nothing is remembered", () => {
    const fake = fakePage({ systemDark: true });

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(true);
  });

  it("follows a light OS when nothing is remembered", () => {
    const fake = fakePage({ systemDark: false });

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(false);
  });

  it("follows the OS over a value it did not write", () => {
    const fake = fakePage({ stored: "purple", systemDark: true });

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(true);
  });

  it("follows a light OS over a dark saved before it followed the OS", () => {
    const fake = fakePage({ systemDark: false });
    fake.stored.set("cadence-theme", "dark");

    runInitScript(fake);

    expect(fake.classes.has("dark")).toBe(false);
  });

  it("follows the OS when storage is blocked", () => {
    const fake = fakePage({ systemDark: true });

    runInitScript(fake, { storageThrows: true });

    expect(fake.classes.has("dark")).toBe(true);
  });

  it("stays light when neither storage nor matchMedia works", () => {
    const fake = fakePage({ systemDark: true });

    runInitScript(fake, { storageThrows: true, matchMediaThrows: true });

    expect(fake.classes.has("dark")).toBe(false);
  });
});
