# Selection Scorecard

Use this to choose one primary React-compatible tool for each frontend capability category before changing dependencies, design systems, fonts, icons, motion/scroll/3D/charting, theme, routing, data/state/form ownership, performance, or build tooling. React itself is fixed by this Skill and is not compared against Vue or another UI framework.

## Hard gates

Reject or pause a candidate when any applicable gate fails:

- It has no credible shipped role that supports the user's product, visual direction, interaction, or delivery; an unused import does not count as adoption.
- Its visible role becomes understandable only after inventing a scene name, explanatory label, or generic pause/reset/rotate/view controls that the product itself does not need.
- For an adopted 3D candidate, the subject is not inherently spatial, real 3D adds no unique communication value, or the team cannot finish coherent geometry, joints, proportions, materials, lighting, subject-specific motion, responsive performance, and a static/DOM fallback without accidental intersections, z-fighting, clipping, or animation collisions.
- Its relevant official demos have not been inspected and no recorded `hard demo-review exemption` from `source-library.md` applies.
- It duplicates the existing design system, icon family, animation owner, router, form layer, or chart stack without a migration plan.
- Its license is unclear, incompatible with intended redistribution, closed/paid without approval, or missing required attribution terms.
- For GSAP, the current Webflow/GreenSock Standard “No Charge” License does not cover the product or the product is or may be a no-code visual web-animation builder that competes with Webflow and written permission has not resolved the restriction. Do not mistake the MIT license of the optional official `greensock/gsap-skills` guidance repository for the runtime license.
- Copied source code lacks an official upstream page or repository, identifiable author/project, exact license text, or a planned notice location.
- Offline/portable delivery requires a remote runtime service, CDN, account, or system-installed font that the user did not authorize.
- A new or materially redesigned page has no deliberately selected open-source primary typeface, the exact font license/files cannot be traced to an official source, relevant specimens were not inspected, or normal rendering depends on a browser/operating-system default.
- Keyboard, screen reader, touch, reduced-motion, or essential static fallback cannot be made usable.
- Maintenance/security evidence is inadequate for the role it would occupy.
- It adds hidden install scripts, native binaries, telemetry, or operational burden disproportionate to its benefit.

## Required capability plan

For every new page or substantial redesign, start the eight rows in `../SKILL.md` while forming the whole-interface direction, refine them through [layered selection](layered-design-selection.md), and settle them before full implementation. This is an inclusion plan, not a menu to minimize: React/primary UI, typography/icons/assets, GSAP motion, Lenis scrolling, separate 2D Canvas, one visualization owner, performance, and the conditional 3D evaluation. For each default row record one compatible owner, its existing host and shipped job, what the user can observe or what infrastructure measurably improves, and the applicable fallback on the declared devices. Reuse verified current owners. Typography includes inspected specimens, role/language/symbol coverage, exact license/source, and local packaging; it is not satisfied by inheriting a system stack. The 3D row records all four suitability results before naming an owner/job.

Coverage must reinforce the composition, not determine a row of library demonstration sections. For an experience-level motion upgrade, retain unaffected owners and apply the GSAP row, research and outcome requirements to the affected sequence even without a static-layout redesign; do not expand to every unrelated category or shrink the assignment to a press effect. A behavioral role can be prominent; an accent may be bounded but must remain meaningful and perceptible. “Smallest honest footprint” preserves the intended result and visual ambition, not the smallest proof of installation. A blank row, unused import, token fade, or unexplained decorative pixel is not success. Apply the integration method in `page-composition.md` within this same plan.

Use the integrated key-page sample to make these roles judgeable early, while structure, visual language and feasibility can still improve each other. A decisive chart/interaction must not wait until after an unrelated static layout is frozen. One sample can test several roles; no separate showcase or approval is required per library. Retain a prototype's actual scope: a technique probe does not establish aesthetic quality, and a styled static draft does not establish runtime adoption. Full implementation must still close the required roles below.

