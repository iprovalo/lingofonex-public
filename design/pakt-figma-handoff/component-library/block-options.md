# Pakt Block Options

This file records approved variations discovered after the initial component inventory.

## Corrected Reference

Source file: `/Users/dmit-mini/Downloads/MacBook Pro 14_ - 17.png`

Local reference:

- `figma-screenshots/component-variants/privacy-conversation-destination-stack-desktop.png`
- `figma-screenshots/live-import/figma-live-macbook-pro-14-17-25pct-frame-crop.png`

Export status:

- Full-resolution component crops are generated from the user-provided PNG.
- The current Figma frame was live-verified in the authenticated in-app browser on 2026-06-19.
- Direct Figma connector export is still blocked by the Figma MCP Starter-plan rate limit.
- In-app browser file downloads are unsupported, so the live import is a browser-canvas screenshot rather than a direct exported PNG.
- Live Figma frame: `MacBook Pro 14" - 17`, node `667:9735`, page/layer group `final web`.

This screenshot contains three reusable SEO landing-page blocks from the component brief:

- `PrivacyBlock`
- `ConversationBlock`
- `DestinationModule`

The earlier checklist-based USP registration was incorrect and has been removed.

## PrivacyBlock

Canonical block name: `PrivacyBlock`

The component-library brief defines this as the privacy/no-cloud trust section.

### Option: `on_device_usp`

Aliases:

- `privacy_usp`
- `no_cloud_proof`
- `local_processing_proof`

Reference:

- Desktop crop: `figma-screenshots/component-variants/privacy-block-on-device-usp-desktop.png`
- Stack reference: `figma-screenshots/component-variants/privacy-conversation-destination-stack-desktop.png`
- Live verification: `figma-screenshots/live-import/figma-live-macbook-pro-14-17-25pct-frame-crop.png`

Purpose:

Use this option when the page needs a trust/USP block focused on local, on-device translation.

Expected slots:

```yaml
eyebrow
heading
body
proof_label_optional
visual_optional
variant: on_device_usp
```

Visual notes:

- Warm cream background.
- Centered uppercase eyebrow.
- Caslon headline.
- Short centered body copy.
- Wide bordered proof panel.
- Centered lock/proof icon with a short label.
- Keep privacy language configurable for product/legal review.

## ConversationBlock

Canonical block name: `ConversationBlock`

The component-library brief defines this as the two-language conversation feature section.

### Option: `two_language_cards`

Aliases:

- `conversation_cards`
- `bilingual_input_cards`
- `voice_chat_cards`

Reference:

- Desktop crop: `figma-screenshots/component-variants/conversation-block-two-language-cards-desktop.png`
- Stack reference: `figma-screenshots/component-variants/privacy-conversation-destination-stack-desktop.png`
- Live verification: `figma-screenshots/live-import/figma-live-macbook-pro-14-17-25pct-frame-crop.png`

Purpose:

Use this option when showing the speak-and-translate conversation interaction as two opposing language cards.

Expected slots:

```yaml
eyebrow
heading
body
left_language
right_language
visual
variant: two_language_cards
```

Visual notes:

- Warm cream background.
- Centered headline and body.
- Wide bordered visual panel.
- Blue and orange speech/input cards.
- Circular microphone affordances.
- Language labels remain configurable.

## DestinationModule

Canonical block name: `DestinationModule`

The component-library brief defines this as the reusable destination-specific landing section.

### Option: `image_cta_teaser`

Aliases:

- `destination_visual_cta`
- `destination_travel_usp`
- `destination_japan_teaser`

Reference:

- Desktop crop: `figma-screenshots/component-variants/destination-module-image-cta-desktop.png`
- Stack reference: `figma-screenshots/component-variants/privacy-conversation-destination-stack-desktop.png`
- Live verification: `figma-screenshots/live-import/figma-live-macbook-pro-14-17-25pct-frame-crop.png`

Purpose:

Use this option when a destination page or in-page teaser needs a destination-specific USP, CTA, and large travel image.

Expected slots:

```yaml
eyebrow
heading
destination
language
body
cta
visual_optional
variant: image_cta_teaser
```

Visual notes:

- Warm cream background.
- Centered destination eyebrow.
- Caslon destination headline.
- Short centered body.
- Black pill CTA.
- Large rounded destination image below the CTA.
- Do not hardcode Japan in the component; destination, language, CTA, and image must be configurable.
