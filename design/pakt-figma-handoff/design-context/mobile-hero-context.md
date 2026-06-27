# Mobile Hero Design Context

Source:

- Figma file: `04jJPedY2ouLBwKC3rTKjJ`
- Mobile frame: `325:7573`
- Hero copy group: `328:12041`

Pulled via Figma `get_design_context` on 2026-06-18.

## Text

```text
Offline translation for real-world conversations.

Pakt works on your phone — no data, no roaming, no sign-in. Buy it once, use it everywhere.
```

## Key CSS-Like Values From Figma

```text
Hero copy group:
display: flex;
flex-direction: column;
gap: 12px;
align-items: flex-start;

H1:
font-family: Caslon Ionic;
font-style: Regular;
font-size: 38px;
font-weight: 400;
line-height: 1.05;
letter-spacing: -0.38px;
color: #FAF7EC;
width: 364px;

Body:
font-family: Geist;
font-size: 14px;
font-weight: 400;
line-height: 1.2;
color: #FAF7EC;
width: 317px;
height: 40px;

Store row:
display: flex;
gap: 8px;
height: 40px;

Store buttons:
width: 120px;
height: 40px;
border: 1.003px solid #FAF7EC;
border-radius: 584.507px;
overflow: hidden;
```

## Asset URLs Downloaded Locally

These were exposed by the Figma context and copied into `assets/`:

- `assets/hero-appstore-apple.png`
- `assets/hero-playstore-icon.png`
- `assets/hero-playstore-wordmark.png`

Original temporary Figma URLs:

```text
Apple icon: https://www.figma.com/api/mcp/asset/3d7b9847-1006-4423-bd2b-522dbfb32f27
Play Store icon: https://www.figma.com/api/mcp/asset/b67470d9-f1ef-4554-8698-80e5118ef793
Play Store wordmark: https://www.figma.com/api/mcp/asset/91370cc8-af1d-4e11-907e-5391d42a32b2
```

## Notes For Agents

- The Figma output is React/Tailwind-like reference code, not production HTML.
- Convert it into the repo's static HTML/CSS generator.
- Do not bake hero text into images. Keep the H1/body real HTML.
- Existing implementation entry points:
  - `SEO/scripts/generate_pakt_stage2.py`
  - `css/pakt-stage2.css`

