import { Link } from "react-router";
import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useDarkMode } from "~/modules/theme";

const navLink =
  "whitespace-nowrap text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function LandingHeader({ signedIn }: { signedIn: boolean }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Cadence
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link to="/courses" className={navLink}>
            Courses
          </Link>
          <button
            onClick={toggle}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {signedIn ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link to="/login" className={navLink}>
                Log In
              </Link>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
