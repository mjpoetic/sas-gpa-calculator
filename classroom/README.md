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

## Teacher accounts and cloud storage

The dedicated **SAS Classroom Studio** Supabase project hosts email/password accounts and private chart storage. Teachers choose **Create teacher account**, enter their email and a password of at least 12 characters twice, confirm their email, then sign in. Database policies restrict each collection to its authenticated user ID and reject anonymous users; the old owner email allowlist is no longer required. Browser UI checks are not the security boundary.

Teacher registration and Resend SMTP were enabled on October 16, 2026. The sender is `accounts@sashonors.com` with display name `Classroom Studio`. Email confirmation remains required; anonymous sign-in is off. SMTP credentials live only in Supabase. Actual mailbox delivery still requires an authorized signup test.

Sign in with a password or emailed link. Changes autosave locally and to your account after cloud charts are opened or the browser collection is saved. On a new device, choose a classroom from Open cloud charts. Concurrent saves use revision checks, merge independent edits, and ask before resolving conflicting edits.

Sessions persist in local storage independently in each browser/device. Supabase coordinates token refreshes across tabs using its default storage, broadcast and locking behavior. Legacy tab sessions migrate once; stale tabs cannot restore a session after sign-out. Email links must be opened on the browser/site origin that requested them. Signing out revokes only the current browser session, retaining local charts and leaving other devices signed in. Automatic cloud saves and five-second polling propagate changes between devices; same-field conflicts require a choice and preserve recovery copies.

`cloud-config.js` contains only the project URL and public publishable key. Never put server secrets or service-role keys in it. The browser SDK is pinned to `@supabase/supabase-js@2.117.3` and loaded as a bundled ESM dependency from esm.sh; cloud sign-in requires that host and Supabase to be reachable. Local chart editing remains available if cloud connectivity fails. Schema and grants are recorded in `backend.sql` and applied as Supabase migrations. Supabase's automatic RLS trigger function has client execution revoked.

Auth site URL: `https://sashonors.com/classroom/`. Exact callback URLs also allow `http://localhost:4173/classroom/` and `http://127.0.0.1:4173/classroom/`. The preview remains unlisted and does not gate the local editor behind sign-in. Cloud access is authenticated. No sharing, accommodation rules, or seating conflict solver is included. Native touch devices and printed paper should receive hands-on checks.

## Verification

Run `node --test tests/classroom*.test.mjs` from the repository root.

The preview is standalone HTML/CSS/JavaScript; it does not modify the generated React bundle. Publishing these files alongside the site makes the direct route available. Integration into the site's main navigation can happen when ready for release.

Browser regression checks are `tests/classroom-rotation.browser.cjs` and `tests/classroom-cloud.browser.cjs`. They require Playwright available through Node module resolution (or `NODE_PATH`) and the installed Google Chrome executable. Start the local preview server first. The cloud browser test uses an isolated simulated backend and sends no invitation or roster data to Supabase. Live SQL isolation checks were run separately against the SAS project with test data rolled back.

Live Safari verification completed with the approved owner account: passwordless sign-in, first cloud save, and opening the cloud copy of the empty starter chart. The saved collection contains no student names. Production email now uses Resend SMTP; Supabase and Resend rate limits both apply. Requests beyond those limits receive an actionable message. See https://supabase.com/docs/guides/auth/rate-limits.

## Email and password sign-in

The login form also accepts an email and password through Supabase Auth. Following an email sign-in link automatically offers password setup, including on a new device; **Not now** keeps email-link access available. While already signed in, **Set / change password** opens the same form. Enter the new password twice (at least 12 characters). Invalid or expired callbacks leave email-link retry available. Each teacher enters and submits their own password. Password fields are cleared after requests and are never added to chart data, browser storage, exports, or logs.

**Forgot password?** requests a Supabase recovery email. Open that link in the same browser and origin that requested it; the verified recovery session reveals the password form. Password sign-in uses the same ownership database policies as email-link sign-in. Registration requires the production email setup described above. Regular password sign-in does not send an email; password recovery and email-link requests still use the email delivery quota.

`tests/classroom-password.browser.cjs` verifies failed and successful password login, password confirmation, updating a password, cleared fields, sign-out, recovery callbacks, and mobile overflow using a simulated auth client. No real password is created or changed by the automated test.

