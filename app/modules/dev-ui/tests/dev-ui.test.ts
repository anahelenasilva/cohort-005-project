import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import { UserRole } from "~/db/schema";
import { createDevUi } from "../index.server";

let db: TestDb;
let base: ReturnType<typeof seedBaseData>;

beforeEach(() => {
  db = createTestDb();
  base = seedBaseData(db);
});

describe("people", () => {
  it("lists everyone by id with just their name and role", () => {
    const { users } = createDevUi(db).people(null);

    expect(users).toEqual([
      { id: base.user.id, name: "Test User", role: UserRole.Student },
      {
        id: base.instructor.id,
        name: "Test Instructor",
        role: UserRole.Instructor,
      },
    ]);
  });

  it("names the Person signed in", () => {
    const { currentUser } = createDevUi(db).people(base.instructor.id);

    expect(currentUser).toEqual({
      id: base.instructor.id,
      name: "Test Instructor",
      role: UserRole.Instructor,
    });
  });

  it("has no current Person when nobody is signed in", () => {
    expect(createDevUi(db).people(null).currentUser).toBeNull();
  });

  it("has no current Person when the session names nobody", () => {
    expect(createDevUi(db).people(9999).currentUser).toBeNull();
  });
});
