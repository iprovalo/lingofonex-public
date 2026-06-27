#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "../..");
const FIGMA_DIR = path.join(ROOT, "design", "pakt-figma-handoff", "figma-screenshots");
const NODE_MAP_PATH = path.join(ROOT, "design", "pakt-figma-handoff", "metadata", "node-map.json");
const REPORT_DIR = path.join(ROOT, "SEO", "reports");
const MOBILE_FULL = path.join(FIGMA_DIR, "pakt-mobile-full.png");

const MOBILE_REFERENCES = [
  ["hero", "mobile-sections/01-hero.png", "mobile.heroBackgroundImage", 0],
  ["situation", "mobile-sections/02-situation.png", "mobile.situation", 1212],
  ["features", "mobile-sections/03-features.png", "mobile.features", 1822],
  ["how-it-works", "mobile-sections/04-how-it-works.png", "mobile.howItWorks", 2648],
  ["app-flow", "mobile-sections/05-travel-confidence.png", "mobile.travelConfidence", 3323],
  ["scenarios", "mobile-sections/06-scenarios.png", "mobile.scenarios", null],
  ["checklist", "mobile-sections/07-checklist.png", "mobile.checklist", 4867],
  ["offline-proof", "mobile-sections/08-offline-proof.png", "mobile.offlineProof", null],
  ["privacy-conversation-destination", "mobile-sections/09-privacy-conversation-destination.png", "mobile.privacyConversationDestination", 6259],
  ["comparison", "mobile-sections/10-comparison.png", "mobile.comparison", 7572],
  ["faq", "mobile-sections/11-faq.png", "mobile.faq", 8023],
  ["final-cta", "mobile-sections/12-final-cta.png", "mobile.finalCta", 8959],
];

const MOBILE_NODE_KEYS = {
  hero: "heroBackgroundImage",
  situation: "situation",
  features: "features",
  "how-it-works": "howItWorks",
  "app-flow": "travelConfidence",
  checklist: "checklist",
  "privacy-conversation-destination": "privacyConversationDestination",
  comparison: "comparison",
  faq: "faq",
  "final-cta": "finalCta",
};

function ensureDirs() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

function loadNodeMap() {
  if (!fs.existsSync(NODE_MAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(NODE_MAP_PATH, "utf8"));
}

async function loadRawImage(filePath) {
  const meta = await sharp(filePath).metadata();
  const data = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer();
  return {
    width: meta.width,
    height: meta.height,
    data,
  };
}

function compareRaw(reference, full, top) {
  let absoluteDelta = 0;
  let matching = 0;

  for (let y = 0; y < reference.height; y += 1) {
    const referenceRow = y * reference.width * 4;
    const fullRow = (top + y) * full.width * 4;
    for (let x = 0; x < reference.width; x += 1) {
      const referenceIndex = referenceRow + x * 4;
      const fullIndex = fullRow + x * 4;
      const delta =
        Math.abs(reference.data[referenceIndex] - full.data[fullIndex]) +
        Math.abs(reference.data[referenceIndex + 1] - full.data[fullIndex + 1]) +
        Math.abs(reference.data[referenceIndex + 2] - full.data[fullIndex + 2]);
      absoluteDelta += delta;
      if (delta <= 12) matching += 1;
    }
  }

  const pixels = reference.width * reference.height;
  const color = 1 - absoluteDelta / (pixels * 255 * 3);
  return {
    top,
    match: matching / pixels,
    color,
    score: matching / pixels * 0.7 + color * 0.3,
  };
}

function scanRange(reference, full, searchStart, searchEnd, step) {
  let best = null;

  for (let top = searchStart; top <= searchEnd; top += step) {
    const result = compareRaw(reference, full, top);
    if (!best || result.score > best.score) best = result;
  }

  return best;
}

function findBestCrop(reference, full, expectedTop) {
  if (reference.width > full.width || reference.height > full.height) {
    throw new Error(`Reference ${reference.width}x${reference.height} is larger than full frame ${full.width}x${full.height}`);
  }

  const maxTop = full.height - reference.height;
  const coarseStart = expectedTop == null ? 0 : Math.max(0, expectedTop - 240);
  const coarseEnd = expectedTop == null ? maxTop : Math.min(maxTop, expectedTop + 240);
  const coarseBest = scanRange(reference, full, coarseStart, coarseEnd, 4);
  const refineStart = Math.max(0, coarseBest.top - 12);
  const refineEnd = Math.min(maxTop, coarseBest.top + 12);
  return scanRange(reference, full, refineStart, refineEnd, 1);
}

function statusFor(score) {
  if (score >= 0.9999) return "exact-full-frame-crop";
  if (score >= 0.98) return "near-full-frame-crop";
  return "not-an-exact-current-full-frame-crop";
}

async function main() {
  ensureDirs();
  const nodeMap = loadNodeMap();
  const mobileNodes = nodeMap.mobileNodes || {};
  const full = await loadRawImage(MOBILE_FULL);
  const rows = [];

  for (const [id, relativePath, nodePath, expectedTop] of MOBILE_REFERENCES) {
    const referencePath = path.join(FIGMA_DIR, relativePath);
    if (!fs.existsSync(referencePath)) continue;
    const reference = await loadRawImage(referencePath);
    const node = mobileNodes[MOBILE_NODE_KEYS[id]];
    const nodeTop = node ? node.y : expectedTop;
    const best = findBestCrop(reference, full, nodeTop);
    rows.push({
      id,
      nodePath,
      reference: relativePath,
      reference_size: `${reference.width} x ${reference.height}`,
      expected_node_top: nodeTop,
      best_top: best.top,
      top_delta_from_node: nodeTop == null ? null : best.top - nodeTop,
      score: best.score,
      exact_pixel_match: best.match,
      color_similarity: best.color,
      status: statusFor(best.score),
    });
  }

  const report = {
    generated_at: new Date().toISOString(),
    source_full_frame: path.relative(ROOT, MOBILE_FULL),
    rows,
  };
  fs.writeFileSync(path.join(REPORT_DIR, "pakt_reference_crop_integrity.json"), JSON.stringify(report, null, 2));

  const lines = [
    "# Pakt Reference Crop Integrity",
    "",
    `Generated: ${report.generated_at}`,
    `Source full frame: \`${report.source_full_frame}\``,
    "",
    "This browser-free check maps stored mobile section reference crops back onto the full Figma mobile frame. High scores confirm that a section reference is an intentional crop/padded crop from the Figma frame rather than a stale hand-edited image.",
    "",
    "| Block | Reference | Size | Node Top | Best Crop Top | Delta | Score | Exact Pixel Match | Color | Status |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
    ...rows.map((row) => [
      row.id,
      `\`${row.reference}\``,
      row.reference_size,
      row.expected_node_top ?? "n/a",
      row.best_top,
      row.top_delta_from_node ?? "n/a",
      `${(row.score * 100).toFixed(4)}%`,
      `${(row.exact_pixel_match * 100).toFixed(4)}%`,
      `${(row.color_similarity * 100).toFixed(4)}%`,
      row.status,
    ].join(" | ")).map((line) => `| ${line} |`),
    "",
  ];
  fs.writeFileSync(path.join(REPORT_DIR, "pakt_reference_crop_integrity.md"), `${lines.join("\n")}\n`);
  console.log("reference-crop-integrity=SEO/reports/pakt_reference_crop_integrity.md");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
