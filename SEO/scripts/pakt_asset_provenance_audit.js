#!/usr/bin/env node

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const REPORT_DIR = path.join(ROOT, "SEO", "reports");
const IMAGE_DIR = path.join(ROOT, "images");
const HANDOFF_ASSET_DIR = path.join(ROOT, "design", "pakt-figma-handoff", "assets");

const STAGE2_FILES = [
  "css/pakt-stage2.css",
  "pakt/index.html",
  ...fs
    .readdirSync(path.join(ROOT, "pakt"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `pakt/${entry.name}/index.html`)
    .filter((file) => fs.existsSync(path.join(ROOT, file))),
];

const LIVE_FIGMA_MCP_ASSETS = {};

const EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS = {
  "pakt-favicon.svg": {
    status: "user-provided-original",
    source: "User-provided original SVG file: Frame 2147239122.svg",
  },
  "pakt-explore-bg-offline.jpg": {
    status: "user-provided-jpg-background",
    source: "User-provided Explore more JPG background: /Users/dmit-mini/Downloads/peter-thomas-NLAm9Jg9RDs-unsplash.jpg",
    sourceSha256: "88e309d29895c0eedbe8747e58a1c82d336552c70715e9c1ffd586804032761a",
    assetSha256: "f9c51f7df4396eda1042f09399e6bc8e632c1ec3ffec3cdb567f4c824102b54d",
  },
  "pakt-explore-bg-voice.jpg": {
    status: "user-provided-jpg-background",
    source: "User-provided Explore more JPG background: /Users/dmit-mini/Downloads/IMG_5608 1.jpg",
    sourceSha256: "ff2f3f6d0a351967d5b604993e6c764fbe95b953ee272243c7d554cd810aeb9b",
    assetSha256: "f356f570804b2f57ae2be25db7199203b067c8bc22e7dad60ab478b3eb58bd1c",
  },
  "pakt-explore-bg-travel.jpg": {
    status: "user-provided-jpg-background",
    source: "User-provided Explore more JPG background: /Users/dmit-mini/Downloads/michal-janek-17KfAMkxQyw-unsplash.jpg",
    sourceSha256: "d478911be3f1d6f3dce6f61385f7cd02d281a3b4fbbf5f3f2865a22b55388b3a",
    assetSha256: "6e8947b4adbea7968f529ba220031b806e1f25061b9f84363a8893d567b3add3",
  },
  "pakt-explore-bg-japan.jpg": {
    status: "user-provided-jpg-background",
    source: "User-provided Explore more JPG background: /Users/dmit-mini/Downloads/peter-thomas-RS-gDRmaPfU-unsplash.jpg",
    sourceSha256: "35bfb4a115a4d1fb383195f6ca05a3933840f2e4436d4251092211d0af7c06e5",
    assetSha256: "c5b680d9eba7dc35c4e4328ae3b31d28f6aa850144f0f1f73a381b8dbb844987",
  },
  "pakt-explore-bg-airplane.jpg": {
    status: "user-provided-jpg-background",
    source: "User-provided Explore more JPG background: /Users/dmit-mini/Downloads/keya-vadgama-dupe 1.jpg",
    sourceSha256: "df84277f3cc60f2003321ffe90bc9562bc5449fe5b665512e6650d8a7fef6596",
    assetSha256: "cfdc8dae326bbfe537f16c798db652d573ae460ed7ec60d8c44a12781ec10b24",
  },
};

const USER_PROVIDED_FIGMA_EXPORTS = {
  "pakt-store-app-store-button.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/Store download button.svg",
    sourceSha256: "c969693dd42649b4b74c110d38ffa509a073a6806d2aa79819b091415df2d916",
  },
  "pakt-icon-close.svg": {
    source:
      "Extracted close glyph from user-provided full-page Figma SVG export: /Users/dmit-mini/Downloads/iPhone 17 - 72.svg",
    sourceSha256: "35fdde3b8f3f3c7d2bad8d6964f10708e58439233f0c96fcbb9ee52e53033ccb",
    assetSha256: "706c13dd319ae35cc4e26a8cdf039f438f59d8440bcd5460901314f6284cad56",
  },
  "pakt-icon-faq-plus.svg": {
    source:
      "Extracted FAQ plus glyph from user-provided full-page Figma SVG export: /Users/dmit-mini/Downloads/MacBook Pro 14_ - 11.svg",
    sourceSha256: "b5762db3fdc08b2717988ee80d182ad0e04944aaf31544041ff4bc88e58aefb8",
    assetSha256: "d75d20f95ec622b58293c5d93a523e4a2886902e555076c09e3e8e2ae255433f",
  },
  "pakt-icon-faq-minus.svg": {
    source:
      "Extracted FAQ minus glyph from user-provided full-page Figma SVG export: /Users/dmit-mini/Downloads/MacBook Pro 14_ - 11.svg",
    sourceSha256: "b5762db3fdc08b2717988ee80d182ad0e04944aaf31544041ff4bc88e58aefb8",
    assetSha256: "bdf8a95b7fc185642cb36c4d4a099c0a1b202c32ffd308db70a1d2d10c1ee602",
  },
  "pakt-feature-icon-offline.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=android_wifi_4_bar_off_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "2802f94b494e9f1ef7e7c135aeaa3b6985edc28c7aa0b8d0a2c413d32db1c2d6",
  },
  "pakt-feature-icon-voice.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=mic_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "5dbda235b992c5610edc86a9ac2e64de2b1dbada708d5cdf691874ca8dc05045",
  },
  "pakt-feature-icon-private.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=lock_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "f97fece263ae5339c700ce9e42777781c289287bbef597ea52ac19570e17433e",
  },
  "pakt-feature-icon-travel.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=luggage_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "8be75c6551c563e9758fe6a025f8b142f6eaed4d68d107649db779f0ec84ce4f",
  },
  "pakt-feature-icon-cloud.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=cloud_off_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "470812711f5ea4a8857a2930bab13de9f2771a16d31369af104d6843b0878fcb",
  },
  "pakt-feature-icon-language.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=emoji_language_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "5b6de8fa8cc47f7fd42df8378903509a48fba593a0a5c8f70ee759c1637707f9",
  },
  "pakt-scenario-icon-taxis.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=local_taxi_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "f17ca412a09590cbfcb3e95bee57177121536219f4f82fdf6b98739adde4d292",
  },
  "pakt-scenario-icon-hotels.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=hotel_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "b3cbb0d3b5821359bec2a21a792bac99fe2201024962897db8dc4127d344ebe7",
  },
  "pakt-scenario-icon-restaurants.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=restaurant_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "a996cb8b54417ee882950257faa46683197cb483166c13dbcf378d6d416721c2",
  },
  "pakt-scenario-icon-stations.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=train_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "c440d2f0490c7598e57e58247237609a50c3820318d90476dff978695068f1fc",
  },
  "pakt-scenario-icon-pharmacies.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=health_cross_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "317f18d7f5392a382edbcfc6868f2c555cf4c5848a7fed20726e4d08fc014f8b",
  },
  "pakt-scenario-icon-markets.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=local_mall_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "f2744068dd3ac342df4dd250cc7de81f7aee71422eb5b6b356220424321a9211",
  },
  "pakt-scenario-icon-airports.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=flight_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "cd39d212db1247f68ad10d88735185bac55c11206b86e859567da33cf65c7136",
  },
  "pakt-explore-icon-phone.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=mobile_3_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "dda5c1826c8e0d42c6c56f86abece065dc219b6b1800f6c645ba295d286740dd",
  },
  "pakt-explore-icon-voice.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=graphic_eq_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "095f8db9b59b39dcbfe6d663f2ab5d0080ed16540d01bf57fcb1efbb28bd35b7",
  },
  "pakt-explore-icon-suitcase.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=card_travel_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "603c5950dd821bfea3bf83bc19c159434dcb5adb48c8b37a3ab728ea09dabe28",
  },
  "pakt-explore-icon-flag.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=japanese_flag_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "648f71e6676b06b5f8463e58f43109ac201c9f6723879452e35cc7b1002be519",
  },
  "pakt-explore-icon-airplane.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=flight_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "cd39d212db1247f68ad10d88735185bac55c11206b86e859567da33cf65c7136",
  },
  "pakt-icon-proof-airplane.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=flight_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "cd39d212db1247f68ad10d88735185bac55c11206b86e859567da33cf65c7136",
  },
  "pakt-icon-proof-no-wifi.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=android_wifi_4_bar_off_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "2802f94b494e9f1ef7e7c135aeaa3b6985edc28c7aa0b8d0a2c413d32db1c2d6",
  },
  "pakt-icon-proof-weak-signal.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/signal_cellular_nodata_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "593097c1b5f224ec58d4543f8f88a37ecf9d1099027ef2a7d5c8112b3504827c",
  },
  "pakt-icon-privacy-lock.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=lock_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "f97fece263ae5339c700ce9e42777781c289287bbef597ea52ac19570e17433e",
  },
  "pakt-icon-mic-button.svg": {
    source: "User-provided Figma SVG export transformed into a reusable currentColor symbol: /Users/dmit-mini/Downloads/Property 1=mic_button.svg",
    sourceSha256: "9d0ef20b0591ba01057fb0fbf708e9bf4ad0859349be06141ce3c28cccebf1d0",
    assetSha256: "34a6d5ba1b23a80813e02df5ae6d3f625c763800f9146a3e15c5a9d4f12885c5",
  },
  "pakt-why-icon-connection.svg": {
    source: "User-provided Figma SVG export for Why offline translation matters: /Users/dmit-mini/Downloads/signal_cellular_nodata_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "593097c1b5f224ec58d4543f8f88a37ecf9d1099027ef2a7d5c8112b3504827c",
  },
  "pakt-why-icon-lock.svg": {
    source: "User-provided Figma SVG export for Why offline translation matters: /Users/dmit-mini/Downloads/lock_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "f97fece263ae5339c700ce9e42777781c289287bbef597ea52ac19570e17433e",
  },
  "pakt-why-icon-shield.svg": {
    source: "User-provided Figma SVG export for Why offline translation matters: /Users/dmit-mini/Downloads/verified_user_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "32264097beb9aa2bbf052faa879001319e8bce4aa4c6bfe54afb02ea9d646641",
  },
  "pakt-icon-check-empty.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=check_circle_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 1.svg",
    sourceSha256: "94534189c27ea7a4667212b081a4cf2d9b729f3e1e1992680a9c8b617d528e21",
  },
  "pakt-icon-check-orange.svg": {
    source: "User-provided Figma SVG export: /Users/dmit-mini/Downloads/website icons svg/Property 1=check_circle_24dp_E3E3E3_FILL0_wght200_GRAD0_opsz24 2.svg",
    sourceSha256: "abdad8476e12e7222a2f65d5b11115becd79cfb18ba68446b9ef478af9d6b690",
  },
};

