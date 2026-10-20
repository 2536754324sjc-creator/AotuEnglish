# Capability Boundaries

Use this map to compose existing Skills instead of reproducing them.

## Capability matrix

| Existing Skill | Capability already present | Nature of coverage | Route from this Skill | Do not copy |
|---|---|---|---|---|
| `$design-taste-frontend` | Brief inference, aesthetic dials, distinctive landing/portfolio composition, redesign audit, anti-template critique, motion and preflight rules | Deep design principles plus opinionated implementation rules; explicitly not for dense dashboards | Use for landing pages, portfolios, and marketing-oriented redesigns | Its full anti-pattern catalog, fixed aesthetic defaults, block vocabulary, or framework/package prescriptions |
| `$frontend-design` | Subject-specific visual direction, typography/layout/signature planning, self-critique, interface copy | Compact creative-direction principles; not a packaging or dependency workflow | Use to establish a visual thesis and content voice | Its prose and design principles verbatim |
| `$clear-feedback` | Distinguishing ambiguous feedback from observable defects and turning answers into a revision | Conditional clarification, not a compulsory questionnaire or design executor | Use when plausible interpretations would change the revision; see `feedback-clarification.md` | A second interview, unrelated domain procedures, or a mandatory external installation |
| `$ui-ux-pro-max` | Broad UX rules, accessibility, responsive behavior, charts, product/style/font palettes, stack-search tooling | Searchable design intelligence and checklists; selection is not tied to license/offline delivery | Use for dashboards/admin apps, patterns, charts, UX, and stack-specific guidance | Its databases, long rule catalog, or generated design-system output |
| `$web-artifacts-builder` | React artifact scaffold and single-HTML bundling flow | Engineered for complex conversation artifacts; stack-specific and not a general repository workflow | Use only when that artifact format is the actual deliverable | Its artifact-specific scaffold and dependency bundle |
| `$webapp-testing` | Local Playwright setup, server lifecycle helper, screenshots, DOM reconnaissance, and console capture | Engineered browser interaction; its own testing step is optional | Use as the execution layer for this Skill's mandatory visual QA | Its Playwright examples and helper implementation |
| `$theme-factory` | Curated palette/font themes and theme application | Theme selection, mainly artifact-oriented; not customer discovery or frontend engineering | Use when preset/reusable themes or theme comparison are requested | Preset theme definitions or its user-selection ceremony in unrelated builds |

