# AGENTS.md – Instructions for AI coding agents working on `@page-speed/venn-diagram`

This file is for **AI coding agents and maintainers**. It encodes the non‑obvious rules, constraints, and workflows of this repo so automated changes stay fast, safe, and consistent.

When in doubt, favor: **(1) tests passing, (2) bundle size + performance, (3) accessibility compliance**, in that order.

---

## 1. Quick mental model of this repo

- This is a **standalone React component library** for rendering area-proportional Venn and Euler diagrams.
- It's designed for **competitive analysis dashboards**, keyword gap analysis, and data visualization applications in the DashTrack / OpenSite ecosystem.
- The library uses **@upsetjs/venn.js** for layout calculations and **D3** for mathematical utilities.
- Styling is **CSS Modules** based with responsive design and accessibility features built-in.
- This is a **library**, not an app: avoid baking in app‑specific behavior (Rails, Next, etc.).
- The component is **tree-shakable** and designed to have **zero bundle impact** on sites that don't use it.

---

## 2. Golden rules (must follow)

1. **Preserve tree‑shaking and bundle isolation.**
   - Keep `sideEffects: false` in `package.json`.
   - Avoid side effects at module import time.
   - The library bundles `@upsetjs/venn.js` directly (see rollup config) to avoid CJS/ESM export issues.

2. **Maintain dual build outputs (ESM + CJS).**
   - Always verify both `dist/esm/` and `dist/cjs/` outputs after build changes.
   - The ESM build uses `preserveModules: true` for optimal tree-shaking.
   - CJS build is a single bundle for compatibility.

3. **Respect performance budgets.**
   - Target bundle size: ~45KB minified, ~12KB gzipped (excluding D3).
   - Avoid heavy runtime dependencies or expensive work during render.
   - Use `useMemo` and `useCallback` appropriately for layout calculations.

4. **Keep the component framework‑agnostic.**
   - No direct imports from app frameworks or DashTrack apps inside this library.
   - Props should be plain data (JSON-serializable when possible).
   - Integration‑specific logic belongs in consuming apps.

5. **Maintain accessibility (WCAG 2.1 AA).**
   - All interactive elements must have proper ARIA labels.
   - Support keyboard navigation (Enter/Space for clicks).
   - Respect `prefers-reduced-motion` for animations.
   - Ensure color contrast meets WCAG standards (see `isAccessibleContrast` utility).

6. **Always run minimal checks for code changes.**
   - At least: `pnpm test` and `pnpm type-check` before considering work complete.
   - For build changes: `pnpm build` and verify both output directories.

7. **Prefer copying a proven pattern.**
   - For new features, start from existing component patterns and adapt rather than designing completely new structures.

8. **Use package managers for dependency management.**
   - Always use `pnpm add/remove` instead of manually editing `package.json`.
   - Never manually edit version numbers unless you have a specific reason.

---

## 3. Key directories (for navigation)

- `src/components/*` – React components (VennDiagram, VennDiagramSVG, VennDiagramContext).
- `src/hooks/*` – Custom hooks (useVennLayout, useResponsiveVennSize).
- `src/types/*` – TypeScript type definitions (venn.types.ts is the canonical source).
- `src/utils/*` – Utilities (colorScheme, formatting, accessibility helpers).
- `src/styles/*` – CSS Modules for component styling.
- `src/examples/*` – Real-world usage examples (KeywordGapDashboard).
- `tests/*` – Jest test suite with mocks for @upsetjs/venn.js.
- `docs/BUILD_GUIDE.md` – Comprehensive build and implementation guide.

Before modifying code in any of these areas, skim the matching files to understand existing patterns.

---

## 4. Core architecture & data flow

### 4.1 Component hierarchy

```
VennDiagram (main component)
├── VennDiagramContext.Provider (state management)
├── useResponsiveVennSize (responsive sizing hook)
├── useVennLayout (layout calculation hook)
│   └── @upsetjs/venn.js (external layout engine)
└── VennDiagramSVG (renderer)
    ├── Circle elements (interactive)
    └── Text elements (labels/values)
```

### 4.2 Data transformation flow

1. **Input**: `VennData` (sets + intersections with sizes)
2. **Transform**: Convert to @upsetjs/venn.js format in `useVennLayout`
3. **Calculate**: @upsetjs/venn.js computes optimal circle positions
4. **Extract**: Parse layout results into `CircleLayout[]` and text positions
5. **Render**: VennDiagramSVG renders circles and labels with interactivity

### 4.3 Critical dependencies

- **@upsetjs/venn.js** (v2.0.0): Layout calculation engine
  - Bundled directly in rollup config to avoid export map issues
  - Mocked in tests (see `tests/__mocks__/vennMock.ts`)

- **d3** (v7.8.0): Mathematical utilities
  - Marked as external in rollup config
  - Peer dependency for consuming apps