The primary React UI system cannot have a no-adoption row. GSAP may be omitted only through the exact gate in `motion-scroll-and-3d.md`. For Lenis, first apply that guide's [path gate](motion-scroll-and-3d.md#lenis-path-gate): `Lenis not adopted: no real scroll path` is valid only with the inspected surfaces/states and declared-target conditions. If a real path exists, native-only behavior requires the hard-failure route. Separate 2D Canvas and other default rows also require an observed delivery, license, accessibility, security, performance, compatibility, or runtime failure remaining despite a meaningful smaller role, compatible owner, and coherent fallback; record the attempted job, alternatives, evidence, and retained result. Convenience, taste, fewer dependencies, and schedule do not qualify. Visualization has the narrower rule: investigate real quantities, time, relationships, hierarchy, geography, processes, and flows; only `hard visualization exemption: no real visualizable object and fabrication prohibited`, with the inspected surfaces, permits absence. A failed chart integration with authentic data is unresolved work, not that exemption. For 3D, `3D not adopted: suitability gate failed: <specific reason>` is a correct conditional result and ends WebGL scouting/loading for that surface.

## Carry selection into observed use

Keep the following evidence in the same inclusion plan as it becomes available, not in a second ledger or a report per layer:

| Decision | Evidence to retain once |
|---|---|
| Proposed | Owner, concrete host/job, exact relevant source/demo and the result expected on real content |
| Previewed | The page-context artifact and state/sequence showing that contribution; identify static intent, playable previsualization or real library rendering accurately |
| Selected | What the user confirmed, or what the Agent chose under explicit delegated discretion; preserve the concrete preview rather than just a style label |
| Implemented | The component/module and actual user entry that own the selected role, not merely a dependency/import |
| Observed | The real state/action where the contribution was seen or a relevant infrastructure benefit was measured; compare with the selected preview |

These are evidence distinctions, not a required database, JSON format or extra approval rounds. Use short prose/links in an existing task note. Mark unavailable stages or unresolved gaps honestly; user acceptance is separate from observing implementation. One integrated sample/action may cover several capabilities. An infrastructure improvement need not acquire a decorative UI; conditional 3D rejection retains its gate result instead of fake preview evidence.

Before closing implementation, inspect the declared roles at the actual entry. An unused package, invisible accent, default chart unrelated to the question, generic fade substituted for the selected sequence, or silently missing font leaves that role incomplete. Repair the role or surface a genuine existing hard constraint; do not retroactively turn an omission into an approved design choice. A static design-only task ends at its requested stage, without claiming runtime adoption.

## Decision table

Before consequential installation, explain the selected owner, shipped role, meaningful tradeoffs, and project impact compactly. Reuse the inclusion plan and research evidence; this is not a second report or an extra approval gate for work already authorized. Keep the complete adoption/exemption boundary above; a high technical score cannot justify an otherwise prohibited omission.

Theme modes, routing/URL state, request/server state, client state, and forms are conditional React application concerns. Inspect all five, but include a selection row only when the product exposes that concern or ownership is changing. Record “not applicable” in the audit instead of inventing a theme toggle, route, API, global store, or form.

Before scoring a visible owner, name the existing page region or interaction that will host it, the product meaning it adds, the reason for any direct user control, and the smallest honest footprint: structural, behavioral, accent, or infrastructure. A proposal that needs a new showcase section, invented copy, fake data, compensatory label, or extra controls solely to reveal the library has failed product fit even if its technical score is high.

Keep a compact demo note for every serious candidate: exact official demo URL or example name, what was actually observed, intended host and tone adaptation, idea-only versus code/package use, and adopted or rejected status. Link an existing note instead of copying it into the selection summary. If no relevant official demo was viewed, cite the exact hard exemption. An unclear license may pause copying or adoption, but it is not an exemption from safely viewing the official demo.

The table below is a comparison aid, not a required output format. Evaluate the applicable fields, but show only decision-changing information; combine columns or use prose when that is clearer. Keep unresolved license, accessibility, delivery, and other hard gates explicit even in a short summary. Use a full comparison when several viable options or the user's request warrant it.

