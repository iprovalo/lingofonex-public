#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "../..");
const REPORT_DIR = path.join(ROOT, "SEO", "reports");
const SCREENSHOT_DIR = path.join(REPORT_DIR, "screenshots", "public-interactivity");
const BASE_URL = process.env.BASE_URL || "https://tool.dowhatmatter.com";
const SYSTEM_CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const pages = [
  { slug: "pakt-hub", path: "/pakt/", publicPage: false },
  { slug: "offline-translator-app", path: "/pakt/offline-translator-app/", publicPage: true },
  { slug: "offline-translator-for-travel", path: "/pakt/offline-translator-for-travel/", publicPage: true },
  { slug: "voice-speech-translator", path: "/pakt/voice-speech-translator/", publicPage: true },
  { slug: "best-offline-translator-app", path: "/pakt/best-offline-translator-app/", publicPage: true },
  { slug: "component-showcase", path: "/pakt/component-showcase/", publicPage: false },
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "wide", width: 2048, height: 1200 },
  { name: "mobile", width: 390, height: 844 },
];

const bannedRasterIconPatterns = [
  /pakt-feature-icon-[^)"]+\.png/g,
  /pakt-scenario-icon-[^)"]+\.png/g,
  /pakt-scenario-mobile-icon-[^)"]+\.png/g,
  /pakt-check-control-[^)"]+\.png/g,
];

