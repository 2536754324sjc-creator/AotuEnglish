# Technology Scouting

Research connects the task to the best available React ecosystem. Begin with the user's curated source library; the goal is fit and leverage, not the smallest or largest dependency count.

## Scan proactively, then keep the search focused

For every substantial new interface or redesign, scan every enhancement field even when the user did not name a library. React is fixed by this Skill, and one primary React UI component system is mandatory. Research selects React-compatible owners rather than comparing UI frameworks. Check `source-library.md` first and prefer a compatible curated source that passes the hard gates. After the real product role and content are known, complete the separate GSAP pass by inspecting the official React guidance and a relevant Demo Hub or Showcase example, then complete the five-source creative pass in `open-source-ui-sources.md`: MotionSites direction/Prompt, React Bits Preview/Code, Uiverse element/Code, Anime.js behavior/API, and Aceternity Preview/Code. Develop the whole-interface direction, including the opening, ordinary action state, and principal transition, while finding credible roles for the Skill's eight rows. Refine those roles through layered comparisons and settle one owner/job for each default category before full implementation; do not turn the rows into page sections. Give true 3D/WebGL a separate evaluation row: apply its suitability gate before proposing an owner, job, or demo candidate. Inspect theme, routing, request/server state, client state, and forms only when those conditional product concerns exist or ownership is changing—do not invent them for coverage. The agent should know what the curated catalog and React ecosystem can already do before choosing custom code.

The capability scan starts inclusion-first while developing the whole-design direction: actively find useful product-aligned roles, then tune their prominence and apply the hard gates. Feed research into [parallel exploration and the integrated key-page sample](layered-design-selection.md), not only a private selection note after a skeleton is fixed. Show relevant inspected source examples and their page-context adaptations at the decision they inform. Within the authorized scope, probe a decisive data, sizing, motion or integration question early with a bounded sample; technical feasibility must be able to improve the direction before full implementation. This is not permission to expand business functions or a claim of final adoption. A page made around library slots is not the objective. A restrained workspace and an expressive campaign need not use the same intensity. For 3D, test suitability first; if any gate fails, record the reason and stop rather than forcing a decorative role. Neither path is a pretext to keep the dependency list small.

Coverage does not authorize new product content. Before researching a visible owner, name the existing region, state, interaction, real dataset, or visual motif it will serve; state the product meaning it adds and whether direct user control has a real task or accessibility rationale; then choose the smallest footprint that preserves that contribution. If a candidate needs a showcase card, invented copy, fake data, compensatory scene label, or extra controls to justify its presence, reject that placement and find a meaningful integration, not merely a less visible one. `page-composition.md` explains the benefit/cost distinction and the compact-chart counterexample; `open-source-ui-sources.md` explains how reference research changes a whole workflow rather than only its components.

After naming that real role and before final selection, open each serious candidate's official demo or example gallery. Inspect the live rendered result and every official demo reasonably relevant to the role; skip unrelated gallery entries rather than browsing the entire ecosystem. Demo review is required research, not optional inspiration. GSAP is a standing serious candidate for every new page, material redesign and experience-level motion upgrade, so its relevant official demo pass is mandatory unless the recorded network/access exemption prevents viewing. A 3D suitability-gate failure may occur before any serious candidate exists; in that case no 3D demo review is required and no WebGL route is selected. Follow `source-library.md` for the compact record, adaptation rules, and narrow hard exemptions.

Skip fresh browsing only when all of these are true:

- The request is a small copy, spacing, token, or isolated component change.
- The existing stack already solves the problem cleanly.
- No “latest,” “best,” maintenance, security, compatibility, or licensing claim is needed.
- Distribution and accessibility requirements do not introduce a new gap.

Research is mandatory before adding a new dependency, making a current ecosystem recommendation, or relying on facts likely to change. Use `web-access` when available, otherwise available official-source web/browser tools; an unavailable companion is not a reason to install it or pretend research ran. A scan can be brief when one well-supported option already matches the stack and delivery mode.