| 需求 | 候选 | 是否采用 | 视觉收益 | 性能代价 | 无障碍 | 维护状态 | 许可证 | 离线能力 | 结论 |
|---|---|---|---|---|---|---|---|---|---|
| State the real gap | Existing/native or named candidate | Yes / No / Conditional | None / Low / Medium / High, with one reason | Bundle/runtime/GPU/network impact | Keyboard, screen reader, touch, reduced motion, fallback | Evidence and date | SPDX/name plus obligations | Local runtime, `file://`, required steps | One-sentence tradeoff |

Keep cells short. Put source links next to maintenance/license/API claims when research occurred.

## Scoring aid

Use 0–3 only to expose tradeoffs; do not let arithmetic override a hard gate.

| Criterion | Weight | 0 | 3 |
|---|---:|---|---|
| Solves the real need | 3 | Cosmetic or speculative | Directly satisfies a documented requirement |
| Stack fit / non-duplication | 2 | Conflicts or duplicates | Reuses architecture cleanly |
| Visual/UX benefit | 2 | No user-visible gain | Material, demonstrable improvement |
| Accessibility/fallback | 3 | Essential path unusable | Complete keyboard/screen reader/reduced-motion/static path |
| Performance | 2 | Unbounded cost | Budgeted, lazy when appropriate, low-end safe |
| Maintenance/security | 2 | Stale/unclear | Active, documented, suitable security posture |
| License/redistribution | 3 | Unknown/incompatible | Clear and compatible, obligations planned |
| Offline/portability | 3 | Runtime network/account required | Fully local or clearly compatible with delivery |
| Operational simplicity | 2 | Adds user setup and fragile tooling | No extra end-user work, clean developer workflow |

Record the total only when comparing several close candidates. A high score cannot cure an incompatible license or broken delivery contract.

## Selection rules by category

