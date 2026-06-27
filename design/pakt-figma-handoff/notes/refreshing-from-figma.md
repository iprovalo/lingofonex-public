# Refreshing From Figma

Use the Figma connector against file key `04jJPedY2ouLBwKC3rTKjJ`.

Important nodes:

- Mobile root: `325:7573`
- Desktop root: `211:5382`
- Mobile hero copy: `328:12041`
- Mobile situation section: `328:12086`
- Mobile features: `420:8743`
- Mobile how it works: `328:9901`
- Mobile travel confidence: `328:10303`
- Mobile checklist: `667:9732`
- Mobile privacy/conversation/destination block: `328:12028`
- Mobile comparison: `667:10068`
- Mobile FAQ: `328:11075`
- Mobile final CTA: `328:11491`

Corrected component-option reference:

- Privacy / conversation / destination stack: `figma-screenshots/component-variants/privacy-conversation-destination-stack-desktop.png`
- Source file provided by user: `/Users/dmit-mini/Downloads/MacBook Pro 14_ - 17.png`
- Live browser verification: `figma-screenshots/live-import/figma-live-macbook-pro-14-17-25pct-frame-crop.png`
- Live Figma frame: `MacBook Pro 14" - 17`, node `667:9735`, opened from `final web`
- Registered options: `PrivacyBlock.variant = "on_device_usp"`, `ConversationBlock.variant = "two_language_cards"`, `DestinationModule.variant = "image_cta_teaser"`
- Current status: live-verified through the authenticated in-app browser on 2026-06-19. Full-resolution direct connector export remains blocked by the Figma MCP rate limit; in-app browser downloads are unsupported, so keep the user-provided PNG as the high-resolution component-detail source.

Recommended refresh order:

1. Export full screenshots for mobile and desktop roots.
2. Crop the screenshots into section files with stable names.
3. Pull variable definitions and update `tokens/figma-variable-defs.json`.
4. Pull design context only for small, targeted nodes. Large page-level context can be noisy.
5. Update `metadata/manifest.json` and `metadata/node-map.json`.

Keep temporary Figma asset URLs out of source files unless they are only used as provenance notes. Download anything needed into `assets/`.
