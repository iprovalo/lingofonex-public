#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../..");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8765";
const SHOWCASE_PATH = process.env.SHOWCASE_PATH || "/pakt/component-showcase/";
const REPORT_BASENAME = process.env.REPORT_BASENAME || "pakt_component_showcase_qa";
const REPORT_TITLE = process.env.REPORT_TITLE || "Pakt Component Showcase QA";
const SYSTEM_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const REPORT_DIR = path.join(ROOT, "SEO", "reports");
const SCREENSHOT_SUBDIR = process.env.SCREENSHOT_SUBDIR || "component-showcase";
const SCREENSHOT_DIR = path.join(REPORT_DIR, "screenshots", SCREENSHOT_SUBDIR);

const REQUIRED_BLOCKS = [
  "HeaderNav",
  "StoreCtaButtons",
  "HeroProduct",
  "PhoneMockupShowcase",
  "SituationBlock",
  "FeatureGrid",
  "HowItWorksSteps",
  "AppFlowSteps",
  "ScenarioCards",
  "TravelChecklist",
  "OfflineProofBand",
  "PrivacyBlock",
  "ConversationBlock",
  "DestinationModule",
  "ComparisonTable",
  "FAQAccordion",
  "FinalCTA",
  "LanguageSupportGrid",
  "FullLanguageListPanel",
  "RelatedPagesGrid",
  "LongFormSEOText",
];

const CROP_TARGETS = [
  ["HeaderNav", ".site-nav"],
  ["HeroProduct", ".pakt-hero"],
  ["StoreCtaButtons", "#store-cta"],
  ["PhoneMockupShowcase", "#phone-showcase"],
  ["SituationBlock", "#situation"],
  ["FeatureGrid", "#features"],
  ["HowItWorksSteps", "#how-it-works"],
  ["AppFlowSteps", "#app-flow"],
  ["ScenarioCards", "#scenarios"],
  ["TravelChecklist", "#checklist"],
  ["OfflineProofBand", "#offline-proof"],
  ["PrivacyBlock", ".privacy-mini"],
  ["ConversationBlock", ".conversation-mini"],
  ["DestinationModule", ".destination-mini"],
  ["ComparisonTable", "#comparison"],
  ["LanguageSupportGrid", "#languages"],
  ["FullLanguageListPanel", "#language-list"],
  ["LongFormSEOText", "#guide"],
  ["FAQAccordion", "#faq"],
  ["RelatedPagesGrid", '[data-block="RelatedPagesGrid"]'],
  ["FinalCTA", "#download"],
];

const VIEWPORTS = [
  { name: "desktop", width: 1512, height: 1200, isMobile: false },
  { name: "mobile", width: 402, height: 1200, isMobile: true },
];

