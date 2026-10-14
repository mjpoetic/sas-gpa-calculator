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

Sign in with a password or emailed link. Changes autosave locally and to your account after cloud charts are opened or the browser collection is saved. On a new device, choose a classroom from Open cloud charts. Concurrent saves use revision checks, merge independent edits, and ask before resolving conflicting edits.

Sessions persist in local storage independently in each browser/device. Supabase coordinates token refreshes across tabs using its default storage, broadcast and locking behavior. Legacy tab sessions migrate once; stale tabs cannot restore a session after sign-out. Email links must be opened on the browser/site origin that requested them. Signing out revokes only the current browser session, retaining local charts and leaving other devices signed in. Automatic cloud saves and five-second polling propagate changes between devices; same-field conflicts require a choice and preserve recovery copies.

`cloud-config.js` contains only the project URL and public publishable key. Never put server secrets or service-role keys in it. The browser SDK is pinned to `@supabase/supabase-js@2.117.3` and loaded as a bundled ESM dependency from esm.sh; cloud sign-in requires that host and Supabase to be reachable. Local chart editing remains available if cloud connectivity fails. Schema and grants are recorded in `backend.sql` and applied as Supabase migrations. Supabase's automatic RLS trigger function has client execution revoked.

Auth site URL: `https://sashonors.com/classroom/`. Exact callback URLs also allow `http://localhost:4173/classroom/` and `http://127.0.0.1:4173/classroom/`. The preview remains unlisted and does not gate the local editor behind sign-in. Cloud access is authenticated. No sharing, accommodation rules, or seating conflict solver is included. Native touch devices and printed paper should receive hands-on checks.

## Verification

Run `node --test tests/classroom*.test.mjs` from the repository root.

The preview is standalone HTML/CSS/JavaScript; it does not modify the generated React bundle. Publishing these files alongside the site makes the direct route available. Integration into the site's main navigation can happen when ready for release.

Browser regression checks are `tests/classroom-rotation.browser.cjs` and `tests/classroom-cloud.browser.cjs`. They require Playwright available through Node module resolution (or `NODE_PATH`) and the installed Google Chrome executable. Start the local preview server first. The cloud browser test uses an isolated simulated backend and sends no invitation or roster data to Supabase. Live SQL isolation checks were run separately against the SAS project with test data rolled back.

Live Safari verification completed with the approved owner account: passwordless sign-in, first cloud save, and opening the cloud copy of the empty starter chart. The saved collection contains no student names. Supabase's built-in email service is limited to two authentication emails per hour; requests beyond that receive an actionable rate-limit message. Configure custom SMTP before broader use or if more frequent sign-in is needed. See https://supabase.com/docs/guides/auth/rate-limits.

## Email and password sign-in

The login form also accepts an email and password through Supabase Auth. Following an email sign-in link automatically offers password setup, including on a new device; **Not now** keeps email-link access available. While already signed in, **Set / change password** opens the same form. Enter the new password twice (at least 12 characters). Invalid or expired callbacks leave email-link retry available. The owner must enter and submit their own password. Password fields are cleared after requests and are never added to chart data, browser storage, exports, or logs.

**Forgot password?** requests a Supabase recovery email. Open that link in the same browser and origin that requested it; the verified recovery session reveals the password form. Password sign-in uses the same approved-email and ownership database policies as email-link sign-in. Public registration remains disabled. Regular password sign-in does not send an email; password recovery and email-link requests still use the email delivery quota.

`tests/classroom-password.browser.cjs` verifies failed and successful password login, password confirmation, updating a password, cleared fields, sign-out, recovery callbacks, and mobile overflow using a simulated auth client. No real password is created or changed by the automated test.

The SAS project's Email provider now also enforces a 12-character minimum on the server, with Secure password change enabled (requires a recent sign-in or recovery session). The owner password setup form was opened in the existing signed-in Safari session; the owner completes password entry and submission privately.

## Hidden logo shortcut

