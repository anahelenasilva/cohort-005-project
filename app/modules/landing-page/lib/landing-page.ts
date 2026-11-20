import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { desc, eq, sql } from "drizzle-orm";
import * as schema from "~/db/schema";
import {
  categories,
  courses,
  CourseStatus,
  lessons,
  modules,
  users,
} from "~/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export const FEATURED_COURSE_COUNT = 3;

export type FeaturedCourse = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  instructorName: string;
  categoryName: string;
  lessonCount: number;
};

export type LandingStats = {
  courses: number;
  lessons: number;
  categories: number;
  instructors: number;
};

export type LandingPage = {
  featuredCourses: FeaturedCourse[];
  stats: LandingStats;
};

const isPublished = eq(courses.status, CourseStatus.Published);

function lessonCountsByCourse(db: Db) {
  const rows = db
    .select({ courseId: modules.courseId, count: sql<number>`count(*)` })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .groupBy(modules.courseId)
    .all();
  return new Map(rows.map((row) => [row.courseId, row.count]));
}

function featuredCourses(db: Db, lessonCounts: Map<number, number>) {
  return db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      coverImageUrl: courses.coverImageUrl,
      instructorName: users.name,
      categoryName: categories.name,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(isPublished)
    .orderBy(desc(courses.createdAt), desc(courses.id))
    .limit(FEATURED_COURSE_COUNT)
    .all()
    .map((course) => ({
      ...course,
      lessonCount: lessonCounts.get(course.id) ?? 0,
    }));
}

function stats(db: Db, lessonCounts: Map<number, number>): LandingStats {
  const published = db
    .select({ id: courses.id, instructorId: courses.instructorId })
    .from(courses)
    .where(isPublished)
    .all();

  return {
    courses: published.length,
    lessons: published.reduce(
      (total, course) => total + (lessonCounts.get(course.id) ?? 0),
      0
    ),
    categories: db.select({ id: categories.id }).from(categories).all().length,
    instructors: new Set(published.map((course) => course.instructorId)).size,
  };
}

export function getLandingPage(db: Db): LandingPage {
  const lessonCounts = lessonCountsByCourse(db);
  return {
    featuredCourses: featuredCourses(db, lessonCounts),
    stats: stats(db, lessonCounts),
  };
}
