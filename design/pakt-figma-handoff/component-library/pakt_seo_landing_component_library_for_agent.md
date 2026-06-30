# Pakt SEO Landing Page Component Library — Implementation Inventory

## Scope

Implement only reusable landing-page blocks that are visibly present in the approved Pakt design files.

This is not a copywriting brief. Copy must remain configurable per page. The agent should build a reusable constructor system that can assemble `/pakt/` and future `/pakt/*` SEO pages from the same block library.

## Global implementation rules

1. Keep all meaningful copy as real HTML text, not embedded inside images.
2. Use semantic headings. Each page must have exactly one `<h1>`; every reusable block should accept its heading level as a prop or render `<h2>` by default.
3. Every CTA must be a real `<a href>` link.
4. Every image/mockup must have meaningful `alt` text or empty `alt=""` if decorative.
5. Components must be responsive. Use the desktop and mobile designs as breakpoints, not as separate duplicated HTML.
6. Components must not hardcode page-specific copy. Use data/config objects.
7. Do not introduce new marketing blocks not present in the design unless explicitly requested.
8. Avoid unsupported product claims in templates. Claim text must be supplied by page content and reviewed separately.

---

# Component inventory

## 1. HeaderNav

**What it does**  
Top navigation for landing pages.

**Purpose**  
Provides page anchors, download path, and consistent product navigation.

**Visible in design**  
Desktop top nav with links like Features, How it works, Privacy, FAQ, and Get app.

**Required slots**

```yaml
logo
nav_items:
  - label
    href
primary_cta:
  label
  href
```

**Implementation notes**

- Must be crawlable raw HTML.
- Use anchor links for same-page sections where applicable.
- On mobile, collapse only if the approved mobile design pattern supports it; otherwise keep a simple horizontal/stacked layout.

---

## 2. StoreCtaButtons

**What it does**  
Reusable App Store download button group. Google Play is intentionally paused for now.

**Purpose**  
Provides consistent install CTAs across hero, mid-page sections, and final CTA.

**Visible in design**  
Hero and final CTA include the App Store badge.

**Required slots**

```yaml
apple_url
google_url
layout: inline | stacked
size: default | compact
```

**Implementation notes**

- Use self-hosted badge assets where available.
- Buttons must be links, not images without links.
- Add `aria-label` values such as `Download Pakt on the App Store`.

---

## 3. HeroProduct

**What it does**  
Main above-the-fold landing section.

**Purpose**  
States page intent, communicates app positioning, and drives app-store clicks.

**Visible in design**  
Large headline, short intro copy, download buttons, and phone/app visual.

**Required slots**

```yaml
eyebrow
heading
body
primary_cta
secondary_cta
store_buttons
visual
background_variant: image | solid | light
```

**Implementation notes**

- On `/pakt/`, this block owns the page `<h1>`.
- On child SEO pages, heading should also be the page `<h1>` unless another page-level hero is used.
- Visual should be optional so text-first pages can still use the block.

---

## 4. PhoneMockupShowcase

**What it does**  
Displays one or more phone/app screens.

**Purpose**  
Shows product UI and makes offline translation feel tangible.

**Visible in design**  
Hero phone mockup, speak/translate/hear cards, offline proof visuals, conversation UI.

**Required slots**

```yaml
screens:
  - image
    alt
    caption_optional
layout: single | side_by_side | triple_flow | conversation
```

**Implementation notes**

- Can be used as a standalone block or nested inside HeroProduct, AppFlowSteps, OfflineProofBand, PrivacyBlock, and ConversationBlock.
- Do not bake important page copy into screenshot images.

---

## 5. SituationBlock

**What it does**  
Problem/situation explanation section.

**Purpose**  
Frames the travel pain before introducing features.

**Visible in design**  
“The situation” section with travel context, weak WiFi, roaming, taxis, hotels, restaurants, pharmacies.

**Required slots**

```yaml
eyebrow
heading
body
secondary_body_optional
highlight_optional
```

**Implementation notes**

- Use for pages where the user problem needs to be made explicit.
- Works well early in a page after the hero.

---

## 6. FeatureGrid

**What it does**  
Grid of product feature cards.

**Purpose**  
Summarizes core product benefits in a scannable layout.

**Visible in design**  
“Built for the road” feature cards: offline translation, voice input, private by design, travel ready, no cloud, multi-language support.

**Required slots**

```yaml
eyebrow
heading
cards:
  - icon
    title
    body
```

**Implementation notes**

- Must support 3, 4, or 6 cards.
- Cards should be real text and icons, not flattened images.

---

## 7. HowItWorksSteps

**What it does**  
Numbered 3-step process block.

**Purpose**  
Explains setup and usage sequence.

**Visible in design**  
“Set it up once. Use it anywhere” with 01 / 02 / 03.

**Required slots**

```yaml
eyebrow
heading
steps:
  - number
    title
    body
```

**Implementation notes**

- Default is 3 steps.
- Should support horizontal desktop and stacked mobile.

---

## 8. AppFlowSteps

**What it does**  
Visual product flow section with app screens.

