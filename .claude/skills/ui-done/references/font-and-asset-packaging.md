# Font and Asset Packaging

Treat typography and visual assets as runtime engineering, not mood-board decoration.

## Mandatory open-source typography gate

Complete this gate before coding every new page or substantial visual redesign. The goal is not merely to avoid a bad default: typography must become an intentional part of the page's identity.

1. Inventory the real text: primary languages, headings, body copy, UI labels, numbers, currencies, charts, code, paths, punctuation, mathematical marks, and special symbols.
2. Inspect the current page/system fonts. Explicitly reuse a suitable family only when its exact font files are open-source, its license is known, and it still fits the new direction. Do not count inheritance as a decision.
3. Compare a small set of current, widely adopted open-source candidates from official projects or reputable open-font catalogs. Open each serious candidate's official specimen or interactive sample and test representative page text, not only the font's marketing word.
4. Choose at least one primary family or a deliberate pairing. Record the page mood, inspected candidates, selected roles, exact upstream and license, scripts/glyphs, weights, file formats/size, and local packaging path.
5. Reject the selection if the final page still resolves to a browser or operating-system default in normal operation. Generic families such as `sans-serif`, `serif`, or `monospace`, and platform faces such as Microsoft YaHei, PingFang, Segoe UI, San Francisco, or another machine-local font, are final failure fallbacks only.

“Popular” is supporting evidence, not a beauty contest. Prefer a family that has a current official distribution or maintained upstream, visible adoption in a reputable open-font catalog or ecosystem, usable specimens, and enough weights/scripts for the role. Stars and download counts may break a tie; they never override license, glyph coverage, readability, page fit, or delivery cost.

“Free” is not enough. Every intentionally selected body, display, data, code, punctuation, math, or symbol font must have an exact open-source font license that permits the intended use and redistribution. Reject personal-use-only files, unclear mirrors, extracted commercial fonts, CDN-only dependencies, and any family whose actual distributed files cannot be traced to the verified license.

For small non-visual repairs, do not add a new family merely to prove this rule ran. Audit the current typography and preserve a suitable verified open-source owner. If the page is using an unclear, proprietary, or system-default primary font and the requested work materially changes the visible page, replacement is part of the redesign. If replacement would violate an established brand contract, stop and surface that conflict rather than silently changing the brand or weakening the open-source rule.

### Reliable discovery starting points

Use these as starting points, not mandatory presets. Recheck the exact family at adoption time.

