import React, { useRef, useState, useMemo } from "react";
import { VennDiagramProps, VennDiagramContextType } from "../types/venn.types";
import { useVennLayout, useResponsiveVennSize } from "../hooks/useVennLayout";
import { getColorScheme } from "../utils/colorScheme";
import styles from "../styles/VennDiagram.module.css";
import { VennDiagramSVG } from "./VennDiagramSVG";
import { VennDiagramContext } from "./VennDiagramContext";

/**
 * Main VennDiagram component
 *
 * @example
 * const data = {
 *   sets: [
 *     { name: 'A', label: 'Set A', size: 100 },
 *     { name: 'B', label: 'Set B', size: 80 },
 *   ],
 *   intersections: [
 *     { sets: ['A', 'B'], size: 20 },
 *   ],
 * };
 *
 * <VennDiagram
 *   data={data}
 *   width={600}
 *   height={400}
 *   interactive
 *   onSetHover={(sets) => console.log('Hovered:', sets)}
 * />
 */
export const VennDiagram: React.FC<VennDiagramProps> = ({
  data,
  width = 600,
  height = 400,
  renderer = "svg",
  showLabels = true,
  showValues = true,
  showLegend = false,
  colorScheme: customColorScheme,
  animated = true,
  hoverOpacity = 0.5,
  interactive = true,
  responsive = true,
  padding = 40,
  textFill = "currentColor",
  strokeWidth = 2,
  formatValue,
  formatLabel,
  className,
  style,
  onSetHover,
  onClick,
  testId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSets, setHoveredSets] = useState<string[] | null>(null);
  const [selectedSets, setSelectedSets] = useState<string[] | null>(null);

  // Handle responsive sizing
  const dimensions = useResponsiveVennSize(
    containerRef,
    width,
    height
  );

  const finalWidth = responsive ? dimensions.width : width;
  const finalHeight = responsive ? dimensions.height : height;

  // Calculate layout
  const { layout, textPositions, error, isLoading } = useVennLayout(data, {
    width: finalWidth,
    height: finalHeight,
    padding,
  });

  // Get color scheme
  const colorScheme = useMemo(
    () => customColorScheme || getColorScheme(data.sets.length),
    [customColorScheme, data.sets.length]
  );

  // Create context value
  const contextValue: VennDiagramContextType = useMemo(
    () => ({
      data,
      config: {
        width: finalWidth,
        height: finalHeight,
        showLabels,
        showValues,
        colorScheme,
        animated,
        hoverOpacity,
        interactive,
        padding,
        textFill,
        strokeWidth,
        formatValue,
        formatLabel,
      },
      hoveredSets,
      setHoveredSets: (sets) => {
        setHoveredSets(sets);
        onSetHover?.(sets);
      },
      selectedSets,
      setSelectedSets,
    }),
    [
      data,
      finalWidth,
      finalHeight,
      showLabels,
      showValues,
      colorScheme,
      animated,
      hoverOpacity,
      interactive,
      padding,
      textFill,
      strokeWidth,
      formatValue,
      formatLabel,
      hoveredSets,
      selectedSets,
      onSetHover,
    ]
  );

  // Error state
  if (error) {
    return (
      <div
        className={styles.error}
        role="alert"
        data-testid={testId ? `${testId}-error` : undefined}
      >
        <p>Error rendering Venn diagram:</p>
        <code>{error.message}</code>
      </div>
    );
  }

  // Loading state
  if (isLoading && layout.length === 0) {
    return (
      <div
        className={styles.loading}
        role="status"
        aria-busy
        data-testid={testId ? `${testId}-loading` : undefined}
      >
        <span>Loading diagram...</span>
      </div>
    );
  }

  return (
    <VennDiagramContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={`${styles.vennContainer} ${className || ""}`}
        style={{
          width: responsive ? "100%" : finalWidth,
          height: responsive ? "100%" : finalHeight,
          ...style,
        }}
        data-testid={testId}
      >
        {renderer === "svg" && (
          <VennDiagramSVG
            layout={layout}
            textPositions={textPositions}
            width={finalWidth}
            height={finalHeight}
            onClick={onClick}
          />
        )}

        {showLegend && (
          <div className={styles.legend}>
            {data.sets.map((set, idx) => (
              <div
                key={set.name}
                className={styles.legendItem}
                style={{
                  borderLeftColor: colorScheme[idx],
                }}
              >
                <span className={styles.legendLabel}>
                  {formatLabel && typeof (set.label || set.name) === "string"
                    ? formatLabel((set.label || set.name) as string)
                    : set.label || set.name}
                </span>
                <span className={styles.legendValue}>
                  {formatValue ? formatValue(set.size) : set.size}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </VennDiagramContext.Provider>
  );
};

VennDiagram.displayName = "VennDiagram";
