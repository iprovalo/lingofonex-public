#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const pixelmatchModule = require("pixelmatch");

const pixelmatch = pixelmatchModule.default || pixelmatchModule;

const ROOT = path.resolve(__dirname, "../..");
const REPORT_DIR = path.join(ROOT, "SEO", "reports");
const AUDIT_PATH = path.join(REPORT_DIR, "pakt_component_parity_audit.json");
const OUT_JSON = path.join(REPORT_DIR, "pakt_component_parity_diagnostics.json");
const OUT_MD = path.join(REPORT_DIR, "pakt_component_parity_diagnostics.md");

const OFFSET_RANGE = 6;
const DOWNSAMPLE_WIDTH = 402;

function pct(value, digits = 2) {
  if (typeof value !== "number" || Number.isNaN(value)) return "n/a";
  return `${(value * 100).toFixed(digits)}%`;
}

function rel(filePath) {
  return path.relative(ROOT, filePath);
}

async function rawImage(filePath, width = null) {
  let image = sharp(filePath).ensureAlpha();
  if (width) image = image.resize({ width, withoutEnlargement: true });
  return image.raw().toBuffer({ resolveWithObject: true });
}

function scoreRaw(reference, actual, dx = 0, dy = 0) {
  const width = reference.info.width;
  const height = reference.info.height;
  const shifted = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceX = x - dx;
      const sourceY = y - dy;
      const target = (y * width + x) * 4;
      if (sourceX >= 0 && sourceX < width && sourceY >= 0 && sourceY < height) {
        const source = (sourceY * width + sourceX) * 4;
        shifted[target] = actual.data[source];
        shifted[target + 1] = actual.data[source + 1];
        shifted[target + 2] = actual.data[source + 2];
        shifted[target + 3] = actual.data[source + 3];
      } else {
        shifted[target] = 250;
        shifted[target + 1] = 247;
        shifted[target + 2] = 236;
        shifted[target + 3] = 255;
      }
    }
  }

  const diff = Buffer.alloc(width * height * 4);
  const mismatched = pixelmatch(reference.data, shifted, diff, width, height, {
    threshold: 0.16,
    includeAA: false,
  });

  let absoluteDelta = 0;
  for (let index = 0; index < reference.data.length; index += 4) {
    absoluteDelta += Math.abs(reference.data[index] - shifted[index]);
    absoluteDelta += Math.abs(reference.data[index + 1] - shifted[index + 1]);
    absoluteDelta += Math.abs(reference.data[index + 2] - shifted[index + 2]);
  }
  const pixelSimilarity = 1 - mismatched / (width * height);
  const colorSimilarity = 1 - absoluteDelta / (width * height * 255 * 3);
  return pixelSimilarity * 0.7 + colorSimilarity * 0.2 + 0.1;
}

function rowAndColumnStats(reference, actual) {
  const width = reference.info.width;
  const height = reference.info.height;
  const rows = [];
  const columns = Array.from({ length: width }, () => 0);
  let refRgb = [0, 0, 0];
  let actualRgb = [0, 0, 0];
  let totalDelta = 0;

  for (let y = 0; y < height; y += 1) {
    let rowDelta = 0;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const dr = Math.abs(reference.data[index] - actual.data[index]);
      const dg = Math.abs(reference.data[index + 1] - actual.data[index + 1]);
      const db = Math.abs(reference.data[index + 2] - actual.data[index + 2]);
      const delta = dr + dg + db;
      rowDelta += delta;
      columns[x] += delta;
      totalDelta += delta;
      refRgb[0] += reference.data[index];
      refRgb[1] += reference.data[index + 1];
      refRgb[2] += reference.data[index + 2];
      actualRgb[0] += actual.data[index];
      actualRgb[1] += actual.data[index + 1];
      actualRgb[2] += actual.data[index + 2];
    }
    rows.push(rowDelta / (width * 3));
  }

  const pixels = width * height;
  refRgb = refRgb.map((value) => value / pixels);
  actualRgb = actualRgb.map((value) => value / pixels);

  const hotBands = [];
  const rowThreshold = Math.max(18, totalDelta / pixels / 3 * 1.55);
  let start = null;
  let sum = 0;
  let count = 0;
  for (let y = 0; y < height; y += 1) {
    if (rows[y] >= rowThreshold) {
      if (start === null) start = y;
      sum += rows[y];
      count += 1;
    } else if (start !== null) {
      hotBands.push({ start, end: y - 1, average_delta: sum / count });
      start = null;
      sum = 0;
      count = 0;
    }
  }
  if (start !== null) hotBands.push({ start, end: height - 1, average_delta: sum / count });

  const hotColumns = [];
  const normalizedColumns = columns.map((value) => value / (height * 3));
  const columnThreshold = Math.max(18, totalDelta / pixels / 3 * 1.55);
  start = null;
  sum = 0;
  count = 0;
  for (let x = 0; x < width; x += 1) {
    if (normalizedColumns[x] >= columnThreshold) {
      if (start === null) start = x;
      sum += normalizedColumns[x];
      count += 1;
    } else if (start !== null) {
      hotColumns.push({ start, end: x - 1, average_delta: sum / count });
      start = null;
      sum = 0;
      count = 0;
    }
  }
  if (start !== null) hotColumns.push({ start, end: width - 1, average_delta: sum / count });

  return {
    mean_reference_rgb: refRgb,
    mean_actual_rgb: actualRgb,
    mean_delta: totalDelta / (pixels * 3),
    top_row_bands: hotBands.sort((a, b) => b.average_delta - a.average_delta).slice(0, 6),
    top_column_bands: hotColumns.sort((a, b) => b.average_delta - a.average_delta).slice(0, 6),
  };
}