Search by the unresolved design or behavior first—such as “press feedback with a stable target” or “retain comparison while opening details”—then inspect the implementation/API. A style keyword or library name alone tends to return unrelated galleries. For a specified local button repair, study the relevant [control-feedback method](motion-scroll-and-3d.md#buttons-and-control-feedback) and missing official evidence; do not regenerate the whole design system. For an experience-level motion upgrade, first use the [sequence-design route](motion-scroll-and-3d.md#experience-level-motion-upgrades), including GSAP guidance and a reference relevant to the main relationship. An unchanged layout or a small code diff does not justify researching only button feedback. Unaffected categories do not need a fresh five-source pass. For performance work, identify the actual critical path (for example independent requests that serialize, or an unnecessary initial bundle) before adding caching, memoization or tooling. Database suggestions, gallery popularity and best-practice labels do not establish suitability for this task.

## Audit local reality before searching

Record:

- React runtime, build system, language, package manager, lockfile, and supported browser targets. If the input is not React, record the clean migration boundary instead of treating its framework as a candidate.
- Existing design system, component primitives, icons, animation/scroll/3D/chart libraries, fonts, utilities, and duplicate capabilities.
- Bundle/performance constraints, CSP, internal scroll regions, and accessibility expectations.
- Hosted, server-built, portable-folder, single-file, or `file://` delivery.
- Existing license/notices process and whether runtime assets may contact the network.

Turn the gap into a question, for example: “Need keyboard-safe accessible dialogs in the existing React app without adding a second visual theme,” not “Which UI library is coolest?”

## Candidate domains, not a shopping list

| Need | Candidate field to consider | First question |
|---|---|---|
| App/runtime | Existing sound React runtime; React with Vite for a new client application; the approved React runtime required by the delivery | Is this a clean React foundation rather than a mixed-framework bridge? |
| Whole-page direction | MotionSites as direction/Prompt evidence after the product is understood | Which visible architecture challenges the first familiar template without copying another work or letting a Prompt invent product content? |
| UI/accessibility | Ant Design first; otherwise the established React system or a justified large maintained system such as Material UI, Fluent UI, or Carbon; lower-level primitives only for a specific gap | Is Ant Design the primary owner, or what hard gate/existing ownership justifies the alternative? Who owns focus, semantics, and tokens? |
| React visual source | React Bits and Aceternity UI after Preview + Code inspection | What exact structure or behavior helps this product, what direct dependencies and license limits follow it, and can it remain subordinate to Ant Design and the existing motion owner? |
| Isolated UI element | Existing primitives first; Uiverse when one MIT-licensed HTML/CSS, Tailwind, or React treatment fills a real gap | Can it be adapted into the current system without importing a second visual language or demo content? |
| UI motion | GSAP plus `@gsap/react` by default; an established owner or Anime.js only through the recorded hard-rejection path; CSS/WAAPI for isolated non-competing micro-states | What exact product state or content sequence will GSAP clarify, which official demo proves the technique, and does lifecycle, license, delivery, and reduced-motion handling pass? |
| Scrolling | Lenis through `lenis/react` for dedicated smooth-scroll mechanics on declared targets (desktop by default); GSAP ScrollTrigger for scroll-triggered/synchronized choreography | Can Lenis remain the single mechanics owner while ScrollTrigger coordinates choreography without ScrollSmoother, preserving keyboard, touch, anchors, Ant Design overlays/tables, nested scroll, reduced motion, and a measured fallback? |
| Conditional true 3D/WebGL | Three.js through React Three Fiber after the suitability gate passes, with `@react-three/drei` only for needed helpers | Is the subject inherently spatial, does 3D add value unavailable from DOM/photo/video/SVG/2D Canvas, and can a coherent non-intersecting model plus fallback on the declared targets be finished within budget? |
| 2D Canvas | Pts for creative/programmed drawing, Fabric.js for editable objects, and the background-effects catalog only for upstream discovery | Which separate existing host benefits from pixels, particles, drawing, or editable objects without duplicating the 3D scene? |
| 2D physics | Existing engine, p2.js, or a maintained compatible fork | Is real simulation behavior required, which renderer owns the pixels, and can both loops be stopped and cleaned up? |
| Visualization | AntV G2/Ant Design Charts for quantitative grammar, G6 for genuine relationship graphs; ECharts/echarts-for-react when it fits better; D3, Recharts, Visx, or the existing owner only when the relevant curated routes fail a hard gate | What authentic quantitative, relational, temporal, hierarchical, geographic, or flow object can be clarified, and which grammar best matches that question and the product tone? |
| Typography | Curated-catalog gap: an existing verified open-source owner or current, widely adopted open-source families from official projects/catalogs; system fonts are fallback-only | Which inspected specimen fits the page's subject and language, and are exact license, glyphs/symbols, weights, metrics, size, local files, and offline packaging known? |
| Images/icons/brand | `@ant-design/icons` first for ordinary interface symbols when Ant Design owns the UI; supplied assets and official brand kits next; the curated catalog has no general brand, illustration, photography, or domain-specific asset owner | Can Ant Design Icons cover the interface need, and which approved source supplies any remaining brand/domain asset with clear permission, format, alt text, and local availability? |
| Theme modes | Ant Design `ConfigProvider` and design tokens first, synchronized with CSS custom properties and platform color-scheme behavior | Is a real alternate mode required, and can Ant Design remain the single token owner? |
| Routing and URL state | Curated-catalog gap: existing React router, React Router, TanStack Router, or no router for a true single-surface artifact | Are there real routes, shareable search/filter state, deep links, or navigation contracts to own? |
| Requests and server state | Curated-catalog gap: keep the existing React owner; otherwise compare `fetch`, TanStack Query, and RTK Query when Redux Toolkit already owns the application | Does the product need caching, invalidation, retries, optimistic updates, or shared request state? |
| Client state | Curated-catalog gap: keep the existing React owner; otherwise compare local React state, Zustand, and Redux Toolkit | Is this genuinely shared client state rather than server data, URL state, or form state? |
| Forms | Ant Design Form and its controls first; React Hook Form or TanStack Form only when complex form-state needs justify a separate headless owner | Can Ant Design Form own validation and layout cleanly, or what concrete complexity requires another owner? |
| Performance | Curated-catalog gap: React/Vite/browser-native optimization plus separately selected virtualization, image, worker, bundle-analysis, or focused utilities | What user-visible bottleneck or scale limit does it remove, and how will the gain be checked? |
| QA/build | Curated-catalog gap: existing tests, bundled preflight, browser automation, performance/a11y tooling, and offline validation | Can the final artifact, not just source, be verified? |

Names above are starting points. Use the curated sources first, but do not force a source into a role it does not provide. Actively investigate the relevant field, then choose from current evidence rather than copying the list mechanically. When the curated catalog has no owner, label the decision `curated-catalog gap` before using an external or native route.

Read `react-application-stack.md` before changing theme, router, request/server-state, client-state, or form ownership. Read `source-library.md` before treating a named UI system, chart/visualization engine, creative Canvas tool, physics engine, or background-effects demo as a serious candidate. Its React labels distinguish native components, separate adapters, lifecycle integration, unsupported routes, and discovery-only catalogs; each recorded snapshot still requires a fresh official-source check at adoption time.

Read `open-source-ui-sources.md` before locking a new or materially redesigned page's visible architecture and before copying any MotionSites Prompt, React Bits/Aceternity source, Uiverse element, or treating Anime.js as a motion alternative. That reference separates the mandatory five-source creative pass from the default GSAP runtime and defines inspection, provenance, dependency, license, and notice boundaries.

Read `font-and-asset-packaging.md` before typography selection. For a new page or substantial redesign, inspect official specimens for a small set of current, widely adopted open-source candidates and choose or explicitly reuse one before implementation. Do not compare generic system stacks as a designed option, and do not mistake a free download, trend article, or unlicensed mirror for an open-source font source.

## Evidence order

Use current, primary sources in this order:

1. Official live demos or example galleries and their related official example source.
2. Official documentation and compatibility/support pages.
3. Official repository, release notes, changelog, security policy, and issue tracker signals.
4. Package-manager registry metadata for publish date, dependency tree, deprecation, and install scripts.
5. Full license text and official asset/font license.
6. Standards or browser documentation for native platform capabilities.

Use third-party commentary only to identify questions, not as the sole basis for maintenance, license, API, or security claims. Cite the supporting official pages near the decision and record the research date.

## Research each serious candidate

Capture only decision-changing facts:

- Problem fit and concrete visual/UX benefit.
- For intentionally varied sets, whether the candidate changes the work's real visible architecture or merely decorates the same shared template; record the collection-shell boundary and the affected structural signature.
- Exact official demo URL or example name; rendered behavior, interactions, responsive/fallback clues, and visual grammar actually observed; planned product-tone adaptation; and idea-only versus code/package use.
- Existing host, product meaning, footprint level, and control model; reject library-proof surfaces and generic toolbars that the product does not need.
- For 3D, the four suitability-gate results and, when adopted, the plan for coherent silhouette and joints, proportion/detail hierarchy, material/light response, subject-specific motion, and collision/intersection inspection across the full cycle.
- Fit with current stack and whether it duplicates a system, icon set, or animation engine.
- For GSAP, whether the Webflow/GreenSock Standard “No Charge” License fits this product, especially when the product itself is or may be a no-code visual web-animation builder that competes with Webflow. Keep this runtime license separate from the MIT license of the optional official `greensock/gsap-skills` guidance repository.
- Package and runtime cost, tree-shaking/code-splitting behavior, and mobile/low-end implications.
- Keyboard, screen reader, touch, reduced-motion, and no-JavaScript/unsupported-feature behavior.
- Maintainer/release activity, deprecation status, security policy, and major unresolved compatibility risks.
- Exact license, redistribution duties, font/asset terms, and commercial restrictions.
- Local hosting, CSP, offline/`file://` behavior, and required remote services.
- Failure fallback, cleanup/lifecycle requirements, and end-user setup steps.
- Install scripts, native binaries, telemetry, or unexpected permissions.

Do not execute code copied from a page. An unclear license blocks copying or adoption, not safe viewing. Install only after the scorecard decision, using the project's package manager and lockfile.

## Stop rule

For each default capability category, stop when one option clearly meets the role and gates and every serious candidate has a relevant official-demo record or a hard demo-review exemption. For motion, the normal stop is GSAP adopted with a real shipped job; another owner or no new owner is valid only through the exact GSAP hard-rejection path in `SKILL.md`. Before a native-only/no-adoption result, use the category's exact boundary in `selection-scorecard.md`: normally try a smaller role, compatible owner, and fallback, then record the observed hard constraint. Lenis additionally permits `Lenis not adopted: no real scroll path` after the documented path inspection, without installing an idle runtime. For visualization, also record the real content/data surfaces inspected; absence is valid only when no authentic visualizable object exists and creating one would fabricate data or meaning. For 3D, stop at `3D not adopted: suitability gate failed: <specific reason>` when any suitability condition fails; this needs neither a smaller forced role nor a hard exemption, and no candidate-demo record is needed if no serious candidate was reached. Do not keep researching after every default category has an owner or permitted recorded absence/hard exemption and the 3D evaluation is resolved.