Press and hold either site logo on the main honors calculator for **1.2 seconds** to open Classroom Studio. A normal click still triggers the existing celebration. Moving more than 12 pixels, releasing early, scrolling, losing focus, or canceling a touch stops the shortcut. Keyboard users can hold Space or Enter while the logo button is focused. The direct `/classroom/` URL remains available. The hidden gesture is a navigation shortcut, not an access-control mechanism; cloud data still requires sign-in.

Run `tests/classroom-shortcut.browser.cjs` with Playwright and the local server to verify click behavior, canceled gestures, and mouse, touch, and keyboard holds.

The logo displays an animated progress ring and “Opening Classroom Studio…” cue during the hold. Releasing early clears both immediately. Reduced-motion preferences use a static ring.

Furniture reveals delete and rotate buttons on hover, keyboard focus, or selection (tap to select on touchscreens). Drag the rotate button for any angle, tap for 90°, or enter an exact angle in the inspector. Seat text remains upright, rotated furniture stays within room bounds, and deletion supports Undo without removing students from the roster. `tests/classroom-fixes.browser.cjs` checks these controls, dark seat hover contrast, logo feedback, email-link password setup, and invalid-link retry with simulated authentication.

## Appearance and furniture customization

The **Appearance** button on the honors calculator and Classroom Studio offers Light, Dark, or device theme, built-in font choices, Google Fonts by family name, installed-device fonts by family name, and interface text sizes from 90% to 125%. Font-name suggestions are supplied for both sources. Interface preferences apply to both pages on this device and persist in browser storage; the calculator's existing theme button stays synchronized. Google Fonts load from Google's CSS API with a system fallback if unavailable. Installed fonts use the device's own font files and require that font on each device.

**Customize this chart** offers a separate chart font/source, text sizes from 9 to 24 px, a default furniture color, natural-color restoration, and a chart appearance reset. Each selected piece of furniture can override its color or use the chart default. Width and Depth provide precise dimensions; selected furniture also has a corner handle for mouse or touch resizing. Resizing accounts for rotation, respects room bounds, and supports Undo. Color, chart font, chart text size, and dimensions travel with cloud charts and JSON backups. Older backups remain compatible. Students and furniture positions are kept when resetting chart appearance.

`tests/classroom-customization.browser.cjs` verifies light/dark switching, the native theme toggle, local font application and Google Fonts requests, saved appearance, individual colors, resizing/undo, print controls, and mobile layouts with larger text. Font downloads are simulated in this test; actual installed-font availability depends on the device.

## Liquid Glass styling

`liquid-glass.css` applies frosted surfaces, reflective borders, layered shadows, rounded controls, and segmented tabs throughout both themes. The floor plan stays opaque for readable names, while furniture highlights preserve custom colors. Reduced-transparency and higher-contrast preferences use solid surfaces; unsupported blur falls back to opaque panels. Reduced motion disables control transitions, and printing removes glass effects. `tests/classroom-glass.browser.cjs` checks both themes, higher contrast, reduced motion, print, and mobile overflow.

## Mobile controls and motion

Appearance has a palette glyph, with its text label hidden on narrower screens and touch devices. Both pages include a labeled Refresh page button on narrow screens, touch devices, and installed web apps. Refresh asks for confirmation because unsubmitted entries and calculator work can be lost; saved classroom charts remain. Account/cloud operations in progress block refresh until finished.

Furniture follows the pointer continuously during dragging and resizing. Grid snapping happens on release with a brief settling animation. Position, size, and rotation changes ease between layouts, and newly added furniture fades in. Reduced-motion preferences disable furniture animations. No new touch gestures are registered for refresh, so native scrolling and device gestures are kept.

`tests/classroom-mobile-controls.browser.cjs` checks the compact glyph, refresh visibility in portrait and landscape, larger text, reload persistence, continuous dragging, snapping animations, and reduced motion. Physical iPhone web-app behavior still merits a device check.

## Group arrangements and room fixtures

