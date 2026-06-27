#!/usr/bin/env python3
"""Audit Pakt Stage 2 SEO pages."""

from __future__ import annotations

import html
import json
import re
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_pakt_stage2 import PAGES, ROOT, SITE, page_url  # noqa: E402


REPORT_DIR = ROOT / "SEO" / "reports"
JSON_REPORT = REPORT_DIR / "seo_stage2_pages_audit.json"
MD_REPORT = REPORT_DIR / "seo_stage2_pages_audit.md"

FORBIDDEN_STRINGS = [
    "50+ languages",
    "35+ voice",
    "Pakt by Pakt",
    "Without internet, the others stop",
    "All other translators need internet",
    "No servers, no logs, no accounts",
    "scan text",
    "camera mode",
    "OCR",
    "camera-based",
    "image translation",
]


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self._in_title = False
        self._script_type = ""
        self._script_text: list[str] = []
        self._skip_depth = 0
        self.meta: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.scripts_ld: list[str] = []
        self.h1_texts: list[str] = []
        self._h1_depth = 0
        self._h1_buffer: list[str] = []
        self.images: list[dict[str, str]] = []
        self.anchors: list[str] = []
        self.visible_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {key.lower(): value or "" for key, value in attrs}
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            self.meta.append(attr)
        elif tag == "link":
            self.links.append(attr)
        elif tag == "script":
            self._script_type = attr.get("type", "")
            self._script_text = []
            self._skip_depth += 1
        elif tag in {"style", "noscript"}:
            self._skip_depth += 1
        elif tag == "h1":
            self._h1_depth = 1
            self._h1_buffer = []
        elif self._h1_depth:
            self._h1_depth += 1
        elif tag == "img":
            self.images.append(attr)
        elif tag == "a":
            href = attr.get("href")
            if href:
                self.anchors.append(href)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        elif tag == "script":
            if self._script_type == "application/ld+json":
                self.scripts_ld.append("".join(self._script_text).strip())
            self._script_type = ""
            self._script_text = []
            self._skip_depth = max(0, self._skip_depth - 1)
        elif tag in {"style", "noscript"}:
            self._skip_depth = max(0, self._skip_depth - 1)
        elif self._h1_depth:
            self._h1_depth -= 1
            if self._h1_depth == 0:
                text = " ".join("".join(self._h1_buffer).split())
                self.h1_texts.append(text)
                self._h1_buffer = []

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
        if self._script_type:
            self._script_text.append(data)
            return
        if self._h1_depth:
            self._h1_buffer.append(data)
        if not self._skip_depth and data.strip():
            self.visible_text.append(data.strip())

    def meta_name(self, name: str) -> str | None:
        for item in self.meta:
            if item.get("name", "").lower() == name.lower():
                return item.get("content")
        return None

    def meta_property(self, prop: str) -> str | None:
        for item in self.meta:
            if item.get("property", "").lower() == prop.lower():
                return item.get("content")
        return None

    def canonical(self) -> str | None:
        for item in self.links:
            if item.get("rel", "").lower() == "canonical":
                return item.get("href")
        return None


def parse_page(path: Path) -> PageParser:
    parser = PageParser()
    parser.feed(path.read_text(encoding="utf-8"))
    return parser


def visible_word_count(parser: PageParser) -> int:
    text = html.unescape(" ".join(parser.visible_text))
    return len(re.findall(r"[A-Za-z0-9]+(?:'[A-Za-z0-9]+)?", text))


def resolve_local_target(href: str, current_file: Path) -> Path | None:
    if not href or href.startswith("#") or href.startswith(("mailto:", "tel:", "javascript:")):
        return None
    parsed = urlparse(href)
    if parsed.scheme in {"http", "https"}:
        if parsed.netloc != "www.lingofonex.com":
            return None
        href_path = parsed.path
    elif parsed.scheme:
        return None
    else:
        href_path = href.split("#", 1)[0].split("?", 1)[0]

    if not href_path:
        return None
    if href_path.startswith("/"):
        local = ROOT / href_path.lstrip("/")
    else:
        local = (current_file.parent / href_path).resolve()

    if href_path.endswith("/"):
        return local / "index.html"
    if local.suffix:
        return local
    return local / "index.html"


def json_ld_types(payload: dict) -> list[str]:
    graph = payload.get("@graph")
    nodes = graph if isinstance(graph, list) else [payload]
    types: list[str] = []
    for node in nodes:
        node_type = node.get("@type") if isinstance(node, dict) else None
        if isinstance(node_type, list):
            types.extend(str(item) for item in node_type)
        elif node_type:
            types.append(str(node_type))
    return types