**Purpose**  
Shows a functional translation flow such as speak → translate → hear.

**Visible in design**  
“Travel with confidence” section with Speak, Translate, Hear cards and phone UI.

**Required slots**

```yaml
eyebrow
heading
flow_cards:
  - title
    body
    visual
```

**Implementation notes**

- Use for voice/speech/conversation pages.
- Must support three cards on desktop and stacked cards on mobile.

---

## 9. ScenarioCards

**What it does**  
Travel use-case card grid.

**Purpose**  
Connects the product to real-world situations.

**Visible in design**  
“Wherever travel takes you” with Taxis, Hotels, Restaurants, Pharmacies, Train stations, Markets, Airports.

**Required slots**

```yaml
eyebrow
heading
cards:
  - icon_or_label
    title
    body
```

**Implementation notes**

- Must support 4–8 cards.
- Use for travel pages, destination pages, and scenario pages.

---

## 10. TravelChecklist

**What it does**  
Checklist-style preparation block.

**Purpose**  
Makes pages useful for travelers and supports “download before your trip” messaging.

**Visible in design**  
“Before you leave” checklist: download languages, test airplane mode, check voice input/output, save app, backup power.

**Required slots**

```yaml
eyebrow
heading
body_optional
items:
  - text
```

**Implementation notes**

- Use check icons or toggles as visual treatment.
- Must support compact and full-width variants.

---

## 11. OfflineProofBand

**What it does**  
Offline/no-connection proof section.

**Purpose**  
Communicates reliability when WiFi, roaming, or signal is unavailable.

**Visible in design**  
“Works when your connection does not” with Airplane mode, No WiFi, Weak signal, plus phone visual.

**Required slots**

```yaml
heading
body
status_chips:
  - label
visual_optional
background_variant: dark | light
```

**Implementation notes**

- This is one of the core differentiator blocks.
- Must be reusable across product, travel, and scenario pages.

---

## 12. PrivacyBlock

**What it does**  
Privacy/no-cloud trust section.

**Purpose**  
Explains local/on-device/private translation positioning.

**Visible in design**  
“Private translation without the cloud” and “On-device only” style treatment.

**Required slots**

```yaml
eyebrow
heading
body
proof_label_optional
visual_optional
```

**Implementation notes**

- Keep language configurable for legal/product review.
- Do not hardcode absolute privacy claims into the component.

---

## 13. ConversationBlock

**What it does**  
Two-language conversation feature section.

**Purpose**  
Shows how Pakt supports real-world conversations between people.

**Visible in design**  
“A real conversation, in two languages” with two input panels / phone UI.

**Required slots**

```yaml
eyebrow
heading
body
left_language
right_language
visual
```

**Implementation notes**

- Use for conversation translator, voice/speech pages, and `/pakt/`.
- Visual should support two-language layout.

---

## 14. DestinationModule

**What it does**  
Reusable destination-specific landing section.

**Purpose**  
Supports future destination pages such as Japan, Spain, France, Italy.

**Visible in design**  
“Destination Japan — Offline translator for Japan travel” with short destination copy and CTA.

**Required slots**

```yaml
eyebrow
heading
destination
language
body
cta
visual_optional
```

**Implementation notes**

- Should not be Japan-specific in code.
- Must be configurable for any destination/language pair.
- Can be used as either a full page hero or an in-page teaser.

---

## 15. ComparisonTable

**What it does**  
Structured comparison component.

**Purpose**  
Supports evaluation pages such as “best offline translator app.”

**Visible in design**  
“How Pakt compares” table with competitors/options and feature rows.

**Required slots**

```yaml
title
columns:
  - label
    highlight: true | false
rows:
  - feature
    values:
      - value
      - value
      - value
notes_optional
```

**Implementation notes**

- Desktop: table layout.
- Mobile: stacked comparison cards.
- Must support highlighted Pakt column.
- Avoid hardcoding competitor claims; table values must come from page config.

---

## 16. FAQAccordion

**What it does**  
Expandable FAQ block.

**Purpose**  
Answers common objections and creates crawlable long-tail content.

**Visible in design**  
“Frequently asked” list of questions.

**Required slots**

```yaml
heading
items:
  - question
    answer
```

**Implementation notes**

- Prefer semantic `<details><summary>` for accessibility and crawlability.
- Optionally support FAQPage JSON-LD only if project decides to add it.

---

## 17. FinalCTA

**What it does**  
Closing download section.

**Purpose**  
Gives users a final install path after reading the page.

**Visible in design**  
“Download Pakt before your next trip” final section with store badges.

**Required slots**

```yaml
heading
body
store_buttons
visual_optional
```

**Implementation notes**

- Should be present on every commercial `/pakt/*` page.
- Can reuse StoreCtaButtons.

---

## 18. LanguageSupportGrid

**What it does**  
Language coverage section with language list and stats.

**Purpose**  
Communicates breadth of language support and voice-language coverage.

**Visible in design**  
“Languages you can rely on” with language list and large 100+ / 50 stats.

**Required slots**

```yaml
heading
body
stats:
  - number
    label
languages:
  - native_name
    english_name
cta_optional
```

