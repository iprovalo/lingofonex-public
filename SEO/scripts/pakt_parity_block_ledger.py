#!/usr/bin/env python3
"""Create a compact ledger for Pakt component parity work.

The strict visual audit tells us what is below the 98% gate. The diagnostics
report tells us what kind of mismatch it is. This ledger combines those with
known rejected tuning axes from the handoff notes, so future passes can spend
time on source-level fixes instead of replaying measured regressions.
"""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
REPORT_DIR = ROOT / "SEO" / "reports"
AUDIT_PATH = REPORT_DIR / "pakt_component_parity_audit.json"
DIAGNOSTICS_PATH = REPORT_DIR / "pakt_component_parity_diagnostics.json"
OUT_MD = REPORT_DIR / "pakt_component_parity_ledger.md"
OUT_JSON = REPORT_DIR / "pakt_component_parity_ledger.json"


REJECTED_AXES = {
    "mobile:hero": [
        "background crop/scale/filter sweeps",
        "batch-tested background positions x -18..-6 and y -148..-136 around current",
        "broad source-aligned hill crop batch x -180..-280 and y -20/-50/-80",
        "source-aligned hill crop bright overlay variants around x -240/-260",
        "broad background filter/size/position batch around the current crop",
        "slightly brighter/darker background filter variants",
        "exact Figma H1 size/line-height",
        "Caslon webfont aliasing",
        "store badge sizing/wordmark swaps",
        "phone/copy transforms",
        "isolated hero phone/visual translateY(-8px)",
        "hero phone-up 10/15/20/24/28px variants",
        "masked-photo crop candidate",
    ],
    "mobile:faq": [
        "darker/restored question text",
        "FAQ color/opacity batch around #444/#4a/#555/#666",
        "black/#333 question text with row-height/gap and vertical-scale variants",
        "question opacity .95",
        "question font-weight 350",
        "question/title scaleY micro variants",
        "title Caslon webfont",
        "question vertical unscale",
        "row-art/background screenshot variants",
        "FAQ row height/gap broad sweeps beyond current values",
    ],
    "mobile:features": [
        "darker body copy",
        "combined darker border/body-copy batches",
        "tight darker border/body/body-y batch around current mobile FeatureGrid",
        "latest border #222/#111, body #777/#666/#888, grid-y 0/-2/-4, and combined border/body/grid batches",
        "visible/darker card borders",
        "transparent background plus dark border",
        "darker border/body-copy with grid translateY 0/-1/-2 and gap 9/11 variants",
        "body-copy translateY(0)",
        "icon/body micro-offset combo",
        "card padding reductions",
        "min-height-only reductions",
        "em-dash production-copy correction in the parity fixture",
    ],
    "mobile:privacy-conversation-destination": [
        "title-only black color",
        "heading text-shadow",
        "Caslon Ionic Web font-family swap",
        "darker ledes",
        "privacy lock-only crop",
        "destination image filters",
        "broad gap/card offsets beyond current raster card treatment",
        "privacy/conversation/destination localized title/lede shifts",
        "privacy stack font-smoothing subpixel/auto variants",
    ],
    "mobile:comparison": [
        "title scaleX",
        "circled-check asset rewrites",
        "over-wide column changes",
    ],
    "mobile:final-cta": [
        "content/right shifts",
        "heading-only right shift",
        "h2 font-size 30px",
        "h2 font-size 28.8/29.2px",
        "h2 scaleY and half-pixel y variants",
        "h2 scaleX values around the promoted .98 state that regressed",
        "close-icon y and body/store-button x/y variants around the promoted FinalCTA state",
        "latest h2/body color candidates around #222/#252525/#2b2b2b/#333",
        "latest h2 transform, body transform, store-button y, font-smoothing, and text-rendering batch where current stayed best",
        "p/store-button half-pixel y variants",
        "Caslon webfont",
        "button crops that change section height",
    ],
    "mobile:how-it-works": [
        "step-one translateY values other than 7px in the current layout",
        "title/body color changes",
        "number-image crops",
    ],
    "desktop:hero": [
        "Caslon webfont",
        "h1 shadow .2/.3px",
        "h1 line-height .94/.96",
        "hero-copy x/y micro-offsets",
        "hero phone x micro-offsets",
        "phone/background-size shifts",
        "copy/phone shifts beyond current best",
    ],
    "desktop:features": [
        "black/darker card borders",
        "transparent card border score bump rejected as visually unfaithful",
        "internal content downshift",
        "desktop pseudo exact-linebreak body copy",
        "body max-width 300px",
        "body color #7a7a7a",
        "heading weight 600",
        "fractional icon/title/body offsets around the promoted h3 -0.5px state",
        "global body-width and non-winning per-card body-width variants after fifth-card wrap fix",
        "intermediate card border-color",
        "card gap/tone sweeps beyond current 29px gap",
    ],
    "desktop:app-flow": [
        "header-only downshift",
        "active-card black border",
        "phone brightness filter",
        "grid/card structural shifts beyond current 3px right shift",
        "grid-up with matching phone-down compensation",
        "card top pseudo-line overlays",
        "border opacity .02/.03 variants rejected as visually too frameless",
        "p-down/title-x micro variants beyond current best",
    ],
    "desktop:final-cta": [
        "H2 micro-shadow",
        "Caslon webfont",
        "content up 1px",
        "button/font-size variants",
    ],
}


