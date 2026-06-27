#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const sharp = require("sharp");
const pixelmatchModule = require("pixelmatch");

const pixelmatch = pixelmatchModule.default || pixelmatchModule;

const ROOT = path.resolve(__dirname, "../..");
const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:8765";
const PAGE_PATH = process.env.PAGE_PATH || "/pakt/component-parity/";
const TARGET = process.env.TARGET || "mobile:scenarios";
const CANDIDATES = JSON.parse(process.env.CANDIDATES || '[{"name":"current","css":""}]');
const SYSTEM_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const FIGMA_DIR = path.join(ROOT, "design", "pakt-figma-handoff", "figma-screenshots");
const OUT_DIR = path.join(ROOT, "SEO", "reports", "screenshots", "candidate-tuning");

const VIEWPORTS = {
  desktop: { width: 1512, height: 1800, isMobile: false },
  mobile: { width: 402, height: 1800, isMobile: true },
};

const REFERENCES = {
  "desktop:hero": [".pakt-hero", "desktop-sections/01-hero.png"],
  "desktop:situation": ["#situation", "component-variants/situation-focus-desktop.png"],
  "desktop:features": ["#features", "desktop-sections/03-features.png"],
  "desktop:how-it-works": ["#how-it-works", "desktop-sections/04-how-it-works.png"],
  "desktop:app-flow": ["#app-flow", "component-variants/app-flow-steps-desktop.png"],
  "desktop:scenarios": ["#scenarios", "component-variants/scenario-cards-desktop.png"],
  "desktop:checklist": ["#checklist", "desktop-sections/07-checklist.png"],
  "desktop:offline-proof": ["#offline-proof", "desktop-sections/08-offline-proof.png"],
  "desktop:privacy-conversation-destination": [".privacy-conversation-section", "component-variants/privacy-conversation-destination-stack-desktop.png"],
  "desktop:comparison": ["#comparison", "desktop-sections/10-comparison-faq.png"],
  "desktop:final-cta": ["#download", "desktop-sections/11-final-cta.png"],
  "mobile:hero": [".pakt-hero", "mobile-sections/01-hero.png"],
  "mobile:situation": ["#situation", "mobile-sections/02-situation.png"],
  "mobile:features": ["#features", "mobile-sections/03-features.png"],
  "mobile:how-it-works": ["#how-it-works", "mobile-sections/04-how-it-works.png"],
  "mobile:app-flow": ["#app-flow", "mobile-sections/05-travel-confidence.png"],
  "mobile:scenarios": ["#scenarios", "mobile-sections/06-scenarios.png"],
  "mobile:checklist": ["#checklist", "mobile-sections/07-checklist.png"],
  "mobile:offline-proof": ["#offline-proof", "mobile-sections/08-offline-proof.png"],
  "mobile:privacy-conversation-destination": [".privacy-conversation-section", "mobile-sections/09-privacy-conversation-destination.png"],
  "mobile:comparison": ["#comparison", "mobile-sections/10-comparison.png"],
  "mobile:faq": ["#faq", "mobile-sections/11-faq.png"],
  "mobile:final-cta": ["#download", "mobile-sections/12-final-cta.png"],
};

const CAPTURE_OPTIONS = {
  "mobile:offline-proof": {
    framePadding: { top: 80, bottom: 98, color: "#faf7ec" },
  },
  "mobile:final-cta": {
    clipPadding: { top: 59, bottom: 0 },
  },
};

async function prepare(page) {
  const response = await page.goto(`${BASE_URL}${PAGE_PATH}`, { waitUntil: "networkidle", timeout: 30000 });
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
}

async function capture(page, selector, outputPath, viewportWidth, options = {}) {
  const rect = await page.locator(selector).first().evaluate((node) => {
    const box = node.getBoundingClientRect();
    return {
      top: Math.max(0, box.top + window.scrollY),
      height: Math.max(1, box.height),
      documentHeight: document.documentElement.scrollHeight,
    };
  });
  const clipPadding = options.clipPadding || {};
  const framePadding = options.framePadding || {};
  const padTop = clipPadding.top || 0;
  const padBottom = clipPadding.bottom || 0;
  const frameTop = framePadding.top || 0;
  const frameBottom = framePadding.bottom || 0;
  const clipTop = Math.max(0, Math.round(rect.top - padTop));
  const clipHeight = Math.max(
    1,
    Math.min(
      Math.round(rect.height + padTop + padBottom),
      Math.round(rect.documentHeight - clipTop),
    ),
  );
  const rawPath = frameTop || frameBottom ? `${outputPath}.raw.png` : outputPath;
  await page.screenshot({
    path: rawPath,
    fullPage: true,
    clip: {
      x: 0,
      y: clipTop,
      width: viewportWidth,
      height: clipHeight,
    },
  });
  if (frameTop || frameBottom) {
    await sharp({
      create: {
        width: viewportWidth,
        height: clipHeight + frameTop + frameBottom,
        channels: 4,
        background: framePadding.color || "#ffffff",
      },
    })
      .composite([{ input: rawPath, top: frameTop, left: 0 }])
      .png()
      .toFile(outputPath);
    fs.unlinkSync(rawPath);
  }
}