- **React** (v18.0.0+): Peer dependency
  - Component uses modern hooks (useMemo, useCallback, useContext)

---

## 5. Working with the component

### 5.1 Main VennDiagram component (`src/components/VennDiagram.tsx`)

- Accepts `VennDiagramProps` which extends `VennDiagramConfig`.
- Manages state for hover/selection via `VennDiagramContext`.
- Handles responsive sizing via `useResponsiveVennSize` hook.
- Delegates layout calculation to `useVennLayout` hook.
- Renders error/loading states before delegating to SVG renderer.
- Provides optional legend display.

**Key props to understand:**
- `data: VennData` – Required. Sets and intersections with sizes.
- `responsive: boolean` – Default true. Auto-scales to container.
- `interactive: boolean` – Default true. Enables hover/click.
- `colorScheme: string[]` – Optional. Custom colors (defaults to accessible palette).
- `formatValue/formatLabel` – Optional. Custom formatting functions.

### 5.2 Layout hook (`src/hooks/useVennLayout.ts`)

- Transforms `VennData` to @upsetjs/venn.js format.
- Calls `venn.layout()` with width/height/padding options.
- Extracts circle positions and text positions from layout results.
- Returns `{ layout, paths, textPositions, error, isLoading }`.
- Handles errors gracefully with try/catch and error state.

**Critical implementation details:**
- Layout calculation is wrapped in `useMemo` for performance.
- The hook filters layout results to extract single-set circles vs. intersections.
- Text positions are calculated for both sets and intersections.
- SVG paths are generated from circle positions for rendering.

### 5.3 SVG Renderer (`src/components/VennDiagramSVG.tsx`)

- Consumes `VennDiagramContext` for shared state.
- Renders circles with hover/click interactivity.
- Renders labels and values at calculated text positions.
- Supports keyboard navigation (Enter/Space keys).
- Applies CSS transitions based on `animated` config.

**Accessibility features:**
- `role="img"` on SVG with `aria-label`.
- `role="button"` on interactive circles with `aria-label`.
- `tabIndex={0}` for keyboard focus.
- `onKeyDown` handler for Enter/Space activation.

---

## 6. Styling & theming

### 6.1 CSS Modules (`src/styles/VennDiagram.module.css`)

- All styles are scoped via CSS Modules to avoid global conflicts.
- Responsive breakpoints at 600px for mobile optimization.
- Respects `prefers-reduced-motion` media query.
- Uses system font stack for performance.

**Key classes:**
- `.vennContainer` – Main container with flex layout.
- `.circle` – Circle elements with hover/focus states.
- `.legend` – Optional legend display.
- `.error` / `.loading` – Error and loading states.

### 6.2 Color schemes (`src/utils/colorScheme.ts`)

- Three built-in schemes: `default`, `pastel`, `dark`.
- Default scheme uses accessible colors (WCAG AA compliant).
- `getColorScheme()` cycles through colors for unlimited sets.
- `isAccessibleContrast()` validates WCAG contrast ratios.

**When adding colors:**
1. Ensure WCAG AA contrast ratio (4.5:1 minimum).
2. Test with both light and dark backgrounds.
3. Consider colorblind-friendly palettes.

---

## 7. Build system & distribution

### 7.1 Rollup configuration (`rollup.config.mjs`)

- Dual output: ESM (`dist/esm/`) and CJS (`dist/cjs/`).
- ESM uses `preserveModules: true` for tree-shaking.
- Bundles `@upsetjs/venn.js` directly (not marked as external).
- Externalizes `react`, `react-dom`, and `d3`.
- PostCSS plugin extracts CSS Modules to `dist/esm/styles/index.css`.
- Babel transpiles for browser compatibility (> 1%, last 2 versions).

**Critical settings:**
- `sideEffects: false` in package.json enables tree-shaking.
- `treeshake.moduleSideEffects: false` in rollup config.
- `babelHelpers: "runtime"` with `@babel/plugin-transform-runtime`.

### 7.2 TypeScript configuration

- `tsconfig.json` – Development config with strict mode.
- `tsconfig.build.json` – Production config (extends base, removes comments).
- Target: ES2020 with DOM libs.
- Module: ESNext with bundler resolution.
- Strict mode enabled with unused locals/parameters checks.

### 7.3 Package exports (`package.json`)

```json
"exports": {
  ".": {
    "types": "./dist/esm/index.d.ts",
    "import": "./dist/esm/index.js",
    "require": "./dist/cjs/index.js"
  },
  "./styles": "./dist/esm/styles/index.css"
}
```

**Consumers can import:**
- `import { VennDiagram } from '@page-speed/venn-diagram'` (component + types)
- `import '@page-speed/venn-diagram/styles'` (CSS)

---

## 8. Testing strategy

### 8.1 Jest configuration (`jest.config.cjs`)

