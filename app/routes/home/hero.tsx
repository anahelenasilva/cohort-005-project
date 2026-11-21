import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CourseImage } from "~/components/course-image";
import type { HeroActions } from "~/modules/landing-page";
import type { FeaturedCourse } from "~/modules/landing-page/index.server";

export function Hero({
  actions,
  courses,
}: {
  actions: HeroActions;
  courses: FeaturedCourse[];
}) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Learn to code,
          <br />
          <span className="text-muted-foreground">at your own pace.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Structured courses built by experienced instructors. Track your
          progress, take quizzes, and build real-world skills.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link to={actions.primary.to}>
              {actions.primary.label}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={actions.secondary.to}>{actions.secondary.label}</Link>
          </Button>
        </div>
      </div>
      {courses.length > 0 && <CoverStack courses={courses} />}
    </section>
  );
}

const FAN = [
  "z-30",
  "z-20 hidden translate-x-10 -translate-y-8 rotate-3 opacity-90 lg:block",
  "z-10 hidden translate-x-20 -translate-y-16 rotate-6 opacity-75 lg:block",
];

function CoverStack({ courses }: { courses: FeaturedCourse[] }) {
  return (
    <div className="relative max-w-sm lg:h-80 lg:max-w-none" aria-hidden="true">
      {courses.slice(0, FAN.length).map((course, index) => (
        <div
          key={course.id}
          className={`overflow-hidden rounded-xl border border-border bg-card shadow-lg lg:absolute lg:bottom-0 lg:left-0 lg:w-4/5 ${FAN[index]}`}
        >
          <CourseImage
            src={course.coverImageUrl}
            alt=""
            className="aspect-video w-full object-cover"
          />
          <div className="px-4 py-3">
            <p className="truncate text-sm font-semibold">{course.title}</p>
            <p className="text-xs text-muted-foreground">
              {course.instructorName} · {course.lessonCount} lessons
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
