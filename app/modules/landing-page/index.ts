import { heroActionsFor, type HeroActions } from "./lib/hero-actions";

export type { HeroAction, HeroActions } from "./lib/hero-actions";

/**
 * The two calls to action in the landing page hero. Everyone gets "Browse
 * courses"; the second one sends a visitor to sign up and a signed-in user
 * to their dashboard.
 */
export function heroActions(signedIn: boolean): HeroActions {
  return heroActionsFor(signedIn);
}