**Implementation notes**

- Must support compact grid and expanded/full list variant.
- Keep stats configurable; do not hardcode claim numbers inside CSS/images.

---

## 19. FullLanguageListPanel

**What it does**  
Expanded language list / modal-style language directory.

**Purpose**  
Lets pages show broader language coverage without overloading the main layout.

**Visible in design**  
Large language list panel with many language rows/columns.

**Required slots**

```yaml
languages:
  - native_name
    english_name
search_enabled: true | false
```

**Implementation notes**

- Can be implemented as an inline expandable panel first.
- Modal behavior is optional; do not over-engineer for Stage 2A.

---

## 20. RelatedPagesGrid

**What it does**  
Internal-link card grid.

**Purpose**  
Connects SEO pages to each other and supports crawlable internal linking.

**Visible in design**  
“Explore more” block with cards like Offline Translator App, Voice Translator, Travel Translator, Japan Travel Translator, Airplane Mode Translator.

**Required slots**

```yaml
heading
body_optional
cards:
  - title
    href
    icon_optional
    body_optional
```

**Implementation notes**

- Each card must be a real `<a>` link.
- Use on all Stage 2 SEO pages.
- Do not rely only on nav/footer for internal linking.

---

## 21. LongFormSEOText

**What it does**  
Readable explanatory content block for 2–4 short paragraphs or 3 editorial columns.

**Purpose**  
Adds crawlable substance without making the page feel like a blog post.

**Visible in design**  
“Why offline translation matters” text block with short explanatory paragraphs/columns.

**Required slots**

```yaml
heading
intro_optional
paragraphs:
  - text
cards_optional:
  - icon
    title
    body
```

**Implementation notes**

- Use real paragraphs and headings.
- This block is important for SEO content depth.
- Should support single-column mobile and multi-column desktop.

---

# Recommended page assembly recipes

## `/pakt/`

```yaml
- HeaderNav
- HeroProduct
- SituationBlock
- FeatureGrid
- HowItWorksSteps
- AppFlowSteps
- ScenarioCards
- TravelChecklist
- OfflineProofBand
- PrivacyBlock
- ConversationBlock
- LanguageSupportGrid
- FAQAccordion
- FinalCTA
```

## `/pakt/offline-translator-app/`

```yaml
- HeaderNav
- HeroProduct
- FeatureGrid
- OfflineProofBand
- LanguageSupportGrid
- HowItWorksSteps
- LongFormSEOText
- ScenarioCards
- FAQAccordion
- RelatedPagesGrid
- FinalCTA
```

## `/pakt/offline-translator-for-travel/`

```yaml
- HeaderNav
- HeroProduct
- SituationBlock
- TravelChecklist
- ScenarioCards
- OfflineProofBand
- LanguageSupportGrid
- LongFormSEOText
- FAQAccordion
- RelatedPagesGrid
- FinalCTA
```

## `/pakt/voice-speech-translator/`

```yaml
- HeaderNav
- HeroProduct
- AppFlowSteps
- ConversationBlock
- FeatureGrid
- OfflineProofBand
- LanguageSupportGrid
- LongFormSEOText
- FAQAccordion
- RelatedPagesGrid
- FinalCTA
```

## `/pakt/best-offline-translator-app/`

```yaml
- HeaderNav
- HeroProduct
- ComparisonTable
- FeatureGrid
- OfflineProofBand
- PrivacyBlock
- LongFormSEOText
- FAQAccordion
- RelatedPagesGrid
- FinalCTA
```

## Destination pages, e.g. `/pakt/offline-translator-for-japan/`

```yaml
- HeaderNav
- DestinationModule
- SituationBlock
- TravelChecklist
- ScenarioCards
- OfflineProofBand
- LanguageSupportGrid
- LongFormSEOText
- FAQAccordion
- RelatedPagesGrid
- FinalCTA
```

---

# Do not implement as Stage 2 landing blocks yet

These are either not clearly present as landing-page components, or they are app UI / future-product surfaces rather than approved SEO landing-page blocks:

1. Sticky mobile CTA bar.
2. Breadcrumb visual block.
3. Press / reviews / credibility logo strip.
4. Pricing/paywall landing-page block.
5. Camera/OCR marketing block.
6. Blog-card/feed block.
7. Testimonial carousel.
8. Case-study block.

If these become necessary later, request design confirmation before implementation.

---

# Acceptance criteria

For the component library implementation:

1. All 21 components can be rendered independently from config/data.
2. Components are responsive and match the approved desktop/mobile design direction.
3. No component contains hardcoded SEO copy, destination names, competitor names, or claim numbers except examples in fixtures.
4. Every text-bearing component renders real HTML text.
5. Every link-bearing component uses real `<a href>` links.
6. RelatedPagesGrid outputs crawlable internal links.
7. FAQAccordion is accessible and crawlable.
8. ComparisonTable has a mobile stacked-card layout.
9. LanguageSupportGrid supports both compact and expanded states.
10. The first four Stage 2 pages can be assembled from this library without new design work.