const bannedCssIconPatterns = [
  {
    label: "CSS-drawn FAQ plus/minus icon",
    pattern: /linear-gradient\(currentColor,\s*currentColor\)\s+center\s*\/\s*16px\s+2px\s+no-repeat/s,
  },
  {
    label: "CSS-drawn scenario icon shadow",
    pattern: /box-shadow:\s*11px\s+0\s+0\s+var\(--pakt-black\)/,
  },
  {
    label: "CSS-drawn polygon icon",
    pattern: /clip-path:\s*polygon\(/,
  },
];

const requiredSvgReferences = [
  "/images/pakt-feature-icon-offline.svg",
  "/images/pakt-feature-icon-voice.svg",
  "/images/pakt-feature-icon-private.svg",
  "/images/pakt-feature-icon-travel.svg",
  "/images/pakt-feature-icon-cloud.svg",
  "/images/pakt-feature-icon-language.svg",
  "/images/pakt-scenario-icon-taxis.svg",
  "/images/pakt-scenario-icon-hotels.svg",
  "/images/pakt-scenario-icon-restaurants.svg",
  "/images/pakt-scenario-icon-stations.svg",
  "/images/pakt-scenario-icon-pharmacies.svg",
  "/images/pakt-scenario-icon-markets.svg",
  "/images/pakt-icon-check-empty.svg",
  "/images/pakt-icon-check-orange.svg",
  "/images/pakt-icon-proof-airplane.svg",
  "/images/pakt-icon-proof-no-wifi.svg",
  "/images/pakt-icon-proof-weak-signal.svg",
  "/images/pakt-icon-privacy-lock.svg",
  "/images/pakt-icon-mic-button.svg",
  "/images/pakt-why-icon-connection.svg",
  "/images/pakt-why-icon-lock.svg",
  "/images/pakt-why-icon-shield.svg",
  "/images/pakt-icon-faq-plus.svg",
  "/images/pakt-icon-faq-minus.svg",
  "/images/pakt-icon-close.svg",
];

const legacyNonFigmaAssetPatterns = [
  /Lingofonex_App_Icon-167px\.png/,
  /Lingofonex_Logo-Medium\.png/,
  /og-card\.png/,
  /pakt-travel-hero\.png/,
];

function ensureDirs() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function ignoreConsole(text) {
  return /googletagmanager|google-analytics|favicon|gtag|ERR_BLOCKED_BY_CLIENT/i.test(text);
}

function auditRasterIconReferences(errors) {
  const cssPath = path.join(ROOT, "css", "pakt-stage2.css");
  const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";
  const stage2Files = [
    "css/pakt-stage2.css",
    "pakt/index.html",
    ...pages.map((pageDef) => `pakt/${pageDef.slug}/index.html`).filter((file) => fs.existsSync(path.join(ROOT, file))),
  ];
  const stageText = stage2Files
    .map((file) => (fs.existsSync(path.join(ROOT, file)) ? fs.readFileSync(path.join(ROOT, file), "utf8") : ""))
    .join("\n");
  const matches = new Set();
  for (const pattern of bannedRasterIconPatterns) {
    for (const match of css.matchAll(pattern)) matches.add(match[0]);
  }
  if (matches.size) {
    errors.push(`Raster icon crop references remain in CSS: ${Array.from(matches).sort().join(", ")}`);
  }
  for (const { label, pattern } of bannedCssIconPatterns) {
    if (pattern.test(css)) errors.push(`${label} remains in CSS`);
  }
  for (const asset of requiredSvgReferences) {
    if (!stageText.includes(asset)) errors.push(`Required SVG icon asset is not referenced by generated Pakt files: ${asset}`);
  }
}

function auditPaktAssetReferences(errors) {
  const stage2Files = [
    "css/pakt-stage2.css",
    "pakt/index.html",
    ...pages.map((pageDef) => `pakt/${pageDef.slug}/index.html`).filter((file) => fs.existsSync(path.join(ROOT, file))),
  ];
  const refs = new Set();
  const refPatterns = [
    /\/images\/([^"')\\\s]+?\.(?:png|svg|jpe?g|webp))/gi,
    /(?:\.\.\/)+images\/([^"')\\\s]+?\.(?:png|svg|jpe?g|webp))/gi,
    /https:\/\/www\.lingofonex\.com\/images\/([^"')\\\s]+?\.(?:png|svg|jpe?g|webp))/gi,
  ];

  for (const file of stage2Files) {
    const source = fs.readFileSync(path.join(ROOT, file), "utf8");
    for (const pattern of legacyNonFigmaAssetPatterns) {
      if (pattern.test(source)) errors.push(`${file} still references legacy/non-Figma asset ${pattern}`);
    }
    for (const pattern of refPatterns) {
      let match;
      while ((match = pattern.exec(source))) refs.add(match[1]);
    }
  }

  for (const asset of refs) {
    if (!asset.startsWith("pakt-")) {
      errors.push(`${asset} is referenced by Pakt stage-2 files but is not Pakt/Figma-prefixed`);
    }
    if (!fs.existsSync(path.join(ROOT, "images", asset))) {
      errors.push(`${asset} is referenced by Pakt stage-2 files but missing from images/`);
    }
    if (!fs.existsSync(path.join(ROOT, "design", "pakt-figma-handoff", "assets", asset))) {
      errors.push(`${asset} is referenced by Pakt stage-2 files but missing from design/pakt-figma-handoff/assets/`);
    }
  }
}

function bgUsesAsset(value, assetName) {
  return typeof value === "string" && value.includes(assetName);
}

function styleUsesAsset(value, assetName) {
  if (typeof value === "string") return bgUsesAsset(value, assetName);
  if (!value) return false;
  return bgUsesAsset(`${value.backgroundImage || ""} ${value.maskImage || ""} ${value.webkitMaskImage || ""}`, assetName);
}

async function countVisible(locator) {
  const count = await locator.count();
  let visible = 0;
  for (let index = 0; index < count; index += 1) {
    if (await locator.nth(index).isVisible()) visible += 1;
  }
  return visible;
}

async function scrollThroughParallaxSection(page, selector, progress = 0.55) {
  await page.locator(selector).first().evaluate((section) => {
    const pin = section.querySelector(".scroll-pin");
    const top = pin ? parseFloat(window.getComputedStyle(pin).top) || 0 : 0;
    window.scrollTo(0, section.offsetTop - top + 2);
  });
  await page.waitForTimeout(220);
  const beforeY = await page.evaluate(() => Math.round(window.scrollY));
  await page.locator(selector).first().evaluate((section, targetProgress) => {
    const pin = section.querySelector(".scroll-pin");
    const top = pin ? parseFloat(window.getComputedStyle(pin).top) || 0 : 0;
    const start = Math.max(0, section.offsetTop - top);
    const pinHeight = pin ? pin.getBoundingClientRect().height : window.innerHeight;
    const distance = Math.max(1, section.offsetHeight - pinHeight);
    window.scrollTo(0, start + distance * targetProgress);
  }, progress);
  await page.waitForTimeout(260);
  const afterY = await page.evaluate(() => Math.round(window.scrollY));
  const sticky = await page.locator(selector).first().evaluate((section) => {
    const pin = section.querySelector(".scroll-pin");
    if (!pin) return null;
    const rect = pin.getBoundingClientRect();
    const expectedTop = parseFloat(window.getComputedStyle(pin).top) || 0;
    return {
      top: rect.top,
      expectedTop,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
    };
  });
  return { beforeY, afterY, sticky };
}

function assertParallaxScroll(result, label, errors) {
  if (result.afterY <= result.beforeY + 20) {
    errors.push(`${label} should use natural page scroll through the pinned range, y=${result.beforeY}->${result.afterY}`);
  }
  if (!result.sticky) {
    errors.push(`${label} is missing a sticky scroll-pin wrapper`);
    return;
  }
  if (Math.abs(result.sticky.top - result.sticky.expectedTop) > 8) {
    errors.push(`${label} sticky stage should stay pinned, top=${result.sticky.top} expected=${result.sticky.expectedTop}`);
  }
}

async function hrefTargetExists(page, href) {
  if (!href || !href.startsWith("#") || href === "#") return true;
  return page.evaluate((hash) => {
    try {
      return Boolean(document.querySelector(decodeURIComponent(hash)));
    } catch (_error) {
      return false;
    }
  }, href);
}

async function auditNav(page, viewport, errors) {
  const navLinks = await page.locator(".nav-links a").evaluateAll((links) =>
    links.map((link) => ({
      text: link.textContent.trim(),
      href: link.getAttribute("href"),
    })),
  );

  for (const link of navLinks) {
    if (link.href && link.href.startsWith("#") && !(await hrefTargetExists(page, link.href))) {
      errors.push(`Nav anchor target missing: ${link.href}`);
    }
  }

  if (viewport.name !== "mobile") return;

  const toggle = page.locator(".nav-toggle").first();
  if (!(await toggle.count()) || !(await toggle.isVisible())) {
    errors.push("Mobile nav toggle is not visible");
    return;
  }

  const before = await toggle.getAttribute("aria-expanded");
  await toggle.click();
  const opened = await toggle.getAttribute("aria-expanded");
  const navOpen = await page.locator(".nav-links.open").first().isVisible();
  await toggle.click();
  const closed = await toggle.getAttribute("aria-expanded");

  if (before !== "false" || opened !== "true" || closed !== "false") {
    errors.push(`Mobile nav aria-expanded not maintained: before=${before} open=${opened} close=${closed}`);
  }
  if (!navOpen) errors.push("Mobile nav did not visibly open");

  const hashLink = page.locator(".nav-links a[href^='#']").first();
  if (await hashLink.count()) {
    await toggle.click();
    await hashLink.click();
    const afterLink = await toggle.getAttribute("aria-expanded");
    const stillOpen = await page.locator(".nav-links.open").count();
    if (afterLink !== "false" || stillOpen !== 0) {
      errors.push("Mobile nav does not close after tapping an anchor link");
    }
  }
}

async function auditFaq(page, errors) {
  const questions = page.locator(".faq-question");
  const count = await questions.count();
  if (!count) return;

  const initiallyOpen = await page.locator(".faq-item[open], .faq-item.open").count();
  if (initiallyOpen !== 0) errors.push(`FAQ should start closed, found ${initiallyOpen} open items`);

  const shouldAuditDesktopGeometry = await page.evaluate(() => window.innerWidth > 760 && Boolean(document.querySelector("body:not(.page-component-parity) #faq .faq-item")));
  let closedGeometry = null;
  if (shouldAuditDesktopGeometry) {
    closedGeometry = await page.locator("body:not(.page-component-parity) #faq .faq-item").first().evaluate((item) => {
      const question = item.querySelector(".faq-question");
      const icon = window.getComputedStyle(question, "::after");
      const rect = item.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        radius: parseFloat(window.getComputedStyle(item).borderTopLeftRadius) || 0,
        questionHeight: question.getBoundingClientRect().height,
        questionFontSize: parseFloat(window.getComputedStyle(question).fontSize) || 0,
        iconWidth: parseFloat(icon.width) || 0,
        iconImage: icon.backgroundImage,
      };
    });
  }

  await questions.nth(0).click();
  let openCount = await page.locator(".faq-item[open], .faq-item.open").count();
  if (openCount !== 1) errors.push(`FAQ first click should leave one item open, found ${openCount}`);

  if (shouldAuditDesktopGeometry) {
    const openGeometry = await page.locator("body:not(.page-component-parity) #faq .faq-item").first().evaluate((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      const icon = window.getComputedStyle(question, "::after");
      const rect = item.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        radius: parseFloat(window.getComputedStyle(item).borderTopLeftRadius) || 0,
        answerHeight: answer.getBoundingClientRect().height,
        answerFontSize: parseFloat(window.getComputedStyle(answer).fontSize) || 0,
        answerColor: window.getComputedStyle(answer).color,
        iconWidth: parseFloat(icon.width) || 0,
        iconImage: icon.backgroundImage,
      };
    });
    if (closedGeometry.width < 930 || closedGeometry.width > 980) {
      errors.push(`FAQ desktop closed width should match 957px component: ${JSON.stringify(closedGeometry)}`);
    }
    if (closedGeometry.height < 68 || closedGeometry.height > 75 || closedGeometry.radius < 32 || closedGeometry.radius > 38) {
      errors.push(`FAQ desktop closed row should match 71px pill state: ${JSON.stringify(closedGeometry)}`);
    }
    if (closedGeometry.questionHeight < 66 || closedGeometry.questionHeight > 72 || closedGeometry.questionFontSize < 19 || closedGeometry.questionFontSize > 21) {
      errors.push(`FAQ desktop question text geometry should match component: ${JSON.stringify(closedGeometry)}`);
    }
    if (!closedGeometry.iconImage.includes("pakt-icon-faq-plus.svg") || closedGeometry.iconWidth < 14 || closedGeometry.iconWidth > 18) {
      errors.push(`FAQ desktop closed icon should be 16px plus SVG: ${JSON.stringify(closedGeometry)}`);
    }
    if (openGeometry.width < 930 || openGeometry.width > 980 || openGeometry.height < 170 || openGeometry.radius < 36 || openGeometry.radius > 44) {
      errors.push(`FAQ desktop expanded row should match 957x179 component state: ${JSON.stringify(openGeometry)}`);
    }
    if (openGeometry.answerHeight <= 30 || openGeometry.answerFontSize < 19 || openGeometry.answerFontSize > 21 || !/rgba?\(23,\s*23,\s*26/.test(openGeometry.answerColor)) {
      errors.push(`FAQ desktop expanded answer should be visible muted 20px text: ${JSON.stringify(openGeometry)}`);
    }
    if (!openGeometry.iconImage.includes("pakt-icon-faq-minus.svg") || openGeometry.iconWidth < 14 || openGeometry.iconWidth > 18) {
      errors.push(`FAQ desktop expanded icon should be 16px minus SVG: ${JSON.stringify(openGeometry)}`);
    }
  }

  if (count > 1) {
    await questions.nth(1).click();
    openCount = await page.locator(".faq-item[open], .faq-item.open").count();
    if (openCount !== 1) errors.push(`FAQ switching should leave one item open, found ${openCount}`);
    await questions.nth(1).click();
    openCount = await page.locator(".faq-item[open], .faq-item.open").count();
    if (openCount !== 0) errors.push(`FAQ second click should close the current item, found ${openCount}`);
  }
}

async function auditStoreButtons(page, errors) {
  const buttons = page.locator(".store-button");
  const count = await buttons.count();
  if (!count) return;
  if ((await countVisible(buttons)) < 1) {
    errors.push("App Store CTA badge is not visible");
  }

  const data = await buttons.evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.href,
      target: anchor.target,
      rel: anchor.rel,
      label: anchor.getAttribute("aria-label") || anchor.textContent.trim(),
    })),
  );

  const appStoreButtons = data.filter((button) => /^https:\/\/apps\.apple\.com\//.test(button.href));
  const googleButtons = data.filter((button) => /play\.google\.com|Google Play/i.test(`${button.href} ${button.label}`));
  if (!appStoreButtons.length) errors.push("No App Store CTA badge found");
  if (googleButtons.length) errors.push(`Google Play CTA should be removed for now: ${googleButtons.map((button) => button.label).join(", ")}`);

  for (const button of appStoreButtons) {
    if (!/^https:\/\/apps\.apple\.com\//.test(button.href)) {
      errors.push(`Store CTA is not an expected App Store URL: ${button.href}`);
    }
    if (button.target !== "_blank") errors.push(`Store CTA should open a new tab: ${button.label}`);
    if (!button.rel.includes("noopener")) errors.push(`Store CTA missing noopener: ${button.label}`);
  }
}

async function auditRelatedCards(page, errors) {
  const cards = await page.locator("#explore-more .related-card").evaluateAll((elements) =>
    elements.map((element) => ({
      tagName: element.tagName.toLowerCase(),
      href: element.getAttribute("href"),
      type: element.getAttribute("type"),
      expanded: element.getAttribute("aria-expanded"),
      text: element.textContent.trim().replace(/\s+/g, " "),
    })),
  );
  for (const card of cards) {
    if (card.tagName !== "button") {
      errors.push(`Explore card should be an in-page button, found <${card.tagName}>: ${card.text}`);
    }
    if (card.href) {
      errors.push(`Explore card should not navigate with href: ${card.text} -> ${card.href}`);
    }
    if (card.type !== "button") {
      errors.push(`Explore card should use type=button: ${card.text}`);
    }
    if (card.expanded !== "false") {
      errors.push(`Explore card should start collapsed: ${card.text}`);
    }
  }

  const firstCard = page.locator("#explore-more .related-card").first();
  const secondCard = page.locator("#explore-more .related-card").nth(1);
  if ((await firstCard.count()) && (await secondCard.count())) {
    await scrollThroughParallaxSection(page, "#explore-more", 0.55);
    const scrollExpanded = await page.locator("#explore-more .related-card[aria-expanded='true']").count();
    if (scrollExpanded) {
      errors.push(`Explore more scroll should move the rail only, not open cards; expanded=${scrollExpanded}`);
    }

    await page.evaluate(() => {
      const section = document.querySelector("#explore-more");
      if (!section) return;
      const pin = section.querySelector(".scroll-pin");
      const top = pin ? parseFloat(window.getComputedStyle(pin).top) || 0 : 0;
      window.scrollTo(0, Math.max(0, section.offsetTop - top));
    });
    await page.waitForTimeout(180);
    const beforeUrl = page.url();
    const before = await firstCard.boundingBox();
    await firstCard.evaluate((card) => card.click());
    await page.waitForTimeout(260);
    const after = await firstCard.boundingBox();
    const firstExpanded = await firstCard.getAttribute("aria-expanded");
    if (page.url() !== beforeUrl) errors.push(`Explore card click navigated away: ${beforeUrl} -> ${page.url()}`);
    if (firstExpanded !== "true") errors.push("Explore card did not enter expanded state on click");
    if (before && after && after.width <= before.width + 30) {
      errors.push(`Explore expanded card did not grow enough: before=${before.width} after=${after.width}`);
    }
    await secondCard.evaluate((card) => card.click());
    await page.waitForTimeout(260);
    const firstCollapsed = await firstCard.getAttribute("aria-expanded");
    const secondExpanded = await secondCard.getAttribute("aria-expanded");
    if (firstCollapsed !== "false" || secondExpanded !== "true") {
      errors.push(`Explore card state should move to the newly clicked card: first=${firstCollapsed} second=${secondExpanded}`);
    }
    await secondCard.evaluate((card) => card.click());
    await page.waitForTimeout(260);
    if ((await secondCard.getAttribute("aria-expanded")) !== "false") {
      errors.push("Explore card should collapse when clicked while open");
    }
  }
}

async function auditChecklist(page, errors) {
  const checklist = page.locator("#checklist .checklist");
  if (!(await checklist.count())) return;

  const itemCount = await checklist.locator(".check-item").count();
  const buttonCount = await checklist.locator("button, [role='button']").count();
  if (buttonCount !== 0) errors.push(`Checklist should not expose click controls, found ${buttonCount}`);

  if (itemCount) {
    await page.locator("#checklist").first().evaluate((el) => window.scrollTo(0, el.offsetTop - window.innerHeight * 0.8));
    await page.waitForTimeout(120);
    const beforeCount = await checklist.locator(".check-item.is-checked").count();
    const lock = await scrollThroughParallaxSection(page, "#checklist", 0.55);
    const afterCount = await checklist.locator(".check-item.is-checked").count();
    assertParallaxScroll(lock, "Checklist", errors);
    if (afterCount <= beforeCount || afterCount < Math.min(2, itemCount)) {
      errors.push(`Checklist should progress on scroll, before=${beforeCount} after=${afterCount}`);
    }
    const checkedMarker = await checklist.locator(".check-item.is-checked").first().evaluate((item) => {
      const control = item.querySelector(".check-control");
      const styles = window.getComputedStyle(control);
      return {
        markerContent: window.getComputedStyle(control, "::after").content,
        markerBg: styles.backgroundColor,
        markerImage: styles.backgroundImage,
      };
    }).catch(() => null);
    if (
      !checkedMarker ||
      checkedMarker.markerContent !== "none" ||
      !bgUsesAsset(checkedMarker.markerImage, "pakt-icon-check-orange.svg") ||
      !/rgba?\(0,\s*0,\s*0,\s*0\)|transparent/.test(checkedMarker.markerBg)
    ) {
      errors.push(`Checklist checked marker should use the orange SVG control, not a filled dot or CSS glyph: ${JSON.stringify(checkedMarker)}`);
    }
  }
}

async function auditProofTabs(page, errors) {
  const tabs = page.locator(".proof-band .status-chip-button");
  const count = await tabs.count();
  if (!count) return;

  if (count < 3) errors.push(`Expected 3 proof status items, found ${count}`);
  const buttonCount = await page.locator(".proof-band .status-chip-button button, .proof-band .status-chip-button[role='tab']").count();
  if (buttonCount !== 0) errors.push(`Proof statuses should not expose tab/click controls, found ${buttonCount}`);

  let selected = await tabs.evaluateAll((buttons) =>
    buttons.map((button) => ({
      label: button.textContent.trim().replace(/\s+/g, " "),
      selected: button.getAttribute("aria-selected"),
    })),
  );
  if (selected.filter((item) => item.selected === "true").length !== 1) {
    errors.push(`Expected one selected proof status on load: ${JSON.stringify(selected)}`);
  }
  let iconStates = await tabs.evaluateAll((buttons) =>
    buttons.map((button) => ({
      selected: button.getAttribute("aria-selected"),
      iconOpacity: Number(window.getComputedStyle(button.querySelector(".status-icon")).opacity),
      iconImage: window.getComputedStyle(button.querySelector(".status-icon")).backgroundImage,
      maskImage:
        window.getComputedStyle(button.querySelector(".status-icon")).webkitMaskImage ||
        window.getComputedStyle(button.querySelector(".status-icon")).maskImage,
    })),
  );
  const expectedProofIcons = [
    "pakt-icon-proof-airplane.svg",
    "pakt-icon-proof-no-wifi.svg",
    "pakt-icon-proof-weak-signal.svg",
  ];
  iconStates.forEach((item, index) => {
    if (!styleUsesAsset(item, expectedProofIcons[index])) {
      errors.push(`Proof status icon ${index + 1} should use ${expectedProofIcons[index]}: ${JSON.stringify(item)}`);
    }
  });
  const initialSelectedIndex = iconStates.findIndex((item) => item.selected === "true");
  if (initialSelectedIndex < 0 || iconStates.some((item, index) => index !== initialSelectedIndex && item.iconOpacity >= iconStates[initialSelectedIndex].iconOpacity)) {
    errors.push(`Selected proof icon should be brightest: ${JSON.stringify(iconStates)}`);
  }

  const lock = await scrollThroughParallaxSection(page, ".proof-band", 0.5);
  assertParallaxScroll(lock, "Proof status", errors);
  selected = await tabs.evaluateAll((buttons) =>
    buttons.map((button) => ({
      label: button.textContent.trim().replace(/\s+/g, " "),
      selected: button.getAttribute("aria-selected"),
      color: window.getComputedStyle(button).color,
    })),
  );
  if (!selected.some((item, index) => index > 0 && item.selected === "true")) {
    errors.push(`Proof status did not advance on scroll: ${JSON.stringify(selected)}`);
  }
  iconStates = await tabs.evaluateAll((buttons) =>
    buttons.map((button) => ({
      selected: button.getAttribute("aria-selected"),
      iconOpacity: Number(window.getComputedStyle(button.querySelector(".status-icon")).opacity),
      iconImage: window.getComputedStyle(button.querySelector(".status-icon")).backgroundImage,
      maskImage:
        window.getComputedStyle(button.querySelector(".status-icon")).webkitMaskImage ||
        window.getComputedStyle(button.querySelector(".status-icon")).maskImage,
    })),
  );
  const selectedIndex = iconStates.findIndex((item) => item.selected === "true");
  if (selectedIndex > -1 && iconStates.some((item, index) => index !== selectedIndex && item.iconOpacity >= iconStates[selectedIndex].iconOpacity)) {
    errors.push(`Selected proof icon should be brightest after scroll: ${JSON.stringify(iconStates)}`);
  }
  const panelText = await page.locator("#proof-status-copy").textContent().catch(() => "");
  if (!/WiFi is unavailable|unreliable network/.test(panelText || "")) {
    errors.push(`Proof status panel text did not update on scroll: ${panelText}`);
  }
}

async function auditAppFlowCards(page, errors) {
  const cards = page.locator("#app-flow .flow-card");
  const count = await cards.count();
  if (!count) return;
  if (count !== 3) errors.push(`Expected 3 app flow cards, found ${count}`);
  const roleCount = await page.locator("#app-flow .flow-card[role='tab'], #app-flow .flow-grid[role='tablist']").count();
  if (roleCount !== 0) errors.push(`App flow should not expose tab/click roles, found ${roleCount}`);

  const initial = await cards.evaluateAll((items) =>
    items.map((card) => {
      const description = card.querySelector("p");
      const image = card.querySelector(".flow-phone-image");
      return {
        title: card.querySelector("h3")?.textContent.trim(),
        selected: card.getAttribute("aria-selected"),
        description: description?.textContent.trim(),
        descriptionFontSize: description ? parseFloat(window.getComputedStyle(description).fontSize) : 0,
        descriptionOpacity: description ? Number(window.getComputedStyle(description).opacity) : 0,
        imageOpacity: image ? Number(window.getComputedStyle(image).opacity) : 0,
      };
    }),
  );

  if (initial.filter((item) => item.selected === "true").length !== 1) {
    errors.push(`Expected one active app flow card on load: ${JSON.stringify(initial)}`);
  }
  if (initial.some((item) => !item.description || item.descriptionFontSize < 10)) {
    errors.push(`App flow subtitles are missing or hidden: ${JSON.stringify(initial)}`);
  }
  const activeInitial = initial.find((item) => item.selected === "true");
  if (!activeInitial || activeInitial.descriptionOpacity < 0.95 || activeInitial.imageOpacity < 0.95) {
    errors.push(`App flow active card should be fully visible: ${JSON.stringify(initial)}`);
  }
  if (initial.some((item) => item.selected === "false" && (item.descriptionOpacity > 0.75 || item.imageOpacity > 0.75))) {
    errors.push(`App flow inactive cards should be dimmed: ${JSON.stringify(initial)}`);
  }

  const lock = await scrollThroughParallaxSection(page, "#app-flow", 0.74);
  assertParallaxScroll(lock, "App flow", errors);
  let selected = await cards.evaluateAll((items) => items.map((card) => card.getAttribute("aria-selected")));
  if (!selected.some((value, index) => index > 0 && value === "true") || selected.filter((value) => value === "true").length !== 1) {
    errors.push(`App flow did not advance on scroll: ${JSON.stringify(selected)}`);
  }
}

async function auditLanguageModal(page, errors) {
  const trigger = page.locator("#languages .language-more").first();
  if (!(await trigger.count())) return;

  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.waitForTimeout(220);

  const opened = await page.locator("#languages .language-modal").first().evaluate((modal) => ({
    open: modal.classList.contains("is-open"),
    hidden: modal.getAttribute("aria-hidden"),
    count: modal.querySelectorAll(".language-modal-grid li").length,
    expanded: document.querySelector("#languages .language-more")?.getAttribute("aria-expanded"),
    bodyLocked: document.body.classList.contains("language-modal-open"),
  }));
  if (!opened.open || opened.hidden !== "false" || opened.expanded !== "true") {
    errors.push(`Language modal did not open correctly: ${JSON.stringify(opened)}`);
  }
  if (opened.count !== 88) errors.push(`Language modal should contain 88 rows, found ${opened.count}`);
  if (!opened.bodyLocked) errors.push("Language modal did not lock body scroll");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(180);
  const closedByEscape = await page.locator("#languages .language-modal").first().evaluate((modal) => ({
    open: modal.classList.contains("is-open"),
    hidden: modal.getAttribute("aria-hidden"),
    expanded: document.querySelector("#languages .language-more")?.getAttribute("aria-expanded"),
    bodyLocked: document.body.classList.contains("language-modal-open"),
  }));
  if (closedByEscape.open || closedByEscape.hidden !== "true" || closedByEscape.expanded !== "false" || closedByEscape.bodyLocked) {
    errors.push(`Language modal did not close on Escape: ${JSON.stringify(closedByEscape)}`);
  }

  await trigger.click();
  await page.locator("#languages .language-modal-close").first().click();
  await page.waitForTimeout(180);
  const closedByButton = await page.locator("#languages .language-modal").first().evaluate((modal) => !modal.classList.contains("is-open"));
  if (!closedByButton) errors.push("Language modal close button did not close the popup");
}

async function auditImages(page, errors) {
  await page.evaluate(async () => {
    const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (const image of Array.from(document.images)) {
      image.scrollIntoView({ block: "center", inline: "nearest" });
      await pause(60);
      if (image.decode) await image.decode().catch(() => {});
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  const brokenImages = await page.locator("img").evaluateAll((images) =>
    images
      .filter((image) => !image.complete || image.naturalWidth === 0)
      .map((image) => image.currentSrc || image.src || image.alt || "unknown image"),
  );
  if (brokenImages.length) {
    errors.push(`Broken images: ${brokenImages.join(", ")}`);
  }
}

async function auditAssetBackedGlyphs(page, errors) {
  const glyphs = await page.evaluate(() => {
    const bg = (element, pseudo) => (element ? window.getComputedStyle(element, pseudo).backgroundImage : "");
    const imageStyle = (element, pseudo) => {
      if (!element) return {};
      const styles = window.getComputedStyle(element, pseudo);
      return {
        backgroundImage: styles.backgroundImage,
        maskImage: styles.maskImage,
        webkitMaskImage: styles.webkitMaskImage,
      };
    };
    const content = (element, pseudo) => (element ? window.getComputedStyle(element, pseudo).content : "");
    const publicPage = !document.body.classList.contains("page-component-parity");
    const featureCards = publicPage ? Array.from(document.querySelectorAll("#features .feature-grid .card")) : [];
    const scenarioCards = publicPage ? Array.from(document.querySelectorAll("#scenarios .scenario-card[data-scenario]")) : [];
    const checkControls = Array.from(document.querySelectorAll("#checklist .check-control"));
    const proofIcons = Array.from(document.querySelectorAll(".proof-band .status-icon"));
    const whyIcons = Array.from(document.querySelectorAll(".why-matters .why-matters-icon"));
    const micDots = Array.from(document.querySelectorAll(".mic-dot"));

    return {
      featureIcons: featureCards.map((card) => imageStyle(card, "::before")),
      scenarioIcons: scenarioCards.map((card) => ({
        scenario: card.getAttribute("data-scenario"),
        before: bg(card, "::before"),
        after: bg(card, "::after"),
        beforeContent: content(card, "::before"),
        afterContent: content(card, "::after"),
      })),
      checklistIcons: checkControls.map((control) => ({
        backgroundImage: bg(control),
        afterContent: content(control, "::after"),
      })),
      proofIcons: proofIcons.map((icon) => imageStyle(icon)),
      whyIcons: whyIcons.map((icon) => imageStyle(icon)),
      faqPlus: {
        backgroundImage: bg(document.querySelector("#faq .faq-question"), "::after"),
        content: content(document.querySelector("#faq .faq-question"), "::after"),
      },
      lockIcon: {
        backgroundImage: bg(document.querySelector(".lock-icon")),
        beforeContent: content(document.querySelector(".lock-icon"), "::before"),
        afterContent: content(document.querySelector(".lock-icon"), "::after"),
      },
      micDots: micDots.map((dot) => ({
        useHref: dot.querySelector(".mic-button-svg use")?.getAttribute("href") || "",
        beforeContent: content(dot, "::before"),
        afterContent: content(dot, "::after"),
      })),
      comparisonChecks: Array.from(document.querySelectorAll("body:not(.page-component-parity) #comparison .compare-table .pakt-col-is-check")).map((cell) => bg(cell, "::after")),
      closeButtons: Array.from(document.querySelectorAll(".language-modal-close, .final-cta-close")).map((button) => ({
        backgroundImage: bg(button),
        beforeContent: content(button, "::before"),
        afterContent: content(button, "::after"),
      })),
    };
  });

  const expectedFeatures = [
    "pakt-feature-icon-offline.svg",
    "pakt-feature-icon-voice.svg",
    "pakt-feature-icon-private.svg",
    "pakt-feature-icon-travel.svg",
    "pakt-feature-icon-cloud.svg",
    "pakt-feature-icon-language.svg",
  ];
  glyphs.featureIcons.forEach((style, index) => {
    if (!styleUsesAsset(style, expectedFeatures[index])) {
      errors.push(`Feature card ${index + 1} should use ${expectedFeatures[index]}: ${JSON.stringify(style)}`);
    }
  });

  const scenarioIconByKey = {
    taxis: "pakt-scenario-icon-taxis.svg",
    hotels: "pakt-scenario-icon-hotels.svg",
    restaurants: "pakt-scenario-icon-restaurants.svg",
    stations: "pakt-scenario-icon-stations.svg",
    pharmacies: "pakt-scenario-icon-pharmacies.svg",
    markets: "pakt-scenario-icon-markets.svg",
  };
  glyphs.scenarioIcons.forEach((item) => {
    const expected = scenarioIconByKey[item.scenario];
    if (expected && !bgUsesAsset(`${item.before} ${item.after}`, expected)) {
      errors.push(`Scenario ${item.scenario} should use ${expected}: ${JSON.stringify(item)}`);
    }
  });

  glyphs.checklistIcons.forEach((item, index) => {
    if (!bgUsesAsset(item.backgroundImage, "pakt-icon-check") || item.afterContent !== "none") {
      errors.push(`Checklist icon ${index + 1} should be SVG-backed with no pseudo tick: ${JSON.stringify(item)}`);
    }
  });

  const expectedProofIcons = [
    "pakt-icon-proof-airplane.svg",
    "pakt-icon-proof-no-wifi.svg",
    "pakt-icon-proof-weak-signal.svg",
  ];
  glyphs.proofIcons.forEach((style, index) => {
    if (!styleUsesAsset(style, expectedProofIcons[index])) {
      errors.push(`Proof icon ${index + 1} should use ${expectedProofIcons[index]}: ${JSON.stringify(style)}`);
    }
  });

  const expectedWhyIcons = [
    "pakt-why-icon-connection.svg",
    "pakt-why-icon-lock.svg",
    "pakt-why-icon-shield.svg",
  ];
  glyphs.whyIcons.forEach((style, index) => {
    if (!styleUsesAsset(style, expectedWhyIcons[index])) {
      errors.push(`Why matters icon ${index + 1} should use ${expectedWhyIcons[index]}: ${JSON.stringify(style)}`);
    }
  });

  if (glyphs.faqPlus.content && glyphs.faqPlus.content !== "none" && !bgUsesAsset(glyphs.faqPlus.backgroundImage, "pakt-icon-faq")) {
    errors.push(`FAQ control should use SVG plus/minus: ${JSON.stringify(glyphs.faqPlus)}`);
  }
  if (glyphs.lockIcon.backgroundImage && !bgUsesAsset(glyphs.lockIcon.backgroundImage, "pakt-icon-privacy-lock.svg")) {
    errors.push(`Privacy lock should use SVG asset: ${JSON.stringify(glyphs.lockIcon)}`);
  }
  if (glyphs.lockIcon.beforeContent && glyphs.lockIcon.beforeContent !== "none") {
    errors.push(`Privacy lock should not be drawn with pseudo-elements: ${JSON.stringify(glyphs.lockIcon)}`);
  }
  glyphs.micDots.forEach((item, index) => {
    if (!item.useHref.includes("pakt-icon-mic-button.svg") || !item.useHref.includes("#pakt-mic-button") || item.beforeContent !== "none" || item.afterContent !== "none") {
      errors.push(`Conversation mic ${index + 1} should use SVG asset: ${JSON.stringify(item)}`);
    }
  });
  glyphs.comparisonChecks.forEach((backgroundImage, index) => {
    if (!bgUsesAsset(backgroundImage, "pakt-icon-check-orange.svg")) {
      errors.push(`Comparison Pakt check ${index + 1} should use orange SVG check: ${backgroundImage}`);
    }
  });
  glyphs.closeButtons.forEach((item, index) => {
    if (!bgUsesAsset(item.backgroundImage, "pakt-icon-close.svg") || item.beforeContent !== "none" || item.afterContent !== "none") {
      errors.push(`Close icon ${index + 1} should use SVG asset: ${JSON.stringify(item)}`);
    }
  });
}

async function auditPriorRegressions(page, errors) {
  if (await page.locator("body:not(.page-component-parity) .situation-slider").count()) {
    const situationSlider = page.locator(".situation-slider").first();
    await situationSlider.evaluate((slider) => window.scrollTo(0, slider.closest("#situation").offsetTop - window.innerHeight * 0.95));
    await page.waitForTimeout(180);
    const gallery = await situationSlider.evaluate((slider) => ({
      visibleCopyCount: [...slider.querySelectorAll(".situation-panel > *")].filter((node) => window.getComputedStyle(node).visibility !== "hidden").length,
      controls: slider.querySelectorAll(".situation-control").length,
      current: [...slider.querySelectorAll(".situation-panel")].filter((card) => card.getAttribute("aria-current") === "true").length,
    }));
    if (gallery.visibleCopyCount < 2) errors.push("Situation gallery should keep visible copy on both cards");
    if (gallery.controls !== 0) errors.push(`Situation progression should not expose previous/next controls, found ${gallery.controls}`);
    if (gallery.current !== 1) errors.push(`Situation gallery should mark one current card, found ${gallery.current}`);
    const before = await situationSlider.evaluate((slider) => slider.className);
    const lock = await scrollThroughParallaxSection(page, "#situation", 0.7);
    assertParallaxScroll(lock, "Situation block", errors);
    const after = await situationSlider.evaluate((slider) => slider.className);
    const activeCount = await situationSlider.locator(".situation-panel.is-active").count();
    if (after === before) errors.push("Situation progression did not change state on scroll");
    if (activeCount !== 1) errors.push(`Situation gallery should have one active card, found ${activeCount}`);
  }

  if (await page.locator("body:not(.page-component-parity) #features .feature-grid").count()) {
    await page.locator("#features").evaluate((section) => {
      const pin = section.querySelector(".scroll-pin");
      const top = pin ? parseFloat(window.getComputedStyle(pin).top) || 0 : 0;
      window.scrollTo(0, Math.max(0, section.offsetTop - top + 2));
    });
    await page.waitForTimeout(180);
    const initial = await page.locator("#features").evaluate((section) => {
      const cards = Array.from(section.querySelectorAll(".feature-grid .card"));
      const activeIndex = cards.findIndex((card) => card.getAttribute("aria-current") === "true");
      return {
        hasPin: Boolean(section.querySelector(".scroll-pin")),
        count: cards.length,
        activeCount: cards.filter((card) => card.getAttribute("aria-current") === "true").length,
        activeIndex,
      };
    });
    if (initial.count !== 6) errors.push(`Built For feature grid should expose 6 cards, found ${initial.count}`);
    if (!initial.hasPin) errors.push("Built For feature grid should use a sticky scroll-pin wrapper");
    if (initial.activeCount !== 1) errors.push(`Built For feature grid should have one active card, found ${initial.activeCount}`);

    const lock = await scrollThroughParallaxSection(page, "#features", 0.84);
    assertParallaxScroll(lock, "Built For feature grid", errors);
    const after = await page.locator("#features").evaluate((section) => {
      const cards = Array.from(section.querySelectorAll(".feature-grid .card"));
      const activeIndex = cards.findIndex((card) => card.getAttribute("aria-current") === "true");
      const activeCard = cards[activeIndex];
      const inactiveCard = cards.find((card, index) => index !== activeIndex);
      const activeTitle = activeCard?.querySelector("h3");
      const activeCopy = activeCard?.querySelector("p");
      return {
        activeIndex,
        activeCount: cards.filter((card) => card.getAttribute("aria-current") === "true").length,
        activeBorder: activeCard ? window.getComputedStyle(activeCard).borderColor : "",
        activeTitleColor: activeTitle ? window.getComputedStyle(activeTitle).color : "",
        activeCopyColor: activeCopy ? window.getComputedStyle(activeCopy).color : "",
        inactiveBorder: inactiveCard ? window.getComputedStyle(inactiveCard).borderColor : "",
      };
    });
    if (after.activeCount !== 1) errors.push(`Built For feature grid should keep one current card after scroll, found ${after.activeCount}`);
    if (after.activeIndex <= initial.activeIndex) errors.push(`Built For feature grid did not advance active card on scroll: ${initial.activeIndex}->${after.activeIndex}`);
    if (!/241,\s*120,\s*60/.test(`${after.activeBorder} ${after.activeTitleColor} ${after.activeCopyColor}`)) {
      errors.push(`Built For active card should use Pakt orange state: ${JSON.stringify(after)}`);
    }
    if (after.inactiveBorder === after.activeBorder) {
      errors.push(`Built For inactive card should not share active border color: ${JSON.stringify(after)}`);
    }
  }

  if (await page.locator(".app-flow-card").count()) {
    const dimmed = await page.locator(".app-flow-card").nth(1).evaluate((card) => {
      const title = card.querySelector("h3");
      const image = card.querySelector("img, .app-flow-phone");
      const titleOpacity = title ? Number(window.getComputedStyle(title).opacity) : 1;
      const imageOpacity = image ? Number(window.getComputedStyle(image).opacity) : 1;
      return titleOpacity < 0.95 || imageOpacity < 0.95;
    });
    if (dimmed) errors.push("App flow secondary cards are still visually dimmed");
  }

  if (await page.locator("body:not(.page-component-parity) #comparison .compare-table th:nth-child(2)").count()) {
    const wordmark = await page.locator("#comparison .compare-table th").nth(1).evaluate((header) => {
      const styles = window.getComputedStyle(header);
      const pseudo = window.getComputedStyle(header, "::after");
      return {
        fontSize: styles.fontSize,
        pseudoWidth: pseudo.width,
        maskImage: pseudo.webkitMaskImage || pseudo.maskImage,
      };
    });
    if (wordmark.fontSize !== "0px" || wordmark.maskImage === "none") {
      errors.push(`Comparison Pakt header should render as wordmark mask: ${JSON.stringify(wordmark)}`);
    }
  }

  if (await page.locator("#scenarios .scenario-grid").count()) {
    const scenario = await page.locator("#scenarios .scenario-grid").evaluate((grid) => ({
      isParity: document.body.classList.contains("page-component-parity"),
      display: window.getComputedStyle(grid).display,
      count: grid.querySelectorAll(".scenario-card").length,
      cardWidth: grid.querySelector(".scenario-card")?.getBoundingClientRect().width || 0,
      viewportWidth: window.innerWidth,
      transform: window.getComputedStyle(grid).transform,
      trackOverflow: grid.scrollWidth - grid.closest("#scenarios").clientWidth,
      sectionOverflow: window.getComputedStyle(grid.closest("#scenarios")).overflowX,
    }));
    if (scenario.count !== 6) errors.push(`Expected 6 scenario cards, found ${scenario.count}`);
    if (!scenario.isParity) {
      if (scenario.viewportWidth <= 760) {
        if (scenario.display !== "grid") errors.push(`Mobile scenario cards should render as a static grid, got ${scenario.display}`);
        if (scenario.transform !== "none") errors.push(`Mobile scenario grid should not be parallax-transformed, got ${scenario.transform}`);
        if (scenario.cardWidth < 150 || scenario.cardWidth > 190) {
          errors.push(`Mobile scenario cards should stay near Figma width, got ${scenario.cardWidth}px`);
        }
        return;
      }
      if (scenario.display !== "flex") errors.push(`Scenario cards should render as a carousel row, got ${scenario.display}`);
      if (!["hidden", "clip"].includes(scenario.sectionOverflow)) errors.push(`Scenario carousel section should clip overflow, got ${scenario.sectionOverflow}`);
      if (scenario.viewportWidth > 1100 && (scenario.cardWidth < 320 || scenario.cardWidth > 360)) {
        errors.push(`Desktop scenario cards should stay near Figma width, got ${scenario.cardWidth}px`);
      }
      const scenarioGrid = page.locator("#scenarios .scenario-grid");
      const lock = await scrollThroughParallaxSection(page, "#scenarios", 0.55);
      assertParallaxScroll(lock, "Scenario row", errors);
      const afterState = await scenarioGrid.evaluate((grid) => {
        const section = grid.closest("#scenarios");
        const sectionRect = section.getBoundingClientRect();
        const cards = Array.from(grid.querySelectorAll(".scenario-card"));
        const visibleCards = cards
          .map((card) => {
            const rect = card.getBoundingClientRect();
            const after = window.getComputedStyle(card, "::after");
            return {
              key: card.getAttribute("data-scenario"),
              left: rect.left,
              right: rect.right,
              clipped: rect.left < sectionRect.left - 1 || rect.right > sectionRect.right + 1,
              afterPosition: after.position,
              afterDisplay: after.display,
              afterImage: after.backgroundImage,
            };
          })
          .filter((item) => item.right > sectionRect.left + 1 && item.left < sectionRect.right - 1);
        return {
          transform: window.getComputedStyle(grid).transform,
          visibleCards,
        };
      });
      const afterTransform = afterState.transform;
      if (scenario.trackOverflow > 2 && (afterTransform === "none" || afterTransform === "matrix(1, 0, 0, 1, 0, 0)")) {
        errors.push("Scenario row did not move with scroll progress");
      }
      if (scenario.viewportWidth > 760 && afterState.visibleCards.some((card) => card.clipped)) {
        errors.push(`Desktop scenario row should show complete visible cards: ${JSON.stringify(afterState.visibleCards)}`);
      }
      if (scenario.viewportWidth > 760 && afterState.visibleCards.some((card) => card.afterPosition !== "absolute" || card.afterDisplay === "inline" || !card.afterImage.includes("pakt-scenario-icon"))) {
        errors.push(`Desktop scenario icons should be positioned SVG assets: ${JSON.stringify(afterState.visibleCards)}`);
      }
    }
  }

  if (await page.locator("body:not(.page-component-parity) #explore-more .related-grid").count()) {
    const explore = await page.locator("#explore-more .related-grid").evaluate((grid) => {
      const section = grid.closest("#explore-more");
      const rail = section?.querySelector(".related-rail");
      return {
        count: grid.querySelectorAll(".related-card").length,
        transform: window.getComputedStyle(grid).transform,
        trackOverflow: rail ? grid.scrollWidth - rail.clientWidth : 0,
        hasPin: Boolean(section?.querySelector(".scroll-pin")),
      };
    });
    if (explore.count < 5) errors.push(`Explore more should expose 5 cards, found ${explore.count}`);
    if (!explore.hasPin) errors.push("Explore more should use a sticky scroll-pin wrapper");
    if (explore.trackOverflow > 2) {
      const exploreGrid = page.locator("#explore-more .related-grid");
      const lock = await scrollThroughParallaxSection(page, "#explore-more", 0.55);
      assertParallaxScroll(lock, "Explore more", errors);
      const afterTransform = await exploreGrid.evaluate((grid) => window.getComputedStyle(grid).transform);
      if (afterTransform === explore.transform || afterTransform === "none" || afterTransform === "matrix(1, 0, 0, 1, 0, 0)") {
        errors.push(`Explore more row did not move with scroll progress: before=${explore.transform} after=${afterTransform}`);
      }
    }
  }
}

async function auditPage(browser, pageDef, viewport) {
  const page = await browser.newPage({ viewport });
  const url = `${BASE_URL}${pageDef.path}`;
  const errors = [];
  const warnings = [];
  const consoleErrors = [];
  const pageErrors = [];

  page.on("request", (request) => {
    if (/\/images\/(?:Lingofonex_App_Icon-167px|Lingofonex_Logo-Medium|og-card|pakt-travel-hero)\.(?:png|jpg|jpeg|webp|svg)/i.test(request.url())) {
      errors.push(`Pakt page requested legacy/non-Figma asset: ${request.url()}`);
    }
  });
  page.on("console", (message) => {
    if (message.type() === "error" && !ignoreConsole(message.text())) {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  if (!response || response.status() !== 200) {
    errors.push(`Expected HTTP 200, got ${response ? response.status() : "no response"}`);
  }
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });

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

  await auditImages(page, errors);
  await auditNav(page, viewport, errors);
  await auditFaq(page, errors);
  await auditStoreButtons(page, errors);
  await auditRelatedCards(page, errors);
  await auditChecklist(page, errors);
  await auditProofTabs(page, errors);
  await auditAppFlowCards(page, errors);
  await auditLanguageModal(page, errors);
  await auditAssetBackedGlyphs(page, errors);
  await auditPriorRegressions(page, errors);

  if (pageDef.publicPage) {
    for (const blockName of ["HeaderNav", "HeroProduct", "StoreCtaButtons", "FAQAccordion", "RelatedPagesGrid", "FinalCTA"]) {
      if ((await page.locator(`[data-block="${blockName}"]`).count()) < 1) {
        errors.push(`Missing component block: ${blockName}`);
      }
    }
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
  const staticErrors = [];
  auditRasterIconReferences(staticErrors);
  auditPaktAssetReferences(staticErrors);
  const results = [{
    slug: "static-css",
    path: "css/pakt-stage2.css",
    viewport: "static",
    url: path.join(ROOT, "css", "pakt-stage2.css"),
    title: "Static CSS checks",
    screenshot: "",
    errors: staticErrors,
    warnings: [],
  }];
  try {
    for (const pageDef of pages) {
      for (const viewport of viewports) {
        results.push(await auditPage(browser, pageDef, viewport));
      }
    }
  } finally {
    await browser.close();
  }

  const errorCount = results.reduce((sum, result) => sum + result.errors.length, 0);
  const warningCount = results.reduce((sum, result) => sum + result.warnings.length, 0);
  const report = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    passed: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    results,
  };

  fs.writeFileSync(path.join(REPORT_DIR, "pakt_public_interactivity_qa.json"), JSON.stringify(report, null, 2));

  const lines = [
    `# Pakt Public Interactivity QA - ${report.passed ? "PASS" : "FAIL"}`,
    "",
    `Base URL: ${BASE_URL}`,
    `Generated: ${report.generated_at}`,
    `Total errors: ${errorCount}`,
    `Total warnings: ${warningCount}`,
    "",
    "## Checks",
    "",
  ];

  for (const result of results) {
    lines.push(`- \`${result.path}\` ${result.viewport}: ${result.errors.length ? "FAIL" : "PASS"} - screenshot: \`${result.screenshot}\``);
    for (const error of result.errors) lines.push(`  - ERROR: ${error}`);
    for (const warning of result.warnings) lines.push(`  - WARNING: ${warning}`);
  }

  fs.writeFileSync(path.join(REPORT_DIR, "pakt_public_interactivity_qa.md"), `${lines.join("\n")}\n`);

  console.log(`Pakt Public Interactivity QA ${report.passed ? "PASS" : "FAIL"}`);
  console.log(`errors=${errorCount} warnings=${warningCount}`);
  console.log("report=SEO/reports/pakt_public_interactivity_qa.md");
  process.exit(report.passed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
