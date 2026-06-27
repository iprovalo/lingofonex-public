# Pakt In-App Browser Component QA - PASS

Generated: 2026-06-22

This is a fallback browser QA pass using the Codex in-app browser because the standalone showcase Playwright runner is currently blocked by local browser launch issues: bundled Chromium is missing, and system Chrome aborts during launch for this script.

## Desktop Viewport

- `/pakt/component-showcase/`: PASS
- `/pakt/component-parity/`: PASS
- All 21 documented SEO blocks present.
- Exactly one `h1`.
- `robots` meta is `noindex,nofollow`.
- No document-level horizontal overflow at `1512 x 1200` (`scrollWidth` equals `clientWidth`). The desktop ScenarioCards row intentionally extends inside a clipped section and does not create page scroll.

## Mobile Viewport

Viewport override: `402 x 1200`

- `/pakt/component-showcase/`: PASS
- `/pakt/component-parity/`: PASS
- All 21 documented SEO blocks present.
- Exactly one `h1`.
- `robots` meta is `noindex,nofollow`.
- No horizontal overflow (`scrollWidth` equals `clientWidth`, measured at `387px` content width in the in-app browser).
- No suspiciously small or collapsed `[data-block]` boxes.

## Caveats

- This does not replace the strict pixel parity audit.
- Lazy below-fold images were not counted as failures in this fallback pass because the in-app browser read-only evaluation path cannot reliably force lazy image decoding. The shell Playwright QA remains the canonical image-load check when run with `PAKT_USE_SYSTEM_CHROME=1`.
- The latest strict component parity audit is `98.7898%` average, `99.2448%` mobile, `98.2936%` desktop, with `23/23` comparable crops passing the strict `98%` gate.
