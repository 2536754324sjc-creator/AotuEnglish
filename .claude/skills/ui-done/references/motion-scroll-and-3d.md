# Motion, Scroll, and 3D

For substantial frontend work, motion, scroll enhancement, and 2D Canvas are three distinct default layers. Give each one a role that communicates hierarchy, feedback, state, narrative, atmosphere, or drawing, then tune its intensity to the product. Evaluate true 3D/WebGL separately and adopt it only when the subject is inherently spatial, it adds unique communication value, and the team can finish it to the required quality. A restrained dashboard and an expressive campaign page should use the default layers differently; neither should receive forced 3D.

## Choose one primary owner per layer

| Layer | Default owner | Boundary |
|---|---|---|
| Hover, press, focus, simple reveal | CSS for isolated states, coordinated by the selected motion system when sequencing matters | Do not split ownership of the same property between CSS and the motion library |
| Component state, presence, layout continuity | GSAP plus `@gsap/react` | Default primary owner for new pages, material redesigns and experience-level motion upgrades; scope it to the React host and clean it up on unmount/remount |
| Scroll storytelling | GSAP ScrollTrigger | Limit pinning and scrubbing to the narrative regions that need it; it owns choreography, not scroll mechanics |
| Smooth scrolling | Lenis through `lenis/react` | Default to it on the declared targets (desktop unless otherwise required) when the tested path works; preserve reduced motion, nested controls, anchors, focus navigation, and precise regions |
| Conditional signature 3D scene | Three.js through React Three Fiber, only after the suitability gate passes | Use R3F as the React scene boundary, keep it in one bounded product-aligned region, and provide a static/DOM fallback; otherwise do not mount or request WebGL |
| Separate 2D Canvas role | Pts for creative/programmed drawing or Fabric.js for editable objects | This is independent from the R3F scene; use DOM controls and labels for essential interaction |

Research current APIs, maintenance, license, and bundle behavior before choosing the owners. GSAP with `@gsap/react` is the starting and default primary motion selection; Lenis is the starting scroll-mechanics selection; Three.js/R3F is the starting 3D selection only after the suitability gate passes. Recheck selected packages at adoption time. Missing default coverage requires a permitted observed hard constraint, not merely “native is simpler”; scrolling additionally has the no-path condition below. A failed 3D suitability gate is a valid conditional decision and does not require a hard exemption.

For a new page, material redesign, or experience-level motion upgrade, inspect the official GSAP React guidance and a relevant live Demo Hub or Showcase example. Select for the dominant relationship being designed: a magnetic-button example alone cannot answer how a whole working state changes. Give GSAP a concrete job attached to existing content or state and record its host, behavior, page-specific adaptation, selected plugins, reduced-motion/static completion, and current Standard License fit. A package import, homepage mention, or shared generic reveal is not adoption.

When Anime.js is inspected in the required five-source pass, use it as idea-only evidence or a conditional alternative. Adopt it as the primary motion or timeline owner only through the exact GSAP hard-rejection gate below. Existing Anime.js ownership alone is insufficient: migration must be outside scope and no smaller non-overlapping GSAP job can avoid duplication. It may sit beside GSAP only for a clearly separate, non-overlapping role with a material advantage and an authorized dependency. Never layer it over GSAP, CSS, or another system controlling the same property, timeline, or scroll region.

Use Lenis as the only smooth-scroll mechanics owner. Its official React component/hook should wrap the intended root or bounded container; GSAP ScrollTrigger may consume scroll progress for choreography without becoming a second mechanics engine. Bridge update and refresh behavior deliberately and never add ScrollSmoother beside Lenis. Keep Lenis active across the declared device targets when it passes, and prefer excluding one incompatible nested region or scaling behavior before disabling it globally.

## Lenis path gate

Inspect document scrolling and real nested paths, including long content, opened overlays, keyboard/focus navigation, desktop resizing and zoom on the declared targets. A screen fitting at one wide viewport does not prove absence of scrolling. Do not hide overflow, truncate real content, or manufacture a long page to influence this decision.

- **A real path exists:** default to Lenis through `lenis/react`. Scope it to that path, preserve precision-critical regions, and exclude an incompatible nested control before abandoning it globally. Native-only behavior needs the observed hard-failure evidence in `selection-scorecard.md`.
- **No real path exists in the agreed surface/states:** record `Lenis not adopted: no real scroll path`, naming the inspected surfaces and conditions. Do not install or mount an idle smoother. This is a narrow applicability result, not a technical failure or an exemption for the other required layers. Revisit when content, layout or a new state introduces scrolling.

## GSAP default-adoption gate

For a new page, material redesign, or experience-level motion upgrade, treat GSAP omission as an implementation defect until one exact hard rejection is proved: the task is only an isolated copy/color/asset/token correction with no motion change; the user explicitly forbids GSAP or animation; the Standard License does not fit or the product may be a competing no-code visual web-animation builder without written permission; an established motion owner cannot be migrated inside the authorized scope and no smaller non-overlapping GSAP role exists; or a reproducible license, SSR, CSP, offline, browser, accessibility, performance, or runtime failure remains after a smaller role, selective plugins, responsive/reduced-motion handling, and a static fallback were tried. Record the evidence as `GSAP not adopted: hard rejection: <reason>`. Convenience, familiarity, deadline pressure, CSS sufficiency, or dependency count do not pass.

