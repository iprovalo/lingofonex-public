#!/usr/bin/env node

process.env.SHOWCASE_PATH = process.env.SHOWCASE_PATH || "/pakt/component-parity/";
process.env.REPORT_BASENAME = process.env.REPORT_BASENAME || "pakt_component_parity_qa";
process.env.REPORT_TITLE = process.env.REPORT_TITLE || "Pakt Component Parity QA";
process.env.SCREENSHOT_SUBDIR = process.env.SCREENSHOT_SUBDIR || "component-parity-qa";

require("./pakt_component_showcase_qa.js");
