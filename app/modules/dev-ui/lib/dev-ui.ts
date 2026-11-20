import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import type * as schema from "~/db/schema";
import { users, type UserRole } from "~/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export type DevPerson = {
  id: number;
  name: string;
  role: UserRole;
};

export type DevUiPeople = {
  users: DevPerson[];
  currentUser: DevPerson | null;
};

const devPerson = { id: users.id, name: users.name, role: users.role };

export function getDevUiPeople(
  db: Db,
  currentUserId: number | null
): DevUiPeople {
  const everyone = db.select(devPerson).from(users).orderBy(users.id).all();
  const currentUser =
    currentUserId === null
      ? undefined
      : db
          .select(devPerson)
          .from(users)
          .where(eq(users.id, currentUserId))
          .get();
  return { users: everyone, currentUser: currentUser ?? null };
}
