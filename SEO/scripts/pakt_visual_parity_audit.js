#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const sharp = require("sharp");
const pixelmatchModule = require("pixelmatch");

const pixelmatch = pixelmatchModule.default || pixelmatchModule;

const ROOT = path.resolve(__dirname, "../..");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8765";
const PAGE_PATH = process.env.PAGE_PATH || "/pakt/offline-translator-app/";
const REPORT_BASENAME = process.env.REPORT_BASENAME || "pakt_visual_parity_audit";
const REPORT_TITLE = process.env.REPORT_TITLE || "Pakt Visual Parity Audit";
const SYSTEM_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const REPORT_DIR = path.join(ROOT, "SEO", "reports");
const SCREENSHOT_SUBDIR = process.env.SCREENSHOT_SUBDIR || "visual-parity";
const SCREENSHOT_DIR = path.join(REPORT_DIR, "screenshots", SCREENSHOT_SUBDIR);
const FIGMA_DIR = path.join(ROOT, "design", "pakt-figma-handoff", "figma-screenshots");
const CANDIDATE_CSS_PATH = path.join(ROOT, "SEO", "tmp", "pakt-audit-candidate.css");
const TARGETS_PATH = path.join(ROOT, "SEO", "tmp", "pakt-audit-targets.json");
const CANDIDATES_PATH = path.join(ROOT, "SEO", "tmp", "pakt-audit-candidates.json");
const CANDIDATE_BATCH_DIR = path.join(REPORT_DIR, "screenshots", "candidate-batch");

const VIEWPORTS = {
  desktop: { width: 1512, height: 1200, isMobile: false },
  mobile: { width: 402, height: 1200, isMobile: true },
};

const REFERENCES = [
  {
    id: "hero",
    label: "HeroProduct + HeaderNav + StoreCtaButtons + PhoneMockupShowcase",
    selector: ".pakt-hero",
    desktopRef: "desktop-sections/01-hero.png",
    mobileRef: "mobile-sections/01-hero.png",
  },
  {
    id: "situation",
    label: "SituationBlock",
    selector: "#situation",
    desktopRef: "component-variants/situation-focus-desktop.png",
    mobileRef: "mobile-sections/02-situation.png",
  },
  {
    id: "features",
    label: "FeatureGrid",
    selector: "#features",
    desktopRef: "desktop-sections/03-features.png",
    mobileRef: "mobile-sections/03-features.png",
  },
  {
    id: "how-it-works",
    label: "HowItWorksSteps",
    selector: "#how-it-works",
    desktopRef: "desktop-sections/04-how-it-works.png",
    mobileRef: "mobile-sections/04-how-it-works.png",
  },
  {
    id: "app-flow",
    label: "AppFlowSteps",
    selector: "#app-flow",
    desktopRef: "component-variants/app-flow-steps-desktop.png",
    mobileRef: "mobile-sections/05-travel-confidence.png",
  },
  {
    id: "scenarios",
    label: "ScenarioCards",
    selector: "#scenarios",
    desktopRef: "component-variants/scenario-cards-desktop.png",
    mobileRef: "mobile-sections/06-scenarios.png",
  },
  {
    id: "checklist",
    label: "TravelChecklist",
    selector: "#checklist",
    desktopRef: "desktop-sections/07-checklist.png",
    mobileRef: "mobile-sections/07-checklist.png",
  },
  {
    id: "offline-proof",
    label: "OfflineProofBand",
    selector: "#offline-proof",
    desktopRef: "desktop-sections/08-offline-proof.png",
    mobileRef: "mobile-sections/08-offline-proof.png",
    mobileFramePadding: { top: 80, bottom: 98, color: "#faf7ec" },
  },
  {
    id: "privacy-conversation-destination",
    label: "PrivacyBlock + ConversationBlock + DestinationModule",
    selector: ".privacy-conversation-section",
    desktopRef: "component-variants/privacy-conversation-destination-stack-desktop.png",
    mobileRef: "mobile-sections/09-privacy-conversation-destination.png",
  },
  {
    id: "comparison",
    label: "ComparisonTable",
    selector: "#comparison",
    desktopRef: "desktop-sections/10-comparison-faq.png",
    mobileRef: "mobile-sections/10-comparison.png",
  },
  {
    id: "faq",
    label: "FAQAccordion",
    selector: "#faq",
    mobileRef: "mobile-sections/11-faq.png",
  },
  {
    id: "final-cta",
    label: "FinalCTA + StoreCtaButtons",
    selector: "#download",
    desktopRef: "desktop-sections/11-final-cta.png",
    mobileRef: "mobile-sections/12-final-cta.png",
    mobileClipPadding: { top: 59, bottom: 0 },
  },
];

