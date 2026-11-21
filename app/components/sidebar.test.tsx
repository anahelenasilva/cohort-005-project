import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { Sidebar } from "~/components/sidebar";

const longTitle = "Design Systems with Tailwind and a Very Long Subtitle";

function renderRecentCourses() {
  return renderToStaticMarkup(
    <MemoryRouter>
      <Sidebar
        currentUser={null}
        recentCourses={[
          {
            courseId: 1,
            title: longTitle,
            slug: "design-systems-with-tailwind",
            coverImageUrl: null,
            completedLessons: 4,
            totalLessons: 9,
            progress: 44,
          },
        ]}
      />
    </MemoryRouter>
  );
}

describe("Sidebar recent courses", () => {
  it("wraps a long course title to two lines instead of cutting it to one", () => {
    const html = renderRecentCourses();
    const titleDiv = html.match(/<div class="([^"]*)">[^<]*Design Systems/);

    expect(titleDiv?.[1]).toContain("line-clamp-2");
    expect(titleDiv?.[1]).not.toContain("truncate");
  });

  it("puts the full course title on the link as a tooltip", () => {
    const html = renderRecentCourses();

    const link = html.match(
      /<a [^>]*href="\/courses\/design-systems-with-tailwind"[^>]*>/
    );

    expect(link?.[0]).toContain(`title="${longTitle}"`);
  });
});
