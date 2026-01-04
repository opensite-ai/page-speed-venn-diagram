// Jest mock for @upsetjs/venn.js
// We don't need the real layout algorithm for unit tests; we just need
// predictable positions and radii.

interface VennInput {
  sets: string[];
  size: number;
}

export function layout(data: VennInput[], _options?: any) {
	return data.map((d, index) => {
		const radius = Math.max(10, Math.sqrt(d.size || 0));
		const isSingleSet = d.sets.length === 1;
		return {
			...d,
			x: (index + 1) * 100,
			y: (index + 1) * 100,
			radius,
			// Only single-set entries should be treated as circles in
			// useVennLayout's circle computation. Intersections still
			// get coordinates for text positioning but are filtered out
			// by the hook's `d.circles && d.circles.length === 1` check.
			circles: isSingleSet ? [{ radius }] : [],
		};
	});
}

