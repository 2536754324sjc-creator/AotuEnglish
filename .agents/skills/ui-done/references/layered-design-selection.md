# Progressive Design and Layered Selection

Use this for a new page or substantial redesign, including a Skill trial. It turns design and capability requirements into things the user can see and compare before investing in the full application. A specific defect, copy repair, or already confirmed design stays scoped. `../SKILL.md` owns the stack and exemption rules; this method does not make those capabilities optional.

## The working sequence

Start with the purpose and real content, increase fidelity as evidence improves, and revisit decisions that the evidence changes. Structure, visual language, data, technical feasibility and motion are connected aspects of the design—not a skeleton → UI → charts → animation conveyor belt. The sequence below is a useful progression, not seven mandatory meetings or a rule to finish each discipline before starting the next.

| Work | Decision to resolve | Useful visible result |
|---|---|---|
| Establish the brief and content | Who uses this, for what outcome, with which real material and boundaries? | A short brief and representative text/data/media; reuse known answers |
| Clarify information and actions | What matters first, what belongs together, and how does the user act and return? | A content hierarchy, rough flow or broad composition sketch |
| Explore directions in parallel | Which combination of structure, visual identity and interaction fits? Is its core technique feasible? | Comparable directions with rough structure and real visual specimens; early motion/data experiments when decisive |
| Build a key-page sample | Does a promising direction work as a whole rather than as separate parts? | One representative styled page with real content, meaningful data/UI and an ordinary action state |
| Play, compare and refine | Does the main sequence feel and read as intended? What must change? | Normal-speed interaction/transition preview and the revised whole; return to affected earlier choices when needed |
| Implement and expand | Can the agreed experience carry the authorized product scope? | Real React/UI owners and related screens, sharing proven primitives without imposing one visible template |
| Inspect the actual entry | Did implementation preserve the chosen experience and capability roles? | Observed states/actions and focused corrections; separate user acceptance from technical checks |

Layers let the user compare an unsettled aspect without losing the whole. Show credible alternatives, normally two or three where a real choice remains. Recommend one with a concrete reason; the user can combine qualities, reject all, or delegate. Use the choice checkpoints below rather than compressing this whole progression into one implementation turn. Do not manufacture alternatives for settled decisions or require approval for every capability. A user's explicit request to choose skeletons first still governs that presentation, without freezing unseen details or postponing feasibility.

Choose the next artifact by the question it must answer:

- **Information or operation is uncertain:** a rough flow/sketch can expose missing steps and wrong grouping quickly. It does not establish visual quality.
- **The whole page feels ordinary or AI-generated:** show actual typography, content density, surfaces, proportions and the relevant action state together. An empty wireframe, attractive background photo or working save button cannot answer this complaint.
- **Motion or spatial continuity is uncertain:** play the actual sequence or a clearly labeled previsualization at normal speed. Still images and easing names cannot establish its feel.
- **A core integration is uncertain:** try the smallest relevant component/data/technique inside the proposed host. Do not finish unrelated features or the entire backend to answer it.

Low-cost refers to limiting unrelated scope, not lowering the quality of the property being judged. Structure and visual explorations can proceed together; a motion-led concept may start with movement, while a dense working tool usually starts with task/content relationships. Neither route changes the required stack or exemptions.

## Choice checkpoints

The default collaboration has a **working-direction choice**, refinement of the **important unresolved layers in one sample**, and an **integrated-design confirmation** before expansion. These are dependencies, not three compulsory meetings: reuse an applicable choice, combine compatible questions, or follow explicit autonomous/batch instructions. A user who asks to choose the skeleton first gets that choice before its dependent details are finalized. Do not infer autonomous delivery from a generic “start” or “redo.”

For each current choice, show the actual options, your recommendation and why it fits, and one concrete question. End the turn for the answer. A commentary plan or an internal decision table is not that exchange; neither is an asynchronous question followed by implementation that assumes an unanswered choice. While waiting, research or fix independent defects only.

