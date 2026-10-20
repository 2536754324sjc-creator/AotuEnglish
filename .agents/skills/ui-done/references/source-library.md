# Curated Source Library

Use this catalog first after the product role and real content are known and before choosing a design direction, source component, UI system, motion/scroll owner, visualization engine, creative Canvas tool, physics engine, or background-effect source. Let direction research inform the whole design before assigning library hosts; do not make the catalog determine the page's sections. These are the user's preferred sources. A compatible curated source that passes the hard gates should win over an unlisted or native-only route. Preserve an established project owner when replacing it would create duplication or an unjustified migration; otherwise search this catalog before the broader ecosystem.

The status below is a time-bounded starting point. Before copying code or installing a package, use `web-access` when available, otherwise available official-source web/browser tools, to recheck the official source, current API, package metadata, maintenance, exact license, framework compatibility, accessibility, and delivery constraints. Catalog metadata last verified: 2026-09-07; newer method observations are dated separately.

This catalog is not a bundle of preinstalled components or interchangeable UI systems. Use [layered design selection](layered-design-selection.md) to show a relevant inspected example and its proposed adaptation inside the user's selected page. A list of these links does not establish adoption. The G6 role/examples addition below was checked in official documentation on 2026-10-14; that did not refresh all other catalog metadata or verify runtime integration.

## Read the source and React labels literally

- **Native:** the named project ships components for that framework.
- **Adapter:** a separate named project wraps a framework-neutral core. Verify the adapter's own maintainer, version, license, and compatibility; do not attribute it to the core project without evidence.
- **Lifecycle:** the core JavaScript/TypeScript library can run inside the framework, but the implementation owns mount, update, resize, teardown, and failure behavior.
- **None:** the named project does not provide a credible React route. Do not port it by copying internals merely to imitate its appearance.
- **Discovery only:** browse it to locate an upstream idea or library, then verify and retrieve from that upstream. Do not copy the aggregator itself.
- **Direction only:** inspect visual grammar or an accessible Prompt as research input; it does not own runtime code and does not grant permission to copy a work or its assets.
- **Source candidate:** the site exposes code intended to enter a project, but every selected item still has its own dependencies, behavior, provenance, and license/distribution gates.

“Works in a React app” is not the same as native React support. Use the narrowest accurate label in selection notes and handoffs.

## Demo-first adoption contract

For every serious or selected curated candidate, open its official demo or example gallery and inspect every official demo reasonably relevant to the role already named in the product. For every new page or material redesign, complete a separate GSAP pass using the official React guidance and a relevant Demo Hub or Showcase example, then complete the five-source creative pass in `open-source-ui-sources.md` before locking visible architecture. “Relevant” means the examples that exercise the needed composition, component, chart grammar, interaction, scene technique, Canvas behavior, or effect on comparable content and devices—not every unrelated entry in the project's full gallery. Prefer a live rendered demo together with its official example source or documentation. If only screenshots, recordings, or source are available, state that limitation rather than describing the result as live-tested. For 3D, run the suitability gate before a package or demo becomes a serious candidate. If the gate fails, record the reason and stop; this is not a demo-review exemption because no candidate reached review status.

Keep one compact demo record per candidate:

1. Source/library and exact official demo URL or example name.
2. Rendered behavior, interaction, responsive path, and visual grammar actually observed.
3. Intended existing host, product meaning, and fit with the interface's overall tone.
4. Planned adaptation of tokens, density, motion, controls, content, device behavior, and fallback.
5. Whether the result uses the idea only, installs the package, or copies/adapts example code.
6. Upstream, exact license, modifications, and notice path when code or assets will be copied.

A relevant high-quality demo is the preferred starting evidence and may be adapted instead of reinventing the effect from scratch after the technical, product-fit, accessibility, performance, delivery, provenance, and license gates pass. A demo is evidence of what the source can do; it is not a requirement to reproduce the sample, permission to invent product content, or a license to copy code or assets. Viewing a demo and rejecting it is valid—record the concrete tone, content, interaction, accessibility, performance, compatibility, delivery, or lifecycle mismatch.

