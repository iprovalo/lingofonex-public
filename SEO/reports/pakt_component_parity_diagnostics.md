# Pakt Component Parity Diagnostics

Generated: 2026-06-22T19:31:26.225Z
Audit source: SEO/reports/pakt_component_parity_audit.json (2026-06-22T19:30:55.746Z)
Current strict audit: 98.7898% overall, 99.2448% mobile, 98.2936% desktop

This report is browser-free. It analyzes the already captured Figma/live/diff crops from the strict Playwright audit, so it is safe to run when Chrome candidate tuning is unavailable.

## Below-98 Diagnostics

| Viewport | Block | Score | Classification | Offset Probe | Hottest Row Bands | Hottest Column Bands |
| --- | --- | ---: | --- | --- | --- | --- |

## How To Use This

- `source-or-asset-mismatch` usually means CSS nudges are unlikely to get the crop to 98%; look for stale Figma exports, raster asset differences, or deliberate fixture copy differences.
- `layout-offset-candidate` is only a hint. Apply it only after a strict browser audit confirms the gain in the full page.
- `near-pass-fine-tuning` is a reasonable target for small measured CSS work.
- The mobile HeroProduct, FAQAccordion, FeatureGrid, and privacy/conversation/destination stack remain the largest blockers.