**At the direction choice**, show inspected reference evidence and small, comparable studies of the proposed page: actual composition, representative type/content, a characteristic working cluster, and the ordinary action's spatial relationship. A motion-led direction also needs a bounded playable study. Identify what you would keep, adapt, and exclude from the references. The studies answer “which experience should we develop?”; they need not implement every control, data mode, resize case or adoption row. Do not spend the turn polishing two complete applications, then ask which direction the user wanted. A bare style name, unpopulated wireframe, default control demo, or list of source URLs is insufficient.

**After a direction is chosen**, integrate its representative page and show the unresolved choices where they matter. For UI, compare coherent treatments using the primary system, not competing frameworks. For data, compare useful encodings of the same real question. For motion, play distinct choreographies on the same action. The Agent shortlists and recommends; the user is not asked “G2 or G6?” or required to browse catalogs. Related choices can share one sample and one question. Do not reopen settled preferences.

**At integrated confirmation**, let the user judge the opening, ordinary action and main transition together. Identify any still-unseen capability or simulated behavior; “we will add GSAP later” cannot settle a motion-led direction. Then implement the agreed scope. Presentation code is allowed at all these checkpoints; the limit is the unresolved decision it depends on, not a ban on React or a file-count budget.

For example, “appearance and layout both need changing” after rejected drafts establishes scope only. Next show concrete visual references or ask the distinction that determines the next study; do not infer that a light list and a dark card grid are wanted. Conversely, “I cannot describe it; make three different previews for me to compare” explicitly authorizes that batch. Produce it without another permission question, then wait for feedback before elaborating a winner. Neither phrase accepts the old look or the new result.

## Establish the task and real content

Use the available brief, instructions, affected entry and representative content before asking for new answers. Name the desired outcome, primary information, main action/reading progression, target devices and preservation boundary. Keep this in the existing task context; no full product dossier, persona workshop or site-wide inventory is mandatory.

Sketch the connection between places and actions when it is unclear: for example, find a record → inspect its evidence → make the authorized decision → return to the same context. The sketch need not settle whether detail appears inline, on a separate page or in another justified carrier. That choice depends on simultaneous information needs and the whole design, not a habitual Drawer.

