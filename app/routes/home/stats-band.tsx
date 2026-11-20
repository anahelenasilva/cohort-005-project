import { BookOpen, GraduationCap, Users } from "lucide-react";

export function StatsBand({
  totalCourses,
  totalCategories,
}: {
  totalCourses: number;
  totalCategories: number;
}) {
  return (
    <section className="border-y border-border bg-muted/50 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 sm:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="size-6 text-primary" />
          </div>
          <p className="text-2xl font-bold">{totalCourses}</p>
          <p className="text-sm text-muted-foreground">Available Courses</p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="size-6 text-primary" />
          </div>
          <p className="text-2xl font-bold">{totalCategories}</p>
          <p className="text-sm text-muted-foreground">Categories</p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-6 text-primary" />
          </div>
          <p className="text-2xl font-bold">Self-paced</p>
          <p className="text-sm text-muted-foreground">
            Learn on your schedule
          </p>
        </div>
      </div>
    </section>
  );
}
