# Release requirements

For every change to site HTML, JavaScript, or CSS, advance the site release before completing the task. Run `node scripts/site-release.mjs YYYY.MM.DD.iteration "User-facing change"` using the current date in America/New_York and the next iteration for that date. This synchronizes all footer metadata, release notes, cache tags, and the release source fingerprint.

Run `node scripts/site-release.mjs --check` after the final site edit. It must pass; changes after preparing the release require another release bump. GitHub runs this check on pushes and pull requests.

Always suggest a GitHub commit summary when there is something to commit. Keep its subject at most 50 characters.