Real text length, row counts, units, media proportions and supported states influence composition. Bring representative material into exploration early; do not approve a generous empty layout and discover later that real labels, charts or media cannot fit. For a bounded working window or simultaneous comparison, use [reference-to-capacity adaptation](page-composition.md#fit-a-reference-to-the-tasks-real-capacity) while making the sample: the routine item count and actual window are design inputs, not just late resize tests. If the task is a visual Skill trial, known product behavior is a boundary, not an invitation to rebuild business functions before judging the UI.

## Explore structure and visual direction together

Read `page-composition.md`. Here **skeleton** means the placement and relationship of content, navigation, working space, and actions, including how that space changes during use—not a loading skeleton, framework, or empty wireframe.

Develop distinct relationships from the actual task, not three skins of a sidebar-plus-cards template. In parallel, try the open-source typography, surfaces, representative controls and main interaction that give those relationships character. An analysis task might support comparison-first aligned views or a time-based main surface; a reading task may favor an evolving editorial visual. These are examples, not a universal layout menu. Reject a candidate that contradicts the brief instead of offering it merely to fill a quota.

Keep content, viewport, and task comparable. A huge photograph in one direction and an empty box in another prevents a fair composition judgment. Use the actual text, representative row density and chart shape, and required media proportions where available. Label unavailable content; use safe fixtures only within the explicit prototype conditions below. Do not invent product claims, data objects or relationships to justify a capability, or invent values where synthetic data is forbidden. A simple outline helps compare topology, but show enough styled design to judge hierarchy and character as well.

Show the opening and one ordinary action state for each direction. Explain the visible difference in ordinary words: for example, “This version keeps the comparison visible while you inspect an item; this version gives the selected item the main stage and provides a clear return.” Ask which relationship better serves the user's work, not where they want every control placed. Preserve the selected preview and the reason for the choice in the existing task context. Treat it as a working hypothesis: a data or motion experiment can reveal a better allocation without discarding the confirmed goal.

Use `source-library.md` and the five-source pass in `open-source-ui-sources.md`. Bring the relevant inspected examples into this round as viewable references, then show their proposed adaptation in the user's page. A homepage list or “I will use Ant Design and GSAP” is not a visual option.

The catalog contains different kinds of sources, not several interchangeable installed UI systems. Ant Design remains the default primary React system. Compare combinations of its tokens, control density, type, navigation treatment, and permitted bounded source ideas. React Bits, Uiverse, and Aceternity may contribute a suitable treatment under their existing license/dependency rules; do not stack several primary systems or incompatible animation owners for variety.

A small visual specimen can compare type, color or a component treatment before polishing an entire page. Move promising specimens into the page early: a button alone cannot establish that its color works on the actual surface or that a menu's text is readable. Show the combined opening and important selected/open state, including representative Chinese, English, numbers and symbols for the roles used. Keep unaffected choices stable for a fair comparison; when a new finding requires changing the structure, explain and show the affected relationship rather than silently locking or replacing it.

Useful prompt: “Both versions keep your selected layout. A uses compact controls and stronger typographic grouping; B uses more generous controls and a softer surface. Here is each with the same menu open. I recommend A because the real records remain visible.” These are illustrative differences, not default styles.

If the user likes qualities from several options, compose and show one consistent revision. Do not implement a collage of independently chosen buttons, tabs, backgrounds, and fonts without checking the result together.

## Build one integrated key-page sample

Use the chosen working direction, or the current explicit batch/autonomous mandate. Select a representative page and action that expose the main design uncertainty. For a work tool, it might be the actual comparison/inspection state; for an expressive page, the subject-led opening and its main navigation or reading transition. Do not automatically choose a decorative cover or implement login/settings first merely because they occur earlier in the route list.

Combine the representative content, deliberate typography, primary-system controls, surfaces, meaningful data view and principal interaction in that sample. Show both the opening and an ordinary action state. When motion is part of the intended experience, include a playable sequence early. If a real chart determines how users read or act, it belongs in the sample before the structure is treated as settled. Apply the existing no-object/no-motion gates rather than manufacture content or effects.

An isolated sample may use real React, Ant Design, chart and GSAP components, safe existing plumbing or authorized fixtures. It need not complete other routes, APIs or persistence, and it must label simulation. Feasibility and presentational code can be written before full design confirmation; do not interpret design-first as a ban on the very prototype needed to judge the design. Do not switch a normal entry or change real data contracts merely to make the preview convenient.

Iterate on the same whole: inspect the content at its real scale, play the action, compare with the chosen references and ask what changed. A table that crowds the main object or a transition that exposes a stock form view may require revising space, type and behavior together. This is a reason to revisit that relationship, not to rerun every decision or shrink the capability until it becomes invisible.

Before expanding implementation, the sample must answer the current design question and expose the important ordinary state. The contributions being judged—such as the primary control treatment, data view and main transition—must actually appear or play there. A plausible owner/job is enough for an early feasibility proposal, not evidence that the integrated sample delivered that contribution. Keep future or unobservable work explicitly pending; the user confirms only the experience shown unless an applicable prior design or explicit delegation settles more. Do not claim design success from library coverage or a generic “taste awaits approval” disclaimer. Conversely, do not finish every future state, route or backend feature to judge this sample. A promising direction is not final product acceptance.

## Refine tables and visualization in the sample

Read the [chart routing](source-library.md#charts-and-visualization) before choosing an engine. First identify the real question and available data, then compare useful visual answers. G2/Ant Design Charts is a quantitative-visualization route; G6 is a relationship/graph route, not a prettier substitute for an unrelated time series. ECharts remains the alternative when its task fit is stronger. Choose one primary owner for the current need; several libraries are not required to demonstrate coverage.

Present chart alternatives with the same relevant data and page allocation. Explain what each makes easier to see: ranking, change over time, distribution, hierarchy or connections. Preserve units, scales, identity and time meaning. A line chart and relation graph of different datasets are not a meaningful style comparison. Show the useful selection, legend/tooltip or focus behavior where the task needs it, not just the default chart thumbnail. A chart's internal renderer owns its own animated marks; GSAP coordinates surrounding UI without competing over those marks.

When the product contains a table, design that working surface instead of dropping a default table into a rounded card. Compare task-relevant organization: column priority and alignment, grouping, density, numeric units, selected rows, filtering, inline detail or comparison, and the return to context. Use the primary UI system's real primitives. Show realistic long labels and enough rows to expose scrolling and density. Tiny bars or sparklines are useful only when real data supports them, not decorative filler. Do not make every product a table, add unsupported editing/filtering features, or animate every cell merely to look busy.

No authentic visualization object is still the narrow hard exemption in `../SKILL.md`, not a missed design round disguised as taste. Research it using real content first; when that exemption is established, end the chart-selection branch without fake alternatives. Distinguish this from a confirmed real object whose data is temporarily unavailable. Only that latter case, within an authorized prototype scope that permits demonstration data, may use an explicitly labeled visual-only fixture. If synthetic data is forbidden, use a truthful empty state, seek the needed real input, or mark the affected choice unresolved; do not fabricate values. A fixture never proves truthful product integration or satisfies final visualization adoption.

## Prototype motion when it affects the direction

Read `motion-scroll-and-3d.md`. Establish what remains anchored, what changes space or prominence, and how the task continues while exploring the whole direction. Prototype the sequence early when its behavior can change the layout or identity, then refine it in the integrated page context at normal speed. Compare choreography when that decision remains open—not merely two durations of the same generic fade. Do not wait for a supposedly final static layout before discovering whether its main transition works.

Apply the existing hard-rejection paths before producing alternatives. If animation itself is expressly forbidden or a proven hard constraint requires no motion, show stable before/after states and the coherent continuation; that is a valid completion of this layer, not missing animation to sneak back in. A GSAP-only rejection is different: follow the existing gate for a permitted alternative owner rather than assume all motion is forbidden. These exceptions do not make ordinary preference, familiarity or schedule a reason to omit the required motion.

Use an isolated playable sample, recording or previsualization. A storyboard explains relationships but cannot settle feel. If playback cannot be produced, show the intended states and identify motion as not yet judged; do not call a static draft an accepted dynamic experience. Preview-only code is allowed to use React, Ant Design, charts and GSAP; it need not implement the full product, backend or persistence. Clearly distinguish simulated outcomes and a non-GSAP previsualization from runtime GSAP adoption.

For a workspace, a primary sequence may link a chosen record, its matching data, the change of working space and the return to the same context. For an expressive page, it may develop the actual subject as reading progresses. Neither requires page-wide motion, a long page, neon/glass styling, or a separate animation showroom. A few hover effects or an animated background cannot replace the requested main interaction. Keep controls responsive; normal use must not replay unrelated entrances.

Refine scroll behavior on real document or nested scroll paths. Lenis handles mechanics, not every state transition. Keep separate Canvas roles and conditional 3D evaluation in the same capability plan; do not manufacture media, controls, extra sections or a WebGL object to fill a row. Preserve the existing hard constraints and accessibility/reduced-motion requirements.

## Make references useful at each decision

Use the relevant subset of the curated sources at the decision it informs. The mandatory five-source pass is research coverage, not a requirement to paste five widgets into the page or revisit all sites at every layer.

| Current decision | Relevant source evidence | What must appear in the proposed page |
|---|---|---|
| Composition and content progression | A selected MotionSites work/accessible Prompt and comparable whole-flow evidence where needed | Recognizable spatial/typographic relationships and the real action state, not its scenery pasted behind an old layout |
| UI treatment | Ant Design specimens/tokens; relevant React Bits Preview/Code, Uiverse Code, or Aceternity Preview/Code | A coherent combination on the chosen surface, with ordinary open/selected/control states |
| Tables and data | Ant Design Table examples; relevant AntV G2/G6 or ECharts examples | The actual question/data in a readable, useful encoding and working-state context |
| Main motion | Official GSAP React guidance and relevant demo; Anime.js as required research/conditional alternative | A playable page-specific trigger-to-completion sequence, not a library logo or a fade quota |
| Typography, Canvas or conditional 3D | The relevant official specimens/demos and existing suitability rules | The real text/object/host at useful scale, with a concrete role in the same whole design |

Keep one compact reference-to-design mapping with the existing source notes: exact example, observable trait, proposed host/change, preview location, and adopted/adapted/idea-only/rejected result. Show enough accessible source evidence for the user to understand the choice; do not redistribute restricted screenshots, code or media. Link an accessible upstream example or describe unavailable evidence honestly. Do not claim an internal catalog entry is a bundled, runnable component when it is only a research link.

## Carry the chosen design into real use

Update the same [capability plan](selection-scorecard.md#carry-selection-into-observed-use) rather than adding a report: proposed role → visible preview → implemented owner/entry → observed result or unresolved gap. Only advance a status when the corresponding work happened. One good integrated sample can cover several rows; there is no separate demo, test or approval requirement per library.

Before expanding full implementation, show the refined key-page experience: opening, ordinary action state, applicable main transition, and meaningful UI/data/Canvas/scroll roles. Ask whether that combined direction should be implemented; reuse an existing applicable confirmation rather than add an approval round. Approval of the skeleton alone does not approve unseen defaults, and approval of one effect does not accept the whole screen. After implementation, compare the actual entry with those artifacts and check the declared contributions. Repair a missing adopted capability or unrecognizable agreed treatment rather than burying the omission in a completion report.

When a model says “the Skill told me, but I did not implement it,” treat that as a claim, not a diagnosis. Check the evidence that can change the remedy:

- Which Skill folder/version was actually loaded? Was the relevant workflow/reference available? Distinct source, installed and published copies can diverge; do not overwrite them blindly.
- Was the requested effect concrete and visible in the selected preview, or only written as an intention?
- Does the real entry render the chosen owner and result, or is it an unused dependency, stale entry, silent fallback or reduced substitute?
- If it runs as intended but still looks ordinary, revisit composition, source translation and choreography; installing it again will not improve the concept.

Use the narrow correction supported by those facts. Do not automatically blame the model, declare the Skill faultless, or claim all Agents are fixed by stronger wording. These are instructions, not host-enforced controls. A host adapter may enforce technical entry checks if supported, but that is a separate capability and cannot certify taste.

## Scope shortcuts and continuation

- **A specific repair:** use existing decisions and inspect the affected state/sequence. Do not generate whole-page options or browse the entire catalog for a color correction or easing defect.
- **An already confirmed design:** show or identify the applicable artifact; develop only the unsettled layers. Do not make the user choose the same skeleton again.
- **The user asks the Agent to decide or deliver without intermediate review:** develop and select coherent alternatives internally, implement the authorized scope, and show the integrated result. Preserve meaningful source adoption and observed-use requirements; label taste assumptions and do not claim user acceptance. A request to start the normal workflow is not this waiver. A past request for several drafts authorizes that batch, not silent taste decisions after later overall rejection.
- **The user requests one layer only:** compare that aspect in the existing page context. Preserve unaffected choices and owners; revisit only the relationships it actually changes. An experience-level motion upgrade is not merely a button repair.
- **A layer remains rejected:** use `feedback-clarification.md`/available Clear Feedback with the actual comparison. Continue responsive rounds when the user asks for depth. Do not ask the same questions or restart settled choices; use observable comparisons when words cannot settle the remaining distinction.
- **Waiting for a choice:** ask the current concrete question and end the turn. Continue independent preparation only where the missing answer cannot change it. Do not choose silently, build dependent full features, or wait in a polling loop.

Carry the current design question, integrated sample/chosen artifacts, confirmed qualities, rejected patterns, open decisions and capability record through resumption or delegation. A short existing task note is sufficient; no new state service, approval framework, permanent user profile or global configuration is required.

## Worked example: an operations analysis page

The product has real daily activity, exception records, owners and statuses. First clarify the relationship: compare activity, find a relevant exception, inspect its evidence and return to the same context. Explore a time-based main view with aligned records and a comparison-first surface with contextual detail, using the same data. Develop their type/control/surface character in parallel; do not call two identical three-column shells “tech” and “business” styles.

In the promising direction, show a representative page with real column priorities, readable long owner names, a useful activity encoding and its inspection state. Try a trend or day-by-category matrix when the data supports that choice. If the matrix needs more width or selection must retain more evidence, revisit allocation before calling the skeleton fixed. G6 is relevant only when genuine graph relationships matter; it is not another skin for the same trend.

Play how choosing an exception connects its time/data position to inspection and returns to the same filtered context. Refine the type, space and coordinated motion together when that sequence exposes a weak result. The user judges this integrated experience before expansion. Unrelated account/settings/backend work is not needed to judge it. In the finished entry, inspect that actual action and its selected UI/chart/motion contributions; naming AntD, AntV and GSAP cannot close it.

This is an illustrative task, not a prescribed dashboard, dataset or requirement to add exception handling to other products.

## Worked example: a motion-led portfolio

The user wants a distinctive portfolio and the central idea is how actual projects move into focus during browsing. A small normal-speed motion concept can be the first useful experiment, alongside real project titles/images. It can reveal the navigation rhythm and space needed for typography before a grid is settled. A finished static skeleton is not a prerequisite for this experiment.

Move the promising behavior into a representative styled page, then refine layout, type, controls, readability and continuation together. Check the ordinary browsing state, not only the dramatic entrance. Motion-first does not mean mandatory WebGL: apply the unchanged 3D suitability gate and preserve the required capabilities. Do not copy this portfolio route into a tool whose unresolved problem is comparing dense records.

## Method sources and application limits

The process sources below were reviewed on 2026-10-14. These are original explanations and bounded case studies, not a universal industry sequence, a new browsing quota, or evidence that UI Done has passed a visual trial. The methods above remain usable without visiting the links; revisit an original only when its evidence is needed.

- [Brad Frost, The Atomic Workflow](https://atomicdesign.bradfrost.com/chapter-4/): content/structure sketches, visual exploration and frontend preparation can proceed concurrently. His TechCrunch example explores a header and browser prototype before a whole article-page composition, then iterates in-browser. Apply the relationship between parts and whole, not a compulsory organizational audit, mobile deliverable or library-building project.
- [Ryan Singer/Basecamp, Find the Elements](https://basecamp.com/shapeup/1.3-chapter-04) and [Get One Piece Done](https://basecamp.com/shapeup/3.2-chapter-11): rough places/actions/connections expose a solution; a small integrated working piece makes progress judgeable. Their function-first roughness addresses behavioral uncertainty. For a visual-quality trial, keep the small scope but make the judged appearance/motion convincing; do not rebuild the backend or use functional correctness as aesthetic evidence.
- [Linear's design and engineering team, UI redesign part II](https://linear.app/now/how-we-redesigned-the-linear-ui): explore connected screens/flows, narrow directions, check representative views/states and implement with continuing design feedback. Apply state coverage to the affected sample; do not require hundreds of screens, a feature-flag system or their product's sidebar layout.
- [Josh W. Comeau, Effective Collaboration with Product and Design](https://www.joshwcomeau.com/career/effective-collaboration/): developers contribute feasibility/data knowledge early, and design review continues during implementation using working flows. Apply early, concrete feedback rather than a one-way mockup handoff; this does not authorize unrequested engineering work.
- [Bruno Arizio and Luis Henrique Bizarro, portfolio case study](https://tympanus.net/codrops/2019/12/18/case-study-portfolio-of-bruno-arizio/): this expressive project develops motion concepts before grid/type and iterates design with code. It demonstrates a valid motion-led route, not a requirement for every page to use After Effects, Three.js or that visual style. The source is a historical 2019 process case, not current API guidance.
- [Design Council, Framework for Innovation](https://www.designcouncil.org.uk/resources/framework-for-innovation/) and [GOV.UK, Alpha](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works): explore alternatives, make/test enough to answer important uncertainties, and revisit earlier conclusions. Adapt that learning loop without importing government assessment schedules, enterprise ceremonies or compulsory customer approval for every component.