Shift-click or Command-click furniture/seat buttons to add or remove objects from the selection. **Select multiple** provides the same behavior for touch: tap the objects, then turn it off to drag the group. Drag blank canvas to select a region. Groups move as one within the room; their resize handles and **Group size (%)** scale furniture and spacing uniformly, preserving touching edges and relative proportions. Undo restores the whole edit. Selection itself is temporary.

With **Snap to grid** enabled, dragging aligns nearby furniture edges within eight canvas pixels, and rotation catches 15-degree angles within four degrees. Disable snapping for unrestricted placement. Horizontal and vertical flips mirror the furniture illustration while keeping its label readable. Flips, new fixture types, and chart font weights persist in browser/cloud saves and backups.

Door swing diagrams, bookshelves with books, and teacher desks with laptop, globe, and pens replace generic shapes. Printer, filing cabinet, window, and smart board are available in the palette. Labels wrap, turn sideways on narrow tall fixtures, and shrink when necessary; labels that still cannot fit use a readable caption below the item.

Site Appearance and chart customization offer weights from Thin (100) to Heavy (900). Google requests the selected weight explicitly; unavailable weights produce a retry hint. Local fonts use the nearest installed face. `tests/classroom-groups.browser.cjs` verifies selection, resizing, dragging, fixtures, flipping, adaptive labels, weight persistence, and mobile fit; model tests verify joined-edge and room-bound preservation.

## Overhead accessories and redo

Doors use a simple wooden leaf and metal handle; teacher desks use overhead monitor, keyboard, mouse, mug, and pen details. Their default labels are omitted, while custom labels remain available. The palette includes plant, laptop, keyboard, mouse, couch, chair, and stool as independent decorative objects. These objects support the same selection, rotation, flipping, resizing, and saved-chart behavior as other furniture.

**⌘Z** undoes and **⌘⇧Z** redoes chart changes (Ctrl equivalents also work). Visible Undo/Redo buttons support touch. Shortcuts leave native text-field undo untouched. A new edit clears the redo stack; both stacks are bounded to 40 changes and reset on reload. `tests/classroom-decor.browser.cjs` covers these behaviors and the illustrated palette.

The door silhouette has been restored to the original pale, dashed rounded-corner design, with its label and 80 × 60 default size. Existing doors retain their saved dimensions. Flipping mirrors the silhouette while keeping the label readable; other overhead illustrations remain unchanged.

Doors now use a thin wooden rectangle and metal handle, without visible labels (including custom labels). Names remain available in the inspector and accessibility descriptions. New doors default to 140 × 40; existing doors retain saved dimensions.

Illustrations preserve their aspect ratio instead of stretching. Round tables and decorative/device items resize proportionally through handles and Width/Depth fields; ordinary desks remain independently resizable. Existing saved dimensions remain intact, with artwork fitting inside them. Teacher desks are blank for separately placed accessories. Room fixtures and decorative items have no visible captions; names remain in accessibility descriptions and the inspector. Window and smart board frames are thin, and plant/laptop/mouse artwork is redrawn from above.

## Placement, guides, menus, and automatic saving

Clicking the furniture palette finds a vacant position; rugs and room labels do not block placement. Drag from the palette to drop near a specific position, with a preview and vacant-space fallback. If the room is full, the editor keeps the new object available to move manually. In multiple-selection mode, dragging an already selected furniture body moves the whole group; tapping seats or unselected bodies still changes selection.

Snapping includes room edges. Doors draw their leaf at the edge of the selectable footprint and mirror for bottom/right walls. Bookshelves use a wide rectangular illustration, plants have a visible pot, and boards/windows use slim illustrations without captions. Alignment lines appear during moving and resizing; near-matching dimensions snap to their counterpart when snapping is enabled.

Classroom selects and the shared Appearance dialog use keyboard-accessible site menus with consistent styling instead of native browser menus. Common action buttons have matching SVG glyphs. Font-family edits apply on leaving the field as well as through Apply font, with an inline loading/applied/error status.

