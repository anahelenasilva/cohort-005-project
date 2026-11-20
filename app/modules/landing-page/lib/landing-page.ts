import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { desc, eq, inArray, sql } from "drizzle-orm";
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

function lessonCountsFor(db: Db, courseIds: number[]) {
  if (courseIds.length === 0) return new Map<number, number>();
  const rows = db
    .select({ courseId: modules.courseId, count: sql<number>`count(*)` })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(inArray(modules.courseId, courseIds))
    .groupBy(modules.courseId)
    .all();
  return new Map(rows.map((row) => [row.courseId, row.count]));
}

function featuredCourses(db: Db): FeaturedCourse[] {
  const featured = db
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
    .all();
  const lessonCounts = lessonCountsFor(
    db,
    featured.map((course) => course.id)
  );
  return featured.map((course) => ({
    ...course,
    lessonCount: lessonCounts.get(course.id) ?? 0,
  }));
}

function stats(db: Db): LandingStats {
  const published = db
    .select({
      courses: sql<number>`count(*)`,
      instructors: sql<number>`count(distinct ${courses.instructorId})`,
    })
    .from(courses)
    .where(isPublished)
    .get();
  const publishedLessons = db
    .select({ count: sql<number>`count(*)` })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(isPublished)
    .get();
  const allCategories = db
    .select({ count: sql<number>`count(*)` })
    .from(categories)
    .get();

  return {
    courses: published?.courses ?? 0,
    lessons: publishedLessons?.count ?? 0,
    categories: allCategories?.count ?? 0,
    instructors: published?.instructors ?? 0,
  };
}

export function getLandingPage(db: Db): LandingPage {
  return {
    featuredCourses: featuredCourses(db),
    stats: stats(db),
  };
}