The GSAP runtime uses the Webflow/GreenSock Standard “No Charge” License, not MIT. The optional official `greensock/gsap-skills` repository is MIT-licensed guidance only and does not change the runtime terms or become a required dependency of UI Done.

When true 3D/WebGL passes the gate, begin with `three` plus `@react-three/fiber`. Add `@react-three/drei` only for named helpers the scene needs. Use direct Three.js lifecycle code only when a low-level integration does not fit R3F; do not choose Pts, Fabric.js, CSS transforms, or a static fake merely to claim that real spatial rendering exists.

## Fit before scale

Name the existing host, the interface job, and the smallest useful footprint before implementing a visible effect. The selected library adapts to the page; the page does not grow a showcase block for the library.

- Motion attaches to an existing state change, hierarchy cue, or feedback loop. Do not invent extra entrances, carousels, or controls to make the animation system visible.
- Smooth scrolling improves an existing scroll path. Do not create a long narrative section merely to demonstrate smoothing or scroll triggers.
- True 3D uses a product object, spatial relationship, real visualization, or established visual motif only when the suitability gate passes. Without a natural host or unique spatial value, omit it instead of shrinking it into a decorative object.
- 2D Canvas receives a different host and job, such as a restrained programmed texture, drawing layer, particle response, or editable object surface. It cannot be counted as the 3D role, and the 3D scene cannot be counted again as Canvas.
- Never add a large standalone 3D panel, scene label, explanatory copy, or control cluster whose only job is to prove that the engine was installed.
- A cluster of stock primitives with one global auto-rotation, generic three-point lighting, and palette swaps is not a finished signature scene unless the subject specifically calls for that object and motion. Establish a scene-specific subject, composition/camera, material/environment response, light hierarchy, and meaningful motion; post-processing may finish that hierarchy but cannot create it.
- Across a set of intentionally different pages, adopted 3D may become a hero environment, an embedded product object, a scroll transition, a spatial diagram, or a quiet accent when that exact role passes the gate. Some pages should have no WebGL at all. Do not append the same framed Canvas after the same content block on every route.

If removing a new visual region changes no product meaning and only hides evidence of the library, the region is filler. Remove it, then redesign the default effect's role using the meaningful-integration method in `page-composition.md`. Relocating or reducing it helps only if a specific contribution survives; a tiny arbitrary accent is still arbitrary. For 3D, a missing product role fails the suitability gate; do not force a replacement WebGL accent.

## 3D suitability gate

Evaluate 3D on every substantial build or redesign, but adopt it only when all four conditions pass:

1. **Natural host:** an existing product object, spatial relationship, real dataset, or established motif owns the scene.
2. **Inherently spatial subject:** material, volume, depth, or movement through space is central to the content.
3. **Unique communication value:** real 3D explains or expresses something that DOM, photography, video, SVG, or the required 2D Canvas layer cannot express as clearly.
4. **Finishable budget:** modeling, lighting/material response, subject-specific motion, responsive GPU cost, and a static/DOM fallback can all meet the delivery bar.

If any condition fails, record `3D not adopted: suitability gate failed: <specific reason>`. Stop 3D package and demo scouting for that surface before a serious candidate exists, and do not add, mount, download, initialize, or probe a WebGL runtime there. This is a successful evaluation, not a hard exemption. If all conditions pass, inspect the relevant official demos before selection and implementation.

## Geometry integrity and modeling finish

An adopted scene must pass all of these checks in several camera views and across its full animation cycle:

- No accidental mesh interpenetration, self-intersection, z-fighting, coplanar flicker, near/far-plane clipping, or animation-cycle collisions. Intentional structural joins, sockets, contact patches, nested shells, and atmospheric layers are valid only when their construction reads clearly.
- Stock boxes, spheres, cylinders, and toruses may support helpers, blocking, procedural construction, or an explicitly justified low-poly/technical language. They are not a finished-model strategy by themselves.
- The subject has one coherent silhouette, believable joins, intentional proportion and scale hierarchy, meaningful medium/small detail, and materials and lighting that reveal rather than flatten its form.
- Motion belongs to the subject: orbiting objects follow an intelligible path and orientation, mechanisms articulate at plausible joints, environments flow continuously, and nothing clips through another object during the loop.
- Post-processing may polish a good scene but cannot hide crude geometry, broken contacts, a generic primitive cluster, or weak framing.

## Prove host, meaning, and control

