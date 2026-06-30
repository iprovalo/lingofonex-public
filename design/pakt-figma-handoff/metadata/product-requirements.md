# Pakt SEO Product Requirements

Canonical claim ledger for the Pakt SEO and marketing pages.

Last updated: 2026-06-29

## Language Coverage Claims

- Translation coverage: use `100+ languages` in compact UI/stat blocks and `100 languages` in precise SEO prose, metadata, structured data, and `llms.txt`.
- Voice output coverage: use `50 languages` everywhere.
- Do not publish or generate the previous voice-language count in Pakt marketing, SEO metadata, structured data, FAQs, localized legacy pages, or design handoff documentation.

## Source Of Truth

- Stage 2 SEO pages: `SEO/scripts/generate_pakt_stage2.py`.
- Rendered Stage 2 pages: `pakt/offline-translator-app/`, `pakt/offline-translator-for-travel/`, `pakt/voice-speech-translator/`, `pakt/best-offline-translator-app/`, `pakt/component-showcase/`, and `pakt/component-parity/`.
- Machine-readable SEO summary: `llms.txt`.
- Legacy localized marketing pages still need matching claim text where they mention voice-language coverage.

## Verification

- Search rendered prose, metadata, structured data, and documentation for stale voice-language counts before handoff.
- Regenerate Stage 2 pages after changing canonical claims with `python3 SEO/scripts/generate_pakt_stage2.py`.
