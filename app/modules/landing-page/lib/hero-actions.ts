export type HeroAction = {
  label: string;
  to: string;
};

export type HeroActions = {
  primary: HeroAction;
  secondary: HeroAction;
};

export function heroActionsFor(signedIn: boolean): HeroActions {
  return {
    primary: { label: "Browse courses", to: "/courses" },
    secondary: signedIn
      ? { label: "Go to your dashboard", to: "/dashboard" }
      : { label: "Create a free account", to: "/signup" },
  };
}
