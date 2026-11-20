import type { Route } from "./+types/home";
import { DevUI } from "~/components/dev-ui";
import { getCurrentUserId, getDevCountry } from "~/lib/session";
import { getCountryTierInfo, COUNTRIES } from "~/lib/ppp";
import { devUi } from "~/modules/dev-ui/index.server";
import { heroActions } from "~/modules/landing-page";
import { landingPage } from "~/modules/landing-page/index.server";
import { LandingHeader } from "./home/landing-header";
import { Hero } from "./home/hero";
import { StatsBand } from "./home/stats-band";
import { FeaturedCourses } from "./home/featured-courses";
import { LandingFooter } from "./home/landing-footer";

export function meta() {
  return [
    { title: "Cadence — Learn at your own pace" },
    {
      name: "description",
      content:
        "A modern course platform for developers. Browse courses, track your progress, and learn at your own pace.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { featuredCourses, stats } = landingPage.get();
  const { users, currentUser } = devUi.people(await getCurrentUserId(request));
  const devCountry = await getDevCountry(request);

  return {
    featuredCourses,
    stats,
    users,
    currentUser,
    devCountry,
    countryTierInfo: getCountryTierInfo(devCountry),
    countries: COUNTRIES,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featuredCourses, stats, currentUser } = loaderData;
  const signedIn = currentUser !== null;

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader signedIn={signedIn} />
      <Hero actions={heroActions(signedIn)} courses={featuredCourses} />
      <StatsBand stats={stats} />
      {featuredCourses.length > 0 && (
        <FeaturedCourses courses={featuredCourses} />
      )}
      <LandingFooter signedIn={signedIn} />
      <DevUI
        users={loaderData.users}
        currentUser={currentUser}
        devCountry={loaderData.devCountry}
        countryTierInfo={loaderData.countryTierInfo}
        countries={loaderData.countries}
      />
    </div>
  );
}