const SHOWCASE_BLOCKS_WITHOUT_DIRECT_FIGMA_CROPS = [
  "FullLanguageListPanel",
  "LanguageSupportGrid",
  "LongFormSEOText",
  "RelatedPagesGrid",
];

const DESKTOP_REFERENCE_CAVEATS = [
  "SituationBlock, AppFlowSteps, ScenarioCards, FeatureGrid, HowItWorksSteps, TravelChecklist, OfflineProofBand, ComparisonTable, and FinalCTA now use isolated or cleaned desktop crops from the full Figma export.",
  "HeroProduct and the privacy/conversation/destination stack still include production copy, asset, or layout differences versus the available Figma references.",
  "Use the remaining low desktop scores as gap trackers until fresh Figma node exports or exact design-copy showcase references are available.",
];

function loadAuditTargets() {
  if (!fs.existsSync(TARGETS_PATH)) return null;
  const rawTargets = JSON.parse(fs.readFileSync(TARGETS_PATH, "utf8"));
  if (!Array.isArray(rawTargets)) {
    throw new Error(`${path.relative(ROOT, TARGETS_PATH)} must contain a JSON array`);
  }
  return new Set(rawTargets.map(String));
}

const AUDIT_TARGETS = loadAuditTargets();

function shouldAuditTarget(viewportName, id) {
  if (!AUDIT_TARGETS) return true;
  return AUDIT_TARGETS.has(id) || AUDIT_TARGETS.has(`${viewportName}:${id}`);
}

function ensureDirs() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function prepare(page, candidateCss = null) {
  const response = await page.goto(`${BASE_URL}${PAGE_PATH}`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  if (!response || response.status() !== 200) {
    throw new Error(`Expected HTTP 200 for ${PAGE_PATH}, got ${response ? response.status() : "no response"}`);
  }
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await Promise.race([
        document.fonts.ready.catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);
    }
    await Promise.all([...document.images].map((img) => {
      img.loading = "eager";
      if (!img.decode) return Promise.resolve();
      return Promise.race([
        img.decode().catch(() => {}),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    }));
  });
  if (candidateCss !== null && candidateCss.trim()) {
    await page.addStyleTag({ content: candidateCss });
    await page.waitForTimeout(30);
  } else if (fs.existsSync(CANDIDATE_CSS_PATH)) {
    await page.addStyleTag({ content: fs.readFileSync(CANDIDATE_CSS_PATH, "utf8") });
    await page.waitForTimeout(30);
  }
}

async function fullWidthElementScreenshot(page, selector, outputPath, viewportWidth, clipPadding = {}, framePadding = {}) {
  const rect = await page.locator(selector).first().evaluate((node) => {
    const box = node.getBoundingClientRect();
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.documentElement.clientHeight,
    );
    const top = Math.max(0, box.top + window.scrollY);
    return {
      top,
      height: Math.max(1, Math.min(box.height, documentHeight - top)),
      documentHeight,
    };
  });
  const padTop = clipPadding.top || 0;
  const padBottom = clipPadding.bottom || 0;
  const clipTop = Math.max(0, Math.round(rect.top - padTop));
  const clipHeight = Math.max(
    1,
    Math.min(
      Math.round(rect.height + padTop + padBottom),
      Math.round(rect.documentHeight - clipTop),
    ),
  );
  const screenshotOptions = {
    fullPage: true,
    clip: {
      x: 0,
      y: clipTop,
      width: viewportWidth,
      height: clipHeight,
    },
  };
  if (framePadding.top || framePadding.bottom) {
    const buffer = await page.screenshot(screenshotOptions);
    await sharp(buffer)
      .extend({
        top: framePadding.top || 0,
        bottom: framePadding.bottom || 0,
        left: 0,
        right: 0,
        background: framePadding.color || "#faf7ec",
      })
      .png()
      .toFile(outputPath);
    return;
  }
  await page.screenshot({
    path: outputPath,
    ...screenshotOptions,
  });
}

async function imageMeta(filePath) {
  const meta = await sharp(filePath).metadata();
  return { width: meta.width, height: meta.height };
}

