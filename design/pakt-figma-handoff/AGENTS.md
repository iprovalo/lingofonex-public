# Pakt Design Handoff Agent Notes

This folder is a local design package for Pakt SEO/marketing page work.

Before editing implementation, read:

1. `README.md`
2. `metadata/node-map.json`
3. `tokens/token-summary.md`
4. `component-library/pakt_seo_landing_component_library_for_agent.md`
5. `component-library/block-inventory.md`
6. `notes/current-implementation.md`

Use the Figma screenshots as the visual source of truth. Use the current web screenshots only as implementation evidence.

Primary implementation files are outside this folder:

- `../../SEO/scripts/generate_pakt_stage2.py`
- `../../css/pakt-stage2.css`

Prioritize mobile visual parity first, especially:

- `figma-screenshots/mobile-sections/01-hero.png`
- `figma-screenshots/mobile-sections/02-situation.png`
- `figma-screenshots/mobile-sections/03-features.png`
- `figma-screenshots/mobile-sections/04-how-it-works.png`

Do not commit this screenshot-heavy folder unless the user explicitly approves including design artifacts in Git.

Do not implement these as reusable SEO landing-page blocks unless separately requested:

- Sticky mobile CTA bar
- Breadcrumb visual block
- Press/reviews/logo strip
- Pricing/paywall landing-page block
- Camera/OCR marketing block
- Blog-card/feed block
- Testimonial carousel
- Case-study block