Signed-in edits save to cloud after a 900 ms quiet period. Automatic saving first verifies the remote collection against the browser copy or its last synchronized baseline. If they differ, Open cloud charts or the existing explicit Save to cloud resolves which collection to keep; sign-in never silently replaces either copy. Revision checks still block concurrent-browser overwrites. Pending changes remain saved locally; network failures retry when connection returns or more edits are made, and pending cloud edits warn before leaving/reloading. Tests use a simulated backend and send no real chart data or authentication emails.

## Room geometry and furniture controls

Room shape and orientation provides Width/Depth (480–1600 planning units), a square preset, and a 90° rotation of the room plus every furniture item. Size changes keep furniture inside the new bounds. Room dimensions travel with cloud charts and JSON backups; legacy charts retain 960 × 680 dimensions. Undo/Redo includes room changes.

Cabinets resize vertically in 30-unit drawer steps with an 80-unit fixed width. Doors keep a thin 12:1 ratio; whiteboards and smart boards keep a thinner 20:1 ratio. Office chairs are black, and bulletin boards have no labels. Double-click a furniture body to open its color control; touch users can select furniture and use the inspector color field. Group resizing keeps cabinet width fixed (cabinet groups do not shrink below their initial scale).

Font-source choices now save immediately instead of reverting when other settings are edited. The chart font preview shows the current family and weight, and chart text defaults to the requested regular weight. The room/browser regression verifies actual Google Fonts loading rather than mocking the font stylesheet.

## Menu and cloud compatibility fixes

Appearance dropdowns now use top-layer popovers within their modal, with fixed 14 px menu text and keyboard navigation. Native select surfaces are hidden so Safari and Chromium use the same site menu. Related JS modules and styles share a release query version to avoid mixing cached editor and validator releases.

Size validation repairs finite legacy/generated dimensions into supported limits, including floating-point overshoots, while preserving furniture IDs, seat assignments, and rosters; malformed/nonfinite dimensions still fail. Group resize bounds now prioritize maximum allowed scale to prevent oversized output.

Open cloud charts loads a modal listing chart names and counts. Choosing a chart opens that chart and retains the account collection; local changes remain recoverable through Undo. Canceling the picker leaves the current chart and revision unchanged. Tests cover modal menu interactions and a two-browser simulated cloud chart collection, including dimension repair and picker cancellation.

Cloud baseline comparisons use canonical property order, so equivalent chart data does not become a false conflict after reloading. Selecting a different active chart in the picker is also saved automatically.

## Chart-first workspace

The seating chart now owns the viewport below a compact header. The chart-name menu contains classroom selection, rename, duplicate, and delete. Account/cloud, Classroom settings (fonts and room geometry), and Files/sharing open dialogs. Appearance stays directly accessible in the header; cloud state appears there on desktop and in the Account button tooltip.

Furniture, Students, Details, and Fit room are always accessible from the workspace toolbar. Desktop uses collapsible sidebars; portrait phones/tablets use bottom drawers, and compact landscape uses a side drawer. Selecting a seat opens Details. Adding furniture closes the mobile drawer so placement is immediately visible. Desktop can show both the library and inspector. Escape or the close control returns to the chart. Fit room uses both available width and height, including resize/orientation changes; manual zoom keeps scrollable room access.

`tests/classroom-workspace.browser.cjs` checks 320/390 px phones, landscape, tablet, and desktop, chart fit, no page overflow, dialog access, drawer flows, seat assignment, and chart fonts. Cloud auto-save/picker tests use the new chart/account dialogs. Physical iPhone behavior remains a separate device check.

## Enlarging the chart

The workspace removes its outer canvas padding and Fit room may enlarge beyond 100% when space allows. Visible minus/plus controls and a zoom percentage are available in every orientation. Fill view enlarges to cover the available chart viewport, with scrolling for the cropped part. Enlargement centers the scroll range and enables Pan; drag the room to inspect it, then turn Pan off to edit furniture. The percentage button or Fit room returns to the whole room. Zoom is view-only and does not change chart geometry. `tests/classroom-zoom.browser.cjs` covers enlargement, filling, panning, and returning to Fit in portrait, landscape, and desktop.