function ensureDirs() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function slugify(value) {
  return value.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

async function prepare(page) {
  const response = await page.goto(`${BASE_URL}${SHOWCASE_PATH}`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  if (!response || response.status() !== 200) {
    throw new Error(`Expected HTTP 200, got ${response ? response.status() : "no response"}`);
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
}

async function auditViewport(browser, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
  });
  await prepare(page);

  const errors = [];
  const warnings = [];
  const metrics = await page.evaluate((requiredBlocks) => {
    const html = document.documentElement;
    const found = {};
    for (const block of requiredBlocks) found[block] = 0;
    for (const el of document.querySelectorAll("[data-block]")) {
      const names = (el.getAttribute("data-block") || "").split(",");
      for (const name of names) {
        const trimmed = name.trim();
        if (trimmed) found[trimmed] = (found[trimmed] || 0) + 1;
      }
    }
    const boxes = [...document.querySelectorAll("[data-block]")].map((el) => {
      const rect = el.getBoundingClientRect();
      return {
        block: el.getAttribute("data-block"),
        tag: el.tagName,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
    });
    return {
      found,
      boxes,
      scrollWidth: html.scrollWidth,
      clientWidth: html.clientWidth,
      scrollHeight: html.scrollHeight,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
      h1Count: document.querySelectorAll("h1").length,
      unloadedImages: [...document.images]
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src),
    };
  }, REQUIRED_BLOCKS);

  if (metrics.scrollWidth > metrics.clientWidth + 2) {
    errors.push(`Horizontal overflow: ${metrics.scrollWidth}px > ${metrics.clientWidth}px`);
  }
  if (metrics.h1Count !== 1) errors.push(`Expected exactly one h1, found ${metrics.h1Count}`);
  if (metrics.robots !== "noindex,nofollow") {
    warnings.push(`Expected noindex,nofollow robots meta, found "${metrics.robots}"`);
  }
  for (const block of REQUIRED_BLOCKS) {
    if (!metrics.found[block]) errors.push(`Missing required block: ${block}`);
  }
  for (const box of metrics.boxes) {
    if (box.width < 20 || box.height < 20) {
      errors.push(`Suspiciously small block ${box.block}: ${box.width}x${box.height}`);
    }
  }
  if (metrics.unloadedImages.length) {
    errors.push(`Images failed to load: ${metrics.unloadedImages.join(", ")}`);
  }

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${viewport.name}-fullpage.png`),
    fullPage: true,
  });
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${viewport.name}-viewport.png`),
  });

  const crops = [];
  for (const [block, selector] of CROP_TARGETS) {
    const locator = page.locator(selector).first();
    if ((await locator.count()) === 0) {
      errors.push(`Missing crop target for ${block}: ${selector}`);
      continue;
    }
    const cropPath = path.join(SCREENSHOT_DIR, `${viewport.name}-${slugify(block)}.png`);
    await locator.screenshot({ path: cropPath });
    crops.push(path.relative(ROOT, cropPath));
  }

  await page.close();
  return {
    viewport: viewport.name,
    url: `${BASE_URL}${SHOWCASE_PATH}`,
    screenshot: path.relative(ROOT, path.join(SCREENSHOT_DIR, `${viewport.name}-fullpage.png`)),
    crops,
    metrics,
    errors,
    warnings,
  };
}

async function main() {
  ensureDirs();
  const launchOptions = {};
  if (process.env.CHROME_EXECUTABLE) {
    launchOptions.executablePath = process.env.CHROME_EXECUTABLE;
  } else if (process.env.PAKT_USE_SYSTEM_CHROME === "1" && fs.existsSync(SYSTEM_CHROME)) {
    launchOptions.executablePath = SYSTEM_CHROME;
  }
  const browser = await chromium.launch(launchOptions);
  const results = [];
  try {
    for (const viewport of VIEWPORTS) {
      results.push(await auditViewport(browser, viewport));
    }
  } finally {
    await browser.close();
  }

  const errorCount = results.reduce((sum, result) => sum + result.errors.length, 0);
  const warningCount = results.reduce((sum, result) => sum + result.warnings.length, 0);
  const report = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    path: SHOWCASE_PATH,
    report_basename: REPORT_BASENAME,
    screenshot_dir: path.relative(ROOT, SCREENSHOT_DIR),
    passed: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    required_blocks: REQUIRED_BLOCKS,
    results,
  };
  fs.writeFileSync(path.join(REPORT_DIR, `${REPORT_BASENAME}.json`), JSON.stringify(report, null, 2));

  const lines = [
    `# ${REPORT_TITLE} - ${report.passed ? "PASS" : "FAIL"}`,
    "",
    `Base URL: ${BASE_URL}`,
    `Path: ${SHOWCASE_PATH}`,
    `Generated: ${report.generated_at}`,
    `Total errors: ${errorCount}`,
    `Total warnings: ${warningCount}`,
    "",
    "## Viewports",
    "",
  ];
  for (const result of results) {
    lines.push(`- ${result.viewport} - ${result.errors.length ? "FAIL" : "PASS"} - screenshot: \`${result.screenshot}\``);
    for (const error of result.errors) lines.push(`  - ERROR: ${error}`);
    for (const warning of result.warnings) lines.push(`  - WARNING: ${warning}`);
  }
  fs.writeFileSync(path.join(REPORT_DIR, `${REPORT_BASENAME}.md`), `${lines.join("\n")}\n`);

  console.log(`${REPORT_TITLE} ${report.passed ? "PASS" : "FAIL"}`);
  console.log(`errors=${errorCount} warnings=${warningCount}`);
  console.log(`report=SEO/reports/${REPORT_BASENAME}.md`);
  process.exit(report.passed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