The SAS project's Email provider now also enforces a 12-character minimum on the server, with Secure password change enabled (requires a recent sign-in or recovery session). The owner password setup form was opened in the existing signed-in Safari session; the owner completes password entry and submission privately.

## Hidden logo shortcut

Press and hold either site logo on the main honors calculator for **1.2 seconds** to open Classroom Studio. A normal click still triggers the existing celebration. Moving more than 12 pixels, releasing early, scrolling, losing focus, or canceling a touch stops the shortcut. Keyboard users can hold Space or Enter while the logo button is focused. The direct `/classroom/` URL remains available. The hidden gesture is a navigation shortcut, not an access-control mechanism; cloud data still requires sign-in.

Run `tests/classroom-shortcut.browser.cjs` with Playwright and the local server to verify click behavior, canceled gestures, and mouse, touch, and keyboard holds.

The logo displays an animated progress ring and “Opening Classroom Studio…” cue during the hold. Releasing early clears both immediately. Reduced-motion preferences use a static ring.

Furniture reveals delete and rotate buttons on hover, keyboard focus, or selection (tap to select on touchscreens). Drag the rotate button for any angle, tap for 90°, or enter an exact angle in the inspector. Seat text remains upright, rotated furniture stays within room bounds, and deletion supports Undo without removing students from the roster. `tests/classroom-fixes.browser.cjs` checks these controls, dark seat hover contrast, logo feedback, email-link password setup, and invalid-link retry with simulated authentication.

## Appearance and furniture customization

The **Appearance** button on the honors calculator and Classroom Studio offers Light, Dark, or device theme, built-in font choices, Google Fonts by family name, installed-device fonts by family name, and interface text sizes from 90% to 125%. Font-name suggestions are supplied for both sources. Interface preferences apply to both pages on this device and persist in browser storage; the calculator's existing theme button stays synchronized. Google Fonts load from Google's CSS API with a system fallback if unavailable. Installed fonts use the device's own font files and require that font on each device.

**Customize this chart** offers a separate chart font/source, text sizes from 9 to 24 px, a default furniture color, natural-color restoration, and a chart appearance reset. Each selected piece of furniture can override its color or use the chart default. Width and Depth provide precise dimensions; furniture can be resized by dragging any edge or corner with a mouse, with direction cursors that follow its rotation. The opposite edge stays anchored within room limits. Groups and free-standing teacher/assistant avatars support the same border gestures while retaining their proportions. The resize glyph remains available on touch devices and for keyboard focus. Resizing accounts for rotation, respects room bounds, and supports Undo. Color, chart font, chart text size, and dimensions travel with cloud charts and JSON backups. Older backups remain compatible. Students and furniture positions are kept when resetting chart appearance.

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
The release manifest is `/site-version.json`. For each published iteration, run `node scripts/site-release.mjs YYYY.MM.DD.iteration "User-facing change"` from the repository root. This advances the manifest, UTC preparation time, all three HTML entry points, asset cache versions, and changelog together. Run `node scripts/site-release.mjs --check` to verify consistency before publishing. The displayed time uses the viewer’s timezone. Open tabs check after ten seconds, every five minutes while visible, and on returning to the tab or reconnecting. A newer version offers Refresh or Later; classroom saves can prevent a refresh while cloud changes are pending.

Saved student lists are available in Students. They travel with the existing cloud document and JSON backup, with no database schema change. Loading replaces the classroom roster and clears seat assignments while retaining furniture; Undo restores the previous roster. Print is in the header, and Clockwise and Counterclockwise room rotation buttons are in the toolbar beneath the grid. Each rotates the room and all furniture by 90 degrees, preserves seat assignments, and supports Undo.

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

Manage classrooms includes Sort A–Z (natural numeric ordering) and Move up/Move down controls. The header menu and classroom selector use this saved order; cloud documents and backups retain it.

Chart view controls provide Full screen (with viewport fallback), Exit full screen/Escape, and remembered Hide tools/Show tools. Presentation hides header and sidebars while retaining zoom and exit controls.

Selected furniture groups support batch colors and resetting to defaults. Seat properties provide separate background and name text colors for one or multiple selected seats; text colors persist in cloud documents and backups, with automatic contrast available as a reset.

