import { describe, it, expect } from "vitest";
import { heroActions } from "../index";

describe("heroActions", () => {
  it("sends someone not signed in to browse courses or sign up", () => {
    expect(heroActions(false)).toEqual({
      primary: { label: "Browse courses", to: "/courses" },
      secondary: { label: "Create a free account", to: "/signup" },
    });
  });

  it("sends a Person to browse courses or their dashboard", () => {
    expect(heroActions(true)).toEqual({
      primary: { label: "Browse courses", to: "/courses" },
      secondary: { label: "Go to your dashboard", to: "/dashboard" },
    });
  });
});
