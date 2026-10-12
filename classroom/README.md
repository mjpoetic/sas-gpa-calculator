# Classroom Studio preview

Open `/classroom/` on the same host as the honors calculator (or `/classroom/index.html`). There is intentionally no link in the main site's navigation. The page asks search engines not to index it. This is an **unlisted preview, not an authenticated private area**: anyone with the URL can open it.

For local use, run `python3 -m http.server 4173` at the repository root, then open `http://localhost:4173/classroom/`.

## First version

- Multiple named classrooms, with duplication and browser-local autosave.
- Student desks, double desks, four-seat group and round tables, teacher desks, boards, bookshelves, doors, rugs, and labels.
- Pointer dragging, grid snapping, rotation, resizing, numerical positioning, keyboard movement, and zoom.
- Rows, groups, and horseshoe presets; presets keep the roster and replace furniture.
- Student entry by one name per line, renaming/removal, seat selection, assignment, swapping, and automatic placement into empty seats.
- Seat locks preserve occupants (or empty seats) during shuffle. Shuffle guarantees a seat change for each movable seated student when at least two exist; furniture stays in place. Unassigned students then fill empty unlocked seats. This uses a random cyclic shift, not every possible permutation.
- Undo for the last 40 changes in the current session, JSON backup import/export, and landscape printing.

Charts are stored under `sas-classroom-studio-v1` in this browser's local storage, separately from calculator data. Storage is per browser and site origin; clearing browser data removes charts. Export backups regularly. Exported files include student names. Import validates the file and replaces the saved classrooms after confirmation; undo can restore them during the current session.

## Owner sign-in and cloud storage

The dedicated **SAS Classroom Studio** Supabase project hosts managed passwordless email sign-in and private chart storage. Public signups and anonymous sign-in are disabled. Only the approved owner email can access classroom data, and every stored chart collection belongs to its authenticated user ID. Database policies enforce both checks; browser UI checks are not the security boundary.

Sign in with your emailed link, then use **Save to cloud** to upload all charts from this browser. In a second browser, sign in and choose **Open cloud charts**. Edits continue to autosave locally; cloud saves are explicit. Opening cloud charts can be undone in the current session. Concurrent cloud saves use a revision check and refuse to silently overwrite changes from another browser. If a conflict appears, export local work before opening the cloud copy.

Sessions are held in session storage for this tab. A short-lived PKCE code verifier uses local storage so email links opened in a new tab of the same browser can complete sign-in. Open the email link on the same browser/site origin that requested it. Signing out clears the session but retains the existing browser-local charts; clear browser data when leaving a shared device. Chart backups contain student names.

`cloud-config.js` contains only the project URL and public publishable key. Never put server secrets or service-role keys in it. The browser SDK is pinned to `@supabase/supabase-js@2.117.3` and loaded as a bundled ESM dependency from esm.sh; cloud sign-in requires that host and Supabase to be reachable. Local chart editing remains available if cloud connectivity fails. Schema and grants are recorded in `backend.sql` and applied as Supabase migrations. Supabase's automatic RLS trigger function has client execution revoked.

Auth site URL: `https://sashonors.com/classroom/`. Exact callback URLs also allow `http://localhost:4173/classroom/` and `http://127.0.0.1:4173/classroom/`. The preview remains unlisted and does not gate the local editor behind sign-in. Cloud access is authenticated. No sharing, accommodation rules, or seating conflict solver is included. Native touch devices and printed paper should receive hands-on checks.

## Verification

Run `node --test tests/classroom*.test.mjs` from the repository root.

The preview is standalone HTML/CSS/JavaScript; it does not modify the generated React bundle. Publishing these files alongside the site makes the direct route available. Integration into the site's main navigation can happen when ready for release.

Browser regression checks are `tests/classroom-rotation.browser.cjs` and `tests/classroom-cloud.browser.cjs`. They require Playwright available through Node module resolution (or `NODE_PATH`) and the installed Google Chrome executable. Start the local preview server first. The cloud browser test uses an isolated simulated backend and sends no invitation or roster data to Supabase. Live SQL isolation checks were run separately against the SAS project with test data rolled back.

Live Safari verification completed with the approved owner account: passwordless sign-in, first cloud save, and opening the cloud copy of the empty starter chart. The saved collection contains no student names. Supabase's built-in email service is limited to two authentication emails per hour; requests beyond that receive an actionable rate-limit message. Configure custom SMTP before broader use or if more frequent sign-in is needed. See https://supabase.com/docs/guides/auth/rate-limits.
