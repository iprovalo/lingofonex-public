# Repository Agent Notes

## Design Asset Provenance

When a user asks for an asset to be original, from Figma, exact to Figma, designer-provided, or not fake, treat that as a hard provenance requirement.

- Use only assets directly exported from the named design source, assets already present in the approved design handoff with clear provenance, or files explicitly supplied by the user.
- Do not redraw, trace, approximate, use icon-library stand-ins, CSS-draw replacements, screenshot crops, or hand-authored SVG substitutes unless the user explicitly approves that fallback after being told the original export is unavailable.
- If Figma export, connector access, download, or authentication is blocked, stop and report the blocker plainly. Do not continue by silently substituting a best-effort asset.
- Do not describe an asset as "Figma", "original", "exported", "designer-provided", or "provenance-verified" unless the source is documented with enough evidence to audit it, such as a Figma node id, Figma asset URL, user-provided file path, checksum, or handoff manifest entry.
- QA must not mark asset provenance as passing when required original assets are unverified. Missing live export proof must be an error unless there is explicit user-approved fallback documentation.

For Pakt work specifically, run `node SEO/scripts/pakt_asset_provenance_audit.js` after asset changes and treat any unverified icon substitution as blocking.