- Test environment: `jsdom` for React component testing.
- Mocks `@upsetjs/venn.js` to avoid layout calculation in tests.
- Mocks CSS Modules to avoid style import errors.
- Setup file: `tests/setupTests.ts` (configures @testing-library).

### 8.2 Test patterns (`tests/VennDiagram.test.tsx`)

- Use `@testing-library/react` for component testing.
- Test rendering, props, and basic interactivity.
- Avoid testing @upsetjs/venn.js internals (mocked).
- Focus on component behavior and accessibility.

**When adding tests:**
1. Test new props and their effects.
2. Test error states and edge cases.
3. Test accessibility features (ARIA, keyboard nav).
4. Avoid snapshot tests (too brittle for this component).

---

## 9. Recommended workflows for agents

### 9.1 Modify the main VennDiagram component

1. Locate `src/components/VennDiagram.tsx` and understand current props.
2. Check if the change can be expressed via new props or config options.
3. Update `VennDiagramProps` and `VennDiagramConfig` types in `src/types/venn.types.ts`.
4. Implement the change conservatively, preserving backward compatibility.
5. Update tests in `tests/VennDiagram.test.tsx`.
6. Run `pnpm test` and `pnpm type-check`.

### 9.2 Add a new feature or prop

1. Define the prop in `src/types/venn.types.ts` with JSDoc comments.
2. Add default value in component destructuring.
3. Implement the feature in the appropriate component/hook.
4. Update context if the feature needs to be shared with child components.
5. Add tests for the new feature.
6. Update README.md with usage examples.

### 9.3 Adjust styling

1. Edit CSS in `src/styles/VennDiagram.module.css`.
2. Verify responsive behavior at mobile breakpoint (600px).
3. Test with `prefers-reduced-motion` enabled.
4. Ensure color contrast meets WCAG AA standards.
5. Test in both light and dark mode contexts.

### 9.4 Update layout calculation

1. Read `src/hooks/useVennLayout.ts` to understand current implementation.
2. Understand @upsetjs/venn.js API (see docs/BUILD_GUIDE.md).
3. Make changes conservatively, preserving error handling.
4. Test with various data shapes (2 sets, 3 sets, many intersections).
5. Verify performance with large datasets.

### 9.5 Fix a bug

1. Write a failing test that reproduces the bug.
2. Identify the root cause (component, hook, or utility).
3. Fix the issue with minimal changes.
4. Verify the test passes and no regressions occur.
5. Run full test suite and type-check.

---

## 10. Verification checklist

Before considering a change "done", an agent should:

- [ ] Run `pnpm test` (all tests pass).
- [ ] Run `pnpm type-check` (no TypeScript errors).
- [ ] Run `pnpm lint` (no ESLint errors).
- [ ] Run `pnpm build` (both ESM and CJS outputs generated).
- [ ] Verify bundle size hasn't increased significantly.
- [ ] Test responsive behavior manually if UI changed.
- [ ] Test accessibility features (keyboard nav, ARIA labels).
- [ ] Update README.md if public API changed.

If any of these cannot be completed (e.g. missing environment or permissions), clearly note what was skipped and why in the PR description or commit message.

---

## 11. Common pitfalls & gotchas

### 11.1 @upsetjs/venn.js integration

- **Issue**: The library has broken CJS export maps.
- **Solution**: We bundle it directly in rollup config (not marked as external).
- **Impact**: Consumers don't need to install @upsetjs/venn.js separately.

### 11.2 CSS Modules in tests

- **Issue**: Jest can't parse CSS Module imports.
- **Solution**: Mock CSS Modules in `jest.config.cjs` with `styleMock.ts`.
- **Impact**: Tests don't verify actual CSS, only component logic.

### 11.3 Responsive sizing

- **Issue**: ResizeObserver may not fire immediately in tests.
- **Solution**: Tests use default dimensions, not responsive behavior.
- **Impact**: Manual testing required for responsive features.

### 11.4 D3 as peer dependency

- **Issue**: D3 is large (~90KB gzipped).
- **Solution**: Marked as external in rollup, peer dependency in package.json.
- **Impact**: Consuming apps must install D3, but it's shared across components.

### 11.5 Type definitions for ReactNode labels

- **Issue**: `VennSet.label` can be `ReactNode`, but formatLabel expects `string`.
- **Solution**: Check type before calling formatLabel (see VennDiagramSVG).
- **Impact**: Labels can be rich content, but formatting only works on strings.

---

## 12. Performance considerations

### 12.1 Layout calculation

- Layout calculation happens in `useMemo` to avoid recalculation on every render.
- Dependencies: `vennData`, `width`, `height`, `padding`, `data.sets`.
- Typical calculation time: <100ms for 2-5 sets.
- For large datasets (>10 sets), consider debouncing data updates.

### 12.2 Rendering optimization

