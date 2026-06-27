#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../..");
const REPORT_DIR = path.join(ROOT, "SEO", "reports");
const SCREENSHOT_DIR = path.join(REPORT_DIR, "screenshots");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8765";
const SYSTEM_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const pages = [
  { slug: "pakt-hub", path: "/pakt/", stage2: false },
  { slug: "offline-translator-app", path: "/pakt/offline-translator-app/", stage2: true },
  { slug: "offline-translator-for-travel", path: "/pakt/offline-translator-for-travel/", stage2: true },
  { slug: "voice-speech-translator", path: "/pakt/voice-speech-translator/", stage2: true },
  { slug: "best-offline-translator-app", path: "/pakt/best-offline-translator-app/", stage2: true },
];

const viewports = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
];

function ensureDirs() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function isIgnorableConsole(text) {
  return /google-analytics|googletagmanager|favicon/i.test(text);
}

async function visibleCount(locator) {
  const count = await locator.count();
  let visible = 0;
  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible()) visible += 1;
  }
  return visible;
}

async function auditPage(browser, pageDef, viewport) {
  const page = await browser.newPage({ viewport });
  const url = `${BASE_URL}${pageDef.path}`;
  const errors = [];
  const warnings = [];
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error" && !isIgnorableConsole(message.text())) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  if (!response || response.status() !== 200) {
    errors.push(`Expected HTTP 200, got ${response ? response.status() : "no response"}`);
  }

  const title = await page.title();
  if (!title) errors.push("Missing document title");

  const h1Count = await page.locator("h1").count();
  if (h1Count !== 1) errors.push(`Expected exactly one h1, found ${h1Count}`);

  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  if (overflow.scrollWidth > overflow.clientWidth + 2) {
    errors.push(`Horizontal overflow: ${overflow.scrollWidth}px > ${overflow.clientWidth}px`);
  }

  if (pageDef.stage2) {
    for (const blockName of ["HeaderNav", "HeroProduct", "StoreCtaButtons", "FAQAccordion", "RelatedPagesGrid", "FinalCTA"]) {
      if ((await page.locator(`[data-block="${blockName}"]`).count()) < 1) {
        errors.push(`Missing component block: ${blockName}`);
      }
    }
    if ((await visibleCount(page.locator(".store-button"))) < 2) {
      errors.push("App Store and Google Play CTA badges are not both visible");
    }
    if ((await page.locator(".faq-question").count()) < 5) {
      errors.push("Expected at least five FAQ questions");
    } else {
      await page.locator(".faq-question").first().click();
      const openFaqVisible = await page.locator(".faq-item[open] .faq-answer, .faq-item.open .faq-answer").first().isVisible();
      if (!openFaqVisible) errors.push("FAQ accordion did not open");
    }
  }

  if (viewport.name === "mobile") {
    const toggle = page.locator(".nav-toggle").first();
    if (await toggle.isVisible()) {
      await toggle.click();
      const navVisible = await page.locator(".nav-links.open").first().isVisible();
      if (!navVisible) errors.push("Mobile navigation did not open");
      await toggle.click();
    } else {
      errors.push("Mobile nav toggle is not visible");
    }
  }

  if (pageDef.slug === "best-offline-translator-app" && viewport.name === "mobile") {
    const tableOverflow = await page.locator(".compare-table").evaluate((table) => {
      const rect = table.getBoundingClientRect();
      return rect.right - document.documentElement.clientWidth;
    });
    if (tableOverflow > 2) errors.push(`Comparison table overflows mobile viewport by ${tableOverflow}px`);
  }

  const screenshot = path.join(SCREENSHOT_DIR, `${pageDef.slug}-${viewport.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });

  if (consoleErrors.length) warnings.push(...consoleErrors.map((item) => `Console error: ${item}`));
  if (pageErrors.length) errors.push(...pageErrors.map((item) => `Page error: ${item}`));

  await page.close();
  return {
    slug: pageDef.slug,
    path: pageDef.path,
    viewport: viewport.name,
    url,
    title,
    screenshot: path.relative(ROOT, screenshot),
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
    for (const pageDef of pages) {
      for (const viewport of viewports) {
        results.push(await auditPage(browser, pageDef, viewport));
      }
    }
  } finally {
    await browser.close();
  }

  const errorCount = results.reduce((sum, item) => sum + item.errors.length, 0);
  const warningCount = results.reduce((sum, item) => sum + item.warnings.length, 0);
  const report = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    passed: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    results,
  };

  fs.writeFileSync(path.join(REPORT_DIR, "pakt_stage2_playwright_qa.json"), JSON.stringify(report, null, 2));

  const lines = [
    `# Pakt Stage 2A Playwright QA - ${report.passed ? "PASS" : "FAIL"}`,
    "",
    `Base URL: ${BASE_URL}`,
    `Generated: ${report.generated_at}`,
    `Total errors: ${errorCount}`,
    `Total warnings: ${warningCount}`,
    "",
    "## Browser Checks",
    "",
  ];
  for (const item of results) {
    lines.push(`- \`${item.path}\` ${item.viewport} - ${item.errors.length ? "FAIL" : "PASS"} - screenshot: \`${item.screenshot}\``);
    for (const error of item.errors) lines.push(`  - ERROR: ${error}`);
    for (const warning of item.warnings) lines.push(`  - WARNING: ${warning}`);
  }
  fs.writeFileSync(path.join(REPORT_DIR, "pakt_stage2_playwright_qa.md"), `${lines.join("\n")}\n`);

  console.log(`Pakt Stage 2A Playwright QA ${report.passed ? "PASS" : "FAIL"}`);
  console.log(`errors=${errorCount} warnings=${warningCount}`);
  console.log("report=SEO/reports/pakt_stage2_playwright_qa.md");
  process.exit(report.passed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