async function bestOffset(referencePath, actualPath, baseScore) {
  const reference = await rawImage(referencePath, DOWNSAMPLE_WIDTH);
  const actual = await rawImage(actualPath, DOWNSAMPLE_WIDTH);
  let best = { dx: 0, dy: 0, score: scoreRaw(reference, actual, 0, 0) };
  for (let dy = -OFFSET_RANGE; dy <= OFFSET_RANGE; dy += 1) {
    for (let dx = -OFFSET_RANGE; dx <= OFFSET_RANGE; dx += 1) {
      const score = scoreRaw(reference, actual, dx, dy);
      if (score > best.score) best = { dx, dy, score };
    }
  }
  return {
    dx: best.dx,
    dy: best.dy,
    downsampled_score: best.score,
    downsampled_gain: best.score - scoreRaw(reference, actual, 0, 0),
    note: best.dx === 0 && best.dy === 0
      ? "No whole-crop offset signal."
      : "Possible whole-crop offset signal; verify in full browser audit before applying.",
    audit_score: baseScore,
  };
}

function classify(item, stats, offset) {
  const scoreGap = 0.98 - item.score;
  const colorGap = item.pixel_similarity - item.color_similarity;
  if (scoreGap <= 0.005) return "near-pass-fine-tuning";
  if (offset.downsampled_gain > 0.0015) return "layout-offset-candidate";
  if (scoreGap > 0.035) return "source-or-asset-mismatch";
  if (colorGap > 0.006) return "color-tone-mismatch";
  if (stats.top_row_bands.length >= 5) return "distributed-typography-or-copy-mismatch";
  return "near-pass-fine-tuning";
}

async function analyzeItem(item) {
  const referencePath = path.join(ROOT, item.reference);
  const actualPath = path.join(ROOT, item.actual);
  const [reference, actual] = await Promise.all([rawImage(referencePath), rawImage(actualPath)]);
  const stats = rowAndColumnStats(reference, actual);
  const offset = await bestOffset(referencePath, actualPath, item.score);
  const classification = classify(item, stats, offset);
  return {
    id: item.id,
    viewport: item.viewport,
    label: item.label,
    status: item.status,
    score: item.score,
    pixel_similarity: item.pixel_similarity,
    color_similarity: item.color_similarity,
    classification,
    reference: item.reference,
    actual: item.actual,
    diff: item.diff,
    offset_probe: offset,
    stats: {
      mean_delta: stats.mean_delta,
      mean_reference_rgb: stats.mean_reference_rgb,
      mean_actual_rgb: stats.mean_actual_rgb,
      top_row_bands: stats.top_row_bands,
      top_column_bands: stats.top_column_bands,
    },
  };
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const belowTarget = audit.results
    .filter((item) => typeof item.score === "number" && item.score < audit.target_score)
    .sort((a, b) => a.score - b.score);
  const diagnostics = [];
  for (const item of belowTarget) diagnostics.push(await analyzeItem(item));

  const report = {
    generated_at: new Date().toISOString(),
    audit_generated_at: audit.generated_at,
    audit_score: audit.average_score,
    mobile_score: audit.mobile_average_score,
    desktop_score: audit.desktop_average_score,
    target_score: audit.target_score,
    diagnostics,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

  const lines = [
    "# Pakt Component Parity Diagnostics",
    "",
    `Generated: ${report.generated_at}`,
    `Audit source: ${rel(AUDIT_PATH)} (${audit.generated_at})`,
    `Current strict audit: ${pct(audit.average_score, 4)} overall, ${pct(audit.mobile_average_score, 4)} mobile, ${pct(audit.desktop_average_score, 4)} desktop`,
    "",
    "This report is browser-free. It analyzes the already captured Figma/live/diff crops from the strict Playwright audit, so it is safe to run when Chrome candidate tuning is unavailable.",
    "",
    "## Below-98 Diagnostics",
    "",
    "| Viewport | Block | Score | Classification | Offset Probe | Hottest Row Bands | Hottest Column Bands |",
    "| --- | --- | ---: | --- | --- | --- | --- |",
  ];

  for (const item of diagnostics) {
    const offset = item.offset_probe;
    const offsetText = `${offset.dx},${offset.dy} (${(offset.downsampled_gain * 100).toFixed(3)}pp)`;
    const rows = item.stats.top_row_bands
      .slice(0, 3)
      .map((band) => `${band.start}-${band.end}`)
      .join(", ");
    const columns = item.stats.top_column_bands
      .slice(0, 3)
      .map((band) => `${band.start}-${band.end}`)
      .join(", ");
    lines.push(`| ${item.viewport} | ${item.label} | ${pct(item.score, 2)} | ${item.classification} | ${offsetText} | ${rows || "n/a"} | ${columns || "n/a"} |`);
  }

  lines.push(
    "",
    "## How To Use This",
    "",
    "- `source-or-asset-mismatch` usually means CSS nudges are unlikely to get the crop to 98%; look for stale Figma exports, raster asset differences, or deliberate fixture copy differences.",
    "- `layout-offset-candidate` is only a hint. Apply it only after a strict browser audit confirms the gain in the full page.",
    "- `near-pass-fine-tuning` is a reasonable target for small measured CSS work.",
    "- The mobile HeroProduct, FAQAccordion, FeatureGrid, and privacy/conversation/destination stack remain the largest blockers.",
    "",
  );

  fs.writeFileSync(OUT_MD, `${lines.join("\n")}\n`);
  console.log(`diagnostics=${rel(OUT_MD)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