- Framework: React is required. For greenfield substantial work, use a sound React runtime and one required React UI component system. Keep a sound existing React runtime; for non-React inputs define a clean migration boundary and do not create a mixed-framework result.
- Design system: default to Ant Design when no approved React system exists. Keep another established system only when it already owns the product or Ant Design fails a documented hard gate. Never layer two primary component systems.
- Source priority: after naming the real need, check `source-library.md` before unlisted packages or native-only work. Prefer a compatible curated source that passes the gates; otherwise record `curated-catalog gap` and the fallback.
- Theme modes: use Ant Design tokens/`ConfigProvider` as the default component-theme owner, synchronized with semantic CSS and platform color-scheme behavior. Add a manual switch only when the product requires it.
- Routing/URL state: keep the current React router when it fits. Use one router for real navigation and shareable URL state; do not add routing to a true single-surface artifact.
- Requests/server state: keep server data out of generic client stores. Use native requests for simple isolated flows, a query/cache owner for shared server state, or RTK Query when Redux Toolkit already owns the application.
- Client state: start with local React state/reducer/context. Add one global owner only for genuinely shared client state; do not duplicate URL, server, or form state.
- Forms: use Ant Design Form and Ant Design controls by default while preserving native semantics. Add React Hook Form or TanStack Form only when validation, composition, dynamic fields, or rendering scale justifies a separate owner.
- Icons: when Ant Design owns the UI, start with `@ant-design/icons` for ordinary interface symbols. Use one family and consistent stroke/fill rules; use official brand assets for brands and separately verify domain-specific assets.
- Animation: use GSAP plus `@gsap/react` as the default primary owner for presence, layout, coordinated state, timelines, and signature transitions on existing product surfaces. Inspect the official React guidance and a relevant Demo Hub or Showcase example before implementation, including an experience-level motion upgrade with unchanged static layout. Keep CSS for isolated micro-states that do not compete with GSAP. Adopt Anime.js or another owner only through the exact GSAP hard-rejection gate, including all conditions of its established-owner exception. Do not expose library controls unless the user has a real manipulation task or an accessibility mechanism requires them.
- Scrolling: use Lenis through `lenis/react` as the default and only dedicated smooth-scroll mechanics owner and GSAP ScrollTrigger as the choreography owner. Do not add ScrollSmoother beside Lenis. Keep Lenis on the declared device targets when their checks pass; desktop is the default, tablet/phone only when requested or contractually supported. A native-only result on a real path requires an observed hard constraint, not convenience; absence of a real path uses the separate recorded path gate. Preserve forms, tables, Ant Design overlays, nested panels, anchors, keyboard paths, applicable touch behavior, desktop resizing, reduced-motion mode, and cleanup across navigation/remount.
- 3D: always evaluate, never force. Adopt only when all four conditions pass: a natural existing host, an inherently spatial subject, communication value unavailable from DOM/photo/video/SVG/2D Canvas, and a finishable modeling/performance/fallback budget. If any fails, record `3D not adopted: suitability gate failed: <specific reason>` and do not mount, request, initialize, or probe WebGL. If all pass, use Three.js through React Three Fiber as the preferred route; add `@react-three/drei` only for used helpers, inspect relevant official demos, provide a static fallback, and verify the full animation cycle has no accidental interpenetration, self-intersection, z-fighting, clipping, or collisions. Reject a finished subject that reads as unrelated stock primitives pushed together; require coherent silhouette, joins, proportion/detail hierarchy, material/light response, and subject-specific motion.
- 2D Canvas: select a separate owner and shipped role; prefer Pts for creative/programmed drawing or Fabric.js for editable objects. A Three.js/R3F scene cannot satisfy this row. Shrink the Canvas footprint or change its host before claiming it cannot fit.
- Visualization: inspect real quantitative, relational, temporal, hierarchical, geographic, and flow content before scoring omission. Prefer AntV G2/Ant Design Charts for quantitative grammar or G6 for genuine relationship graphs; select ECharts when its fit is stronger. Compare encodings of the same relevant data in the selected page, not engine names or unrelated pretty examples. Use one primary owner for the need, not several for generic variety. A no-adoption result must state the inspected surfaces and prove that no authentic visualizable object exists and creating one would fabricate data or meaning.
- Performance: select the framework-native path plus focused tooling that can prove a user-visible or delivery gain; do not add overlapping optimizers for the same bottleneck.
- Fonts: every new or materially redesigned page must select or explicitly reuse at least one current, widely adopted open-source primary family after inspecting official specimens with representative page text. Score subject/tone fit, language and symbol coverage, required weights, file size, layout metrics, maintenance/adoption evidence, exact license, self-hosting, and provenance—not beauty or popularity alone. Generic and operating-system fonts are failure fallbacks, not candidates. Record the choice compactly; do not force a full ten-column installation table when an already verified local open-source family cleanly fits.

## After selection

1. State the selected owner and shipped job for every default capability category. For an omission, state its permitted absence condition and inspected surfaces, or the attempted smaller role, alternatives, evidence, and hard-gate reason. State the 3D suitability result separately; a failed gate does not require a forced smaller role or hard exemption.
2. Attach the GSAP record for each new page, material redesign or experience-level motion upgrade: official React guidance, exact relevant Demo Hub/Showcase example, observed capability, shipped job, selected plugins, planned adaptation, reduced-motion/fallback path, and current Standard License result; otherwise attach the exact hard-rejection evidence. Also attach the official-demo record for every other selected or seriously considered source. A 3D gate failure recorded before any serious candidate exists does not require a demo record.
3. Confirm package or copied-component name, official source, author/project, exact license, and compatible current usage from official evidence. Keep the GSAP runtime license separate from the MIT license of the optional official GSAP Agent Skills repository.
4. Install with the existing package manager and update the lockfile.
5. Re-run build, license/offline checks, browser QA, and bundle/performance checks proportional to impact.
6. Remove superseded dependencies/assets only after proving they are unused and preserving user work.