Multiple selected seats and furniture support built-in, Google and device font families and weights. Size and position starts collapsed, then remembers explicit disclosure choices. Classroom letter shortcuts: F fullscreen, H toolbars, S save, E edit, D furniture, U students, P print. These ignore typing, dialogs, open menus and modifier combinations; browser/system shortcuts remain unchanged.

Student avatars are optional original vector bust portraits. In Students, use Options → Edit avatar, or select an occupied seat and choose Create / edit avatar. The builder includes character style, skin tone, hair and hair color, expressions, clothing and color, glasses/headphones, fun extras, backdrop colors, and Surprise me. Show student avatars controls both seat portraits and miniature roster portraits; each student also has an individual enable switch. Disabling display retains designs. Avatars belong to student records, follow seat assignments, and survive cloud saves, backups, chart duplication, and saved-list loading. Seat portraits scale to available space and hide if a seat is too small to keep the name readable. No photos or external avatar-generation service is required.

Avatar hairstyles include fades, sponge curls, curly tops, waves, cornrows, box braids, long and short locs, twists and afro puffs. Braces are independent of glasses/headphones. Polo shirts, burgundy and forest green presets are available. Every color category (skin, hair, clothing and backdrop) supports custom hex colors and a detailed picker. Flip controls use consistent SVG glyphs.

Optional student nicknames are edited using Student Options → Set nickname or Goes by in seat properties. The actual full name is retained separately. Preferred names appear on seats, in rosters and avatar previews; duplicate displayed names include the actual last initial. Clearing a nickname restores the actual first name. Nicknames persist in cloud documents, backups, duplicated charts, and saved lists.

`tests/classroom-signup.browser.cjs` checks registration validation, email confirmation instructions, rate limits, cleared passwords, redirect URLs, and mobile layout with a simulated SDK. Live transaction-only SQL checks verify own-row saves, cross-account isolation, and anonymous denial; all test records are rolled back. No real confirmation email was sent by these tests.

## Optional two-factor authentication

Account → Two-factor authentication → Enable 2FA enrolls a TOTP authenticator. Scan the QR code or enter the manual setup key, then verify a six-digit code. Canceling does not enable 2FA. Unfinished setup secrets are cleared when Account closes; restarting cleans up abandoned unverified factors. Setup keys and codes are never included in charts, backups, or logs.

For enrolled teachers, password login, email links, and password recovery must be followed by an authenticator code before cloud reads or saves. A restrictive database policy checks verified factors in Supabase Auth and requires an `aal2` session. Teachers without verified factors retain ordinary sign-in. The narrow no-argument lookup function lives in a non-exposed schema, checks only the current user's factors, returns only a boolean, and cannot be called by anonymous clients.

Removing an authenticator requires a fresh code; removing the last one turns 2FA off. Keep a secure authenticator backup before enabling. There are no app-generated recovery codes. A lost authenticator requires site-owner assistance and independent identity verification before any administrative factor reset; password-reset email alone must not bypass 2FA. Previously downloaded or browser-saved charts are not encrypted or erased by 2FA.

`tests/classroom-mfa.browser.cjs` uses simulated authentication to verify enrollment, cancellation, wrong codes, cloud gating, fresh-code removal, secret clearing, sign-out and mobile layout. It never enrolls a real teacher.

Refresh saves current browser edits and waits for cloud synchronization. Unchanged browser saves do not mark charts as edited. A backup exported during the current page session permits refresh if it matches the entire current collection; later edits invalidate that protection. The refresh warning clears after a successful sync or a fresh export, can be dismissed, and is cleared before a retry. `tests/classroom-refresh.browser.cjs` covers failed saves, recovery, current versus stale backups, and no-op refreshes.

Headphones are independent of glasses and can be worn together. Legacy `accessory: headphones` avatars migrate to the independent headphone selection. The editor shows colors only for the selected extra or focused accessory; selecting glasses or headphones opens that item's colors while preserving both worn items. Conditional color panels slide in and out and honor reduced motion. Preset swatches are 38px on desktop and 30px on mobile.

