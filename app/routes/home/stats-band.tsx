import { BookOpen, GraduationCap, Layers, PlayCircle } from "lucide-react";
import type { LandingStats } from "~/modules/landing-page/index.server";

export function StatsBand({ stats }: { stats: LandingStats }) {
  const items = [
    { icon: BookOpen, value: stats.courses, label: "Courses" },
    { icon: PlayCircle, value: stats.lessons, label: "Lessons" },
    { icon: Layers, value: stats.categories, label: "Categories" },
    { icon: GraduationCap, value: stats.instructors, label: "Instructors" },
  ];

  return (
    <section className="border-y border-border bg-muted/50">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 lg:grid-cols-4">
        {items.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-6 text-primary" />
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="text-2xl font-bold">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