async function compare(referencePath, actualPath) {
  const referenceMeta = await sharp(referencePath).metadata();
  const actualMeta = await sharp(actualPath).metadata();
  const width = referenceMeta.width;
  const height = referenceMeta.height;
  const referenceRaw = await sharp(referencePath).ensureAlpha().raw().toBuffer();
  const actualRaw = await sharp(actualPath).resize(width, height, { fit: "fill" }).ensureAlpha().raw().toBuffer();
  const diff = Buffer.alloc(width * height * 4);
  const mismatched = pixelmatch(referenceRaw, actualRaw, diff, width, height, {
    threshold: 0.16,
    includeAA: false,
  });
  let absoluteDelta = 0;
  for (let index = 0; index < referenceRaw.length; index += 4) {
    absoluteDelta += Math.abs(referenceRaw[index] - actualRaw[index]);
    absoluteDelta += Math.abs(referenceRaw[index + 1] - actualRaw[index + 1]);
    absoluteDelta += Math.abs(referenceRaw[index + 2] - actualRaw[index + 2]);
  }
  const pixelSimilarity = 1 - mismatched / (width * height);
  const colorSimilarity = 1 - absoluteDelta / (width * height * 255 * 3);
  const heightDelta = Math.abs(actualMeta.height - referenceMeta.height) / referenceMeta.height;
  return {
    score: pixelSimilarity * 0.7 + colorSimilarity * 0.2 + (1 - Math.min(1, heightDelta)) * 0.1,
    pixel_similarity: pixelSimilarity,
    color_similarity: colorSimilarity,
    height_delta: heightDelta,
    actual_height: actualMeta.height,
    reference_height: referenceMeta.height,
  };
}

function format(value) {
  return typeof value === "number" ? (value * 100).toFixed(4) : value;
}

async function main() {
  const [viewportName, targetId] = TARGET.split(":");
  const viewport = VIEWPORTS[viewportName];
  const ref = REFERENCES[TARGET];
  if (!viewport || !ref) throw new Error(`Unknown TARGET ${TARGET}`);
  const [selector, refRelative] = ref;
  const referencePath = path.join(FIGMA_DIR, refRelative);
  if (!fs.existsSync(referencePath)) throw new Error(`Missing reference ${referencePath}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const launchOptions = {};
  if (process.env.CHROME_EXECUTABLE) {
    launchOptions.executablePath = process.env.CHROME_EXECUTABLE;
  } else if (process.env.PAKT_USE_SYSTEM_CHROME === "1" && fs.existsSync(SYSTEM_CHROME)) {
    launchOptions.executablePath = SYSTEM_CHROME;
  }

  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    isMobile: viewport.isMobile,
  });

  try {
    await prepare(page);
    await page.evaluate(() => {
      const style = document.createElement("style");
      style.id = "candidate-tuning-style";
      document.head.appendChild(style);
    });

    const rows = [];
    for (const [index, candidate] of CANDIDATES.entries()) {
      await page.evaluate((css) => {
        document.getElementById("candidate-tuning-style").textContent = css;
      }, candidate.css || "");
      await page.waitForTimeout(30);
      const outputPath = path.join(OUT_DIR, `${viewportName}-${targetId}-${index}-${candidate.name.replace(/[^a-z0-9_-]+/gi, "-")}.png`);
      await capture(page, selector, outputPath, viewport.width, CAPTURE_OPTIONS[TARGET]);
      rows.push({
        name: candidate.name,
        ...await compare(referencePath, outputPath),
        screenshot: path.relative(ROOT, outputPath),
      });
    }

    rows.sort((a, b) => b.score - a.score);
    console.table(rows.map((row) => ({
      name: row.name,
      score: format(row.score),
      pixel: format(row.pixel_similarity),
      color: format(row.color_similarity),
      height: format(row.height_delta),
      actualH: row.actual_height,
      refH: row.reference_height,
    })));
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