## Account entry and control polish

Login fields now use standard username/current-password metadata and names for password managers. Chromium regression covers autofill-style value assignment without input events; actual iCloud extension behavior still requires a device check. Sign-in reports incomplete fields, invalid credentials, and connection failures distinctly.

New or out-of-sync browser sessions automatically offer the cloud classroom list after access verification, placing the last-viewed classroom first. Matching returning copies keep the current chart. Password setup/recovery remains ahead of chart selection; locally saved work is preserved until the user chooses a cloud collection.

Account, Settings, More, and Appearance share dimensions, icon alignment, borders, and corner shape. Desktop library tabs stack vertically; compact layouts use tightly aligned tabs. Edit is available only for selected furniture/seats, and its inspector sizes to content. The redundant desktop zoom dropdown is hidden in favor of the visible zoom controls.

## Icons and help

Undo/Redo use opposite curved SVG arrows, multi-select uses checked squares, Shuffle uses crossed arrows, Furniture uses a chair, and Students uses a group of people. Hover or keyboard focus reveals concise workspace help, including how multi-selection and group movement work; controls inside dialogs also have descriptive titles. Settings opens with chart appearance and room shape sections expanded. Account also contains the backup/import/print actions, replacing More. The top-left Sawgrass logo links to the main site. Icon/help regression checks distinct glyphs, selection guidance, expanded settings, combined account/files, the logo link, and narrow-screen fit.

## Student name display

Pasting names and adding/editing students trims and collapses whitespace on each line. The roster and assignment menu show first name plus last initial; seat labels show only the first name unless multiple roster students share that first-name spelling (case-insensitive), in which case they show the last initial too. First names are the first word and surname initials come from the final word; single-word names remain intact. Renaming or removing students recalculates seat labels. Full normalized names stay in saved/cloud/backup data and can be edited explicitly through the roster pencil button. Settings uses distinct typography/check, sizing-arrows, square, and rotation glyphs.

## Furniture controls in view

Rotate, Duplicate, Delete, and Resize controls stay within the visible chart-scroll viewport, including rotation, zooming, scrolling, and partially visible furniture. The controls counter-rotate and scale independently of the furniture: mouse controls shrink modestly when zoomed in, while coarse-pointer controls retain larger touch targets. Duplicate uses vacant-space placement, preserves dimensions/colors, clears seats and locks, and supports Undo. The object-controls browser check covers edge containment, arbitrary rotation, zoom sizing, duplication, Undo, and mobile layout.

### Release indicator and saved student lists
The release manifest is `/site-version.json`. For each published iteration, update its date-based version (`YYYY.MM.DD.iteration`), UTC preparation time, and matching `site-version` / `site-updated` metadata in both HTML entry points. The displayed time uses the viewer’s timezone. Open tabs check after ten seconds, every five minutes while visible, and on returning to the tab or reconnecting. A newer version offers Refresh or Later; classroom saves can prevent a refresh while cloud changes are pending.

Saved student lists are available in Students. They travel with the existing cloud document and JSON backup, with no database schema change. Loading replaces the classroom roster and clears seat assignments while retaining furniture; Undo restores the previous roster. Print is in the header, and Rotate room is in the toolbar beneath the grid.

### Seats, separation, labels, and update reminders
Select a seat and use Edit → Seat color to set or reset its color. Colors belong to the seat and stay in place when students shuffle. In Students, use the separation button or double-click a student name to choose students to keep apart. Seating and shuffle improve these preferences without moving furniture or changing locked seats; the status reports unresolved conflicts. All seats at the same table, and seat centers within 120 room units, count as nearby. Preferences are saved with cloud charts, backups, and reusable lists.

Click a Room label to edit its text inline; Enter saves and Escape cancels. Drag its border to move it. Edit includes an independent label font using built-in (`system`, `serif`, `rounded`, `mono`), Google, or device fonts. Hover controls sit outside the label where space permits and hide during text editing.

