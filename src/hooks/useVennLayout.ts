import { useEffect, useState, useMemo } from "react";
import * as venn from "@upsetjs/venn.js";
import {
  VennData,
  CircleLayout,
  UseVennLayoutReturn,
} from "../types/venn.types";

interface UseVennLayoutOptions {
  width?: number;
  height?: number;
  padding?: number;
}

/**
 * Hook that computes Venn diagram layout using @upsetjs/venn.js
 * Handles responsive sizing and dynamic data updates
 */
export const useVennLayout = (
  data: VennData,
  options: UseVennLayoutOptions = {}
): UseVennLayoutReturn => {
  const { width = 600, height = 400, padding = 40 } = options;
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Transform component data format to @upsetjs/venn.js format
  const vennData = useMemo(() => {
    const sets = data.sets.map((set) => ({
      sets: [set.name],
      size: set.size,
    }));

    const intersections = data.intersections.map((intersection) => ({
      sets: intersection.sets,
      size: intersection.size,
    }));

    return [...sets, ...intersections];
  }, [data]);

  // Calculate layout using @upsetjs/venn.js
  const layout = useMemo(() => {
    try {
      setIsLoading(true);
      setError(null);

      // venn.layout() computes optimal circle positions
      // Returns array of circle objects with x, y, radius
      const computed = venn.layout(vennData, {
        width: width - padding * 2,
        height: height - padding * 2,
      });

      const circles: CircleLayout[] = computed
        .filter((d: any) => d.circles && d.circles.length === 1)
        .map((d: any) => ({
          x: padding + (d.x || 0) + (width - padding * 2) / 2,
          y: padding + (d.y || 0) + (height - padding * 2) / 2,
          radius: d.radius || 0,
          set: d.sets[0],
        }));

      return circles;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Venn diagram layout error:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [vennData, width, height, padding]);

  // Generate SVG paths for circles
  const paths = useMemo(() => {
    return layout.map((circle) => {
      const { x, y, radius } = circle;
      return `M ${x - radius} ${y} A ${radius} ${radius} 0 1 0 ${
        x + radius
      } ${y} A ${radius} ${radius} 0 1 0 ${x - radius} ${y}`;
    });
  }, [layout]);

  // Calculate optimal text positions (center of each circle + intersections)
  const textPositions = useMemo(() => {
    try {
      const computed = venn.layout(vennData, {
        width: width - padding * 2,
        height: height - padding * 2,
      });

      return computed.map((d: any) => ({
        x: padding + (d.x || 0) + (width - padding * 2) / 2,
        y: padding + (d.y || 0) + (height - padding * 2) / 2,
        setNames: d.sets,
      }));
    } catch {
      return [];
    }
  }, [vennData, width, height, padding]);

  return {
    layout,
    paths,
    textPositions,
    error,
    isLoading,
  };
};

/**
 * Hook for handling responsive diagram sizing
 */
export const useResponsiveVennSize = (
  containerRef: React.RefObject<HTMLDivElement>,
  defaultWidth: number = 600,
  defaultHeight: number = 400
) => {
  const [dimensions, setDimensions] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const { offsetWidth, offsetHeight } = containerRef.current;
      if (offsetWidth && offsetHeight) {
        setDimensions({
          width: offsetWidth,
          height: offsetHeight,
        });
      }
    };

    // Initial size
    handleResize();

    // Listen for resize
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [containerRef]);

  return dimensions;
};
