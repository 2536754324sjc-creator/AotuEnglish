# React Application Stack

Read this reference whenever a React product has, or may need, theme modes, routing and URL state, requests/server state, shared client state, or forms. React is the fixed framework contract. The goal is one coherent owner per concern, not a maximal package list.

This is a time-bounded discovery snapshot. Before installing or recommending a package, use `$web-access` to verify the current official documentation, package metadata, maintenance, license, React compatibility, accessibility, delivery behavior, and migration guidance. Last verified: 2026-09-02.

## React-only boundary

- Use React for new application code. Prefer TypeScript for a greenfield substantial application, but preserve a sound existing React language/build choice unless changing it has a concrete benefit.
- For a new browser-rendered client application, React with Vite is the default starting point unless the delivery requires another approved React runtime.
- Preserve an existing sound React router, query layer, state owner, form owner, and theme system when they fit. Replacing an owner is a migration, not routine cleanup.
- If the input is not React, define one clean React migration boundary. Do not add Vue code, recommend Vue packages, or leave two UI frameworks owning the same product.
- These concerns are conditional. A static single-surface interface may legitimately use no router, no remote-data cache, no global store, and no form library.

## Required UI system and default devices

- Every delivered React interface uses one primary React UI component system. For greenfield or ownerless work, use Ant Design. Preserve another established React system only when it already owns the product or Ant Design fails a documented delivery, accessibility, license, brand, or runtime gate.
- Use Ant Design components instead of rebuilding ordinary buttons, inputs, selects, dialogs, drawers, menus, tabs, tables, pagination, feedback, and form structure from scratch. Extend Ant Design tokens and compose its components before adding a second primitive or component system. Check the applicable composite behaviors as well as basic controls; two imported primitives do not establish meaningful system coverage. This is not a quota to add more components or features.
- Component ownership does not prescribe the visible page shell. Choose Table/List/Card/Layout for the actual content relationship, not one stock wrapper per function. Carry the selected visual grammar through populated forms, selection, validation and feedback as described in [page composition](page-composition.md#develop-visual-character-not-just-a-clean-wireframe); preserve keyboard, focus and state semantics while customizing.
- Use Ant Design design tokens/`ConfigProvider` for component theming, Ant Design Form for ordinary product forms, and Ant Design Grid/Flex/Layout plus project CSS for responsive structure.
- Use `@ant-design/icons` as the default family for ordinary interface symbols when Ant Design owns the UI. Official brand marks, illustrations, photography, and domain-specific assets remain separate provenance decisions.
- Desktop is the default target for new pages and material redesigns. Add tablet, phone, or other device classes only when the user or an existing explicit product contract requires them. Check representative desktop sizes and affected states through `visual-qa.md`; device quality requirements apply fully to any additional declared targets. Do not create mobile navigation, breakpoints, or tests merely to satisfy a generic matrix.

## Current React candidate matrix

| Concern | Start with | Escalate when | React candidates and boundary |
|---|---|---|---|
| Theme modes | Ant Design `ConfigProvider` and design tokens, synchronized with semantic CSS custom properties and platform color-scheme behavior | The product genuinely supports system/light/dark or branded modes, user choice must persist, or component tokens must synchronize | Keep Ant Design as the default component-token owner. Use another established system's provider only when that system already owns the project. Do not add a theme switch merely to display a second palette. |
| Routing and URL state | The curated source library has no owner: use no router for a true single-surface artifact; otherwise keep the existing React router | The product has distinct routes, deep links, browser history, nested layouts, loaders, or shareable filter/search state | React Router is the broad established route owner. TanStack Router is a serious option when strongly typed routes/search params and integrated loader conventions justify its extra structure. Record `curated-catalog gap`; never run two routers. |
| Requests and server state | The curated source library has no owner: keep the existing React request layer or use `fetch` for a small isolated flow | Data is shared, cached, invalidated, refreshed, paginated, optimistically updated, or synchronized across screens | TanStack Query can own React server-state caching and synchronization. RTK Query is coherent when Redux Toolkit already owns application state. Record `curated-catalog gap`; do not mirror query results into a second global store. |
| Client state | The curated source library has no owner: keep the existing React owner or use component state/reducer/context for modest state | Independent features need shared writable client state, devtools, middleware, normalized entities, or predictable event history | Zustand is a compact option; Redux Toolkit is the structured option for complex domain state or an existing Redux product. Record `curated-catalog gap` and keep URL, server, and form state in their own owners. |
| Forms | Ant Design Form and Ant Design controls | Dynamic arrays, complex schema validation, reusable form composition, async checks, or rendering cost makes a separate headless owner worthwhile | React Hook Form or TanStack Form may own complex form state while Ant Design remains the component/visual owner. Do not replace Ant Design controls with ad hoc fields. |

## Theme-mode contract

1. Define semantic surface, text, border, accent, state, focus, chart, and elevation tokens. Use the component system's matching light/dark derivation as a base, not a background swap with default light-state colors. Explicitly check selected options, placeholders, disabled fields, focus, validation, and popups; use a locally scoped theme when a light work panel sits in a dark shell.
2. Declare compatible browser chrome/form-control schemes with `color-scheme`; use `prefers-color-scheme` when the product follows the operating-system preference.
3. If a manual mode is a real product requirement, define precedence among user choice, system preference, and product default; persist only the mode identifier, not personal data.
4. Synchronize Canvas, charts, code highlighting, images, scrollbars, native controls, and the primary React component system with the same mode owner.
5. Verify the affected mode/state pairs on their actual surfaces, including portals. Inheriting a page token does not prove contrast. Correct the owning semantic pair before adding selector-specific patches; do not run every unrelated mode for an isolated change.

## Routing and state ownership rules

- Put bookmarkable/shareable filters, tabs, pagination, and selections in URL state when that behavior is part of the product contract.
- Keep remote records and request status in the request/query owner. Keep ephemeral UI state near the component that owns it.
- Promote state to a global store only after naming two or more real consumers or a cross-route workflow that local composition cannot serve cleanly.
- Make route, request, global-state, and form owners explicit in the handoff so future work does not add a duplicate layer.

## Request and form behavior

- Every request path needs honest loading, empty, success, validation, timeout/error, retry, permission, and offline behavior where applicable.
- Cancel or ignore obsolete work when navigation, filters, or inputs make an earlier response stale. Do not allow late responses to overwrite newer intent.
- Keep form labels, instructions, errors, required state, disabled/submitting state, focus movement, and server errors understandable without relying on color or animation.
- Do not let a form library replace semantic HTML or let a component library hide the form owner's validation state.

## Official starting points

- React: <https://react.dev/>
- Vite React guide: <https://vite.dev/guide/>
- Theme platform behavior: <https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme> and <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme>
- React state composition: <https://react.dev/learn/scaling-up-with-reducer-and-context>
- React Router: <https://reactrouter.com/start/declarative/routing>
- TanStack Router: <https://tanstack.com/router/latest/docs/overview>
- TanStack Query for React: <https://tanstack.com/query/latest/docs/framework/react/overview>
- Redux Toolkit and RTK Query: <https://redux-toolkit.js.org/introduction/getting-started>
- Zustand: <https://zustand.docs.pmnd.rs/learn/getting-started/introduction>
- React Hook Form: <https://github.com/react-hook-form/react-hook-form>
- TanStack Form for React: <https://tanstack.com/form/latest/docs/framework/react>
- Ant Design theme tokens: <https://ant.design/docs/react/customize-theme/>
- Ant Design React components: <https://ant.design/docs/react/introduce/>
- Ant Design responsive Grid: <https://ant.design/components/grid/>
- Ant Design Form: <https://ant.design/components/form/>
- Ant Design Icons: <https://ant.design/components/icon/>
- Material UI color schemes: <https://mui.com/material-ui/customization/dark-mode/>

## Adoption record

For each applicable concern, record: current owner, selected owner, reason, official evidence and date, package/version, license, migration boundary, distribution/offline effect, runtime failure behavior, and the rejected duplicate. For a non-applicable concern, record that fact in one line and move on.