Headphone band, cups and cushions; sunglasses frames and lenses; flower petals, centers, leaves and band; cat headband, ears and inner ears; antenna stems and each orb; star fill and outline; crown body, outline and jewel; and frog cap components all have independent preset/custom colors. Closed baseball/frog hats clip tucked hair at the crown and retain lower lengths. Headphone bands follow fuller hair and sit above headwear. Hungry (drooling), Satisfied and Laughing expressions and a neutral Squinted eyes option are available. `tests/classroom-avatar-accessories.browser.cjs` covers combinations, conditional colors, animations, reduced motion, persistence and mobile layout.

Additional expressions include Silly (tongue-out wink), Confused (uneven brows and crooked mouth), Excited (open smile and sparkles), Thinking (upward gaze and pursed lips), and Embarrassed (rosy cheeks and shy smile). Braces remain visible with open-mouth Silly and Excited; closed-mouth expressions retain their mouth shapes.

### Teachers and assistants

The People footer button opens Students by default. Choose Teachers below Students to manage your personal teacher avatar and add other teachers or assistants. Additional adults have the full teacher avatar editor and independent desk/chair or free room placement, size, and drag controls. They do not need an account or access to Classroom Studio. Their avatars belong to the classroom and survive backups, duplication, room changes, and cloud document merging; they do not change your reusable personal teacher profile. Removal supports Undo.

### Body build and height

The avatar editor’s Body tab offers Slim, Medium, and Broad builds plus Short, Medium, and Tall heights. Mix the choices independently of head shape for students, teachers, and assistants. These portrait avatars express height through torso length and head-to-body proportions. Older saved avatars default to Medium for both settings, preserving their existing appearance. Body choices are retained in saved lists, backups, and teacher profiles.

### Temporary student avatar passes

Sign in and finish syncing your classroom, then open **People → student Options → Avatar pass**. For seated students, select their seat and choose **Temporary avatar pass** in seat details. Choose 15 minutes, 30 minutes, 1 hour, 4 hours, or 24 hours and create a private link / locally generated QR code. Share it only with that student: anyone holding the link can edit that student's avatar. Issuing a replacement closes older passes for the same student. Reopen Avatar pass to see expiry / last-save status or choose **Close access now**, including from another signed-in device.

Students open `avatar-pass.html#<random credential>` without signing in. They see only their preferred name (or first name) and avatar. The page loads no teacher auth session, roster, seating chart, or third-party QR service. Credentials use 256 random bits, are stored as SHA-256 hashes, and stay in the URL fragment. The server checks expiry, revocation, the current chart/student IDs, and avatar fields on every read/save. Teacher pass management obeys account ownership and optional MFA. A pass never changes names, seating, or classroom visibility preferences. Enable **Show student avatars** in the teacher's classroom if needed.

Student saves atomically update only their avatar and advance the cloud document revision. Existing five-second polling and three-way merging bring changes back to the teacher; conflicting teacher edits use the existing conflict-review flow. Student saves still work while the teacher's browser is closed. Failed saves retain the student's editor draft. Local expiry closes the editor; server checks also reject revoked or expired passes already open on a device.

Backend migration: `supabase/migrations/20261019193425_temporary_avatar_passes.sql`. The private bearer function has a fixed empty search path and explicit grants; the exposed RPC is an invoker wrapper. Anonymous callers have no table access. The QR generator in `classroom/vendor/qrcode.js` is qrcode-generator 1.4.4 (MIT), with an ESM export adapter.

Verification: `node --test tests/*.test.mjs`; browser suites `tests/classroom-avatar-passes.browser.cjs` and `tests/classroom-avatar-passes-cloud.browser.cjs` use Playwright against the local site server. In a **disposable local PostgreSQL database**, run `tests/classroom-avatar-passes.bootstrap.sql`, the migration, then `tests/classroom-avatar-passes.integration.sql`. The bootstrap is a minimal local Supabase auth/RLS fixture, never a production migration. Integration checks cover private projection, valid saves, revision changes, invalid payloads/tokens, anonymous and cross-owner access, teacher MFA, expiry, and revocation. Physical QR scanning on student devices remains a hands-on check.

### Birthdays and live date/time furniture

