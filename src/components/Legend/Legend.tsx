import { memo } from 'react';
import { getColorForFieldName, getFreeBlockColor } from '../../lib/heapUtils';

/**
 * Props for the Legend component
 */
interface LegendProps {
  /** Array of unique field names to display in legend */
  fieldNames: string[];
}

/**
 * Legend - Color legend for memory block visualization
 *
 * Displays color mappings for:
 * - Free blocks (light gray)
 * - Named field allocations (various colors)
 * - Unnamed allocations (gray)
 *
 * Colors are deterministically generated from field names for consistency.
 *
 *
 * @param {LegendProps} props - Component props
 *
 * @param {string[]} props.fieldNames - Unique field names from heap blocks
 *
 * @returns Rendered color legend
 */
export const Legend = memo(function Legend({ fieldNames }: LegendProps) {
  return (
    <div className="legend">
      <div className="legend-title">Legend:</div>
      <div className="legend-items">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: getFreeBlockColor() }}
          />
          <span>Free</span>
        </div>
        {fieldNames.map((name) => (
          <div className="legend-item" key={name}>
            <div
              className="legend-color"
              style={{ backgroundColor: getColorForFieldName(name) }}
            />
            <span>{name}</span>
          </div>
        ))}
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: getColorForFieldName(null) }}
          />
          <span>Unnamed</span>
        </div>
      </div>
    </div>
  );
});