async function compareImages(referencePath, actualPath, diffPath) {
  const referenceMeta = await imageMeta(referencePath);
  const actualMeta = await imageMeta(actualPath);
  const width = referenceMeta.width;
  const height = referenceMeta.height;

  const referenceRaw = await sharp(referencePath)
    .ensureAlpha()
    .raw()
    .toBuffer();
  const actualRaw = await sharp(actualPath)
    .resize(width, height, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const diff = Buffer.alloc(width * height * 4);
  const mismatched = pixelmatch(referenceRaw, actualRaw, diff, width, height, {
    threshold: 0.16,
    includeAA: false,
  });
  await sharp(diff, { raw: { width, height, channels: 4 } }).png().toFile(diffPath);

  let absoluteDelta = 0;
  for (let index = 0; index < referenceRaw.length; index += 4) {
    absoluteDelta += Math.abs(referenceRaw[index] - actualRaw[index]);
    absoluteDelta += Math.abs(referenceRaw[index + 1] - actualRaw[index + 1]);
    absoluteDelta += Math.abs(referenceRaw[index + 2] - actualRaw[index + 2]);
  }
  const maxDelta = width * height * 255 * 3;
  const colorSimilarity = 1 - absoluteDelta / maxDelta;
  const pixelSimilarity = 1 - mismatched / (width * height);
  const heightDelta = Math.abs(actualMeta.height - referenceMeta.height) / referenceMeta.height;
  const widthDelta = Math.abs(actualMeta.width - referenceMeta.width) / referenceMeta.width;

  return {
    reference_size: referenceMeta,
    actual_size: actualMeta,
    width_delta: widthDelta,
    height_delta: heightDelta,
    pixel_similarity: pixelSimilarity,
    color_similarity: colorSimilarity,
    score: pixelSimilarity * 0.7 + colorSimilarity * 0.2 + (1 - Math.min(1, heightDelta)) * 0.1,
  };
}

async function auditViewport(browser, viewportName, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
  });
  await prepare(page);

  const results = [];
  for (const item of REFERENCES) {
    if (!shouldAuditTarget(viewportName, item.id)) continue;
    const refRelative = viewportName === "desktop" ? item.desktopRef : item.mobileRef;
    if (!refRelative) {
      results.push({
        id: item.id,
        label: item.label,
        viewport: viewportName,
        status: "missing-reference",
      });
      continue;
    }

    const referencePath = path.join(FIGMA_DIR, refRelative);
    if (!fs.existsSync(referencePath)) {
      results.push({
        id: item.id,
        label: item.label,
        viewport: viewportName,
        status: "missing-reference-file",
        reference: path.relative(ROOT, referencePath),
      });
      continue;
    }

    const actualPath = path.join(SCREENSHOT_DIR, `${viewportName}-${item.id}.png`);
    const diffPath = path.join(SCREENSHOT_DIR, `${viewportName}-${item.id}-diff.png`);
    const clipPadding = viewportName === "desktop" ? item.desktopClipPadding : item.mobileClipPadding;
    const framePadding = viewportName === "desktop" ? item.desktopFramePadding : item.mobileFramePadding;
    await fullWidthElementScreenshot(page, item.selector, actualPath, viewport.width, clipPadding, framePadding);
    const comparison = await compareImages(referencePath, actualPath, diffPath);
    results.push({
      id: item.id,
      label: item.label,
      viewport: viewportName,
      status: comparison.score >= 0.98 && comparison.height_delta <= 0.02 && comparison.width_delta <= 0.01 ? "pass" : "needs-work",
      reference: path.relative(ROOT, referencePath),
      actual: path.relative(ROOT, actualPath),
      diff: path.relative(ROOT, diffPath),
      ...comparison,
    });
  }

  await page.close();
  return results;
}

function candidateSafeName(name) {
  return String(name || "candidate").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "candidate";
}

function referenceForTarget(target) {
  const [viewportName, id] = String(target).split(":");
  const viewport = VIEWPORTS[viewportName];
  const item = REFERENCES.find((candidate) => candidate.id === id);
  if (!viewport || !item) throw new Error(`Unknown candidate target ${target}`);
  const refRelative = viewportName === "desktop" ? item.desktopRef : item.mobileRef;
  if (!refRelative) throw new Error(`Target ${target} has no ${viewportName} reference`);
  const referencePath = path.join(FIGMA_DIR, refRelative);
  if (!fs.existsSync(referencePath)) throw new Error(`Missing reference ${path.relative(ROOT, referencePath)}`);
  return { viewportName, viewport, item, referencePath };
}

