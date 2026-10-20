# Page Composition and Integrated Experience

Use this guide for a new page or material redesign, or when a review finds fragmented content, poor task-space allocation, or enhancements that are technically present but do not improve the experience. It works without the development conversation or the private projects that exposed these problems. Isolated copy/color repairs do not need a new composition exercise.

`../SKILL.md` owns required capabilities and exemptions. This guide explains how to compose them into a page; it does not make React, the primary UI system, typography, GSAP, or other default categories optional. `visual-qa.md` owns verification scope. The examples below illustrate decisions, not fixed templates, required dimensions, or new features to add to every product.

## Contents

- [Start from a task and its relationships](#start-from-a-task-and-its-relationships)
- [Choose a structure that expresses those relationships](#choose-a-structure-that-expresses-those-relationships)
- [Develop visual character, not just a clean wireframe](#develop-visual-character-not-just-a-clean-wireframe)
- [Group without turning everything into a card](#group-without-turning-everything-into-a-card)
- [Repair a rejected layout family](#repair-a-rejected-layout-family)
- [Distinct works, not theme variants](#distinct-works-not-theme-variants)
- [Allocate usable space across modes](#allocate-usable-space-across-modes)
- [Fit a reference to the task's real capacity](#fit-a-reference-to-the-tasks-real-capacity)
- [Preserve concurrent goals during a repair](#preserve-concurrent-goals-during-a-repair)
- [Integrate capabilities without token adoption](#integrate-capabilities-without-token-adoption)
- [Worked example: a media review workspace](#worked-example-a-media-review-workspace)
- [Methods learned from primary design sources](#methods-learned-from-primary-design-sources)

## Start from a task and its relationships

A page skeleton is the arrangement of content, navigation, controls, and working space, including how that arrangement changes during use. It is not a loading placeholder or an application framework. Begin with the user's actual content, not a menu of hero, statistics, cards, chart, and form components.

Resolve these questions in the existing design read; no separate document is required:

- What is the user primarily reading, comparing, deciding, or changing? A report, a selected order, a photograph, and a story need different amounts and kinds of space.
- Which information belongs to that same object? Which items must be compared simultaneously, share a time/space coordinate, or remain visible during an action?
- What is the useful sequence? For example, find a record, inspect its evidence, change its status, and continue from the same position. Do not add steps to make the page look substantial.
- Which context may recede? Global navigation and occasional settings need not compete with the work. Do not hide evidence or controls needed at the current step just to obtain a clean screenshot.
- Which real modes change these answers? Audio versus video, reading versus editing, and overview versus close comparison may need different allocations while retaining selection, drafts, and familiar control meanings.

For example: “A reviewer selects a spoken line, sees the matching video frame and time range, writes a note, then continues at that position.” This determines coordination between regions. “A dashboard with five stylish panels” specifies containers but explains none of those relationships.

## Choose a structure that expresses those relationships

Consider structures by what they let the user do. These are alternatives to reason about, not a required set, a layout picker, or six reusable page shells:

| Content relationship | Useful structural direction | What must stay coherent | Common misuse |
|---|---|---|---|
| One object with several tools | A continuous working surface with nearby controls and contextual inspection | Selection, object visibility, and tool feedback | Making player, settings, annotations, and status equally prominent cards |
| Many records, one active record | A list/table with in-place detail or a dedicated detail view when space requires it | Active record, filters, scroll position, and a clear return path | A permanent three-column shell regardless of content or available width |
| A genuine comparison | Aligned rows, shared axes, synchronized views, or a justified before/after treatment | Matching fields, units, time, and object identity | Separate attractive cards that require remembering values or compare unrelated assets |
| Time, geography, or spatial relationships | A timeline, calendar, map, or canvas as the working surface | One coordinate system and a clear connection to selected details | Hiding the relationship inside summary cards and treating the real view as decoration |
| A developing argument or story | Continuous editorial reading, steps, or a persistent visual that changes with the explanation | Reading order, state continuity, and understandable backward navigation | Making each sentence a new block, or pinning the entire page because a demo did so |
| Independent items to browse | Cards, tiles, a catalog, or a real Kanban board | Item identity, comparable metadata, and meaningful grouping | Treating every fact about one item as a separate independent item |

Keep useful consistency within a product: the same action should retain its meaning, and navigation should not move merely to appear novel. The stricter distinctness rules in `SKILL.md` apply when a collection is explicitly meant to demonstrate different designs. They do not require every screen of an ordinary application to invent a new navigation system.

## Develop visual character, not just a clean wireframe

While exploring the content relationships, develop their visible expression before expanding the full application. Work on the ordinary task state alongside the opening, inside the representative drafts or isolated real-component sample rather than a separate brand dossier:

1. **Derive a visual grammar from the subject and reference.** Name the recognizable object or content rhythm, actual type roles/scales, contrast and surface relationships, and the relationship that changes during the main action. A catalog might draw rhythm from spines and title proportions; an analysis tool from aligned traces. Those are possible translations, not required metaphors or permission to invent a mascot, data or features. Retain specific reference combinations rather than only its palette or large heading.
2. **Compose one populated working cluster.** Put the actual object/record title, identifying icon or symbol, metadata, current state and next action together at normal size. Choose their relative scale, alignment, spacing, color and edge treatment as a combination. A reading item, editable field and completion action need recognizable functional identities within one family; they need not use unrelated shapes. Repeated records may correctly repeat the same row design.
3. **Carry the grammar through ordinary use.** Show selection, a populated edit/input state with representative long text, and its visible continuation when those actions exist. Decide which identity cue and context remain, which surface changes, where primary and secondary actions sit, and how labels, focus, validation or pending feedback fit. Do not attach an unstyled default form to an expressive cover. A tiny decorated submit button cannot rescue an otherwise unrelated work state.
4. **Resolve local separation and overall connection together.** Give distinct functions readable local boundaries where needed, while sharing deliberate alignment, type/icon rhythm, surface transitions and action relationships. Inspect the adjacent regions together. Removing borders, adding curves, changing every row or enlarging whitespace cannot substitute for that composition decision.

Use the primary UI system for applicable ordinary controls and composite behavior, not only Button and Input. Its Form, Select, Tabs, feedback, dialogs, lists/tables and navigation remain candidates according to their real jobs; do not add nonexistent features to use more components. Style and arrange their tokens, labels, icons and surrounding surfaces into the chosen grammar. Keep accessible states and semantics, the required font/specimen checks, and the related [control response](motion-scroll-and-3d.md#buttons-and-control-feedback). A high coverage count is adoption evidence, not design evidence; bespoke replacements are not the remedy for an ordinary composition.

Give each candidate a short explanation of its concrete decisions, not a style nickname. With the same content and viewing scale, compare three different questions: **is the organizing relationship different where requested; does it support the actual task; and does the visible combination achieve the desired character?** A grid, shared curve and matrix can pass the first question while all three remain visually weak. Use the selected reference and candidate side by side to locate the difference: type hierarchy, shape and spacing rhythm, contrast/surface treatment, and how those relationships survive an ordinary action. Point to the actual working cluster, not a list of adjectives. A reference's white dominant reading paired with a smaller warm-colored comparison is more specific than “premium dark UI”; copying its colors without that hierarchy is not equivalent.

Develop a weak candidate by changing the relationship responsible for the gap—for example, bringing a detached title and reading onto the same alignment, or reducing repeated empty framing while preserving the characteristic contour. Do not automatically make more skeletons or apply every possible correction. Do not remove imagery that is itself the content; inspect whether the interface is designed around it rather than relying on it to disguise a stock shell. Refine a strong direction before implementing several weak applications. These observations support a design recommendation, not an objective beauty score or user acceptance.

### Visible study: same controls, different working composition

These original, synthetic workshop-booking studies illustrate the method, not a model comparison or an accepted product design. Both use React and the same applicable Ant Design primitives: Button, Input, InputNumber, Select, Form and Tag. Rectangular surfaces and repeated rows remain in both; the distinction is their relationships, not a ban on either. The study is static evidence of two states, not proof of motion, persistence or the full required stack.

![Control coverage alone: opening and populated edit state](../assets/working-composition-coverage.png)

**Incomplete:** the booking list, selected-session facts and edit form occupy similarly framed, similarly weighted containers. Fields are operable, but the editor's labels and actions read as another generic panel. Component coverage is real; the selected session's identity and progression have little visual emphasis.

![A composed alternative: opening and populated edit state](../assets/working-composition-integrated.png)

**Proposed improvement:** the session title, date marker, activity icon, selected row and action share an alignment and limited color/type grammar. In editing, the same session identity remains beside the populated fields; the local surface clearly separates input without severing that relationship. Primary commitment and return are distinct in weight. Judge the visible combination and legibility, not the explanation alone; this example is not a universal style or evidence of user preference. Font provenance and scope are in [the study notice](../assets/NOTICE.md).

## Group without turning everything into a card

The “sticky notes on a wall” failure occurs when each function gets its own background, title, padding, rounded outline, and similar visual weight. The page may be tidy, but the user cannot tell what matters or which pieces belong together. This describes the rendered composition, not a component name: several large custom `div` panels can reproduce the same problem without using a single `Card`. React componentization and Ant Design use do not require this visual fragmentation; reuse their controls without automatically enclosing each function.

Start with alignment, proximity, typographic hierarchy, common background, and a shared coordinate system. Add a boundary when it communicates independent identity, a distinct action context, a necessary scroll region, or meaningful contrast. A task card on a Kanban board has an independent identity; the playback button, timecode, and volume control for one player usually belong to one control group.

Neither removing every border nor giving each box a different shape fixes a weak hierarchy. A card-based catalog can be excellent, and an unboxed page can still be an undifferentiated wall. Ask whether the main task is perceptibly dominant and related information is read together, not whether the card count is below an arbitrary limit.

Use visual contrast intentionally: one working area can be broad and dense while secondary metadata is compact. Do not enlarge empty space or a decorative heading at the expense of readable task content. Rich illustration, expressive typography, and atmosphere remain valid when they express the actual subject rather than competing with it.

## Repair a rejected layout family

Use this method when the user rejects a structure or overall direction, not as a new ceremony for routine edits. Name the rejected visible relationship from actual feedback—for example, “three equal full-height islands, with an always-visible form competing with the reviewed object.” Ambiguous “professional” or “AI-generated” feedback routes to [clarification](feedback-clarification.md) only when available evidence cannot distinguish the needed revision.

An authorized full overhaul starts from actual content and the confirmed brief, not the previous component tree. Preserve data, permissions, accurate coordinates, persistence, and expressly retained functions; layout, scale, grouping, visual language, and interaction presentation may change. Familiarity or a smaller diff does not justify keeping the old composition. A targeted correction still stays inside its scope.

Form a positive whole-design proposal before assigning tool slots. Describe the dominant content, secondary relationships, actual typographic scale/placement, surface/material/contrast treatment, and the change through one meaningful action. Show those together in a small rendered sample with representative content, not a list of adjectives or a monochrome outline as the final design. Consider a genuinely different concept if the first is ordinary; merely avoiding cards/columns proves no visual identity.

Use a simple outline to catch recurrence of the rejected topology, then judge the styled first impression and ordinary action state. A clean cover that opens the old card wall on first use is not a structural repair. Neither a lower card count nor a borderless/full-screen stage establishes a better concept. Preserve readable task content; arbitrary empty space or huge decoration can be a different failure. Identify which concrete decisions give the design its character and how those decisions develop during the main action. For example, a large timecode may establish an expressive opening, but deleting it when an ordinary note opens can leave an unrelated stock player-and-form view. The timecode need not stay huge or in the same place: it could change scale or join the selected frame and note target through a visible, coherent transition. Test whether that proposed relationship actually improves this task and preserves the intended character; do not prescribe a giant clock or this arrangement for other products.

Match the sample to the requested stage and result objective. New pages and substantial redesigns default to [progressive design and layered selection](layered-design-selection.md): start with the task/content relationships, explore structure and visual language together, and develop a promising direction into one integrated key-page sample before expanding full implementation. Include important data views and motion early when they can change the composition; a motion-led concept need not wait for a final static skeleton. A skeleton choice is a working hypothesis, not a freeze on proportions or approval of unseen components. Show actual hierarchy, type, surfaces, chart/table allocation and action relationships together. Isolated playable samples may use real components with labeled fixtures/simulation or safe existing content. A storyboard describes intended motion, not its feel or runtime adoption. Do not rebuild APIs, media processing, persistence, or a full feature set to make the visual sample “complete.” Use the guide's shortcuts for confirmed designs, local repairs or explicit autonomous delivery. For product delivery, inspect the relevant real sequence and continuation. Required capabilities still govern implementation; mark incomplete integration honestly rather than inventing an exemption.

Use [concrete reference evidence](open-source-ui-sources.md#preserve-concrete-reference-evidence) to design a recognizable adaptation, not to impose its scenery or only assert a principle. Whole-experience evidence should settle a specific spatial/behavioral question; isolated button/API demos cannot settle that question. No new site quota or full re-research is needed when the relevant evidence already exists.

Finally ask whether the proposal itself meets the intended impression, subject, content density, and operation—not only whether each correction is present. Functional synchronization, a working save, or reference-trait resemblance are separate evidence. When the whole concept still fails, change the concept before polishing or expanding it. Do not make “all requested details present” the stopping condition.

**Counterexample.** Moving an occasional opinion form out of a permanent column can solve fragmentation, but a deep bottom timeline can still shrink portrait footage into an unreadable strip. A more dramatic opening image can hide that same bad editing state. Inspect actual media/text proportions and the open action state at the same viewport; preserve selection, evidence, time range, and continuation without prescribing one universal panel arrangement. A persistent inspector remains valid when simultaneous comparison really requires it; cards remain valid for independent items.

## Distinct works, not theme variants

Apply this only to a gallery, concept set, or collection explicitly meant to demonstrate different designs. A normal product may use consistent navigation and interaction. Separate the collection shell (search, filters, neutral metadata/navigation) from each work's internal composition, media rhythm, content topology, action locus, scroll progression, motion grammar, and ending. A preview must represent its actual work, not a separately polished poster.

Before implementing such a set, keep a compact comparison in the existing design note: product/user/task, opening and dominant masses, detail/overlay carrier, primary action or reading progression, main transition, ending, and authentic content source. Include phone/tablet transformation only if those targets are required. Name the intended difference: structural alternatives must differ in content organization, while motion-only studies may deliberately retain a confirmed layout. For structural alternatives, compare opening and action-state outlines with color, radius, shadow and motion removed. If each is still “main object plus the same inspector and auxiliary cards,” different entrances do not make different skeletons. Change the organizing relationship before coding more variants; do not merely hide borders or rename the shared container. For intentionally different complete works, also compare skeleton + detail carrier + scroll + primary motion; repeating that combination needs a genuine shared task/content reason. Do not default every work to the same Drawer, Modal, three-column editor, hero-to-sections sequence, or reveal preset.

When feedback says “they still look the same,” check which relationship actually repeated before assuming the problem is easing or palette. Retain any liked candidates and compare the next structural proposal against them; “more options” does not mean discard previous preferences or derive every option from their composed shell. Reuse content, semantic controls, state and lifecycle utilities, but a shared visible form/card wrapper is itself a design choice. Cards remain valid when their independent-object meaning fits; acceptance of a card-based candidate is not a reason to give all future proposals that structure.

When the user explicitly requires zero visible reuse, follow that stricter boundary: compare textless outlines of the opening and main action states. Each work must own its visible navigation/return placement, dominant masses/axis, metadata, controls/progress, detail carrier, media proportions, page edge, scrolling, and main choreography. Two works that fit the same wireframe fail that contract. Keep the mandatory Ant Design primitives, but compose/style them into different structures; invisible React lifecycle, data access, fallback, and build infrastructure can remain shared. Do not apply this exceptional novelty rule to ordinary related product screens.

For broad product showcases, let genuine tasks yield different architectures—analysis, monitoring, planning, review, operations, or expressive exploration where authorized. Do not turn every subject into a poster/landing page, add routes merely to fill a taxonomy, or distort a useful product for novelty. Extract shared visible components only after related needs are proven, not before designing the works.

## Allocate usable space across modes

Judge the displayed object, not just its outer container. A tall video fitted inside a wide, shallow player will remain narrow even when the surrounding panel is huge. With contain-style fitting, displayed width is limited by both container width and container height multiplied by the media aspect ratio. Extra horizontal space alone cannot solve insufficient height; cropping is not a fix when review requires seeing the complete frame.

For a bounded workspace, consider headers, controls, the main object, supporting regions, and the available viewport together. Enlarging one row consumes another row's budget. Choose proportions and minimum usable sizes from representative content and the actual task, not a universal pixel constant or a fixed “two-thirds main” rule. A minimum CSS height proves an allocation exists, not that subtitles, fine detail, labels, or editing controls are usable.

When content or mode changes, reclaim space that no longer serves the task. An audio-only mode may prioritize waveform, transcript, and notes instead of retaining a video-sized panel for a slogan. A portrait-video mode may move or reshape supporting regions to preserve frame detail. Keep primary actions available, preserve state during the change, and make the mode understandable. Do not automatically implement a new mode if the product does not need one.

Resizable panels and contextual disclosure can help, but the initial layout must already work. Do not require the user to discover a splitter before the primary task becomes possible. On a smaller screen, use an explicit focus/detail transition when simultaneous views cease to work; stacking every desktop region is not the only option. Avoid hiding necessary comparison information behind tabs just to fit more regions.

## Fit a reference to the task's real capacity

Use this when adapting a reference to a bounded working window, especially when several records must be monitored or compared together. A desktop tool may normally occupy a small window beside another application; desktop-only does not imply a full-screen browser. Use the actual usual window/content viewport, including real chrome. A wider promotional capture is supplementary, not a substitute. This is part of composing the sample, not another approval checkpoint.

1. **Define a useful visible unit from the task.** What must the user read together for each item: identity, current state, primary reading, unit, comparison or next action? Separate that from occasional detail. A card edge, clipped title or offscreen number does not count as a visible summary. Use the expected number of items and representative long names, unknown/waiting states and real value lengths; label permitted fixtures. Do not choose only three short successful records because they flatter the reference.
2. **Budget the whole window before preserving a reference's dimensions.** Subtract actual title/header/filter/group/footer space from the viewport. Fit the useful units in what remains, checking both height and title/number width. A rough calculation can expose a bad premise: with 420 px left for two rows and a 12 px gap, each row has about 204 px—not 290 px. These are illustrative numbers, not required sizes. If the content does not fit readably, change the allocation rather than force it into that budget with tiny type, clipping or hidden overflow.
3. **Separate character from dimensions that served another task.** Identify the concrete combination worth retaining—such as a dark continuous surface, rounded contours, white primary numerals, warm secondary numerals and aligned labels. Compare one populated unit and its repetition in the actual window. Reduce redundant labels/chrome and unused space before reducing meaningful type; try a different aspect ratio or summary/detail relationship while retaining the recognizable combination. Do not assume every large reference object needs the same height in a monitor. Conversely, do not flatten a chosen expressive design into a stock table merely because a table is easier to fit. Show the adapted result and explain a significant departure from the chosen trait.
4. **Spend space according to the current action.** If continued monitoring matters during inspection, keep the required live summaries readable while giving the selected history sufficient room. Detail may reuse a region, rearrange secondary material or enter a deliberate focus mode when the task permits it. Merely scrolling a tall selected card into view can hide all the other identities. Follow the selected object through the transition and return; keep its identity legible and required controls available during motion. An opening that fits but an inspection state that loses the primary task is not a successful allocation.

If the ordinary content cannot fit at the intended size, show the concrete conflict and recommend the least costly change. Distinguish “the routine comparison fits; an unusually large set scrolls” from “the routine comparison already needs scrolling.” Scrolling is valid for browsing or agreed overflow, but is not simultaneous visibility. Neither an “all items fit” quota for unlimited data nor a ban on scroll follows from this method.

**Worked adaptation: a compact instrument monitor.** This is a fictional teaching case, not a validated UI or a prescribed template. A user likes a reference with three tall dark instrument capsules, large white readings and gold secondary values. Their tool normally shows five instruments together in a 600×640 window, distinguishes active/idle devices, and opens one instrument's history. A two-row version of 290 px capsules keeps the silhouette, but headers and controls push the lower readings below the fold. Selecting a lower capsule and scrolling it into view removes the upper identities. Calling this “compact” only compares it with taller capsules; it does not answer the monitoring task.

Try an adaptation of the chosen character, not a forced return to an unrelated style: compose a shorter capsule from the real name, state and paired readings; remove duplicated counts and empty chart reservations; put the actual history where it is useful during inspection, while keeping the required overview legible. A no-record item says “No completed reading” rather than presenting a large empty graph. Compare that populated opening and selected state with the source: are the contour, numeral contrast and repeated rhythm still recognizable, and can the five instruments actually be monitored? A selected-history transition can connect the same instrument identity to its larger plot while the other summaries stay available; implement and watch that sequence rather than infer it from two stills. The required chart, Canvas and motion owners still need meaningful roles; this example does not waive them or justify extra display panels.

If the preserved tall silhouette and the required routine capacity genuinely cannot coexist, make that specific tradeoff visible. A preference for the reference is not permission to silently sacrifice capacity; a request for compactness is not permission to discard its character. The real candidate and user response decide whether the adaptation works.

## Preserve concurrent goals during a repair

Use this when a local correction changes space, ordering, grouping, visibility or continuation. In the existing brief, carry forward the earlier requirements that the proposed change can affect. Pair the new complaint with them before choosing the fix; do not turn this into a full requirements ledger.

For example, “items jump when their state changes” may coexist with “separate active and idle items by default,” “show several items together,” and “let me order them manually.” First locate the movement: sorting by a live value, movement within a group, transfer between groups, or a neighboring detail expansion. Each needs a different response. Manual order within groups fixes value-based sorting but does not fix group-transfer movement. A permanently fixed mixed list fixes movement by dropping the grouping requirement; hiding grouping in a menu is not an equivalent repair.

If live membership in spatial groups and completely fixed positions genuinely conflict, expose that exact conflict rather than silently choosing a weaker contract. For example, updating state in place and deferring transfers until an explicit regroup action preserves positions but temporarily makes the spatial groups stale; a continuous transfer keeps groups current but still moves the item and may disturb tracking. Show the relevant state change and its cost, and ask only for the unresolved semantic choice if existing instructions do not settle it. Do not make either alternative the default for all products, label stale groups as live, or use smooth motion to claim that positions no longer move.

After a change, follow the same ordinary sequence through the corrected moment and continuation. Inspect both the corrected defect and the affected earlier goals. This may mean one status transition and return to overview, not a full application regression. A larger waveform that makes the frame unreadable and a stable list that loses required grouping share this failure: a local success has been bought with an unapproved loss elsewhere. Preserve the new improvement while revising the shared relationship, or surface the genuine conflict.

## Integrate capabilities without token adoption

Keep these answers in the existing inclusion plan, not in a second report:

1. **Host:** Which existing product object, content, dataset, state, interaction, or established visual motif owns the enhancement?
2. **Meaning:** What will the user understand, accomplish, notice, or feel because it is present? “More premium” is not specific; “the selected line and its time range remain visibly linked while the reviewer seeks” is.
3. **Control:** Does direct manipulation serve a real task or accessibility need? Do not expose reset, speed, rotate, pause, or view controls merely because a demo has them.
4. **Observable result:** In which ordinary state or action will that contribution be apparent? Define the result in product terms rather than import count, library names, or animation duration.

Choose a footprint that retains that result:

- **Structural:** powers an existing workflow or real data view, such as a chart that exposes a meaningful comparison.
- **Behavioral:** improves a transition, feedback loop, navigation path, or scroll path without adding content.
- **Accent:** gives an existing region a subject-specific visual character without inventing meaning or stealing task space. For example, a restrained material texture may reinforce an established print/publication direction; unexplained particles added to a review player only to host Canvas do not establish the same fit.
- **Infrastructure:** improves loading, rendering, packaging, measurement, or maintenance without needing a visible demonstration. State the actual gain or diagnostic purpose; invisibility alone is not a benefit.

The smallest honest footprint is the smallest one that still delivers the declared result, not a direction to minimize visible ambition. “Restrained” describes a deliberate hierarchy and finish; it does not justify default styling or nearly imperceptible effects when the brief calls for a distinctive experience. If a newly added region only advertises its implementation, remove that region and redesign the integration. Shrinking a meaningless effect into a corner does not cure it. This rejects the proposed role, not the required category: actively find a useful role or permitted compatible owner, use only the existing hard-exemption paths, and surface a genuinely unresolved conflict rather than claiming completion. True 3D separately stops when its suitability gate fails.

**Counterexample: a technically real but questionable chart.** An interval strip may use authentic transcript times and a real chart library while separate DOM controls perform all selection. That is real use, not fabricated data, but it does not by itself explain the library's contribution. Ask what the visual lets the user distinguish at its actual size, whether timing/selection is coherent, and which useful rendering or interaction responsibility the owner carries. A compact strip can be appropriate; making it large to advertise the dependency is not the solution. Compare roles and compatible implementations using the existing selection rules. Preserve truthful interval visualization and click-to-seek behavior rather than deleting the capability to reduce dependencies.

Treat cost evidence precisely. An unusually large output chunk warrants checking imports, splitting, and the assigned responsibility. Uncompressed bytes are not measured download, parse, memory, or interaction delay; lazy loading is not proof of zero cost. Use an existing build report or a focused measurement when cost could change the decision, not a new performance campaign for every small component.

**Counterexample: motion present is not a redesign completed.** A brief selection highlight can be excellent feedback; it may be exactly the right motion for a dense workspace. It cannot fix an unreadable primary object or disjointed editing flow. Conversely, do not dismiss quiet feedback and add a dramatic entrance merely to prove GSAP use. Compose motion around the meaningful relationship: selecting a line may update the frame, playhead, range emphasis, and contextual note target while keeping controls stable. Judge that visible result, not the number or duration of tweens. `motion-scroll-and-3d.md` owns implementation, ownership, and reduced-motion rules.

## Worked example: a media review workspace

**Situation.** A user reviews a rough cut, finds a problem through playback or transcript, optionally marks time and image regions, writes a note, saves it, and continues. The same product supports audio-only media. The waveform must reveal pauses and changes in loudness, while the complete video frame must remain readable enough to review subtitles and visual detail.

**Tempting but incomplete fix.** Make a short waveform much taller inside the existing height-limited grid. The waveform now passes a height check, but the video row shrinks; portrait footage fits into a narrow strip, and fewer transcript lines remain visible. In audio mode the old player area becomes a large prompt. Every requested control exists and local interactions pass, yet the task is still awkward. Merely shrinking the waveform back sacrifices the original requirement rather than resolving the competition.

**A coherent design response.**

- Treat frame, transcript position, waveform cursor/range, and note target as views of the same selected media/time state, not independent decorated panels. Store or derive their coordinates consistently.
- Allocate the video-review view using real portrait and landscape material when both are supported. Reduce redundant chrome, move occasional settings out of the primary area, or change the relationship between player, transcript, and timeline when the available height cannot support the old arrangement. Choose among those options from the product's task; this is not a prescribed three-column layout.
- Give audio review its own useful emphasis: listening controls, sufficiently detailed waveform, readable transcript, and reachable notes. Keep a current spoken line if helpful, but do not reserve a large empty video placeholder or design slogan for it.
- Preserve the product's input semantics. In a player where a click seeks and range selection requires an explicit mode, make that mode visible and keep ordinary seeking predictable. Do not copy a demo's drag behavior and silently change the contract.
- Tie a selected transcript line to the matching time and frame. Keep the active line visible without repeatedly overriding a user who is manually browsing. After saving a note, preserve the relevant position and show the saved note or truthful save status in context; do not manufacture persistence.
- Use concise product copy. “Select a time range, then add a note” explains the next action; a large poetic instruction about listening does not replace the working area. A loading label remains truthful while work is pending and should not disguise a stalled state as ready.

**What would count as usability improvement.** At the affected viewport and mode, a reviewer can read the actual frame or transcript, identify a meaningful audio interval, reach the associated note action, and continue after saving without losing position. If a size adjustment improves the waveform but makes subtitles unreadable, the result still fails. These are task-based observations, not universal minimum-pixel rules. They do not establish a successful expressive redesign: when the brief also asks for a striking visual identity and main interaction, judge those against the actual opening, action state, and transition. A readable, synchronized ordinary editor can pass this usability example while failing that design brief. For scoped verification and candidate-versus-normal-entry distinctions, use `visual-qa.md`.

**Limits.** This case does not establish that one library caused slowness, that all workspaces should share this arrangement, or that subtle motion is inadequate. Keep real media safety, input, persistence, and accessibility contracts. It explains a relationship failure, not a reason to rebuild unrelated backend or media-processing code.

## Methods learned from primary design sources

The following sources were reviewed on 2026-09-29. These are bounded design lessons, not a claim of full usability testing or instructions to install the source products' stacks. The explanations here remain usable offline; the links preserve provenance and let an Agent inspect relevant examples when research is needed. They supplement, not replace or expand into another fixed quota beside, the five-source pass in `open-source-ui-sources.md`.

### Linear: quiet structure and stable orientation

[Original design-team explanation](https://linear.app/now/behind-the-latest-design-refresh).

The team describes reducing accumulated visual separators and allowing navigation to recede after the user reaches the working area. Structure remains, but every boundary no longer demands attention. The article was revisited on 2026-10-02: it also separates location/orientation from view controls and keeps equivalent actions predictable across views. Apply this by reducing decorative density without reducing useful information density: subordinate navigation, group related controls, and preserve readable state differences. Do not copy its palette or infer that all separators, labels, colored status marks, or sidebars are bad; the aim is readable priority, not an empty interface. This is the team's explanation and illustrated examples, not a live product trial.

### IBM Carbon: hierarchy within a grid

[Grid usage and contrast examples](https://carbondesignsystem.com/elements/2x-grid/usage/) and [spacing guidance](https://carbondesignsystem.com/elements/spacing/overview/).

Carbon contrasts technically aligned content at similar scales with information grouped into a clearer hierarchy. Its improved example still uses containers: removing boxes alone is not the lesson. Apply alignment and spacing to express relationships, then allocate different prominence to different information. Dense product work can be appropriate. Do not import a fixed column count, spacing token set, or Carbon component system merely because its design explanation is useful.

### Frame.io: several views of the selected object

[Official panel overview](https://help.frame.io/en/articles/9101032-panel-overview).

The documented navigation, viewer, and detail panels let people inspect a selected asset while adjusting visible context and density. The transferable mechanism is retained selection and coordinated views, with supporting regions adaptable to the task. This was documentation evidence, not a logged-in product trial. Do not turn its panel arrangement into the default wireframe for every work surface or assume that resizability excuses a poor initial layout.

### The Pudding: structure follows the explanation

[Original guide to story structure](https://pudding.cool/process/how-to-make-dope-shit-part-3/).

The guide distinguishes stacked explanations, a visual that evolves through scrolling, and step-based progression; it does not present one universal template. Apply that choice to what a reader needs to understand: a complex relationship may benefit from seeing the same object change rather than repeatedly reorienting to new charts. Do not force pinned scrolling into ordinary tools, obscure essential information before an animation, or forget reverse navigation and reduced motion.

### Stripe Press: the subject becomes the composition

[The original designer's account of the 2021 project](https://yuinchien.com/p/stripe-press).

The designer describes translating the physical qualities of books into a digital presentation of their spines and covers. The lesson is to let the actual product shape the experience rather than append an unrelated effect to a generic layout. This is a historical design case, not a verified current interaction test. It does not make 3D mandatory: UI Done's spatial suitability and finish-quality gates still apply, and source images/code require their own permission before reuse.
