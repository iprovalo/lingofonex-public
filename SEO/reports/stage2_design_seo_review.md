# Pakt Stage 2A Design + SEO Review

Generated: 2026-06-18

## Verdict

Technical/browser QA passes and SEO requirements pass. Visual alignment with the Figma Pakt design system is now substantially closer after the second design pass, especially on the mobile first viewport.

The generated Stage 2A pages are safe to preview for content, SEO, and responsive behavior. I would still do a designer review before committing, but the implementation now follows the supplied Pakt landing-page kit much more closely than the first pass.

## QA Evidence

- SEO audit: `SEO/reports/seo_stage2_pages_audit.md`
- Playwright audit: `SEO/reports/pakt_stage2_playwright_qa.md`
- Figma mobile reference: `SEO/reports/figma-reference/pakt-mobile-figma.png`
- Figma desktop reference: `SEO/reports/figma-reference/pakt-desktop-figma.png`
- Web mobile reference: `SEO/reports/screenshots/offline-translator-app-mobile.png`
- Web mobile first viewport: `SEO/reports/screenshots/offline-translator-app-mobile-viewport.png`
- Web desktop reference: `SEO/reports/screenshots/offline-translator-app-desktop.png`
- Mobile comparison table check: `SEO/reports/screenshots/best-offline-translator-app-mobile.png`

## SEO Status

Pass:

- 4 Stage 2A pages generated.
- One H1 per page.
- Unique title and meta description per page.
- Self-referencing canonicals.
- `index,follow` robots.
- OG and Twitter metadata.
- JSON-LD parses and includes WebPage, MobileApplication, BreadcrumbList, FAQPage.
- Breadcrumb UI exists.
- App Store and Google Play CTAs visible.
- Internal links resolve.
- Sitemap count is 166.
- `llms.txt` includes the Stage 2A pages.
- No forbidden Stage 2 claim strings found.

Visible word counts:

- `/pakt/offline-translator-app/`: 1370
- `/pakt/offline-translator-for-travel/`: 1251
- `/pakt/voice-speech-translator/`: 1007
- `/pakt/best-offline-translator-app/`: 1573

## Design Comparison

Matches:

- Uses the approved warm white, black, orange, and blue palette.
- Uses Caslon Ionic-style headings and Geist body/UI.
- Uses 8px card/button geometry.
- Uses a real travel-photo hero asset: `images/pakt-travel-hero.png`.
- Uses the Pakt wordmark in the overlaid header.
- Uses a photo-led mobile/desktop hero with an app phone mockup.
- Includes sticky mobile download CTA.
- Uses overlapping orange/blue situation cards.
- Uses colorful travel scenario tiles.
- Uses a dark offline proof block.
- Includes reusable hero, CTA, trust, problem, feature, steps, proof, privacy, language, scenario, comparison, FAQ, related, and final CTA sections.
- Mobile layout is readable with no horizontal overflow.
- Comparison table collapses to stacked mobile rows.

Gaps:

- The hero uses a generated mountain/travel photo rather than the exact Figma background asset.
- The app mockup is CSS-built rather than a real Pakt app screenshot.
- Figma feature section has a bordered kit/container feel; implementation is close but still more SEO/editorial.
- Figma includes phone screenshot showcase cards for Speak/Translate/Hear; implementation still uses text scenario cards for these pages.
- Figma includes destination/Japan module with real image; Stage 2A pages do not include the destination proof visual because destination pages are Stage 2C.
- Figma final CTA is slightly more compact; implementation keeps more SEO copy in the final CTA.

## Recommendation

Commit only after deciding the design bar:

- If the priority is SEO staging and previewing content architecture: current local build is now good enough to review.
- If the priority is designer-approved visual parity: have the designer review the hero image, app mockup fidelity, and feature-card density before committing.

Highest-impact design fixes before commit:

1. Replace the generated hero photo with the exact approved background asset if the designer provides it.
2. Replace the CSS phone mockup with approved Pakt app screenshots.
3. Tighten feature-card density to match the bordered Figma kit more closely.
4. Add phone screenshot showcase rows for voice/conversation sections.
5. Re-check final CTA compactness on mobile after real app screenshots are available.