The official [`greensock/gsap-skills`](https://github.com/greensock/gsap-skills) repository may be consulted as an external first-party GSAP implementation reference when it is available. It does not own UI Done's trigger, permissions, selection gate, or continuity contract, and UI Done must still work when that extra Skill is absent. Its MIT license covers that guidance repository; it does not change the separate GSAP runtime license.

## What the orchestration layer adds

- Classify greenfield versus redesign, product surface, audience, brand freedom, language, density, motion, and exact distribution mode in one brief.
- Inspect the affected behavior and preserve recoverability before mutation, using the scoped audit in `../SKILL.md`; a full baseline or separate checkpoint document is not required for every edit.
- Develop the whole-interface direction from the actual brief while finding a product-aligned role and compatible owner for every default enhancement category; refine them in the integrated key-page sample instead of stopping at a basic result or bolting tools on afterward. Evaluate true 3D/WebGL separately through its strict suitability gate. Do not use minimal dependency count or “native is enough” as the opening filter.
- Capability coverage must not expand the information architecture merely to demonstrate a tool. Apply the meaningful-integration method in `page-composition.md`: a supporting accent needs a specific perceptible contribution, and invisible infrastructure needs a real benefit. A tiny footprint is not proof of fit. Redesign an invalid role without inventing data or silently waiving the required category. For 3D, a missing natural host fails the gate and means clean omission rather than a forced accent.
- Treat enhancement as assimilation rather than placement: prefer changing how an expected existing product surface behaves over adding a separate surface that advertises a library.
- Reuse lifecycle and fallback infrastructure without forcing repeated public UI. Labels and pause, reset, rotate, speed, or view controls remain opt-in product decisions, not defaults supplied by a shared wrapper.
- For substantial work, trigger a focused official-source scan across the React UI foundation, GSAP motion, scrolling, 2D Canvas, AntV-first visualization, icons/assets, and performance even when the user did not name tools. Inspect relevant official GSAP React guidance and Demo Hub/Showcase examples before motion implementation. Evaluate 3D suitability before any package/demo scan; inspect relevant official demos and select Three.js/R3F only when the gate passes.
- When the product exposes them, assign one React-compatible owner to theme modes, routing/URL state, request/server state, client state, and forms without inventing those behaviors for static surfaces.
- Score candidates across fit, duplication, performance, accessibility, maintenance, license, offline behavior, failure fallback, and end-user setup.
- Engineer multilingual font roles, provenance, licenses, hashes, local hosting, and layout-stable loading.
- Coordinate ownership and failure behavior across UI, motion, scrolling, charts, Canvas, and any adopted WebGL layer; surfaces that reject 3D must not mount or request it.
- Treat source build, portable build, single-file output, and direct `file://` opening as different delivery contracts.
- Select relevant interaction, visual, responsive, reduced-motion, fallback, and resource checks through `visual-qa.md`, and stop when they resolve the change's actual risks.

These are the actual gaps. Do not turn this Skill into a replacement visual-design encyclopedia or a frozen package list.

## Lessons from other public frontend Skills

Primary entries reviewed on 2026-10-02–03. These are method comparisons, not rankings, installations, copied rule collections, or evidence that their executions outperform one another. The useful adaptations are included in UI Done's local owners so an executor needs neither these repositories nor the development conversation.

| Primary source and reviewed revision | Method retained here | Boundary |
|---|---|---|
| [Anthropic frontend-design](https://github.com/anthropics/skills/blob/8a1541c4a3ffa5a20a5a91de0dcf3f0bab1d1ef4/skills/frontend-design/SKILL.md) | Derive visual identity from subject and audience; make typography, composition and a focal decision concrete, then critique the whole result. See `page-composition.md` | Creative direction is not a substitute for UI Done's required components, GSAP, data truth or design confirmation. Its accompanying license at this revision is Apache-2.0; no Skill text is copied here |
| [Vercel React Best Practices](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices/SKILL.md) | Route by the actual problem, explain why a rule helps, and prioritize high-impact bottlenecks before micro-optimization. See `technology-scouting.md` | Framework-specific server/cache rules are conditional; performance rules do not establish visual quality. Only the entry was reviewed, not every rule or its behavior; copying-license scope was not verified |
| [Vercel Web Design Guidelines](https://github.com/vercel-labs/agent-skills/blob/063bee94c3f4df8453406c830b0a7df0f2860278/skills/web-design-guidelines/SKILL.md) | Tie an actionable finding to an affected file/location rather than a general verdict. See `visual-qa.md` | An audit is not a creative process or a browser observation. UI Done keeps essential methods locally instead of requiring a remote rules file on every run |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/09170eec67eefd46a7ae85de61b40c194020f997/.claude/skills/ui-ux-pro-max/SKILL.md) | Distinguish whole-system direction from a local question; search by semantic intent and use bounded follow-ups for missing evidence. See `technology-scouting.md` | Database matches and aesthetic dials are suggestions, not accepted designs. The reviewed repository license is MIT; no database, scripts or Skill prose are copied, and no external CLI is required |

## Fallback when a companion Skill is missing

| Missing capability | Compact fallback |
|---|---|
| Creative direction | Develop a concrete composition from the subject, audience, actual content and main action: type/scale/placement, density, surfaces/contrast, and a representative transition. Render the opening and action state; critique whether the whole direction meets the brief. Adjectives and a signature effect alone are insufficient. |
| Feedback clarification | Follow the complete bundled `feedback-clarification.md` method. Use ordinary conversation if the host has no question UI; retain answers once and resume UI Done's design workflow. |
| UI/UX database | Apply semantic HTML, visible focus, 4.5:1 normal-text contrast, 44px touch targets, clear loading/empty/error states, layout for the declared devices (desktop by default), and chart text/table alternatives. |
| Theme tooling | Derive semantic colors and typography from existing brand assets; present at most two directions only when the choice is genuinely unresolved. |
| Artifact builder | Use React and the full compatible enhancement stack; for non-React inputs define a clean migration boundary, while direct-open artifacts must bundle every selected layer locally. |
| Browser testing Skill | Use available browser automation directly: start or open the app, wait for rendered state, capture screenshots and console/network errors, interact by accessible role, and close the browser. |
| Web research Skill | Use another available browser/search tool against official sources. If no network exists, avoid freshness claims and uncertain new dependencies. |
| Image generation | Use supplied/openly licensed assets or leave a clearly sized placeholder and report the missing asset; do not fabricate brand logos. |

## Case-derived methods worth retaining

The Agent Carry dashboard demonstrated reusable engineering, not a mandatory stack:

- Give each library one job and keep project tokens in control of the visual language.
- Researching a second React router, a second smooth-scroll engine after Lenis owns the path, unnecessary post-processing, or abstraction layers can correctly end in rejection.
- Give Chinese body text, Latin display, numbers, and code explicit font roles.
- Package OFL fonts and license records locally; verify hashes and runtime references after build.
- Make the checked-in end-user entry genuinely direct-open when promised.
- Pause hidden-tab animation, handle resize/context loss, dispose WebGL resources, honor reduced motion, and retain a usable static navigation fallback.
- Use computed styles and screenshots to find 8–10px accidental text, then enforce a semantic floor rather than patching components randomly.

Treat these as patterns. Never modify or depend on the case project itself.
