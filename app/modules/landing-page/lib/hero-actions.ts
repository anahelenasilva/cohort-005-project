export type HeroAction = {
  label: string;
  to: string;
};

export type HeroActions = {
  primary: HeroAction;
  secondary: HeroAction;
};

/**
 * The two calls to action in the landing page hero. Everyone gets "Browse
 * courses"; the second one sends someone who is not signed in to sign up, and
 * a Person to their dashboard.
 */
export function heroActions(signedIn: boolean): HeroActions {
  return {
    primary: { label: "Browse courses", to: "/courses" },
    secondary: signedIn
      ? { label: "Go to your dashboard", to: "/dashboard" }
      : { label: "Create a free account", to: "/signup" },
  };
}
