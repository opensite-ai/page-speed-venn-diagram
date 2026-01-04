# @page-speed/venn-diagram

![PageSpeed Venn Diagram React Component](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/286681/nkbe6r4vyewp1gzu3js3wgbvgbyr/rounded-banner.png&q=90)

Dynamic, data-driven Venn diagram component for React applications. Renders area-proportional Venn and Euler diagrams with interactive hover/click events, perfect for competitive analysis dashboards, keyword gap analysis, and data visualization applications.


## Features

- **Area-Proportional Rendering** - Circle sizes automatically scale to represent data values
- **Customizable Styling** - Full control over colors, fonts, and appearance
- **Accessible** - WCAG 2.1 AA friendly patterns with keyboard navigation and ARIA labels
- **Interactive** - Hover effects, click handling, and dynamic updates
- **Responsive** - Automatically scales to container size
- **Performance** - Optimized rendering with isolated D3/@upsetjs/venn.js dependency
- **Unlimited Circles** - Support for 2+ sets with automatic layout optimization


## Installation

```bash
npm install @page-speed/venn-diagram react react-dom
```

If you use pnpm:

```bash
pnpm add @page-speed/venn-diagram react react-dom
```

## Quick Start

```jsx
import { VennDiagram } from "@page-speed/venn-diagram";

const data = {
  sets: [
    { name: "A", label: "Set A", size: 100 },
    { name: "B", label: "Set B", size: 80 },
  ],
  intersections: [{ sets: ["A", "B"], size: 20 }],
};

export function MyDashboard() {
  return (
    <div style={{ width: 600, height: 400 }}>
      <VennDiagram data={data} interactive showLegend />
    </div>
  );
}
```

## Styling

This component uses Tailwind utility classes for its default styling. Make sure
your Tailwind `content` config includes this package so the classes are
generated (for example, `./node_modules/@page-speed/venn-diagram/dist/**/*.{js,ts,jsx,tsx}`).

## API Overview

### `VennDiagram` Props (high level)

- `data`: `VennData` - sets + intersections
- `width`, `height`: base dimensions (ignored when `responsive` is `true`)
- `renderer`: `"svg" | "canvas"` (currently SVG is implemented)
- `showLabels`, `showValues`, `showLegend`
- `colorScheme`: override default color palette
- `animated`, `hoverOpacity`, `interactive`, `responsive`
- `padding`, `textFill`, `strokeWidth`
- `formatValue`, `formatLabel` for custom formatting
- `onSetHover`, `onClick` callbacks

See the TypeScript definitions in `src/types/venn.types.ts` for the full, strongly-typed API.

## Examples

See the `src/examples/` directory for real-world use cases including:

- Keyword gap analysis (`KeywordGapDashboard`)
- Competitor overlap visualization
- Multi-set comparisons
- Interactive dashboards

## Development

Common scripts (see `package.json` for the complete list):

```bash
pnpm build        # Build library with Rollup
pnpm test         # Run Jest test suite
pnpm lint         # Run ESLint on src
pnpm storybook    # Run Storybook (if configured)
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## License