Drag the update notice by its message to reposition it; browser storage remembers the relative screen position. Later folds it into a dot on Refresh. Click Refresh to reopen the notice and choose when to reload.

### Unified group editing
Selecting several furniture items shows one shared rotate/duplicate/delete toolbar and one resize handle around the selection bounds. Group rotation turns both placement and orientation around the group center; groups too large to fit the rotated room bounds retain their previous arrangement. Duplication preserves relative spacing and clears seat assignments. Resizing scales spacing with dimensions, and all group actions support Undo.

Room-label text scales to fill its resized box. Double-clicking a seat opens its own color, assignment/lock, student-name, and separation controls; double-clicking the furniture body edits the furniture color. The smartboard is a thin black top-down strip with a narrow light screen edge. Furniture artwork no longer receives the glass highlight plate; selected items retain a simple outline.

### Layered hover controls
Furniture uses a stable stack with smaller objects above larger surfaces; hovering and selecting do not raise a desk above its accessories. Only the object under the pointer owns the hover controls. A narrow pointer corridor keeps that object's toolbar available when moving toward it across a larger object underneath. Hidden controls cannot intercept clicks. Touch keeps selection-based controls, and multiple selections retain their shared group toolbar.

### Wall fixtures and shortcut reference
With Snap & guides enabled, dragging a single door, whiteboard, smartboard, window, bulletin board, clock, or calendar within 24 room units of an edge aligns its orientation and places its footprint flush against that wall. Group moves retain their relative arrangement. Disable snapping for free placement. Bulletin boards are thin wall strips; new accessories include trash can, side table, wall clock, globe, mug, water bottle, electric pencil sharpener, and calendar.

Press Shift + / (`?`) to open Keyboard shortcuts, or use the button in Account. Text entry does not trigger the help dialog. The registry in `assets/keyboard-shortcuts.js` is the source for future shortcuts; modules can also dispatch `sas-register-shortcut` with `{key, description}` to add a reference entry.

### Small accessories and label backgrounds
Mugs resize down to 16 room units wide, preserving their proportions through group sizing, room changes, backups, and cloud validation. Room-label Edit controls offer independent background and outline toggles plus background, outline, and text colors. Unstyled labels remain transparent. The accessory artwork uses crumpled paper and a discarded bottle inside the trash can, a translucent bottle shoulder with a blue water-marked cap, and a rounded sharpener housing with yellow pencils.

### Portrait sign-in layout
At portrait widths up to 600px, Account sign-in and password setup use a single-column grid: full-width email/password fields precede full-width actions. Inputs use 16px text and 48px minimum targets. The extra inner frame and duplicate introductory help are removed on phones, and backups use two equal-width buttons. Hidden form states are retained. Browser checks cover 320, 390, and 440px with dark mode, bold weight, and 125% interface text; actual phone autofill and authentication are separate from these layout checks.

### Student-list action buttons
Student separation, name editing, and removal use proportional SVG glyphs in matching circular glass buttons. Actions occupy a separate row beneath each name so the name field remains readable in the narrow library. Button and icon proportions remain independent of the selected interface font and text scale.

### Save before refreshing
Both the refresh button and update notice share `assets/refresh.js`. Classroom refresh commits the active editor, saves locally, then waits for pending cloud writes before reloading. A failed local save, cloud conflict, active chart picker, or failed/timed-out write keeps the page open with an explanation. Signed-out charts can refresh after a local save. The main calculator retains its warning because classroom cloud saving does not cover calculator entries. Browser tests use delayed and failed mock writes without changing live account data.

### Compact roster and student dragging
Students shows the roster first, with Add students and Saved lists opening dedicated dialogs. Student editing actions are collapsed behind each name’s Options button. Drag a roster name or an assigned seat onto another seat to assign or swap students. Dropping a waiting student onto an occupied seat returns the occupant to Waiting. Locked source and target seats reject moves; highlight colors show available versus locked targets. Dragging from the mobile roster hides the drawer to expose the grid. Drag operations preserve furniture, seat colors, and separation preferences, save normally, and support Undo. Touch verification uses browser-simulated touch, not physical-device validation.

