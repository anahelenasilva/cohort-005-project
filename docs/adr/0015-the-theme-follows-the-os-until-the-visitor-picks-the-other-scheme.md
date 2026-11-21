# The theme follows the OS until the visitor picks the other scheme

Ticket #4 reported an app in dark mode on a computer in light mode, and asked whether it shouldn't auto adjust. With no stored choice, the page takes the OS's colour scheme (`prefers-color-scheme`) before the first paint and keeps following it live while the page is open. The toggle stays a two-state light/dark button. Picking the scheme the OS is not using is remembered (`cadence-theme` holds `"dark"` or `"light"`) and wins over the OS from then on. Picking the scheme the OS already uses forgets the stored choice, so the page follows the OS again.

## Considered Options

- **Remember every toggle, as before.** Rejected: one click pins the theme for good, which is how the reporter ended up stuck in dark mode.
- **A three-way Light / Dark / System control.** Rejected for now: it changes the toggle in the sidebar and the landing header, and the two-state toggle can already return to following the OS.

## Consequences

A visitor who picks light on a light OS gets dark when the OS switches to dark at night. A `"dark"` or `"light"` stored before this change still wins over the OS until the visitor toggles once.