def audit_page(page: dict) -> dict:
    slug = page["slug"]
    path = ROOT / "pakt" / slug / "index.html"
    expected_url = page_url(slug)
    result = {
        "slug": slug,
        "path": str(path.relative_to(ROOT)),
        "url": expected_url,
        "errors": [],
        "warnings": [],
        "word_count": 0,
    }

    if not path.exists():
        result["errors"].append("Missing HTML file")
        return result

    text = path.read_text(encoding="utf-8")
    parser = parse_page(path)
    result["word_count"] = visible_word_count(parser)

    if html.unescape(parser.title.strip()) != page["title"]:
        result["errors"].append(f"Title mismatch: {parser.title.strip()!r}")
    if parser.meta_name("description") != page["meta"]:
        result["errors"].append("Meta description mismatch")
    robots = parser.meta_name("robots")
    if robots != "index,follow":
        result["errors"].append(f"Robots must be index,follow, got {robots!r}")
    canonical = parser.canonical()
    if canonical != expected_url:
        result["errors"].append(f"Canonical mismatch: {canonical!r}")
    if len(parser.h1_texts) != 1:
        result["errors"].append(f"Expected exactly one H1, found {len(parser.h1_texts)}")
    elif parser.h1_texts[0] != page["h1"]:
        result["errors"].append(f"H1 mismatch: {parser.h1_texts[0]!r}")

    for prop in ["og:title", "og:description", "og:image", "og:url"]:
        if not parser.meta_property(prop):
            result["errors"].append(f"Missing {prop}")
    for name in ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]:
        if not parser.meta_name(name):
            result["errors"].append(f"Missing {name}")

    if result["word_count"] < page["min_words"]:
        result["errors"].append(f"Visible word count {result['word_count']} below minimum {page['min_words']}")

    for forbidden in FORBIDDEN_STRINGS:
        if re.search(re.escape(forbidden), text, flags=re.IGNORECASE):
            result["errors"].append(f"Forbidden string present: {forbidden}")

    if len(re.findall(r'class="faq-item"', text)) < 5:
        result["errors"].append("FAQ section has fewer than 5 FAQ items")

    parsed_ld = []
    for raw in parser.scripts_ld:
        try:
            parsed_ld.append(json.loads(raw))
        except json.JSONDecodeError as exc:
            result["errors"].append(f"Invalid JSON-LD: {exc}")
    all_types: list[str] = []
    for payload in parsed_ld:
        all_types.extend(json_ld_types(payload))
    for required_type in ["BreadcrumbList", "MobileApplication", "WebPage"]:
        if required_type not in all_types:
            result["errors"].append(f"JSON-LD missing {required_type}")
    if page.get("faqs") and "FAQPage" not in all_types:
        result["errors"].append("JSON-LD missing FAQPage")

    for img in parser.images:
        if "alt" not in img:
            result["errors"].append(f"Image missing alt: {img.get('src', '<unknown>')}")
        target = resolve_local_target(img.get("src", ""), path)
        if target and not target.exists():
            result["errors"].append(f"Image target missing: {img.get('src')}")

    for href in parser.anchors:
        target = resolve_local_target(href, path)
        if target and not target.exists():
            result["errors"].append(f"Broken internal link: {href} -> {target.relative_to(ROOT)}")

    return result


def audit_support_files() -> dict:
    result = {"errors": [], "warnings": []}
    sitemap_text = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    locs = re.findall(r"<loc>(.*?)</loc>", sitemap_text)
    result["sitemap_url_count"] = len(locs)
    if len(locs) != 166:
        result["errors"].append(f"Sitemap should contain 166 URLs after Stage 2A, found {len(locs)}")
    llms_text = (ROOT / "llms.txt").read_text(encoding="utf-8")
    hub_text = (ROOT / "pakt" / "index.html").read_text(encoding="utf-8")
    for page in PAGES:
        url = page_url(page["slug"])
        if url not in locs:
            result["errors"].append(f"Sitemap missing {url}")
        if url not in llms_text:
            result["errors"].append(f"llms.txt missing {url}")
        if f'/pakt/{page["slug"]}/' not in hub_text:
            result["errors"].append(f"Hub missing visible link for /pakt/{page['slug']}/")
    for forbidden in FORBIDDEN_STRINGS:
        if re.search(re.escape(forbidden), llms_text + "\n" + hub_text, flags=re.IGNORECASE):
            result["errors"].append(f"Forbidden string present in hub or llms.txt: {forbidden}")
    return result


def build_reports(results: dict) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    JSON_REPORT.write_text(json.dumps(results, indent=2), encoding="utf-8")

    status = "PASS" if results["passed"] else "FAIL"
    lines = [
        f"# Pakt Stage 2A SEO Audit - {status}",
        "",
        f"Generated: {results['generated_at']}",
        f"Pages audited: {len(results['pages'])}",
        f"Sitemap URL count: {results['support']['sitemap_url_count']}",
        f"Total errors: {results['error_count']}",
        f"Total warnings: {results['warning_count']}",
        "",
        "## Page Results",
        "",
    ]
    for page in results["pages"]:
        page_status = "PASS" if not page["errors"] else "FAIL"
        lines.append(f"- `{page['url']}` - {page_status} - {page['word_count']} visible words")
        for error in page["errors"]:
            lines.append(f"  - ERROR: {error}")
        for warning in page["warnings"]:
            lines.append(f"  - WARNING: {warning}")
    lines.extend(["", "## Support Files", ""])
    for error in results["support"]["errors"]:
        lines.append(f"- ERROR: {error}")
    for warning in results["support"]["warnings"]:
        lines.append(f"- WARNING: {warning}")
    if not results["support"]["errors"] and not results["support"]["warnings"]:
        lines.append("- PASS: sitemap.xml, llms.txt, and /pakt/ hub links validated.")
    lines.extend(["", "## Claim Check", ""])
    if results["passed"]:
        lines.append("- PASS: no forbidden Stage 2 claim strings were found in the audited Pakt pages, hub links, or llms.txt.")
    else:
        lines.append("- FAIL: see errors above.")
    MD_REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    pages = [audit_page(page) for page in PAGES]
    support = audit_support_files()
    error_count = sum(len(page["errors"]) for page in pages) + len(support["errors"])
    warning_count = sum(len(page["warnings"]) for page in pages) + len(support["warnings"])
    results = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "passed": error_count == 0,
        "error_count": error_count,
        "warning_count": warning_count,
        "pages": pages,
        "support": support,
    }
    build_reports(results)
    print(f"Stage 2A SEO audit {'PASS' if results['passed'] else 'FAIL'}")
    print(f"errors={error_count} warnings={warning_count}")
    print(f"report={MD_REPORT.relative_to(ROOT)}")
    return 0 if results["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