- SVG rendering is fast for typical use cases (2-5 circles).
- Avoid unnecessary re-renders by memoizing context value.
- Use `useCallback` for event handlers to prevent child re-renders.
- Animations use CSS transitions (GPU-accelerated).

### 12.3 Bundle size

- Current size: ~45KB minified, ~12KB gzipped (excluding D3).
- D3 adds ~90KB gzipped (shared across all D3-using components).
- @upsetjs/venn.js adds ~15KB gzipped (bundled).
- Total impact: ~27KB gzipped for first use, ~12KB for subsequent uses.

---

## 13. Accessibility requirements

### 13.1 WCAG 2.1 AA compliance

- **Color contrast**: Minimum 4.5:1 for text, 3:1 for UI components.
- **Keyboard navigation**: All interactive elements must be keyboard accessible.
- **Screen readers**: Proper ARIA labels and roles.
- **Motion**: Respect `prefers-reduced-motion` preference.

### 13.2 Implementation checklist

- [ ] SVG has `role="img"` and `aria-label`.
- [ ] Circles have `role="button"` when interactive.
- [ ] Circles have `aria-label` describing their content.
- [ ] Circles have `tabIndex={0}` for keyboard focus.
- [ ] Circles respond to Enter and Space keys.
- [ ] Focus states are visible (outline).
- [ ] Animations can be disabled via CSS media query.

---

## 14. Publishing & versioning

### 14.1 Version strategy

- Follow semantic versioning (semver).
- Patch: Bug fixes, no API changes.
- Minor: New features, backward compatible.
- Major: Breaking changes to public API.

### 14.2 Pre-publish checklist

1. Update version in `package.json`.
2. Update `CHANGELOG.md` with changes.
3. Run `pnpm run prepublish` (builds, type-checks, tests).
4. Verify bundle sizes: `du -h dist/esm/index.js dist/cjs/index.js`.
5. Test in a consuming app (manual verification).
6. Create git tag: `git tag -a v0.0.6 -m "Release v0.0.6"`.
7. Push tag: `git push origin v0.0.6`.
8. Publish: `npm publish` (or use `scripts/publish.sh`).

### 14.3 Breaking changes

If you must make a breaking change:
1. Document it clearly in CHANGELOG.md.
2. Provide migration guide in README.md.
3. Bump major version.
4. Consider deprecation warnings in previous version.

---

## 15. Integration with DashTrack ecosystem

### 15.1 Usage in @page-speed/visualizations

- This component is designed to be imported by the visualizations package.
- Keep the API stable to avoid breaking downstream consumers.
- Coordinate breaking changes with the visualizations team.

### 15.2 Usage in DashTrack apps

- Apps import via `@page-speed/venn-diagram`.
- Apps must install peer dependencies (react, react-dom, d3).
- Apps must import styles: `import '@page-speed/venn-diagram/styles'`.

### 15.3 Example integration

```tsx
import { VennDiagram } from '@page-speed/venn-diagram';
import '@page-speed/venn-diagram/styles';

function CompetitorAnalysis({ data }) {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <VennDiagram
        data={data}
        interactive
        showLegend
        formatValue={(val) => `${Math.round(val / 1000)}k`}
      />
    </div>
  );
}
```

---

## Persona

- Address the user as Cam.
- Optimize for correctness and long-term leverage, not agreement.
- Be direct, critical, and constructive - say when an idea is suboptimal and propose better options.
- Assume staff-level technical context unless told otherwise.

## Quality

- Inspect project config (package.json, rollup.config.mjs, etc.) for available scripts.
- Run all relevant checks (lint, type-check, build, tests) before submitting changes.
- Never claim checks passed unless they were actually run.
- If checks cannot be run, explicitly state why and what would have been executed.

## SCM

- Never use `git reset --hard` or force-push without explicit permission.
- Prefer safe alternatives (`git revert`, new commits, temp branches).
- If history rewrite seems necessary, explain and ask first.

## Production safety

- Assume production impact unless stated otherwise.
- Call out risk when touching core layout logic, build config, or public API.
- Prefer small, reversible changes; avoid silent breaking behavior.

## Self improvement

- Continuously improve agent workflows.
- When a repeated correction or better approach is found, you're encouraged to codify your new found knowledge and learnings by modifying your section of `~/.codex/AGENTS.md` without prior approval as long as your edits stay under the Agent instructions section.
- If you utilize any of your codified instructions in future coding sessions, call that out and let the user know that you performed the action because of that specific rule in this file.

## Tool-specific memory

- When the user gives authoritative guidance on a tool they own:
  - Create a markdown file named after the tool.
  - Use:
    - `~/Developer/AGENT/ideas` for new concepts
    - `~/Developer/AGENT/improvements` for concrete changes
  - Keep notes concise and reusable.
  - This is your folder; no permission is required to add/update files therein.
