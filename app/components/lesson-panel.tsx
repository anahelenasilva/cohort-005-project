import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "~/components/ui/card";

/**
 * The shell shared by the panels a Student works in on the Lesson page (their
 * Note, and Questions & Discussion), so the two read as one set.
 */
export function LessonPanel({
  icon: Icon,
  title,
  description,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="mb-8 gap-0">
      <CardContent>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Icon className="size-5 text-primary" />
              <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {aside}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
