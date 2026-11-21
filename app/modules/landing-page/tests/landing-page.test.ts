import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import * as schema from "~/db/schema";
import { CourseStatus, UserRole } from "~/db/schema";
import { markdown } from "~/lib/text";
import { createLandingPage } from "../index.server";

let db: TestDb;
let base: ReturnType<typeof seedBaseData>;

beforeEach(() => {
  db = createTestDb();
  base = seedBaseData(db);
});

// ─── Fixtures ───

let counter = 0;

function addInstructor(name: string) {
  counter++;
  return db
    .insert(schema.users)
    .values({
      name,
      email: `instructor-${counter}@example.com`,
      role: UserRole.Instructor,
    })
    .returning()
    .get();
}

function addCategory(name: string) {
  counter++;
  return db
    .insert(schema.categories)
    .values({ name, slug: `category-${counter}` })
    .returning()
    .get();
}

function addCourse(
  title: string,
  options: {
    status?: CourseStatus;
    createdAt?: string;
    instructorId?: number;
    categoryId?: number;
  } = {}
) {
  counter++;
  return db
    .insert(schema.courses)
    .values({
      title,
      slug: `course-${counter}`,
      description: `About ${title}`,
      salesCopy: markdown(`## ${title}`),
      instructorId: options.instructorId ?? base.instructor.id,
      categoryId: options.categoryId ?? base.category.id,
      status: options.status ?? CourseStatus.Published,
      coverImageUrl: `/images/${counter}.svg`,
      ...(options.createdAt ? { createdAt: options.createdAt } : {}),
    })
    .returning()
    .get();
}

function addLessons(courseId: number, perModule: number[]) {
  perModule.forEach((count, moduleIndex) => {
    const mod = db
      .insert(schema.modules)
      .values({
        courseId,
        title: `Module ${moduleIndex}`,
        position: moduleIndex,
      })
      .returning()
      .get();
    for (let i = 0; i < count; i++) {
      db.insert(schema.lessons)
        .values({ moduleId: mod.id, title: `Lesson ${i}`, position: i })
        .run();
    }
  });
}

function get() {
  return createLandingPage(db).get();
}

// ─── Featured courses ───

describe("featured courses", () => {
  it("lists a published course with its instructor, category and cover", () => {
    const [course] = get().featuredCourses;

    expect(course).toEqual({
      id: base.course.id,
      title: "Test Course",
      slug: "test-course",
      description: "A test course",
      coverImageUrl: null,
      instructorName: "Test Instructor",
      categoryName: "Programming",
      lessonCount: 0,
    });
  });

  it("shows the three newest published courses, newest first", () => {
    db.update(schema.courses)
      .set({ createdAt: "2025-01-01T00:00:00.000Z" })
      .run();
    addCourse("Oldest", { createdAt: "2026-01-01T00:00:00.000Z" });
    addCourse("Newest", { createdAt: "2026-04-01T00:00:00.000Z" });
    addCourse("Middle", { createdAt: "2026-03-01T00:00:00.000Z" });
    addCourse("Second", { createdAt: "2026-03-15T00:00:00.000Z" });

    const titles = get().featuredCourses.map((course) => course.title);

    expect(titles).toEqual(["Newest", "Second", "Middle"]);
  });

  it("leaves out drafts and archived courses", () => {
    addCourse("Draft", { status: CourseStatus.Draft });
    addCourse("Archived", { status: CourseStatus.Archived });

    const titles = get().featuredCourses.map((course) => course.title);

    expect(titles).toEqual(["Test Course"]);
  });

  it("counts lessons across every module of the course", () => {
    addLessons(base.course.id, [2, 3]);
    const other = addCourse("Other", { createdAt: "2000-01-01T00:00:00.000Z" });
    addLessons(other.id, [4]);

    const counts = Object.fromEntries(
      get().featuredCourses.map((course) => [course.title, course.lessonCount])
    );

    expect(counts).toEqual({ "Test Course": 5, Other: 4 });
  });

  it("is empty when nothing is published", () => {
    db.update(schema.courses).set({ status: CourseStatus.Draft }).run();

    expect(get().featuredCourses).toEqual([]);
  });
});

// ─── Stats ───

describe("stats", () => {
  it("counts the seeded platform", () => {
    expect(get().stats).toEqual({
      courses: 1,
      lessons: 0,
      categories: 1,
      instructors: 1,
    });
  });

  it("counts every published course, beyond the three featured", () => {
    for (let i = 0; i < 5; i++) addCourse(`Course ${i}`);

    expect(get().stats.courses).toBe(6);
  });

  it("counts only lessons and instructors of published courses", () => {
    addLessons(base.course.id, [2, 1]);
    const drafter = addInstructor("Drafty Dan");
    const draft = addCourse("Draft", {
      status: CourseStatus.Draft,
      instructorId: drafter.id,
    });
    addLessons(draft.id, [7]);

    const { lessons, instructors, courses } = get().stats;

    expect({ lessons, instructors, courses }).toEqual({
      lessons: 3,
      instructors: 1,
      courses: 1,
    });
  });

  it("counts an instructor with several courses once", () => {
    const second = addInstructor("Second Instructor");
    addCourse("A");
    addCourse("B", { instructorId: second.id });
    addCourse("C", { instructorId: second.id });

    expect(get().stats.instructors).toBe(2);
  });

  it("counts every category, empty ones included", () => {
    addCategory("Design");
    addCategory("Data");

    expect(get().stats.categories).toBe(3);
  });
});
