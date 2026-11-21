import { db } from "~/db";
import { getDevUiPeople, type Db } from "./lib/dev-ui";

export type { DevPerson, DevUiPeople } from "./lib/dev-ui";

/**
 * The people the DevUI panel switches between, bound to a database. The app
 * uses `devUi`; tests build their own against a test database.
 */
export function createDevUi(database: Db) {
  return {
    /**
     * Everyone, by id, to pick from, and the Person signed in now, or null
     * when nobody is or the id names nobody. Each is just id, name and role.
     */
    people(currentUserId: number | null) {
      return getDevUiPeople(database, currentUserId);
    },
  };
}

export const devUi = /* @__PURE__ */ createDevUi(db);