Reuse the Host–Meaning–Control answers and observable result from [meaningful integration](page-composition.md#integrate-capabilities-without-token-adoption); do not create another record. For motion, connect the trigger to the affected object, the relationship made visible, and the stable completion. “More dynamic,” “more premium,” and “adds visual interest” are insufficient without a specific connection to the content or established visual language. A decorative scene name such as “field,” “orbit,” or “spatial view” cannot create that connection. Rework an invalid default role; for 3D, a vague host or missing unique spatial value fails the suitability gate.

Prefer motion on a surface the product already expects—a promotional strip, schedule card, product object, map path, progress state, or real chart transition—over a separate animation surface. The reusable lesson is integration into existing content, not copying any particular marquee, orbit, or visual style.

For substantial new pages, material redesigns and experience-level motion upgrades, GSAP motion is a planned default, not optional polish. Give every page one primary motion signature tied to its content or task, then use quieter supporting feedback only where needed. In an intentionally varied set, do not let the same reveal preset, scroll entry, direction, or looping background become the primary motion of multiple works; shared code may manage scope and cleanup, but each page owns a visibly different trigger-to-completion choreography. Omission requires the exact recorded hard-rejection path above. Reduced-motion is a required alternate completion state, not evidence that the normal page may ship motionless.

A work surface's signature can be a precise, recognizable coordination of existing states, not necessarily a large entrance or ambient spectacle. Brief highlights may be useful parts, but a few tweens do not establish a complete dynamic experience. Use the sequence method below for a material redesign or a rejected motion direction; keep small motion repairs scoped. Reading tween parameters is not observing the rendered motion.

Treat visible controls as product features. Do not surface pause, reset, rotate, speed, view, or scene controls simply because the library provides them. Use them only when direct manipulation serves a real task or when an accessibility requirement calls for a user-operated mechanism. For ambient or decorative motion, prefer brief or bounded behavior plus automatic reduced-motion, hidden-tab, offscreen, and low-power handling. If continuous motion needs a pause mechanism, integrate it into the product's interaction language instead of attaching a generic engine toolbar.

## Experience-level motion upgrades

This route applies when the user asks to improve the interface's overall motion/interaction character, or rejects the current motion as absent, ordinary or insufficient. It is not a synonym for a full visual or business rewrite. A specified hover defect, stuck transition or easing correction remains local. Keeping the resting layout does not turn a sequence-design task into a micro-feedback task.

Recover the actual brief and inspect the ordinary action before choosing the footprint. Separate an explicit preservation boundary from your own assumption: accurate state, coordinates, input and persistence may be fixed while visual grouping, contextual disclosure or a transition between states can change within scope. Conversely, do not use a motion request as permission to replace an expressly retained layout. If the desired sequence truly needs a change outside the authorized boundary, explain that particular conflict instead of silently reducing the motion to highlights.

Choose the main sequence from the task, then compose the supporting controls around it:

| Role | Contribution | What it cannot substitute for |
|---|---|---|
| Primary transition | Makes a meaningful change of focus, relationship, working state or content progression visibly understandable and gives it the requested character | A collection of independent button nudges, input flashes and toast fades cannot stand in for an expressive main sequence merely because each uses GSAP |
| Supporting feedback | Makes activation, selection and truthful completion clear and responsive | Bigger press scales do not repair an unconsidered relationship between the affected regions |
| Optional atmosphere | Reinforces an established visual direction without taking task space or attention from the main action | An unrelated particle field, automatic entrance or infinite shimmer cannot rescue missing interaction design |

Use the existing [sequence method](#design-a-sequence-not-a-tween-quota) to decide what anchors, travels, reveals, changes emphasis and settles. Consider different choreographies rather than only different tween durations: retain one selected object while its context changes; reveal a related layer from its source; or coordinate entry/exit and typography to establish the next working state. These are possibilities, not mandatory layouts. Use GSAP timelines/labels for coordinated phases, [Flip](https://gsap.com/docs/v3/Plugins/Flip/) when genuine layout continuity needs it, or appropriate DOM/SVG techniques for the chosen treatment. Research only relevant techniques, and do not add plugins, scroll paths or 3D for coverage.

Before full application integration, follow the main entry's [progressive design boundary](layered-design-selection.md#prototype-motion-when-it-affects-the-direction): compare distinct motion directions on the same representative content, show a normal-speed labeled previsualization, then refine the principal sequence in the integrated key-page context. An isolated real-component prototype is allowed before full confirmation; it does not authorize business APIs, persistence or changing the normal entry. Do not ask the beginner to supply easing or library names. Reuse a confirmed applicable sequence; for an explicit defect, repair it directly. If rendered preview tools are unavailable, show a storyboard and name the unresolved feel rather than claim approval of motion that nobody could observe.

At normal size and speed, the main sequence should be recognizable through the changing relationship, not only because an overlay marks tween targets or a report points out a few pixels. Judge against the actual intensity and character requested; do not impose a minimum travel distance, a long delay or spectacle on precise repeated actions. A quiet sequence is valid when it meets that brief, not merely because the page is a work tool. The [motion outcome check](visual-qa.md#motion-outcome-not-only-motion-execution) distinguishes execution from that judgment.

**Counterexample.** A user asks for a distinctive transition through an existing workspace. The implementation retains the entire presentation without checking whether that is required, adds slight label movement, a sliding tab underline, a field flash and a saved checkmark, then reports “the interaction chain is complete.” Those can be good local improvements and real GSAP use. They do not establish that the requested main transition was designed or that it is perceptible in the full interface. Revisit the sequence and demonstrate its actual contribution; do not discard useful feedback, arbitrarily multiply every duration, or treat a larger import list as the fix.

## Design a sequence, not a tween quota

Start from the real subject/task, user action and available visual direction, not an animation preset. When a confirmed design exists, keep its unaffected choices. When motion itself determines the emerging identity or allocation, [prototype that concept early](layered-design-selection.md#prototype-motion-when-it-affects-the-direction), alongside structure/type exploration instead of waiting for a final static layout. Refine it in the integrated key-page context before expanding implementation. This is a valid motion-led route, not a requirement to put animation first in every product. If “not premium” or “not smooth” still has incompatible meanings, use [feedback clarification](feedback-clarification.md). Do not equate polish with stronger easing, longer travel, more effects, or automatic dark/glass/neon styling.

In the existing motion commitment, explain the before, transition, and after of one representative sequence. Identify what remains anchored, what changes prominence or position, how related elements respond together, and how the user continues or reverses the action. Choose timing, easing, emphasis, and depth to express that relationship. No additional animation inventory or fixed duration is required.

Make that proposal visible at the current design choice, not only in the research notes. If the relevant example uses shared-object travel and neighboring elements making room, a later panel-height tween is not the same choreography merely because both are called “expansion.” Preserve the defining relationship in the playable study, or explicitly propose a different treatment and show why it fits. A legitimate quieter adaptation is a design choice to judge, not an invisible default imposed because the product is a work tool.

Use the sample's ordinary actions to distinguish implemented motion from intentions. For example, opening detail, changing the selected record, changing a time range, and manually reordering may expose different transitions. Design the affected relationships with one primary owner; a successful open animation does not prove the others. Not every action needs travel: immediate authoritative values, a stable list order, and reduced-motion completion can be correct. State that decision when it matters, and show how context remains coherent. If a chart renderer's animation is disabled to avoid conflicting ownership or inaccurate interpolation, do not then count range switching as animated without a separate observed treatment. This is a focused check of the promised experience, not a demand to animate every cell or expand every task into a motion audit.

For example, in an evidence-review tool, selecting an item can establish the matching range and evidence immediately; opening an annotation can then make the change of working space understandable while keeping the subject readable; saving can connect the result to that same object and return to inspection. This does not prescribe a sidebar, require every element to move, or justify delaying a seek/save response. A form fading in by itself while the subject abruptly shrinks, the active label disagrees, and the user must hunt for continuation is a failed sequence even if that fade is technically smooth. On an expressive page, the same reasoning may produce a bolder subject-led entrance or scroll transformation instead of a work-tool pattern.

**Worked example: from comparison to one subject.**

Use this example when an interface genuinely moves between comparing several records and examining one of them. It demonstrates the relationship to design, not a required chart-above-list layout or a reason to turn every page into an analysis tool.

Suppose the chosen composition has a shared trend view above a record index. The user says, “One area animates, but the rest of the page feels unrelated.” First identify what the action changes: which record becomes the subject, which peers remain available, and what useful detail receives more space. Making the existing animation larger does not answer those questions.

| Moment | One coherent treatment | What would break the relationship |
|---|---|---|
| Overview | Show representative records with stable identities and meaningful comparison information; keep navigation anchored | An attractive empty composition that only works with one short record |
| Select | Carry the selected record's identifying label, marker and reading from its index position into the focus area. Let the peers make room and the related visualization occupy the released space in the same sequence | Duplicate the title above while leaving an indistinguishable selected summary below; grow a panel without showing what moved or why |
| Examine or switch | Keep peers legible and selectable. Reveal useful evidence for the current subject; when another record is chosen, hand off from the current visible pose rather than replaying the page's entrance | Animate every region independently, hide the peers to create space, or restart from an obsolete position on a rapid second click |
| Return | Rejoin the record with its index in the established order and restore a useful reading position; the visualization returns to comparison | Remove the subject before its return, leave a duplicate or empty slot, or restore a title outside the viewport |

Make the relationship survive real content, not only the demonstration's tidy records:

- **Recognizable identity:** the index, chart/legend and focused subject use the same durable record identity and visual cues. Assign a color to that identity, not the filtered row index. A hash into a short palette can still give several visible records the same color: inspect the actual comparison set. A retained ID-to-palette assignment can avoid collisions while slots remain; use readable labels or line/marker differences when color alone is insufficient. Reordering or refreshing must not silently recolor the subjects. This does not require a global identity service or unlimited unique colors.
- **Content changes are not navigation:** update truthful readings and status without replaying the selection choreography. Preserve selection, useful scroll position and the product's ordering/grouping policy. Give expected state labels and value lengths sufficient room so a routine change such as “Active” to “Waiting for records” does not unexpectedly push the neighbors away. Choose alignment, reserved status space or deliberate reflow for the actual content; do not impose a universal fixed height, cut off the meaning, or suppress a valid state change to keep the animation tidy.
- **Data meaning stays authoritative:** do not manufacture count-ups, bridge missing measurements without the product's stated semantics, or silently change the time range. A zero, a missing measurement, no recent observations and a rendering failure are different states. If the real content cannot fit this treatment, change the allocation or choose a different choreography instead of truncating it to imitate the example.

Inspect the in-between frames as well as the endpoints: a moving label may need a temporary separating surface, stacking order or a different path so it does not merge with text it passes. End that temporary treatment after completion or interruption; do not leave an opaque panel or blocked controls behind. It is an option for readability, not a new permanent card or a mandatory effect. Try the same action with long labels, a missing measurement and a second selection before completion, then let an ordinary data refresh arrive without another click. The transferable result is that the subject, context and continuation remain understandable together; other tasks may express that through a tab handoff, a source-linked reveal or an editorial progression with no traveling record at all.

Treat three different effects separately:

- **Scroll mechanics:** wheel/touch movement within a particular container. Lenis on one list proves only that path, not a smoothly coordinated whole page.
- **Automatic following:** bringing an active line or object into view. Immediate positioning can be correct for precision or reduced motion; otherwise judge jumps, continuity, cancellation, and interference with manual browsing. Never smooth the authoritative media clock or drag coordinate just to make movement look fluid.
- **UI transitions:** opening, closing, changing modes, reallocating space, and showing outcomes. Design these explicitly with the chosen motion owner; a scroll library does not supply them automatically.

Try the sequence at normal interaction speed, including an early reversal or a second selection while movement is in progress. Judge whether the eye can follow the subject, the new state feels intentional, and the controls remain responsive; also inspect the settled composition. A static screenshot, a package import, a high frame rate, or a handful of fades cannot alone demonstrate that result. Keep good quiet feedback, but do not use “this is a work tool” to excuse an unconsidered visual identity. Fix the relationship rather than making disconnected effects larger. Use the existing reduced-motion and ownership rules for the alternate path.

### Keep state boundaries continuous

Inspect the handoff into and out of the timeline, not only its middle. A fast animation can still feel jerky if the click handler first changes the font size, resets a transform, seeks the media, or snaps an unfinished entrance to its endpoint. Diagnose that discontinuity separately from dropped frames. Immediate settlement may be appropriate for reduced motion or a required fallback; settle the intended current state without obsolete business callbacks, rather than using it as a shortcut for ordinary interruption.

| Boundary | Implementation method | False fix |
|---|---|---|
| First visible change | Compare the settled pose immediately before input with the first visible pose afterward. Capture required geometry before a class/state change. Animate from the current pose; if a tilt is part of the choreography, travel into that tilt instead of setting it instantly | A smooth tween begins only after a visible size/position/rotation jump |
| Early input or reversal | Retarget from the currently rendered state or reverse a compatible timeline, including while entrance motion is unfinished. Cancel obsolete callbacks without forcing the old animation to its endpoint or reverting the visible surface to its initial pose. Check the selected layout-animation API's capture behavior: a snapshot helper may itself settle an active animation, so taking a snapshot is not automatically a read-only operation | Calling `progress(1)`, `finish()` or a visual reset just to make the next animation easier; capturing geometry only after an implicit completion; completion may also run stale side effects |
| Media and other expensive state | Keep UI opening/closing separate from playback, decoding and data work. If the product intentionally returns to a reference frame, seek only when the current media/time actually differs, using tolerance appropriate to its accuracy contract; handle media readiness and changed targets | Re-seeking the same frame on every expansion, hiding a real time difference with a coarse tolerance, or restarting unrelated work from a visual-state effect |
| Settling | End masks, clipping layers, transforms and hit testing in the intended usable state, including after an interrupted path. Check combined pixel/percentage offsets and remove only obsolete properties; retain required final transforms and lifecycle cleanup | A successful click test or completed timeline leaves a visible curtain over content, or cleanup snaps the settled result back |

For a fixed-content, same-aspect-ratio move/resize, prefer transform-based geometry or an appropriate Flip transition over repeated width/height changes. A display phrase that only changes visual prominence may keep its layout metrics and scale continuously; text that must genuinely reflow needs a layout-aware treatment instead. Preserve readable settled text, caret/focus behavior, clipping and pointer-to-content coordinate mapping. A real row expansion must allocate space and move its neighbors; bounded layout animation can be correct there. Do not flatten every transition into transforms or shrink the design to get fewer layout events. Measure only the affected cost with the [validity checks](visual-qa.md#valid-motion-performance-evidence).

## Buttons and control feedback

Use this method for the local feedback layer when designing or changing buttons, tabs, toggles, menus, and their outcomes. For a broader interaction request, first choose the [experience-level sequence](#experience-level-motion-upgrades); this state table does not define the whole assignment. Work from the actual action and the page's visual language; do not give every control the same bounce, shine, magnetic pull, or looping border. A high-frequency transport or editing control needs immediate, stable feedback; a rare expressive call to action can afford more character. Calm does not mean an unstyled default, and expressive does not mean hard to hit.

### Compose one response from input to outcome

For the affected control, inspect the states it really exposes. Do not add network requests, progress, or a success state to an action that has none.

| State | Design and implementation decision | Failure to avoid |
|---|---|---|
| Rest | Establish hierarchy through readable label/icon, proportion, surface, edge and contrast; reserve enough room for real state labels | Every button becomes a primary CTA, or a spinner makes neighboring controls jump |
| Hover | Use a bounded change in surface, edge, light or a decorative inner layer on hover-capable inputs | Changing font weight/geometry, moving the hit target away, or hiding meaning until hover |
| Press and release | Give immediate tactile response; let release settle deliberately. Use small face/shadow travel or restrained scale when it suits the design | Waiting for a release animation before acting, shrinking text illegibly, or triggering the business action from both pointer-up and click |
| Keyboard focus | Keep a clear, unclipped focus indicator and the primitive's keyboard activation. Provide equivalent state information without pointer motion | Replacing `:focus-visible` with hover, or removing the outline because a mouse click showed it |
| Pending | Reflect a real operation, preserve layout and accessible meaning, and use the existing pending/disabled policy to prevent duplicate submissions | A timer masquerades as progress; animation determines whether data was saved |
| Success, failure, cancellation | Connect a truthful result to the triggering control/object. Keep error text, input and retry available; restore an understandable rest state | A decorative checkmark claims success on rejection, or failure immediately disappears into a generic toast |
| Re-entry and interruption | Retarget from the current visual state; exit/blur/pointer-cancel releases visual press. Handle repeated hover, a new selection, early close and unmount | Queued tweens finish obsolete states, a late response changes a different record, or pressed styling stays stuck |

Keep the main action on the primary system's semantic button/link and existing handler. Use its loading, disabled, focus and form semantics; customize tokens and supported semantic slots before replacing its markup. For Ant Design, inspect the current [Button API](https://ant.design/components/button): visual `type` and native `htmlType` have different jobs. Disable its wave only for a control whose feedback is intentionally owned elsewhere; do not erase useful system feedback globally.

Keep the interactive box stable during hover/press feedback. This prevents a chasing target; it does not freeze the entire interface through an intentional mode/layout transition. Such transitions still preserve activation, focus, object identity and input accuracy. A layered face, shadow or decorative wrapper may move without moving the target; decorative layers must not intercept events, enter the accessibility tree, cover adjacent actions, or clip the focus ring. A depth illusion made with DOM/CSS is not true 3D/WebGL and does not justify a WebGL runtime. Test the actual long/localized labels rather than hard-coding a width around “Send”.

### Implement with the established owner

- React/application state owns intent and truthful outcomes. GSAP owns the coordinated visual response, not the save/request result. A completion callback may settle decoration; it must not manufacture success. Preserve existing cancellation and persistence semantics, and ignore obsolete asynchronous completions when the target or request changes.
- Keep isolated CSS hover/focus colors when they do not compete. For coordinated press, label/icon change, pending and completion, use one scoped GSAP timeline or explicitly retargeted tweens. A CSS `transform` transition and GSAP must not both control that same transform; separate layers or choose one owner.
- Reverse a reversible timeline or retarget from current values rather than restarting from a hard-coded rest pose. For competing tweens, choose cancellation or a deliberate GSAP overwrite mode for the owned targets/properties; do not globally kill unrelated animation. Use `quickTo()` only for a justified high-frequency pointer response, and remove its listener/tween on cleanup.
- Keep native activation immediate. Short feedback can still be perceptible through contrast and coordinated targets; frequent interactions should not wait through a ceremonial entrance. Timing, travel and easing must be judged at actual size and normal speed, not chosen from a universal millisecond or spring preset.
- Expansion should originate from the real trigger/attachment where that improves continuity. A moving selection indicator and its text contrast should agree throughout the transition. Do not smooth authoritative time, coordinates or numeric readouts just to imitate a decorative demo.
- With reduced motion, remove spatial pull, bounce, repeated shimmer and large travel while retaining focus, pressed/selected state, pending status and truthful completion. A live preference change or unmount must not clear the user's work or leave the label hidden. Apply the existing React lifecycle rules below.

**Counterexample.** A “Save” button lifts on hover, attracts the cursor, bounces on press, runs a CSS wave and then shows a timed checkmark even if the request failed. It has more effects but less usable feedback. A better response keeps the target fixed, acknowledges press promptly, shows actual pending state and confirms only the real result in context. This does not prescribe a flat style: an expressive face/edge/shadow treatment can retain all those behaviors.

### Primary-source lessons and limits

Reviewed 2026-10-02–03; these are original method summaries, not redistributed component code or claims of full live testing. Read the relevant row for the problem at hand, not all links for each small repair.

| Primary source | Concrete observation from the article/docs/source | Transfer and boundary |
|---|---|---|
| [Emil Kowalski: Good vs Great](https://emilkowal.ski/ui/good-vs-great-animations) and [Great Animations](https://emilkowal.ski/ui/great-animations) | Popovers follow their trigger origin; tab text and highlight remain coordinated; frequent interactions and interruptible transitions need different treatment from a showcase entrance | Match easing and intensity to the action; allow reversal. The articles' examples and suggested durations are not universal constants or evidence that every spring suits accurate data |
| [Josh W. Comeau: Building a Magical 3D Button](https://www.joshwcomeau.com/animation/3d-button/) | A stationary edge with a moving face and shadow creates depth; the final example presses much faster than it releases and retains visible keyboard focus | Study the relative layer movement for a suitable prominent action, not every dense toolbar control. Author an original treatment; this review did not establish a code-redistribution grant or complete cancellation/reduced-motion coverage |
| [Rauno: Web Interface Guidelines](https://interfaces.rauno.me/) | Stable hover typography, subtle press response and local feedback such as copy-to-checkmark keep the response close to the action | Preserve semantic controls and meaningful pending/disabled states. Optimistic results need the product's real rollback policy; a checklist alone is not visual-design evidence |
| [GSAP magnetic-button / overwrite example](https://demos.gsap.com/demo/magnetic-button-overwrite-modes/) and [conflict guidance](https://gsap.com/resources/conflict) | The official entry identifies a magnetic-button example about competing animations | Use it to investigate hover-in/out ownership, not to mandate magnetic buttons. The embedded source was not retrieved in this review; inspect it before attributing exact parameters or observed behavior |
| [Aceternity Stateful Button](https://ui.aceternity.com/components/stateful-button) | The public demo caller returns a Promise resolved after four seconds; it explicitly labels this a dummy API call | Study local pending/result feedback, but connect production feedback to the real operation. Caller source is not complete component/error-path review; preview/code access grants no blanket redistribution permission |
| [Anime.js spring API](https://animejs.com/documentation/easings/spring/) | Perceived completion and physical settling differ; bounce/duration and physical parameters describe different tuning routes | Tune what the user perceives, but do not equate spring completion with operation success or cancellation. Keep this idea-only when GSAP owns the response |

For a source element, use the existing Preview/Code, dependency and license procedure in `open-source-ui-sources.md`. A demo that omits failure, keyboard or reduced-motion handling is useful technique evidence, not a production-ready replacement for the primary UI system. `visual-qa.md` owns the affected-state checks.

## Assign ownership

- Give one system ownership of each animated property and scroll container.
- Keep UI motion, scroll timelines, and any adopted 3D render loops in separate components/modules with explicit inputs.
- Do not let CSS, a UI-motion library, and a timeline engine all animate the same transform.
- Do not run multiple uncontrolled `requestAnimationFrame` loops for one visual region.
- When Lenis, GSAP/ScrollTrigger, Canvas, or R3F share time or scroll signals, coordinate them through one explicit scheduler/bridge where supported; do not let each layer poll and mutate the same target independently.
- Keep 3D and 2D Canvas decorative output separate from semantic navigation and content. Provide DOM controls and labels only for essential interactions, using the product's language rather than engine terminology.
- Keep small decorative accents non-interactive and outside the accessibility tree; render them statically or stop them quickly instead of adding controls that make the accent larger than its purpose.
- Reuse lifecycle, cleanup, failure, and rendering infrastructure freely, but keep public controls opt-in. A shared scene component must not stamp the same toolbar onto unrelated products.
- A shared scene registry may own quality caps, visibility, context loss, and fallback, while each unrelated subject owns its camera, lighting, material, composition, and motion. Do not reduce scene variation to a `shape` or color switch inside one generic renderer.
- In server-rendered frameworks, isolate browser-only motion/Canvas/WebGL in client boundaries and avoid hydrating static layout unnecessarily.

## Runtime lifecycle

Implement and test applicable items:

- Register GSAP plugins once at the application boundary. In React, use `useGSAP()` with a scoped root; wrap click handlers, delayed callbacks, and other later-created animations with `contextSafe()`; revert timelines, ScrollTriggers, observers, and listeners on cleanup; and keep browser-only motion behind a client boundary in server-rendered frameworks.
- Use `gsap.matchMedia()` or an equivalent live preference path for responsive and reduced-motion variants. Prefer timelines with positions or labels over chains of unrelated delays, `quickTo()` for frequent pointer updates, and transforms, opacity, or `autoAlpha` over continuously animating width, height, top, or left.
- For charts, Canvas, and other size-dependent visuals, initialize only when the host has non-zero usable dimensions. A hidden tab or collapsed panel is not ready just because its DOM exists; wait for a usable host size rather than accepting a library's fallback dimensions.
- Keep one host-size owner. Reuse the library's container-aware resize path when it handles visibility and layout changes; otherwise use `ResizeObserver` or an equivalent bounded path. Measure the element whose layout actually allocates the space, not an inner container whose positioning or size is written by the renderer: that container can retain its old dimensions and make the next measurement self-confirming. Window resize alone does not cover reveal or parent-layout changes. Cap device pixel ratio for GPU cost.
- When a chart changes allocation during a layout transition, separate its drawing dimensions from the surrounding surface's visible motion. One useful Flip-style treatment lays out the chart at its destination size and moves/scales the outer surface between poses, avoiding repeated axis layout or curve entrances on every animation frame. This is not a rule against live redraw: actual resizing, reflow or direct manipulation may need it. Keep content and size updates synchronized when they arrive together, retain accurate input mapping, and check that the settled allocation, renderer host and drawing bounds agree after focus, resizing and return. A matching fresh-load screenshot does not prove those transitions.
- Keep viewport/scroll coordinates separate from the renderer's local drawing space. Fit a bounded accent to its actual host after scrolling or layout changes; do not hide displaced drawing with clipping or a compensating offset.
- Pause or reduce work when `document.hidden`, the element is offscreen, or the user requests reduced motion.
- Cancel animation frames/timelines and remove owned pointer, resize, visibility, and context listeners on teardown. When replacing a library's built-in sizing or lifecycle behavior, check that version's initialization/disposal assumptions and prevent delayed callbacks from touching unmounted hosts.
- Dispose geometries, materials, textures, render targets, controls, workers, and renderer contexts as applicable.
- Handle loading, decoding, shader/model/texture failure, unsupported APIs, initialization exceptions, and WebGL context loss.
- Avoid per-frame React/state updates. Keep continuous values in the animation/render layer.
- Animate `transform` and `opacity` for ordinary UI when they preserve the intended geometry and content behavior. For necessary reflow, choose bounded layout animation or an appropriate Flip transition and measure its cost; apply the [state-boundary method](#keep-state-boundaries-continuous) rather than treating zero layout events as the design goal.
- Budget main-thread, GPU, memory, texture dimensions, draw calls, and bundle size for mobile/low-power hardware.

## Declared-device policy

Use these checks for new or materially changed effects on the declared targets: desktop by default; tablet/phone only if requested or required by an existing explicit product contract. Do not add device work to a desktop-only design. For a scoped repair, select the relevant cases through `visual-qa.md`; an unchanged layer does not require a fresh full lifecycle run.

- Exercise Lenis on the declared device classes. When touch devices are in scope, keep upstream-safe touch behavior unless a stronger synchronization mode has passed the supported iOS/Android checks; a desktop success is not evidence for phone. Verify anchor links, keyboard focus, route restoration, nested Ant Design overlays/tables, text selection, overscroll, and reduced motion.
- Exercise GSAP timelines and ScrollTriggers across the declared targets, desktop resizing, relevant breakpoints, navigation, unmount/remount, and live reduced-motion changes. Confirm no duplicate timeline, trigger, listener, or animation frame survives, and confirm a Lenis page does not also load ScrollSmoother.
- When 3D was adopted, exercise R3F/Three.js on supported targets, including phone/tablet only when declared. Reduce device-pixel ratio, model/texture size, lights, post-processing, draw calls, update frequency, and interaction density to meet the budget; lazy-load the scene and pause hidden/offscreen work. Do not confuse a suitability-gate rejection with a device-performance fallback.
- Exercise the separate 2D Canvas role on the declared targets. Reduce pixel ratio, particle/object count, redraw frequency, and interaction density before omitting it; verify resize, teardown, and a static/DOM fallback independently from the 3D scene.
- Fall back only after a reproducible compatibility, accessibility, performance, delivery, or runtime failure. Record the failing device/path and retain a coherent static/DOM result rather than silently shipping an empty region.

## Reduced motion and input safety

- Honor `prefers-reduced-motion` for every automatic, parallax, looping, scroll-scrubbed, or spatial effect.
- Observe preference changes during the session through a framework hook or media-query change listener; do not read reduced motion only once at mount when the effect can remain running.
- Reduced motion must preserve content, state, and navigation; it is not a blank canvas.
- Keep focus order, anchor navigation, browser history, keyboard scrolling, screen-reader announcements, touch inertia, and selection usable.
- Avoid scroll hijacking. If used for a justified narrative, provide an immediate reduced-motion/static layout and an escape from pinned regions.
- Do not rely on hover, pointer parallax, drag, or 3D picking as the only way to reach an action.
- Keep user-triggered feedback interruptible and avoid blocking input until animation completes.

## Fallback ladder

Design fallback before the premium path:

1. Full effect on capable devices within budget.
2. Reduced/paused effect for reduced-motion, low-power, hidden, or offscreen conditions.
3. Static local image/CSS illustration or simplified DOM visualization when the engine/resource is unavailable.
4. Semantic text and controls that preserve the task even if all visual enhancement fails.

For WebGL, cover both initialization failure and runtime `webglcontextlost`. A fallback message alone is insufficient if the visual also carries navigation; retain equivalent DOM navigation.

## Acceptance evidence

Reuse the effect's selection and host/meaning/control record rather than writing another copy. Apply the following checks within the scope selected in `visual-qa.md`; the main Skill handoff owns the final summary.

- Test normal and reduced-motion modes.
- Test mouse/keyboard, resizing and relevant touch paths on the declared targets; do not add a mobile viewport to a desktop-only task.
- Confirm no competing scroll regions, clipped pinned content, focus jumps, or input-blocking timelines.
- Exercise initialization/resource/context failure for advanced visuals.
- For adopted 3D, capture several animation phases, inspect the complete motion cycle, and verify the geometry-integrity rules rather than judging one flattering frame.
- For surfaces that rejected 3D, confirm no WebGL canvas, initialization probe, or 3D chunk request occurs.
- Navigate away/unmount and return; check for duplicate GSAP timelines, ScrollTriggers, canvases, loops, listeners, or rising memory.
- Capture screenshots of the full, reduced, and fallback states.

If an adopted enhanced layer fails, the coherent static fallback must still work. A required fallback is not a reason to omit a default layer. For conditional 3D, decide suitability first; once adopted, fallback quality is mandatory.
