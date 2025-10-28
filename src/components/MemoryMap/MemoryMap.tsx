import { useMemo, memo } from 'react';
import type { HeapBlock } from '../../types/heap';
import {
  formatBytes,
  formatAddress,
  getColorForFieldName,
  getFreeBlockColor,
} from '../../lib/heapUtils';

/**
 * Props for the MemoryMap component
 */
interface MemoryMapProps {
  /** Filtered blocks to display */
  blocks: HeapBlock[];
  /** All heap blocks (for index mapping) */
  allBlocks: HeapBlock[];
  /** Starting address of the heap region */
  heapStart: number;
  /** Total length of the heap in bytes */
  heapLength: number;
  /** Index of currently hovered block (or null) */
  hoveredBlockIndex: number | null;
  /** Callback when block hover state changes */
  onBlockHover: (index: number | null) => void;
  /** Optional callback to reset filters */
  onResetFilters?: () => void;
}

/**
 * MemoryMap - Horizontal visualization of heap memory blocks
 *
 * Renders a horizontal memory map where:
 * - Each block's width is proportional to its size
 * - Blocks are color-coded by field name
 * - Free blocks appear in light gray
 * - Blocks are keyboard-accessible with tooltips
 * - Uses O(1) Map lookup for performance
 *
 *
 * @param {MemoryMapProps} props - Component props
 *
 * @param {HeapBlock[]} props.blocks - Filtered blocks to render
 *
 * @param {HeapBlock[]} props.allBlocks - All blocks for index mapping
 *
 * @param {number} props.heapStart - Heap starting address
 *
 * @param {number} props.heapLength - Total heap size in bytes
 *
 * @param {number | null} props.hoveredBlockIndex - Currently hovered block index
 *
 * @param {Function} props.onBlockHover - Hover state change callback
 *
 * @param {Function} [props.onResetFilters] - Optional callback to reset filters
 *
 * @returns Rendered memory map visualization
 */
export const MemoryMap = memo(function MemoryMap({
  blocks,
  allBlocks,
  heapStart,
  heapLength,
  hoveredBlockIndex,
  onBlockHover,
  onResetFilters,
}: MemoryMapProps) {
  // Create a Map for O(1) block index lookup
  const blockIndexMap = useMemo(
    () => new Map(allBlocks.map((block, idx) => [block, idx])),
    [allBlocks]
  );

  // Memoize block elements to prevent recreating on every render
  const blockElements = useMemo(() => {
    return blocks.map((block) => {
      const originalIndex = blockIndexMap.get(block);
      if (originalIndex === undefined) {
        // Block not found in index map - skip rendering
        return null;
      }
      const offsetFromStart = block.start_address - heapStart;
      const leftPercent = (offsetFromStart / heapLength) * 100;
      const widthPercent = (block.length / heapLength) * 100;
      const color = block.free
        ? getFreeBlockColor()
        : getColorForFieldName(block.field_name);
      const isHovered = hoveredBlockIndex === originalIndex;

      return (
        <div
          key={originalIndex}
          className={`heap-block ${isHovered ? 'hovered' : ''}`}
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            backgroundColor: color,
          }}
          role="button"
          tabIndex={0}
          aria-label={`Memory block ${originalIndex}: ${formatBytes(block.length)}, ${
            block.free ? 'free' : 'allocated'
          }${block.field_name ? `, ${block.field_name}` : ''}`}
          onMouseEnter={() => onBlockHover(originalIndex)}
          onMouseLeave={() => onBlockHover(null)}
          onFocus={() => onBlockHover(originalIndex)}
          onBlur={() => onBlockHover(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onBlockHover(hoveredBlockIndex === originalIndex ? null : originalIndex);
            }
          }}
          data-testid={`heap-block-${originalIndex}`}
        >
          {isHovered && (
            <div className="block-tooltip">
              <div className="tooltip-header">Block #{originalIndex}</div>
              <div className="tooltip-row">
                <span className="tooltip-label">Address:</span>
                <span className="tooltip-value">
                  {formatAddress(block.start_address)}
                </span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Length:</span>
                <span className="tooltip-value">{formatBytes(block.length)}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Field:</span>
                <span className="tooltip-value">
                  {block.field_name || (block.free ? 'Free' : 'Unnamed')}
                </span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Status:</span>
                <span
                  className={`tooltip-value status-${block.free ? 'free' : 'allocated'}`}
                >
                  {block.free ? 'Free' : 'Allocated'}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    });
  }, [blocks, blockIndexMap, heapStart, heapLength, hoveredBlockIndex, onBlockHover]);

  return (
    <div className="memory-map-container">
      <div className="memory-map-label">Memory Map:</div>
      <div className="memory-map">{blockElements.filter(el => el !== null)}</div>
      {blocks.length === 0 && (
        <div className="no-blocks-message">
          <p>No blocks match the current filters.</p>
          {onResetFilters && (
            <button className="reset-filters-btn" onClick={onResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
});