NEXT_ACTION_BY_CLASS = {
    "source-or-asset-mismatch": (
        "Prefer fresh Figma/node export, asset replacement, or source fixture "
        "alignment. CSS-only micro-tuning has repeatedly regressed."
    ),
    "distributed-typography-or-copy-mismatch": (
        "Check exact copy, line breaks, raster icon/card assets, and font source. "
        "Avoid broad color, opacity, and padding sweeps already rejected."
    ),
    "near-pass-fine-tuning": (
        "Use bbox/diff-guided one-axis tweaks and strict full-audit confirmation."
    ),
}


def pct(value: float | None) -> str:
    if value is None:
        return "n/a"
    return f"{value * 100:.4f}%"


def load_json(path: Path) -> dict:
    with path.open() as handle:
        return json.load(handle)


def main() -> None:
    audit = load_json(AUDIT_PATH)
    diagnostics = load_json(DIAGNOSTICS_PATH)
    diag_by_key = {
        f"{item['viewport']}:{item['id']}": item
        for item in diagnostics.get("diagnostics", [])
    }

    target = audit["target_score"]
    rows = []
    for item in audit["results"]:
        if not isinstance(item.get("score"), (int, float)):
            continue
        key = f"{item['viewport']}:{item['id']}"
        diag = diag_by_key.get(key, {})
        score = item["score"]
        rows.append(
            {
                "key": key,
                "viewport": item["viewport"],
                "id": item["id"],
                "label": item["label"],
                "status": "pass" if score >= target else "needs-work",
                "score": score,
                "gap_to_98": max(0.0, target - score),
                "classification": diag.get("classification", "pass-or-unclassified"),
                "next_action": NEXT_ACTION_BY_CLASS.get(
                    diag.get("classification"),
                    "Maintain unless a fresh source/reference update changes the target.",
                ),
                "rejected_axes": REJECTED_AXES.get(key, []),
            }
        )

    rows.sort(key=lambda row: (row["status"] == "pass", row["score"]))
    payload = {
        "generated_from_audit": audit["generated_at"],
        "overall_score": audit["average_score"],
        "mobile_score": audit["mobile_average_score"],
        "desktop_score": audit["desktop_average_score"],
        "pass_count": audit["pass_count"],
        "comparable_count": audit["comparable_count"],
        "target_score": target,
        "rows": rows,
    }
    OUT_JSON.write_text(json.dumps(payload, indent=2) + "\n")

    lines = [
        "# Pakt Component Parity Ledger",
        "",
        f"Audit source: `{AUDIT_PATH.relative_to(ROOT)}` ({audit['generated_at']})",
        f"Current strict score: {pct(audit['average_score'])} overall, {pct(audit['mobile_average_score'])} mobile, {pct(audit['desktop_average_score'])} desktop",
        f"Passing crops: {audit['pass_count']}/{audit['comparable_count']}",
        "",
        "## Below 98%",
        "",
        "| Viewport | Block | Score | Gap | Classification | Next action | Rejected axes |",
        "| --- | --- | ---: | ---: | --- | --- | --- |",
    ]
    for row in rows:
        if row["status"] == "pass":
            continue
        rejected = "; ".join(row["rejected_axes"]) if row["rejected_axes"] else "None recorded"
        lines.append(
            f"| {row['viewport']} | {row['label']} | {pct(row['score'])} | "
            f"{pct(row['gap_to_98'])} | {row['classification']} | "
            f"{row['next_action']} | {rejected} |"
        )

    lines.extend(["", "## Passing Crops", ""])
    for row in rows:
        if row["status"] == "pass":
            lines.append(f"- {row['viewport']} `{row['id']}`: {pct(row['score'])}")

    OUT_MD.write_text("\n".join(lines) + "\n")
    print(f"ledger={OUT_MD.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
