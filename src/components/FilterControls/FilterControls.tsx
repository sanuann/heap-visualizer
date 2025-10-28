import { memo } from 'react';
import type { FilterOptions } from '../../types/heap';

/**
 * Props for the FilterControls component
 */
interface FilterControlsProps {
  /** Current filter state */
  filters: FilterOptions;
  /** Array of unique field names for dropdown options */
  fieldNames: string[];
  /** Callback when showFree filter changes */
  onShowFreeChange?: (show: boolean) => void;
  /** Callback when showAllocated filter changes */
  onShowAllocatedChange?: (show: boolean) => void;
  /** Callback when fieldNameFilter changes */
  onFieldNameFilterChange?: (fieldName: string | null) => void;
  /** Callback to reset all filters to default state */
  onReset?: () => void;
}

/**
 * FilterControls - Interactive filter controls for heap visualization
 *
 * Provides controls for filtering heap blocks by:
 * - Free/allocated status (checkboxes)
 * - Field name (dropdown selector)
 *
 * Filters can be combined to narrow down visible blocks.
 *
 * @param {FilterControlsProps} props - Component props
 *
 * @param {FilterOptions} props.filters - Current filter state
 *
 * @param {string[]} props.fieldNames - Unique field names for dropdown
 *
 * @param {Function} [props.onShowFreeChange] - Callback when showFree changes
 *
 * @param {Function} [props.onShowAllocatedChange] - Callback when showAllocated changes
 *
 * @param {Function} [props.onFieldNameFilterChange] - Callback when fieldNameFilter changes
 *
 * @param {Function} [props.onReset] - Callback to reset all filters
 *
 * @returns {JSX.Element} Rendered filter controls
 */
export const FilterControls = memo(function FilterControls({
  filters,
  fieldNames,
  onShowFreeChange,
  onShowAllocatedChange,
  onFieldNameFilterChange,
  onReset,
}: FilterControlsProps) {
  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.showFree}
            onChange={(e) => onShowFreeChange?.(e.target.checked)}
          />
          <span>Show Free Blocks</span>
        </label>
        <label className="filter-checkbox">
          <input
            type="checkbox"
            checked={filters.showAllocated}
            onChange={(e) => onShowAllocatedChange?.(e.target.checked)}
          />
          <span>Show Allocated Blocks</span>
        </label>
      </div>
      <div className="filter-group">
        <label className="filter-select-label">
          <span>Filter by Field Name:</span>
          <select
            className="filter-select"
            value={filters.fieldNameFilter || ''}
            onChange={(e) =>
              onFieldNameFilterChange?.(e.target.value || null)
            }
          >
            <option value="">All Fields</option>
            {fieldNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {onReset && (
          <button className="reset-btn" onClick={onReset}>
            Reset All Filters
          </button>
        )}
      </div>
    </div>
  );
});