function loadCandidateBatch() {
  if (!fs.existsSync(CANDIDATES_PATH)) return null;
  const raw = JSON.parse(fs.readFileSync(CANDIDATES_PATH, "utf8"));
  const batches = Array.isArray(raw) ? raw : [raw];
  for (const batch of batches) {
    if (!batch || typeof batch !== "object" || !batch.target || !Array.isArray(batch.candidates)) {
      throw new Error(`${path.relative(ROOT, CANDIDATES_PATH)} entries must include target and candidates[]`);
    }
  }
  return batches;
}

async function runCandidateBatch(browser, batches) {
  fs.mkdirSync(CANDIDATE_BATCH_DIR, { recursive: true });
  const rows = [];

  for (const batch of batches) {
    const target = referenceForTarget(batch.target);
    for (const [index, candidate] of batch.candidates.entries()) {
      const name = candidateSafeName(candidate.name || `candidate-${index}`);
      const page = await browser.newPage({
        viewport: { width: target.viewport.width, height: target.viewport.height },
        deviceScaleFactor: 1,
        isMobile: target.viewport.isMobile,
      });
      try {
        await prepare(page, candidate.css || "");
        const actualPath = path.join(CANDIDATE_BATCH_DIR, `${target.viewportName}-${target.item.id}-${String(index).padStart(2, "0")}-${name}.png`);
        const diffPath = path.join(CANDIDATE_BATCH_DIR, `${target.viewportName}-${target.item.id}-${String(index).padStart(2, "0")}-${name}-diff.png`);
        const clipPadding = target.viewportName === "desktop" ? target.item.desktopClipPadding : target.item.mobileClipPadding;
        const framePadding = target.viewportName === "desktop" ? target.item.desktopFramePadding : target.item.mobileFramePadding;
        await fullWidthElementScreenshot(page, target.item.selector, actualPath, target.viewport.width, clipPadding, framePadding);
        const comparison = await compareImages(target.referencePath, actualPath, diffPath);
        rows.push({
          target: batch.target,
          name: candidate.name || `candidate-${index}`,
          status: comparison.score >= 0.98 && comparison.height_delta <= 0.02 && comparison.width_delta <= 0.01 ? "pass" : "needs-work",
          score: comparison.score,
          pixel_similarity: comparison.pixel_similarity,
          color_similarity: comparison.color_similarity,
          width_delta: comparison.width_delta,
          height_delta: comparison.height_delta,
          actual: path.relative(ROOT, actualPath),
          diff: path.relative(ROOT, diffPath),
        });
      } finally {
        await page.close();
      }
    }
  }

  rows.sort((a, b) => a.target.localeCompare(b.target) || b.score - a.score);
  const report = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    page_path: PAGE_PATH,
    candidates_file: path.relative(ROOT, CANDIDATES_PATH),
    rows,
  };
  fs.writeFileSync(path.join(REPORT_DIR, "pakt_candidate_batch.json"), JSON.stringify(report, null, 2));

  const lines = [
    "# Pakt Candidate Batch",
    "",
    `Generated: ${report.generated_at}`,
    `Page: ${PAGE_PATH}`,
    "",
    "| Target | Candidate | Status | Score | Pixel | Color | Actual | Diff |",
    "| --- | --- | --- | ---: | ---: | ---: | --- | --- |",
    ...rows.map((row) => `| ${row.target} | ${row.name} | ${row.status} | ${formatPercent(row.score)} | ${formatPercent(row.pixel_similarity)} | ${formatPercent(row.color_similarity)} | \`${row.actual}\` | \`${row.diff}\` |`),
    "",
  ];
  fs.writeFileSync(path.join(REPORT_DIR, "pakt_candidate_batch.md"), `${lines.join("\n")}\n`);
  return rows;
}

function formatPercent(value) {
  if (typeof value !== "number") return "n/a";
  return `${(value * 100).toFixed(1)}%`;
}

function averageFor(results, predicate) {
  const items = results.filter((item) => typeof item.score === "number" && predicate(item));
  if (!items.length) return null;
  return items.reduce((sum, item) => sum + item.score, 0) / items.length;
}

