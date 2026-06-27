# Pakt SEO Landing Block Inventory

Source: `pakt_seo_landing_component_library_for_agent.md`

This is the quick scan list of reusable blocks and why each exists. The full brief remains the source of truth for slots, implementation notes, page recipes, and acceptance criteria.

| # | Block | Why It Exists |
| ---: | --- | --- |
| 1 | `HeaderNav` | Provides page anchors, download path, and consistent product navigation. |
| 2 | `StoreCtaButtons` | Provides consistent App Store and Google Play install CTAs across hero, mid-page, and final sections. |
| 3 | `HeroProduct` | States page intent above the fold, communicates product positioning, and drives app-store clicks. |
| 4 | `PhoneMockupShowcase` | Shows product UI so offline translation feels tangible rather than abstract. |
| 5 | `SituationBlock` | Frames the travel pain before introducing features. |
| 6 | `FeatureGrid` | Summarizes core product benefits in a scannable layout. |
| 7 | `HowItWorksSteps` | Explains setup and usage as a clear numbered sequence. |
| 8 | `AppFlowSteps` | Shows a functional translation flow, such as speak, translate, hear. |
| 9 | `ScenarioCards` | Connects Pakt to real-world travel situations. |
| 10 | `TravelChecklist` | Makes the page useful for travelers and supports download-before-trip messaging. |
| 11 | `OfflineProofBand` | Communicates reliability when WiFi, roaming, or signal is unavailable. |
| 12 | `PrivacyBlock` | Explains local/on-device/private translation positioning without hardcoding legal claims. |
| 13 | `ConversationBlock` | Shows how Pakt supports real conversations between people using two languages. |
| 14 | `DestinationModule` | Supports future destination pages such as Japan, Spain, France, and Italy. |
| 15 | `ComparisonTable` | Supports evaluation pages such as best offline translator app. |
| 16 | `FAQAccordion` | Answers common objections and creates crawlable long-tail content. |
| 17 | `FinalCTA` | Gives users a final install path after reading the page. |
| 18 | `LanguageSupportGrid` | Communicates breadth of language support and voice-language coverage. |
| 19 | `FullLanguageListPanel` | Shows broader language coverage without overloading the main layout. |
| 20 | `RelatedPagesGrid` | Connects SEO pages to each other with crawlable internal links. |
| 21 | `LongFormSEOText` | Adds crawlable explanatory substance without turning the page into a blog post. |

## Registered Options

- `PrivacyBlock.variant = "on_device_usp"`: no-cloud/on-device privacy proof treatment. See `block-options.md`.
- `ConversationBlock.variant = "two_language_cards"`: two-language conversation visual with colored input cards. See `block-options.md`.
- `DestinationModule.variant = "image_cta_teaser"`: destination-specific USP, CTA, and image teaser. See `block-options.md`.

## Approved Page Recipes

The full brief defines assembly recipes for:

- `/pakt/`
- `/pakt/offline-translator-app/`
- `/pakt/offline-translator-for-travel/`
- `/pakt/voice-speech-translator/`
- `/pakt/best-offline-translator-app/`
- future destination pages such as `/pakt/offline-translator-for-japan/`

## Do Not Implement Unless Separately Requested

These were not clearly present as reusable SEO landing-page components:

- Sticky mobile CTA bar
- Breadcrumb visual block
- Press/reviews/logo strip
- Pricing/paywall landing-page block
- Camera/OCR marketing block
- Blog-card/feed block
- Testimonial carousel
- Case-study block
