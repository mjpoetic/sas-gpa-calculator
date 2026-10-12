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

The page does not send roster data to a server. There is no account sync, sharing, accommodation rules, or seating conflict solver in this version. Before a public release, decide on authentication, student-data handling, and whether to add cloud persistence. Native touch devices and printed paper should receive hands-on checks.

## Verification

Run `node --test tests/classroom.test.mjs` from the repository root.

The preview is standalone HTML/CSS/JavaScript; it does not modify the generated React bundle. Publishing these files alongside the site makes the direct route available. Integration into the site's main navigation can happen when ready for release.