Use **Birthdays** in the toolbar or **Birthday** under a student's roster options to save a month and day (no birth year). Saved student lists and backups retain birthdays. **Celebrate now** previews or reopens a celebration, including on a different day. While Studio is open, today's birthdays appear one at a time when no other dialog is open. Each large celebration shows a smiling avatar, party hat, and balloons, and stays until dismissed. Dismissal is remembered for that student, classroom, and local date in this browser; multiple birthdays are shown in turn. February 29 is celebrated on February 29.

The furniture catalog's **Calendar**, **Analog clock**, and **Digital clock** use the device's current local date/time and update while Studio is open. Existing calendar and wall-clock furniture automatically become live. Digital clocks default to 12-hour time with AM/PM. Select a digital clock and use **Details → Time format** to choose 12-hour or 24-hour time for that clock. The choice is saved with the classroom and retained in backups and duplicates.

Birthday celebrations include continuous falling confetti (static decoration with reduced motion). The party hat temporarily replaces headgear and hair ornaments, while retaining glasses and headphones worn around the neck. Its placement follows the rendered central hair silhouette for each hairstyle and avatar size; the saved avatar is unchanged.

#### Bulk birthday entry

Choose **Birthdays → Bulk add birthdays**. **Download template** exports a CSV with the current roster's full names and any saved birthdays. Fill in the second column using **MM/DD** (no year), then upload the CSV or paste the two columns directly from Excel/Google Sheets. Blank birthdays are skipped and never clear saved dates.

Choose **Preview birthdays** to review matches. Full names match without regard to capitalization or extra spaces. Unmatched names, ambiguous roster names, duplicate rows, and invalid dates must be corrected before saving. Changes to existing dates are shown explicitly and require **Apply changes to existing birthdays**. Editing the pasted list invalidates its preview; roster changes also require a new preview. Saving updates the current classroom in one undoable step. Canceling leaves birthdays unchanged.

#### SIS reports across saved lists and classrooms

Choose **Birthdays → Import SIS report across lists**. Upload CSV or a text-based PDF, or paste spreadsheet/report text. PDF parsing uses a locally bundled PDF.js worker; there is no AI/OCR service or report upload. Scanned-image PDFs need a CSV export instead. PDF reports can have repeated **Student / Grade / Birthdate** groups across the page. CSV supports those groups, separate First Name/Last Name columns, and standard two-column birthday templates. Full dates use US month/day/year order; only month/day is saved.

Matching searches every saved student list and existing classroom using full names, with case/space normalization and `Last, First` to `First Last` conversion. Grade is displayed for teacher review; it is not inferred from a list's title. Each report row shows all proposed destinations with individual checkboxes. Unmatched students and blank birthdays are skipped without creating students. Duplicate report names, invalid dates, and same-named students within a destination require correction, selection, or explicitly skipping the row. Same-named students across different grades must be distinguished by reviewing the destinations; there is no fuzzy-name matching.

Before saving, check **I reviewed the names and selected lists/classrooms**, and explicitly approve any changes to existing birthdays. Saving updates the selected destinations in one undoable change. A change to the underlying roster invalidates the preview. Only month/day birthdays are added to normal classroom data; report text and grade/birth-year values are not saved. Normal account cloud sync still applies to the confirmed birthday data.

Third-party PDF library: `classroom/vendor/pdfjs/` contains PDF.js and its Apache 2.0 license.

#### Weekend celebrations and push birthday reminders

Open **Birthdays → Birthday reminders**. **Celebrate Saturday and Sunday birthdays on Friday** defaults on and syncs as a classroom-document preference. Actual dates are unchanged. Birthday cards mark weekend dates and their preceding Friday. On Friday, automatic celebrations include both weekend days with an early-celebration caption. Dismissal is keyed to the actual birthday occurrence, so that classroom/student is not automatically celebrated again that weekend in the same browser. Explicit Celebrate now remains available. Non-leap years do not invent a February 29 birthday.

Push is opt-in per browser/device and requires a teacher account with cloud classrooms saved. The default schedule is 07:00 in the device's detected IANA timezone, on weekdays only. Teachers can change the time/zone and explicitly opt into names on the lock screen; the default notification contains counts only. Names are deduplicated across saved lists and classrooms for the daily summary. Signing out unsubscribes this browser. iPhone/iPad users must first open the installed Home Screen web app. This worker does not cache pages or read local rosters in the background.