- [Noto](https://github.com/notofonts/noto-docs/blob/main/docs/website/use.md): broad language and symbol coverage; the project states that Noto families use the SIL Open Font License.
- [Adobe Source Han Sans](https://github.com/adobe-fonts/source-han-sans) and the related Source Han families: open-source Pan-CJK options with official design/download guidance and Web-ready distributions.
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/): an official code specimen and SIL OFL 1.1 source for technical roles; pair or replace it when Chinese/code coverage or the page's tone requires another open-source monospace family.
- A reputable open-font catalog such as Google Fonts may help discover current candidates, but verify the exact family license and download at the upstream project before packaging it.

Do not turn these examples into the same typography on every page. Editorial, industrial, luxury, playful, cultural, technical, and dense-data work should produce visibly different candidates and pairings.

## Assign font roles

Define only roles the product needs:

| Role | Typical content | Selection checks |
|---|---|---|
| Body/interface | Chinese or primary-language copy, labels, controls, long reading | Complete glyph coverage, readable UI metrics, needed 400/500/600 or variable range |
| Display/brand | English/Latin headlines, wordmarks, large editorial moments | Brand fit, restrained use, fallback metrics, required scripts |
| Numeric/data | Metrics, prices, timers, tables, charts | Tabular figures, stable widths, punctuation/currency/locale coverage |
| Code/technical | Code, paths, IDs, hashes, technical bilingual text | Monospace behavior, CJK width/coverage if needed, Regular/Bold distinction |
| Fallback | Unsupported scripts and loading failure | Available across target platforms, compatible metrics, explicit stack order |

One family may serve several roles when it does them well. Do not add a font merely to fill every row.

For ordinary interface icons, use the selected SVG/icon component family. Do not use random Unicode characters, emoji, or icon-font glyphs as a shortcut. Code punctuation and technical symbols belong to the verified open-source code font; specialist math or symbol content needs an explicitly verified open-source coverage font when the primary family lacks those glyphs.

## Verify before adopting

- Read the exact font license. Require an open-source font license such as SIL OFL or another license that clearly permits the intended use and redistribution; record modification/conversion conditions separately.
- Verify Chinese/multilingual glyph coverage, punctuation, symbols, currency, numerals, and project-specific names/terms.
- Package only weights/styles actually used. Choose a variable font when its support, size, and interpolation needs are beneficial. Subset chunks intended to compose the same face must have matching family/style/weight descriptors, with `unicode-range` dividing their glyph coverage. Those descriptors must match the files' actual static weights or variable axes; do not declare a static font as a variable range.
- Prefer WOFF2 for modern Web delivery. Preserve upstream source/version, conversion method, and original license.
- Do not subset CJK or user-generated content to a guessed “common character” list. Subset only from a controlled corpus with an explicit missing-glyph strategy.
- Never select Microsoft YaHei, PingFang, Segoe UI, San Francisco, a developer-installed font, or another machine-local face as the designed primary font.

## Load without layout surprises

- Use `font-display: swap` or `optional` according to the product's tolerance for late swaps.
- Preload only fonts required above the fold; excessive preload competes with critical content.
- Set stable fallback stacks and test layout before and after fonts resolve. Consider metric overrides when shifts are material.
- Use semantic font tokens/components rather than component-by-component family declarations. Synchronize Ant Design typography tokens and any chart/Canvas/3D text with those roles.
- Verify which fonts actually render representative page text and required weights, using the browser's rendered-font inspection or equivalent glyph-level evidence. A computed `font-family`, a loaded font resource, or `document.fonts.check(...) === true` alone cannot identify the face used for those glyphs. Correlate the actual face with local resource requests and screenshots. If actual face inspection is unavailable, report that limit instead of treating the other signals as proof.
- Check the needed weights, tabular numerals, long text/IDs, and missing glyphs. Font choice alone does not establish typography: inspect real line breaks, line-height, control labels, and chart axes at the affected sizes. Keep related Chinese words and punctuation readable; do not use oversized display type with compressed leading at the expense of task text, and do not hide bad wrapping through clipping.

## Package for portability and offline use

- Package clearly redistributable open-source fonts for essential body/interface, display, data, and code roles in new pages and substantial redesigns. A system stack remains the final failure fallback, not the primary plan.
- If a full CJK face creates an unacceptable size cost, quantify that cost and present the tradeoff before changing the delivery promise. Do not silently replace packaged coverage with Microsoft YaHei, PingFang, or another platform-dependent primary face.
- Self-host runtime fonts and essential assets for offline/portable work. Do not call Google Fonts or another font CDN at runtime.
- Make asset paths compatible with the actual delivery mechanism. Root-absolute `/assets/...` paths usually fail when a built page is opened directly with `file://`; verify the emitted artifact.
- Distinguish source checkout, built folder, and direct-open entry. Check in the built artifact only when the project's distribution policy calls for it.
- If a single-file deliverable is required, inline only what is safe and practical; keep large replaceable data/assets external when the contract allows, and document the relationship.
- Do not register a service worker solely to disguise an artifact that is not genuinely offline; caching is not the same as packaged availability.

## Record provenance

For distributed fonts/assets, retain a machine-readable manifest when practical with:

- Family/asset name and project role.
- Upstream owner, official source URL, version/release/commit, and retrieval date.
- Original filename and distributed filename.
- Format conversion or subsetting method.
- SHA-256 of the distributed bytes.
- License identifier, license file path, attribution/copyright, and modification notice.
- Included weights/styles/scripts and known coverage limits.

Keep human-readable third-party notices for direct runtime dependencies and distributed fonts/assets. Include complete required license texts in the final package, not only the source tree. Re-generate or validate notices against the lockfile before release.

## Images, icons, illustrations, and brand assets

- Prefer supplied brand assets and official brand kits; preserve proportions, clear space, color restrictions, and license.
- Use one icon family for product UI. Do not invent brand logos or mix visual grammars to fill gaps.
- Generate original imagery only when it serves the brief and the image-generation Skill is available. Record that it is generated when provenance matters.
- For third-party imagery, verify usage/redistribution rights and retain attribution where required.
- Use responsive dimensions/formats, reserve aspect ratio to prevent layout shift, lazy-load below-fold media, and provide meaningful alt text or an empty alt for decorative media.
- Package essential raster/SVG/video/model/environment-map assets locally for offline work and provide a lightweight fallback for optional heavy media.

## Build-time validation

Validate the final artifact for:

- Missing files and wrong relative paths.
- Remote runtime `src`, `href`, CSS `url()`, dynamic imports, and fetches.
- Font hashes, manifest entries, license texts, and actual CSS references.
- Stale or unused fonts/assets left in the distributed package.
- Production dependency inventory aligned with the lockfile.
- Secrets or private data accidentally embedded in client output.

Use `scripts/frontend_preflight.py` for a first pass, then confirm with the browser's network/resource view. Static scanning cannot prove what the browser actually loaded.