### Drop spotlight and blank seats
Student drags from the roster or grid spotlight the destination with a bright fill and glow while other seats dim. Locked targets use an amber spotlight. The source gets a subtle dashed treatment, and all temporary styling clears on drop or cancellation. Empty seats have no visible text; their accessible seat descriptions and inspector numbering remain available.

### Name sizing and furniture handles
Clicking an assigned seat focuses its student-name editor; Enter saves and Escape cancels. Chart settings include an independent Seat name size, and the seat editor offers a per-seat Name label size override plus reset. These settings change text without resizing furniture and survive backups/cloud validation.

Thin fixture resize handles stretch only the local length axis, preserving the slim ratio. Height matching to nearby furniture is skipped for these fixtures. The old invisible hover bridge no longer intercepts resize clicks. Resize uses diagonal outward arrows; a separate cardinal-arrow Move handle is available on individual and shared group toolbars, with grid/wall snapping and Undo.

### Multi-seat properties
Shift/Command-click seats, or enable Select Multiple and tap seats, to add or remove individual seats from the selection. The first Shift-click includes an already selected seat. Edit exposes shared color, name-label size, lock, appearance reset, and clear-selection controls when several seats are selected. Mixed sizes show an empty Mixed field; mixed locks use the checkbox’s intermediate state. Property changes apply only to selected seats and use the normal save/Undo flow. Selecting furniture switches back to furniture selection; seat selection does not expose furniture movement controls.

### Chromium printing and explicit room-label size
Printing builds a dedicated room snapshot before the print dialog opens. It fits inside a landscape Letter/A4-safe page area independently of screen zoom, panning, drawers, and control overlays; after printing, the temporary sheet is removed. Artwork and seat colors remain intact, backgrounds print white, and unstyled room labels use readable dark text. Chromium PDF checks confirm one-page Letter and A4 output. Actual Safari print-dialog behavior has not been revalidated for this change.

Room-label Edit includes Label font size (8–200) independent of seat and furniture text. An explicit value stays fixed when the label box is resized; Fit text automatically restores the existing automatic-sizing behavior. The value saves in backups and cloud documents.

### Spotlighted furniture and live cross-device synchronization
Hovered furniture temporarily rises above neighboring objects with a clear outline/glow, and its controls share that elevated layer. Hit testing uses the stable underlying stack before changing hover ownership, so a raised desk cannot permanently hide smaller accessories. Other furniture softens while the spotlight is active.

Cloud writes still autosave after edits. Visible signed-in pages check for remote updates every five seconds and on reconnect/tab return, deferring application while typing or dragging. Three-way comparison against the last synchronized document merges independent edits by object/student/chart IDs; object position and dimensions are treated as coupled fields. Remote adoption preserves the current classroom when it still exists. Revision compare-and-swap continues to prevent silent overwrites.

Overlapping changes pause saving and offer an explicit local-versus-other-device choice, plus downloadable normal backups of both versions. A local recovery envelope is also retained under `sas-sync-conflict-backup` when browser storage permits. Review Later keeps local changes and suppresses repeat prompts for the same remote revision. Invalid merged seat assignments require review. No backend schema or Realtime publication changes are required; this uses polling of the existing owner-protected document table. Browser verification uses shared mocked storage across isolated contexts, not live account edits.

The Students drawer shows a compact, collapsible list of unseated students. Empty all seats returns students to that list while preserving furniture and seat styles; Delete/Backspace clears selected seats and Undo restores assignments. Saved lists can be created independently from the current classroom, including an empty list to start later.

Snap and Guides starts off; wall fixtures still align automatically when dragged near room edges. Color controls use a consistent compact preset palette, with More colors exposing hex entry and the device’s detailed color picker.