Backend deployment consists of the migration `supabase/migrations/20261025065612_birthday_push_reminders.sql` and the pinned Deno function in `supabase/functions/birthday-reminders/`. This adds service-only, RLS-enabled subscription/configuration/delivery tables, atomic delivery claims, a five-minute cron dispatcher, and daily delivery-log cleanup. The function verifies signed-in users through Auth and the existing caller-scoped classroom/MFA policy; cron uses a random server-only scheduler key. VAPID keys are generated on the first authenticated configuration request and retained in the service-only configuration table. No service credentials or private VAPID key are shipped to browsers. Cron sends from saved cloud birthdays, not unsaved browser state. Reminders normally arrive within five minutes; transient failures retry within a 90-minute window with at most four attempts. Provider delivery and OS notification settings can delay or suppress alerts.

The production migration and `birthday-reminders` Edge Function were deployed to SAS Classroom Studio on October 25, 2026 after explicit approval. The five-minute dispatcher and daily delivery-log cleanup are enabled. A scheduler-authenticated `dryRun` request checks backend health without sending notifications. Device permission and subscription are still opt-in; the settings screen alone is not proof of provider delivery. After deployment, enable notifications on a real device and use **Send test notification** to verify browser/OS permission and provider delivery.

Validation: birthday/date and delivery-rule Node tests; `tests/classroom-birthday-reminders.browser.cjs` (mocked provider, no real messages); `tests/classroom-birthday-push.integration.sql` (transactional disposable database); and the Deno encryption runtime test. The browser/server copies of `celebration-date.mjs` must remain identical.

The avatar Hair tab includes a live hairstyle search and seven shape/texture groups, with no gender labels. Search matches style and group names; the group filter can narrow results further. Sponge curl afro · low taper adds a full rounded coil silhouette, shaped front hairline and low temple fades.

### Classroom board

The homepage opens Classroom Studio directly; the former `/teacher-tools/` URL forwards here. Switch between **Room** (seating and classroom management) and **Board** (teaching notes). Each classroom has one board, saved in the same document as its room and included in backups and the existing cloud save flow.

Choose **Add tool → Note**, then type directly into its title and text. The inline toolbar formats selected text and inserts lists or checklists. Notes have colors, fonts, text size and alignment, position locking, hide/show, duplication, and deletion. Drag the top handle to move, drag the corner to resize, or use arrow keys on either handle (Shift for fine adjustments). The Notes list provides access to hidden notes. Present hides editing controls; Exit presentation or Escape returns to editing. Checklists remain interactive while presenting.

Boards use a fixed 1600 × 900 canvas fitted to the available viewport. On small screens, selecting a note enlarges it within the board while the inline toolbar stays available. Saved note text and formatting use a validated text tree, never arbitrary saved HTML. Boards support up to 100 notes, each with 12,000 characters.

Notes now edit directly on the board. Click the note or its Edit button to use the inline toolbar for selection formatting, lists, checklists, text size/color, and alignment. Choose built-in fonts, a device font, or a Google Fonts family. Google Fonts download when selected and use the system fallback if unavailable. Note formatting is stored as a validated tree of text and supported formatting elements, rather than arbitrary HTML. Pasted content enters as plain text.

**Add tool → Timer** adds a movable countdown with minutes/seconds, Start/Pause, Reset, +1 minute, and optional sound. Timers save an absolute deadline so a running countdown remains accurate after backgrounding or reloading. Timer controls stay available during presentation; sound requires enabling it on the current device.

Room's **Tools** menu contains birthdays, the name picker, shuffle, Group maker, and a timer shortcut. Group maker uses the current roster, supports a group count or maximum students per group, lets teachers exclude absent students, and saves balanced group results with student avatars. Grouping does not move seats or change the picker/cleaner exclusions. Group results and timer/note data are included in classroom duplication and backups.

Titles and body text support independent rich formatting. Select words in either field, then use the mini bar for bold, italic, underline, strikethrough, font, or size. Its Title/Body indicator shows the active field; pressed buttons reflect the selection. Built-in, device, and common Google Fonts are available directly in the font picker. More opens custom Google/device font entry, lists, checklists, alignment, and colors. At a collapsed caret, font/size changes apply to subsequent typing rather than the entire note. Formatted titles remain limited to 120 characters and are preserved in backups.