const USER_PROVIDED_FIGMA_RASTER_EXPORTS = {
  "pakt-explore-card-open-bg.jpg": {
    source:
      "Extracted embedded JPEG from user-provided Explore more open-card Figma SVG export: /Users/dmit-mini/Downloads/explore_more_card.svg",
    sourceSha256: "93bc97de1f244ba4976feb2b54c7fb6d475df33415f19ba2acbc91b56148c600",
    assetSha256: "b96f0b6a53dd43e4496dfb52b4ff82f28f23c68547bd07c8fe5d64c3472fe3cf",
  },
};

const LEGACY_ASSET_PATTERNS = [
  /Lingofonex_App_Icon-167px\.png/,
  /Lingofonex_Logo-Medium\.png/,
  /og-card\.png/,
  /pakt-travel-hero\.png/,
];

const BANNED_ICON_PATTERNS = [
  /pakt-feature-icon-[^)"]+\.png/g,
  /pakt-scenario-icon-[^)"]+\.png/g,
  /pakt-scenario-mobile-icon-[^)"]+\.png/g,
  /pakt-check-control-[^)"]+\.png/g,
];

const FORBIDDEN_LOCAL_ASSET_PATTERNS = [
  /^pakt-travel-hero\.png$/,
  /^pakt-feature-icon-.+\.png$/,
  /^pakt-scenario-icon-.+\.png$/,
  /^pakt-scenario-mobile-icon-.+\.png$/,
  /^pakt-check-control-.+\.png$/,
];

