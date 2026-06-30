# Pakt Figma Handoff

Local design package for the Pakt SEO/marketing page work.

Generated: 2026-06-18

This is not a native `.fig` export. It is an agent-readable local handoff built from the connected Figma file: full-page reference screenshots, cropped section screenshots, design tokens, source node IDs, small extracted assets, and notes that point back to the current web implementation.

## Source

- Figma file: `Pakt`
- Figma file key: `04jJPedY2ouLBwKC3rTKjJ`
- Mobile source URL: `https://www.figma.com/design/04jJPedY2ouLBwKC3rTKjJ/Pakt?node-id=325-7573&m=dev`
- Desktop source URL: `https://www.figma.com/design/04jJPedY2ouLBwKC3rTKjJ/Pakt?node-id=211-5382&m=dev`
- Mobile root frame: `325:7573`, `iPhone 17 - 72`, `402 x 9147`
- Desktop root frame: `211:5382`, `1512 x 9504`

## What Is In This Folder

- `figma-screenshots/pakt-mobile-full.png` - full mobile Figma frame.
- `figma-screenshots/pakt-desktop-full.png` - full desktop Figma frame.
- `figma-screenshots/pakt-desktop-grid-reference.jpg` - user-provided designer grid screenshot for desktop spacing checks.
- `figma-screenshots/mobile-sections/` - mobile frame cropped into named page sections.
- `figma-screenshots/desktop-sections/` - desktop frame cropped into named page sections.
- `figma-screenshots/live-import/` - authenticated in-app browser verification screenshots for updated Figma frames.
- `web-screenshots/` - current local implementation screenshots from Playwright QA.
- `tokens/figma-variable-defs.json` - colors and typography variables pulled from Figma.
- `tokens/pakt-tokens.css` - CSS custom property reference for implementation work.
- `metadata/manifest.json` - machine-readable index of the package.
- `metadata/product-requirements.md` - canonical SEO/product claim ledger, including the `100+ / 50` language coverage rules.
- `metadata/node-map.json` - source Figma nodes and local screenshot mapping.
- `metadata/screenshot-inventory.md` - dimensions for every Figma and web screenshot.
- `component-library/` - reusable SEO landing-page block inventory, page recipes, and out-of-scope block rules.
- `metadata/component-options.json` - machine-readable registry for component options such as `PrivacyBlock.variant = "on_device_usp"`.
- `design-context/mobile-hero-context.md` - CSS-like context extracted from the Figma hero copy group.
- `assets/` - local Figma assets used by the rebuild, including hero background, wordmark, phone mockup, and store-button pieces.
- `notes/current-implementation.md` - implementation entry points and QA pointers.

Updated component variant:

- `MacBook Pro 14" - 17`, node `667:9735`, page group `final web`.
- Registers `PrivacyBlock.variant = "on_device_usp"`, `ConversationBlock.variant = "two_language_cards"`, and `DestinationModule.variant = "image_cta_teaser"`.
- Latest web comparison crops: `web-screenshots/offline-translator-app-desktop-privacy-destination-loaded.png` and `web-screenshots/offline-translator-app-mobile-privacy-destination-loaded.png`.

## How Agents Should Use This

Start with the full screenshots, then compare section crops against the matching local web screenshots.

For code work, edit the generator and shared CSS:

- `SEO/scripts/generate_pakt_stage2.py`
- `css/pakt-stage2.css`

Before adding or changing page blocks, read:

- `component-library/pakt_seo_landing_component_library_for_agent.md`
- `component-library/block-inventory.md`

For SEO checks, run:

```bash
python3 SEO/scripts/seo_stage2_pages_audit.py
node SEO/scripts/pakt_stage2_playwright_qa.js
node SEO/scripts/pakt_component_showcase_qa.js
node SEO/scripts/pakt_visual_parity_audit.js
```

For visual matching, use the full Figma screenshots and mobile section crops as the design contract. The desktop section crops are useful, but some are viewport slices that overlap neighboring sections; verify desktop decisions against `figma-screenshots/pakt-desktop-full.png` and the component-variant crops.

The full component catalog is available locally at `/pakt/component-showcase/`. It is intentionally `noindex,nofollow` and should not be added to the sitemap.

## Known Limitations

- The current web implementation uses the local handoff assets `images/pakt-figma-hero-bg.png` and `images/pakt-figma-phone-mockup.png`; fresh live re-export from Figma was not available in the resumed Codex session on 2026-06-26.
- The hero phone mockup is still an image/CSS reconstruction, not a full exported app implementation.
- `OfflineProofBand` now uses a Figma-cropped phone/control-center visual from `images/pakt-offline-proof-phone.png` and `images/pakt-offline-proof-phone-desktop.png`.
- Public SVG icons must have explicit provenance. Stage-2 UI icons now come from user-provided named Figma SVG exports or extracted glyphs from user-provided full-page Figma SVG exports, and are checksum-pinned in `SEO/scripts/pakt_asset_provenance_audit.js`. Do not add a hand-authored/recreated SVG and describe it as original Figma artwork.
- Key assets surfaced by Figma are local in `assets/`; full-image sections should be reconstructed from screenshots or refreshed through Figma if exact production assets are needed.
- Figma temporary asset URLs can expire. Use the file key and node IDs in `metadata/` to refresh the package.
