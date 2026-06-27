#!/usr/bin/env node

process.env.PAGE_PATH = process.env.PAGE_PATH || "/pakt/component-parity/";
process.env.REPORT_BASENAME = process.env.REPORT_BASENAME || "pakt_component_parity_audit";
process.env.REPORT_TITLE = process.env.REPORT_TITLE || "Pakt Component Parity Visual Audit";
process.env.SCREENSHOT_SUBDIR = process.env.SCREENSHOT_SUBDIR || "component-parity";

require("./pakt_visual_parity_audit.js");