async function main() {
  ensureDirs();
  const candidateBatches = loadCandidateBatch();
  const launchOptions = {};
  if (process.env.CHROME_EXECUTABLE) {
    launchOptions.executablePath = process.env.CHROME_EXECUTABLE;
  } else if (process.env.PAKT_USE_SYSTEM_CHROME === "1" && fs.existsSync(SYSTEM_CHROME)) {
    launchOptions.executablePath = SYSTEM_CHROME;
  }
  const browser = await chromium.launch(launchOptions);
  let results = [];
  try {
    if (candidateBatches) {
      const rows = await runCandidateBatch(browser, candidateBatches);
      const best = rows[0];
      console.log(`Pakt candidate batch candidates=${rows.length}${best ? ` best=${best.target}:${best.name}:${formatPercent(best.score)}` : ""}`);
      console.log("report=SEO/reports/pakt_candidate_batch.md");
      return;
    }
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      results = results.concat(await auditViewport(browser, viewportName, viewport));
    }
  } finally {
    await browser.close();
  }

  const comparable = results.filter((item) => typeof item.score === "number");
  const averageScore = comparable.reduce((sum, item) => sum + item.score, 0) / comparable.length;
  const mobileAverage = averageFor(results, (item) => item.viewport === "mobile");
  const desktopAverage = averageFor(results, (item) => item.viewport === "desktop");
  const passCount = results.filter((item) => item.status === "pass").length;
  const report = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    page_path: PAGE_PATH,
    report_basename: REPORT_BASENAME,
    screenshot_dir: path.relative(ROOT, SCREENSHOT_DIR),
    target_score: 0.98,
    average_score: averageScore,
    mobile_average_score: mobileAverage,
    desktop_average_score: desktopAverage,
    pass_count: passCount,
    comparable_count: comparable.length,
    results,
    showcase_blocks_without_direct_figma_crops: SHOWCASE_BLOCKS_WITHOUT_DIRECT_FIGMA_CROPS,
    desktop_reference_caveats: DESKTOP_REFERENCE_CAVEATS,
  };
  fs.writeFileSync(path.join(REPORT_DIR, `${REPORT_BASENAME}.json`), JSON.stringify(report, null, 2));

  const lines = [
    `# ${REPORT_TITLE}`,
    "",
    `Base URL: ${BASE_URL}`,
    `Page: ${PAGE_PATH}`,
    `Generated: ${report.generated_at}`,
    `Target: 98.0% per comparable crop`,
    `Average score: ${formatPercent(averageScore)}`,
    `Mobile average: ${formatPercent(mobileAverage)}`,
    `Desktop average: ${formatPercent(desktopAverage)}`,
    `Passing crops: ${passCount}/${comparable.length}`,
    "",
    "## Comparable Figma Crops",
    "",
    "| Viewport | Block | Status | Score | Pixel | Color | Size Delta | Actual | Diff |",
    "| --- | --- | --- | ---: | ---: | ---: | ---: | --- | --- |",
  ];

  for (const item of results) {
    if (typeof item.score !== "number") continue;
    lines.push(
      `| ${item.viewport} | ${item.label} | ${item.status} | ${formatPercent(item.score)} | ${formatPercent(item.pixel_similarity)} | ${formatPercent(item.color_similarity)} | ${formatPercent(item.height_delta)} | \`${item.actual}\` | \`${item.diff}\` |`,
    );
  }

  lines.push(
    "",
    "## Coverage Notes",
    "",
    "The component showcase renders all 21 documented SEO blocks. These blocks are present in the showcase but do not have a one-to-one Figma crop in the current handoff, so this audit tracks them as implementation/QA coverage rather than 98% pixel parity:",
    "",
    ...SHOWCASE_BLOCKS_WITHOUT_DIRECT_FIGMA_CROPS.map((block) => `- ${block}`),
    "",
    "Desktop reference caveats:",
    "",
    ...DESKTOP_REFERENCE_CAVEATS.map((item) => `- ${item}`),
    "",
    "Scores resize the live crop to the reference crop before pixel comparison, so text/content differences still count. Use the diff images for direction; designer-grade acceptance still needs visual review.",
    "",
  );

  fs.writeFileSync(path.join(REPORT_DIR, `${REPORT_BASENAME}.md`), `${lines.join("\n")}\n`);

  console.log(`Pakt visual parity average=${formatPercent(averageScore)} mobile=${formatPercent(mobileAverage)} desktop=${formatPercent(desktopAverage)} pass=${passCount}/${comparable.length}`);
  console.log(`report=SEO/reports/${REPORT_BASENAME}.md`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
