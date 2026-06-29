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

const LIVE_FIGMA_MCP_ASSETS = {
  "pakt-feature-icon-offline.svg": {
    nodeId: "420:8743",
    figmaAssetUrl: "https://www.figma.com/api/mcp/asset/1ae689de-7086-42ad-9271-59ee99ae05c4",
  },
  "pakt-feature-icon-voice.svg": {
    nodeId: "420:8743",
    figmaAssetUrl: "https://www.figma.com/api/mcp/asset/1e5eec2e-3c1f-48f4-94af-d0bc781fbc64",
  },
  "pakt-feature-icon-private.svg": {
    nodeId: "420:8743",
    figmaAssetUrl: "https://www.figma.com/api/mcp/asset/625ccedc-5a82-47b6-91fe-504a617683aa",
  },
  "pakt-feature-icon-travel.svg": {
    nodeId: "420:8743",
    figmaAssetUrl: "https://www.figma.com/api/mcp/asset/d34e5b94-42f6-4eee-b301-0f86c89336af",
  },
  "pakt-feature-icon-cloud.svg": {
    nodeId: "420:8743",
    figmaAssetUrl: "https://www.figma.com/api/mcp/asset/12031f1b-0d64-4f18-910f-8f5969715ffd",
  },
  "pakt-feature-icon-language.svg": {
    nodeId: "420:8743",
    figmaAssetUrl: "https://www.figma.com/api/mcp/asset/e27b6a7b-3bad-4acb-bf1f-b27f33385c32",
  },
  "pakt-icon-mic-cream.svg": {
    nodeId: "328:10303",
    figmaAssetUrl: "https://www.figma.com/api/mcp/asset/39a5d274-0884-49b1-9695-3c1ac4eb2ecb",
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
  "/images/pakt-icon-mic-cream.svg",
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
  if (asset.includes("parity") || asset.startsWith("pakt-parity-mobile-")) return "figma-section-parity-export";
  if (asset.startsWith("pakt-store-")) return "figma-store-badge-export";
  if (asset.startsWith("pakt-flow-phone-")) return "figma-app-flow-crop";
  if (asset.includes("destination-japan")) return "figma-destination-module-image";
  if (asset.includes("offline-proof-phone")) return "figma-offline-proof-crop";
  if (asset.endsWith(".svg")) return "figma-handoff-svg";
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
    if (!css.includes(required)) errors.push(`Required SVG reference missing from CSS: ${required}`);
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
    }
    if (
      asset.endsWith(".svg") &&
      row.imageExists &&
      !LIVE_FIGMA_MCP_ASSETS[asset] &&
      !svgLooksLiveExported(imagePath)
    ) {
      warnings.push(`${asset} is SVG-backed and mirrored into the handoff, but not freshly live-exported in this pass`);
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
