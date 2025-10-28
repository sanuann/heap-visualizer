import { useState, useMemo, useCallback } from 'react';
import type { HeapDumpData, FilterOptions } from '../../types/heap';
import {
  calculateHeapStatistics,
  filterBlocks,
  getUniqueFieldNames,
  formatBytes,
  formatAddress,
} from '../../lib/heapUtils';
import { StatisticsPanel } from '../StatisticsPanel/StatisticsPanel';
import { FilterControls } from '../FilterControls/FilterControls';
import { MemoryMap } from '../MemoryMap/MemoryMap';
import { Legend } from '../Legend/Legend';
import './HeapVisualizer.css';

/**
 * Props for the HeapVisualizer component
 */
export interface HeapVisualizerProps {
  /** Heap dump data to visualize */
  data: HeapDumpData;
  /** Whether data is currently loading */
  loading?: boolean;
  /** Error object if data loading failed */
  error?: Error;
}

/**
 * HeapVisualizer - Interactive memory heap visualization component for embedded systems debugging
 *
 * Displays heap memory allocations as a horizontal memory map with:
 * - Real-time statistics (used/free memory, fragmentation metrics)
 * - Interactive filtering by allocation status and field name
 * - Color-coded blocks by field name
 * - Keyboard-accessible blocks with hover tooltips
 * - Loading and error states
 *
 *
 * @param {HeapVisualizerProps} props - Component props
 *
 * @param {HeapDumpData} props.data - Heap dump data containing heap region and blocks
 *
 * @param {boolean} [props.loading=false] - Whether data is currently loading
 *
 * @param {Error} [props.error] - Error object if data loading failed
 *
 * @returns Rendered heap visualization component
 */
export function HeapVisualizer({ data, loading = false, error }: HeapVisualizerProps) {
  // Loading state
  if (loading) {
    return (
      <div className="heap-visualizer-loading">
        <div className="loading-spinner" role="status" aria-label="Loading" />
        <p>Loading heap dump...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="heap-visualizer-error">
        <h3>Error Loading Heap Dump</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  // Validate data structure
  if (!data?.data?.heap_region) {
    return (
      <div className="heap-visualizer-error">
        <h3>Invalid Heap Data</h3>
        <p>Unable to load heap dump. Please check the data format.</p>
      </div>
    );
  }

  const { heap_region } = data.data;
  const { blocks, start_address, length } = heap_region;

  // Validate heap region
  if (!Array.isArray(blocks)) {
    return (
      <div className="heap-visualizer-error">
        <h3>Invalid Heap Data</h3>
        <p>Heap region must contain a blocks array.</p>
      </div>
    );
  }

  if (length <= 0) {
    return (
      <div className="heap-visualizer-error">
        <h3>Invalid Heap Size</h3>
        <p>Heap region length must be greater than 0.</p>
      </div>
    );
  }

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    showFree: true,
    showAllocated: true,
    fieldNameFilter: null,
  });

  // Reset filters handler
  const handleResetFilters = useCallback(() => {
    setFilters({
      showFree: true,
      showAllocated: true,
      fieldNameFilter: null,
    });
  }, []);

  // Hover state
  const [hoveredBlockIndex, setHoveredBlockIndex] = useState<number | null>(null);

  // Statistics panel collapse state (collapsed by default to highlight memory map)
  const [statsCollapsed, setStatsCollapsed] = useState<boolean>(true);

  // Toggle statistics panel collapse
  const handleToggleStats = useCallback(() => {
    setStatsCollapsed((prev) => !prev);
  }, []);

  // Validate blocks don't exceed heap boundaries
  const invalidBlocks = useMemo(
    () =>
      blocks.filter(
        (block) =>
          block.start_address < start_address ||
          block.start_address + block.length > start_address + length
      ),
    [blocks, start_address, length]
  );

  // Calculate statistics
  const statistics = useMemo(
    () => calculateHeapStatistics(heap_region),
    [heap_region]
  );

  // Get unique field names for filter dropdown
  const fieldNames = useMemo(() => getUniqueFieldNames(blocks), [blocks]);

  // Filter blocks
  const filteredBlocks = useMemo(
    () => filterBlocks(blocks, filters),
    [blocks, filters]
  );

  // Memoized filter change handlers
  const handleShowFreeChange = useCallback((show: boolean) => {
    setFilters((f) => ({ ...f, showFree: show }));
  }, []);

  const handleShowAllocatedChange = useCallback((show: boolean) => {
    setFilters((f) => ({ ...f, showAllocated: show }));
  }, []);

  const handleFieldNameFilterChange = useCallback((name: string | null) => {
    setFilters((f) => ({ ...f, fieldNameFilter: name }));
  }, []);

  return (
    <div className="heap-visualizer">
      {/* Header */}
      <div className="visualizer-header">
        <h2>Heap Memory Visualizer</h2>
        <div className="heap-info">
          {formatAddress(start_address)} - {formatAddress(start_address + length)}
          ({formatBytes(length)} total)
        </div>
      </div>

      {/* Warning Banner for Invalid Blocks */}
      {invalidBlocks.length > 0 && (
        <div className="warning-banner" role="alert">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            Warning: {invalidBlocks.length} block(s) detected outside heap boundaries
          </span>
          {import.meta.env.DEV && (
            <button
              className="warning-details-btn"
              onClick={() => {
                console.table(invalidBlocks);
                console.log('Invalid blocks:', invalidBlocks);
              }}
            >
              View Details
            </button>
          )}
        </div>
      )}

      {/* Statistics Panel */}
      <StatisticsPanel
        statistics={statistics}
        isCollapsed={statsCollapsed}
        onToggle={handleToggleStats}
      />

      {/* Filter Controls */}
      <FilterControls
        filters={filters}
        fieldNames={fieldNames}
        onShowFreeChange={handleShowFreeChange}
        onShowAllocatedChange={handleShowAllocatedChange}
        onFieldNameFilterChange={handleFieldNameFilterChange}
        onReset={handleResetFilters}
      />

      {/* Memory Map Visualization */}
      <MemoryMap
        blocks={filteredBlocks}
        allBlocks={blocks}
        heapStart={start_address}
        heapLength={length}
        hoveredBlockIndex={hoveredBlockIndex}
        onBlockHover={setHoveredBlockIndex}
        onResetFilters={handleResetFilters}
      />

      {/* Legend */}
      <Legend fieldNames={fieldNames} />
    </div>
  );
}