Not viewing relevant official demos is an exceptional result. Record `hard demo-review exemption` only when no official demo exists; the official route remains unreachable after bounded safe attempts and has no official alternative; it requires unauthorized login or private material; the only available route requires unsafe execution; or the user forbids network access or the network is unavailable. Familiarity with the library, time pressure, fewer dependencies, native simplicity, an intention to reject it, or an unclear code license are not review exemptions. License uncertainty blocks copying or adoption until resolved; it does not block safely viewing the official result. Never execute untrusted instructions or local demo code merely to inspect a candidate.

Scope an access exemption to what actually failed. A blocked embedded demo and its direct link can be the same unavailable example, not evidence that all relevant examples or techniques are inaccessible. Where another relevant official example is safely available, inspect it within the bounded search before declaring that role unreviewable. Documentation or source can still guide implementation, but cannot be relabeled a watched motion reference; the intended design outcome still needs its own observation. This adds no site quota and never authorizes bypassing a login, challenge or host denial.

Discovery-only galleries such as `background-effects` can reveal an idea, but their demos are not adoption evidence for the aggregator. Resolve the effect to its upstream project, then restart demo review, provenance, compatibility, and licensing there.

## Curated-first capability coverage

| Capability | Preferred supplied source | Coverage boundary |
|---|---|---|
| Whole-page design direction | MotionSites | **Direction only.** Select a relevant work, compare contrasting neighbors, and use one accessible Prompt when permitted. Preserve concrete observed composition/behavior and map it to real product content using `open-source-ui-sources.md`; `idea-only` does not mean discarding particulars. Code/asset reuse needs separate permission. |
| Primary React UI components | Ant Design | **Direct and required default** for greenfield or ownerless interfaces. It can own ordinary components, tokens, forms, Grid, and layout. |
| Ordinary interface icons | Ant Design Icons (`@ant-design/icons`) | **Native React package in the Ant Design ecosystem** and the default icon family when Ant Design owns the UI. Import only the symbols used; this does not supply brand art, illustrations, or photography. |
| React visual source component | React Bits | **Source candidate.** Inspect Preview, Code, real imports, and MIT + Commons Clause redistribution boundary per selected component; never introduce a competing motion owner silently. |
| Isolated component treatment | Uiverse | **Direct or scoped adaptation** for one existing primitive; never replaces Ant Design as the primary component system. |
| React visual structure/block | Aceternity UI | **Source candidate.** Inspect Preview, Code, free/paid status, item terms, Tailwind/Motion/shadcn dependencies, and primary-system fit; use idea-only when redistribution is unclear. |
| Primary UI/SVG/DOM/Canvas motion | GSAP + `@gsap/react` | **Default primary motion owner** for new pages, material redesigns and experience-level motion upgrades after the relevant official GSAP demo pass and current Standard License check. Use scoped React lifecycle and ship a page-specific job; omission requires the exact recorded hard rejection in `SKILL.md`. |
| Motion alternative and five-source research | Anime.js | **Required creative-pass inspection, conditional runtime adoption.** Use as idea-only evidence; use as primary owner only through the exact GSAP hard-rejection gate in `motion-scroll-and-3d.md` (including its full established-owner conditions); use beside GSAP only for a clearly separate, non-overlapping role with a material advantage. Never duplicate GSAP. |
| Scroll-triggered/synchronized motion | GSAP ScrollTrigger | **Default choreography owner**; it does not replace scrolling mechanics. Pair with Lenis when smooth scrolling is active and do not add ScrollSmoother beside Lenis. |
| Dedicated smooth-scroll mechanics | Lenis / `lenis/react` | **Official React integration and required default for real scroll paths.** Apply the [path gate](motion-scroll-and-3d.md#lenis-path-gate) when none exists. Otherwise keep it enabled on declared targets when nested-scroll, anchor, reduced-motion, performance and applicable touch checks pass; native-only behavior requires an observed hard failure. |
| Conditional true 3D/WebGL | Three.js + React Three Fiber (`@react-three/fiber`) | **Preferred official core plus React renderer after the strict suitability gate passes.** Use `@react-three/drei` only for helpers the scene actually needs. If the gate fails, do not mount or request WebGL and do not mislabel a 2D Canvas effect as 3D. |
| Required visualization default | AntV G2/Ant Design Charts | **Preferred React or lifecycle route** whenever authentic visualizable data exists. Select the AntV route that fits the data and adapt its grammar and styling to the product. |
| Relationship/graph visualization | AntV G6 | **Lifecycle route** for genuine node/edge relationships, hierarchy and graph analysis. Select it for that data question, not as a different skin for a quantitative chart. |
| Visualization alternative | Apache ECharts/echarts-for-react | **Adapter or lifecycle route** selected instead of AntV when ECharts better fits the authentic data, interaction, delivery, or established stack. Do not add both merely for variety. |
| Generative/creative Canvas | Pts/react-pts-canvas | **Direct adapter or lifecycle integration**. |
| Editable object Canvas | Fabric.js | **Direct lifecycle integration**. |
| 2D physics | p2.js or a verified maintained compatible fork | **Simulation owner only**; it still needs a renderer. |
| Background effects | background-effects catalog | **Discovery only**. Resolve and verify the actual upstream before adoption. |
| Non-React UI reference | Element Plus | **Unsupported** for this React-only Skill. Never adopt or port its internals. |

## Curated catalog gaps

The supplied sources currently provide no direct adoptable owner for the following concerns. Do not pretend another listed source covers them. Record `curated-catalog gap`, then keep a suitable existing React owner, research one external React package, or use the native/framework path when it is the honest smallest solution.

| Gap | Current fallback route |
|---|---|
| Routing and URL state | Existing React router, React Router, TanStack Router, or browser-native behavior for a true single surface. |
| Requests and server state | Existing request layer, `fetch`, TanStack Query, or RTK Query when Redux already owns the app. |
| Shared client state | Existing owner, React state/reducer/context, Zustand, or Redux Toolkit. |
| Brand marks and domain-specific iconography | Existing approved assets, official brand kits, or one separately verified family. Ant Design Icons and Uiverse are not substitutes for official brand or domain art. |
| General font/image/illustration catalog | Supplied or officially licensed assets, locally packaged fonts, or generated original imagery. |
| Performance and bundle tooling | React/Vite/browser-native optimization plus separately selected analysis, virtualization, image, worker, or compression tooling. |
| Browser QA and measurement | The bundled preflight plus real-browser automation and browser performance/accessibility tools. |

## Native platform responsibilities that remain

Curated libraries own capabilities; they do not replace the browser foundation. Keep semantic HTML, accessible names, focus and keyboard behavior, responsive CSS/media or container queries around Ant Design layout, link/history semantics, request cancellation, element sizing, reduced-motion handling, and lifecycle cleanup in the application layer. This is required integration work, not permission to rebuild an available Ant Design component or ignore a compatible curated source.

## Current React routing matrix

| Source | Best-fit role | React route | Current boundary and provenance gate |
|---|---|---|---|
| [MotionSites](https://motionsites.ai/) | Whole-page composition and Prompt-based design direction | Direction only | Inspect one relevant work and nearby contrasting works. Use only an accessible Prompt the site permits; current site footer states all rights reserved, so do not copy page code, media, copy, or paid content. |
| [React Bits](https://reactbits.dev/) | React visual components, animated backgrounds, text effects, and [Micro control-feedback sources](https://reactbits.dev/c/micro) | Source candidate: JS/TS with CSS/Tailwind variants | Inspect both Preview and Code plus actual direct dependencies. See the [Micro studies and intake route](open-source-ui-sources.md#react-bits-react-visual-source-candidate), added 2026-10-11; this is not another primary UI system. Current repository license is MIT + Commons Clause, not plain MIT; component redistribution, bundling, and ports are restricted even though end-product use is allowed under the license text. |
| [Uiverse](https://uiverse.io/) | One isolated visual treatment for an existing primitive | Native variant on some entries, or scoped HTML/CSS adaptation | Keep the existing accessible primitive as behavior owner. Read `open-source-ui-sources.md` before copying anything. |
| [GSAP](https://gsap.com/) + [`@gsap/react`](https://gsap.com/resources/React/) | Default primary timeline/SVG/DOM/Canvas/UI motion owner | Lifecycle with official React hook | Checked 2026-09-07: public npm releases were `gsap` 3.15.0 and `@gsap/react` 2.1.2, each with zero runtime dependencies. Inspect a relevant [Demo Hub](https://demos.gsap.com/) or [Showcase](https://gsap.com/showcase/) example before implementation. GSAP uses the Webflow/GreenSock Standard “No Charge” License, not MIT; verify current product fit and retain notices. The no-code visual web-animation-builder competitive restriction requires a pause or written permission when it may apply. |
| [Official GSAP AI Skills](https://github.com/greensock/gsap-skills) | Optional first-party implementation guidance for GSAP core, timelines, ScrollTrigger, React, and performance | Guidance only | The repository is MIT-licensed and supports multiple Agents, but UI Done must remain self-contained and must not depend on it for triggering or correctness. Its MIT license does not relicense the GSAP runtime. |
| [Anime.js](https://animejs.com/documentation/) | Motion-language/API research and conditional alternative owner | Lifecycle | Framework-neutral. Inspect it in the five-source pass. Adopt it as primary only through the exact GSAP hard-rejection path, including its established-owner conditions, or as a secondary runtime only for a clearly separate non-overlapping role with a material advantage. Never let it control the same properties, timeline, or scroll region as GSAP. |
| [Aceternity UI](https://ui.aceternity.com/) | React visual components, effects, blocks, and structure ideas | Source candidate, often React + Tailwind + Motion/shadcn-style registry | Free and paid material coexist. Inspect the exact item's Preview, Code, dependencies, and covering terms; the general Pro licence restricts source-item redistribution and template/marketplace use, so never infer blanket open-source permission. |
| [Lenis](https://github.com/darkroomengineering/lenis) | Dedicated smooth-scroll mechanics and scroll signal for WebGL/parallax synchronization | Native: official [`lenis/react`](https://github.com/darkroomengineering/lenis/tree/main/packages/react) | Selected on 2026-09-02 after current official-source comparison: MIT, 15,657 GitHub stars, active v1.3.26 release, zero runtime dependencies, reduced-motion support, and direct React context/hook integration. Stars are a popularity signal, not a substitute for project-specific QA. |
| [Three.js](https://github.com/mrdoob/three.js) + [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Conditional true 3D/WebGL/WebGPU scenes in React | Native React renderer: `@react-three/fiber`; core: `three`; optional helpers: [`@react-three/drei`](https://github.com/pmndrs/drei) | Preferred route only after the 3D suitability gate passes. On 2026-09-02 the official repositories were MIT, active, and showed about 115,013 and 31,844 GitHub stars respectively. Match R3F and React major versions, budget the GPU path, retain a static/DOM fallback, and verify geometry integrity and modeling finish across the full motion cycle. |
| [Apache ECharts](https://echarts.apache.org/zh/index.html) | General-purpose quantitative visualization | Adapter: [`echarts-for-react`](https://github.com/hustcc/echarts-for-react), or Lifecycle with core | Core is Apache-2.0 and framework-neutral. The adapter is a separate MIT project with its own compatibility and lifecycle contract. |
| [Pts](https://github.com/williamngan/pts) | Generative geometry, drawing, and creative coding | Adapter: author's [`react-pts-canvas`](https://github.com/williamngan/react-pts-canvas), or Lifecycle | Pts and the React adapter are Apache-2.0. Package update signals were from 2024, so recheck compatibility before adoption. |
| [Ant Design](https://ant.design/) | Enterprise React component/design system and ordinary interface icons | Native: `antd` and [`@ant-design/icons`](https://ant.design/components/icon/) | Required default for greenfield or ownerless React interfaces. Preserve a different established primary system only for existing ownership or a documented hard gate; never run two primary design systems. |
| [Element Plus](https://github.com/element-plus/element-plus) | Non-React component-system reference | None | Out of scope for implementation through this React-only Skill. Do not copy its demos or internals into React. |
| [AntV 2018 index](https://antv-2018.alipay.com/zh-cn/index.html) and current [G2](https://g2.antv.antgroup.com/manual/quick-start) | Visualization grammar and AntV product discovery | Lifecycle with G2; native React option: [`@ant-design/charts`](https://github.com/ant-design/ant-design-charts) | The 2018 URL is historical navigation, not current API evidence. Use current product documentation and package metadata. |
| [AntV G6](https://g6.antv.antgroup.com/) and [official examples](https://g6.antv.antgroup.com/zh/examples/) | Genuine relationship graphs, organization/hierarchy and graph exploration | Lifecycle with G6 inside a React host | Official documentation checked 2026-10-14 identifies relationship-data focus and lists organization, tree/layout, focus/highlight and animation examples. This is documentation/example-index evidence, not a live interaction or package/license check. Inspect the exact relevant rendered demo, current React integration, dependencies and license before adoption. |
| [p2.js demos](https://github.com/schteppe/p2.js#demos) | 2D rigid-body physics for a real simulation or interaction | Lifecycle | MIT, framework-neutral, and not a renderer. The `p2` package update signal was from 2022; compare current requirements and maintained alternatives before new adoption. |
| [Fabric.js releases](https://github.com/fabricjs/fabric.js/releases) | User-editable object-model Canvas, selection, transforms, and serialization | Lifecycle | MIT and framework-neutral. Own Canvas instance state outside React render loops and verify the current major-version migration path. |
| [background-effects demo](https://mofeiss.github.io/background-effects/index.html) | Discovery index for background-effect upstreams | Discovery only | The [repository](https://github.com/mofeiss/background-effects) had no repository-level license when checked and loads third-party libraries from CDNs. Resolve the selected effect to its actual upstream; do not copy the aggregator code. |

## Route by the real need

### Design direction and source components

- Complete the five-source creative pass for every new page or material redesign. The pass is research coverage, not dependency coverage: inspect all five and record adopt/adapt/idea-only/reject, but install or copy only the selected parts that pass every gate.
- Use MotionSites to break the first familiar whole-page composition. Keep the collection shell separate from the work itself: shared filters, card chrome, and metadata are allowed, while each preview retains its own silhouette, content topology, media rhythm, type placement, motion, and journey.
- Use React Bits or Aceternity only after opening both Preview and Code. Audit direct imports and setup before deciding whether a component fits the GSAP, Ant Design, CSS, Canvas, and delivery owners. Source availability does not erase dependency, license, accessibility, or redistribution constraints.
- Use Uiverse for a bounded treatment around an accessible existing primitive. Inspect Anime.js for the five-source motion comparison, then normally author page-specific motion with GSAP; adopt Anime.js instead only through the recorded hard-rejection path. Different source names do not make pages different if every route still shares the same hero, overlay, card grammar, or animation sequence.

### Buttons and local feedback

For a button, tab, toggle or popover change, start with the [control-feedback method and primary examples](motion-scroll-and-3d.md#buttons-and-control-feedback), plus the [bounded source studies](open-source-ui-sources.md#bounded-control-studies). Inspect Ant Design's current primitive/API, then the specific tactile, stateful, origin-aware or interrupted-motion example that resolves the gap. These examples are not an extra mandatory browsing round, a replacement component system, or a preapproved code pack. Prefer a stable semantic target with deliberate visual layers over a gallery effect that changes the task's behavior.

### UI systems

- Use Ant Design as the required default primary component system for greenfield or ownerless React work. Keep another established system only when it already owns the approved product or Ant Design fails a documented hard gate.
- Do not adopt Element Plus or another non-React component system. Do not use a component library as a gallery for copying visual internals into React; design inspiration does not grant source-code permission or preserve accessibility behavior.

### Smooth scrolling, choreography, and real 3D

- Use Lenis through `lenis/react` as the default smooth-scroll mechanics owner for real scroll paths in substantial React work. Apply the [path gate](motion-scroll-and-3d.md#lenis-path-gate) when no real document or nested scroll path exists in the agreed surface/states; do not install an idle runtime or manufacture scrolling. Use GSAP ScrollTrigger for scroll-triggered choreography; bridge updates deliberately, do not install ScrollSmoother or a second smooth-scroll engine, and do not let both layers own the same scroll container, timing loop, or transform.
- Keep Lenis as the selected owner on declared targets whenever their actual paths pass. Add phone/tablet checks only when those targets are required. Preserve anchors, keyboard/focus navigation, nested Ant Design drawers/modals/tables, and `prefers-reduced-motion`; exclude only the failing region or device behavior before disabling the owner globally. Do not enable touch-synchronization options blindly when the upstream documents platform limitations.
- Evaluate 3D on every substantial build with the four-part gate in `motion-scroll-and-3d.md`: natural host, inherently spatial subject, unique communication value, and a finishable modeling/performance/fallback budget. When any condition fails, record `3D not adopted: suitability gate failed: <specific reason>` and do not load, initialize, or probe WebGL for that surface.
- When the gate passes, use React Three Fiber over Three.js as the default React scene boundary. Reach for direct Three.js lifecycle code only when a low-level integration cannot be expressed cleanly through R3F. Treat `@react-three/drei` as an optional helper collection, not another renderer or a reason to add generic controls. Inspect relevant official examples before implementation, then reject accidental intersections, z-fighting, clipping, animation collisions, and finished models that read as unrelated stock primitives assembled together.
- Treat 2D Canvas as a separate required category regardless of the 3D result: Pts remains the creative-Canvas owner and Fabric.js the editable-Canvas owner. Neither satisfies an adopted real 3D/WebGL role, and R3F does not satisfy 2D Canvas coverage.

### Charts and visualization

- Select one primary visualization owner for the real need whenever authentic quantitative, relational, temporal, hierarchical, geographic, or flow data exists. Prefer AntV G2/Ant Design Charts for quantitative visual grammar; consider G6 for genuine node/edge relationships, hierarchy or graph exploration. Select ECharts when its fit is stronger. Do not add several engines for generic variety; distinct engines require distinct real responsibilities, not a desire to show more package names.
- At the data-design layer, show viable encodings of the same relevant data inside the selected page and explain what each reveals. G2 and G6 are not interchangeable style choices. For a task table, inspect [Ant Design Table examples](https://ant.design/components/table/) and design its real column hierarchy, density, selection and applicable detail/filter states, rather than accept a default rounded-card wrapper. One primary UI system still owns the table and ordinary controls.
- A React wrapper can reduce component boilerplate but adds another compatibility owner. A direct core integration may be smaller when only a few stable charts exist.
- Treat omission as exceptional: inspect all real content and data surfaces and try a restrained existing-host visualization before giving up. Only when no authentic visualization object exists and creating one would fabricate data or product meaning may the implementation record the narrow hard visualization exemption. A gallery entry is never permission to invent a dataset.

### Creative Canvas, editable Canvas, and physics

- Choose Pts for programmed geometry and creative drawing, Fabric.js for user-manipulable Canvas objects, and p2.js only for physical simulation. They solve different problems and are not interchangeable visual-effect packages.
- p2.js needs a renderer; selecting it does not satisfy the Canvas/visual owner by itself. Keep fixed-step simulation separate from rendering and stop both loops when the host is inactive.
- Treat the background-effects site as an index. For a selected Particles.js, Three.js, Matter.js, Vanta.js, GSAP, Anime.js, or other effect, restart provenance and selection at that project's official source.

## Lifecycle contract for framework-neutral sources

For React Lifecycle integrations:

1. Create the library instance only after a stable container exists; keep continuous engine state outside React renders.
2. Update through the library's supported API rather than reconstructing the instance for ordinary prop or data changes.
3. Observe real container size when responsiveness matters; do not assume only the window can resize it.
4. On unmount, cancel animation frames and timers, remove observers/listeners, dispose or destroy the instance, release Canvas/WebGL resources, and make remount idempotent.
5. Provide reduced-motion, unsupported-feature, loading, and static/failure paths proportional to the feature's importance.

For GSAP in React, register plugins once at the application boundary; use `useGSAP()` with a scoped container; wrap handlers or delayed callbacks created after the hook with `contextSafe()`; revert timelines, ScrollTriggers, listeners, and observers during cleanup; use a client boundary in server-rendered frameworks; and use `gsap.matchMedia()` or an equivalent live preference path for responsive and reduced-motion behavior. Prefer timeline positions/labels over chains of unrelated delays, `quickTo()` for frequent pointer updates, and transforms/opacity/`autoAlpha` over continuous layout-property animation.

## Adoption record

When a source is selected, record the exact core and adapter package separately: upstream project, exact Prompt/Demo/Code item, package/repository, author or organization, version or commit, retrieval date, license, notice location, framework relationship, integration owner, and fallback. Attach the demo record above. If only a Prompt, Demo, or Code view was inspected and no code or package was adopted, say so explicitly and record why it was rejected or retained as idea-only evidence.