const REQUIRED_SVG_REFS = [
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

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), "utf8");
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function collectReferences() {
  const refs = new Map();
  const patterns = [
    /\/images\/([^"')\\\s]+?\.(?:png|svg|jpe?g|webp))/gi,
    /(?:\.\.\/)+images\/([^"')\\\s]+?\.(?:png|svg|jpe?g|webp))/gi,
    /https:\/\/www\.lingofonex\.com\/images\/([^"')\\\s]+?\.(?:png|svg|jpe?g|webp))/gi,
  ];

  for (const file of STAGE2_FILES) {
    const source = read(file);
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(source))) {
        const asset = match[1];
        if (!refs.has(asset)) refs.set(asset, new Set());
        refs.get(asset).add(file);
      }
    }
  }
  return refs;
}

function statusFor(asset) {
  if (LIVE_FIGMA_MCP_ASSETS[asset]) return "live-figma-mcp-export";
  if (USER_PROVIDED_FIGMA_EXPORTS[asset]) return "user-provided-figma-svg-export";
  if (USER_PROVIDED_FIGMA_RASTER_EXPORTS[asset]) return "user-provided-figma-raster-export";
  if (EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset]) return EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset].status;
  if (asset.includes("parity") || asset.startsWith("pakt-parity-mobile-")) return "figma-section-parity-export";
  if (asset.startsWith("pakt-store-")) return "figma-store-badge-export";
  if (asset.startsWith("pakt-flow-phone-")) return "figma-app-flow-crop";
  if (asset.includes("destination-japan")) return "figma-destination-module-image";
  if (asset.includes("offline-proof-phone")) return "figma-offline-proof-crop";
  if (asset.endsWith(".svg")) return "unverified-local-svg";
  return "figma-handoff-raster";
}

function svgLooksLiveExported(assetPath) {
  const source = fs.readFileSync(assetPath, "utf8");
  return source.includes('preserveAspectRatio="none"') && source.includes('overflow="visible"');
}

function main() {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const errors = [];
  const warnings = [];
  const refs = collectReferences();
  const css = read("css/pakt-stage2.css");
  const stageText = STAGE2_FILES.map((file) => read(file)).join("\n");

  for (const file of STAGE2_FILES) {
    const source = read(file);
    for (const pattern of LEGACY_ASSET_PATTERNS) {
      if (pattern.test(source)) errors.push(`${file} still references legacy/non-Figma asset ${pattern}`);
    }
  }

  for (const directory of [IMAGE_DIR, HANDOFF_ASSET_DIR]) {
    if (!fs.existsSync(directory)) continue;
    for (const asset of fs.readdirSync(directory)) {
      if (FORBIDDEN_LOCAL_ASSET_PATTERNS.some((pattern) => pattern.test(asset))) {
        errors.push(`${path.relative(ROOT, path.join(directory, asset))} is a forbidden leftover raster/legacy Pakt asset`);
      }
    }
  }

  for (const pattern of BANNED_ICON_PATTERNS) {
    const matches = [...css.matchAll(pattern)].map((match) => match[0]);
    if (matches.length) errors.push(`Raster icon crop reference remains in CSS: ${matches.join(", ")}`);
  }

  for (const required of REQUIRED_SVG_REFS) {
    if (!stageText.includes(required)) errors.push(`Required SVG reference missing from generated Pakt files: ${required}`);
  }

  const rows = [];
  for (const [asset, usedBy] of [...refs.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const imagePath = path.join(IMAGE_DIR, asset);
    const handoffPath = path.join(HANDOFF_ASSET_DIR, asset);
    const row = {
      asset,
      status: statusFor(asset),
      usedBy: [...usedBy].sort(),
      imageExists: fs.existsSync(imagePath),
      handoffExists: fs.existsSync(handoffPath),
      sha256: null,
      handoffMatchesImage: false,
      figmaAssetUrl: LIVE_FIGMA_MCP_ASSETS[asset]?.figmaAssetUrl || null,
      figmaNodeId: LIVE_FIGMA_MCP_ASSETS[asset]?.nodeId || null,
      explicitApproval: EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset]?.source || null,
      explicitApprovalSha256: EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset]?.sourceSha256 || null,
      explicitApprovalAssetSha256: EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset]?.assetSha256 || null,
      userProvidedFigmaExport: USER_PROVIDED_FIGMA_EXPORTS[asset]?.source || null,
      userProvidedFigmaExportSha256: USER_PROVIDED_FIGMA_EXPORTS[asset]?.sourceSha256 || null,
      userProvidedFigmaAssetSha256: USER_PROVIDED_FIGMA_EXPORTS[asset]?.assetSha256 || null,
      userProvidedFigmaRasterExport: USER_PROVIDED_FIGMA_RASTER_EXPORTS[asset]?.source || null,
      userProvidedFigmaRasterExportSha256: USER_PROVIDED_FIGMA_RASTER_EXPORTS[asset]?.sourceSha256 || null,
      userProvidedFigmaRasterAssetSha256: USER_PROVIDED_FIGMA_RASTER_EXPORTS[asset]?.assetSha256 || null,
    };

    if (!asset.startsWith("pakt-")) {
      errors.push(`${asset} is referenced by Pakt stage-2 files but is not Pakt/Figma-prefixed`);
    }
    if (!row.imageExists) errors.push(`${asset} is referenced but missing from images/`);
    if (!row.handoffExists) errors.push(`${asset} is referenced but missing from design/pakt-figma-handoff/assets/`);
    if (row.imageExists && row.handoffExists) {
      row.sha256 = sha256(imagePath);
      row.handoffMatchesImage = row.sha256 === sha256(handoffPath);
      if (!row.handoffMatchesImage) errors.push(`${asset} differs between images/ and design handoff assets/`);
      const expectedUserProvidedHash =
        USER_PROVIDED_FIGMA_EXPORTS[asset]?.assetSha256 ||
        USER_PROVIDED_FIGMA_EXPORTS[asset]?.sourceSha256 ||
        USER_PROVIDED_FIGMA_RASTER_EXPORTS[asset]?.assetSha256 ||
        USER_PROVIDED_FIGMA_RASTER_EXPORTS[asset]?.sourceSha256 ||
        EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset]?.assetSha256 ||
        EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset]?.sourceSha256;
      if (expectedUserProvidedHash && row.sha256 !== expectedUserProvidedHash) {
        errors.push(`${asset} no longer matches its recorded user-provided Figma SVG export checksum`);
      }
    }
    if (
      asset.endsWith(".svg") &&
      row.imageExists &&
      !LIVE_FIGMA_MCP_ASSETS[asset] &&
      !USER_PROVIDED_FIGMA_EXPORTS[asset] &&
      !EXPLICITLY_APPROVED_NON_FIGMA_ORIGINALS[asset] &&
      !svgLooksLiveExported(imagePath)
    ) {
      errors.push(
        `${asset} is an unverified local SVG substitution. Do not ship as original Figma artwork without a live Figma export or explicit user approval.`,
      );
    }
    rows.push(row);
  }

  const liveExportCount = rows.filter((row) => row.status === "live-figma-mcp-export").length;
  const md = [
    "# Pakt Asset Provenance Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Referenced Pakt assets: ${rows.length}`,
    `- Live Figma MCP SVG exports fetched in this pass: ${liveExportCount}`,
    `- User-provided Figma SVG exports: ${rows.filter((row) => row.status === "user-provided-figma-svg-export").length}`,
    `- User-provided Figma raster exports: ${rows.filter((row) => row.status === "user-provided-figma-raster-export").length}`,
    `- Assets mirrored in handoff package: ${rows.filter((row) => row.handoffExists && row.handoffMatchesImage).length}`,
    `- Errors: ${errors.length}`,
    `- Warnings: ${warnings.length}`,
    "",
    "## Live Figma MCP Exports",
    "",
    ...rows
      .filter((row) => row.status === "live-figma-mcp-export")
      .map((row) => `- \`${row.asset}\` from node \`${row.figmaNodeId}\` (${row.sha256})`),
    "",
    "## User-Provided Figma SVG Exports",
    "",
    ...rows
      .filter((row) => row.status === "user-provided-figma-svg-export")
      .map((row) => `- \`${row.asset}\` from \`${row.userProvidedFigmaExport}\` (${row.sha256})`),
    "",
    "## User-Provided Figma Raster Exports",
    "",
    ...rows
      .filter((row) => row.status === "user-provided-figma-raster-export")
      .map((row) => `- \`${row.asset}\` from \`${row.userProvidedFigmaRasterExport}\` (${row.sha256})`),
    "",
    "## Referenced Assets",
    "",
    "| Asset | Provenance status | SHA-256 | Used by |",
    "| --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| \`${row.asset}\` | ${row.status} | \`${row.sha256 || "missing"}\` | ${row.usedBy
          .map((file) => `\`${file}\``)
          .join("<br>")} |`,
    ),
    "",
    "## Warnings",
    "",
    ...(warnings.length ? warnings.map((warning) => `- ${warning}`) : ["- None"]),
    "",
    "## Errors",
    "",
    ...(errors.length ? errors.map((error) => `- ${error}`) : ["- None"]),
    "",
  ].join("\n");

  fs.writeFileSync(path.join(REPORT_DIR, "pakt_asset_provenance_audit.md"), md);
  fs.writeFileSync(
    path.join(REPORT_DIR, "pakt_asset_provenance_audit.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), errors, warnings, assets: rows }, null, 2) + "\n",
  );

  console.log(`Pakt asset provenance audit: ${errors.length} errors, ${warnings.length} warnings, ${rows.length} assets`);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }
}

main();
