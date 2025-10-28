import { memo } from 'react';
import type { HeapStatistics } from '../../types/heap';
import { formatBytes } from '../../lib/heapUtils';

/**
 * Props for the StatisticsPanel component
 */
interface StatisticsPanelProps {
  /** Calculated heap statistics to display */
  statistics: HeapStatistics;
  /** Whether the panel is collapsed (showing summary only) */
  isCollapsed?: boolean;
  /** Callback when collapse/expand button is clicked */
  onToggle?: () => void;
}

/**
 * StatisticsPanel - Displays real-time heap memory statistics
 *
 * Shows key metrics including:
 * - Total heap size
 * - Used and free memory (bytes and percentage)
 * - Largest contiguous free block
 * - Block counts (free and allocated)
 *
 * Can be collapsed to show only summary metrics (Used, Free, Fragmentation).
 *
 *
 * @param {StatisticsPanelProps} props - Component props
 *
 * @param {HeapStatistics} props.statistics - Calculated heap statistics
 *
 * @param {boolean} [props.isCollapsed=false] - Whether panel is collapsed
 *
 * @param {Function} [props.onToggle] - Toggle collapse/expand callback
 *
 * @returns Rendered statistics panel
 */
export const StatisticsPanel = memo(function StatisticsPanel({
  statistics,
  isCollapsed = false,
  onToggle
}: StatisticsPanelProps) {
  return (
    <div className={`statistics-panel ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Header with collapse/expand button */}
      <div className="stats-header">
        <h3 className="stats-title">Statistics</h3>
        {onToggle && (
          <button
            className="stats-toggle-btn"
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand statistics' : 'Collapse statistics'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
        )}
      </div>

      {/* Summary view (always visible) */}
      <div className="stats-summary">
        <span className="stat-summary-item">
          <span className="stat-summary-label">Used:</span>{' '}
          <span className="stat-value stat-used">
            {formatBytes(statistics.usedMemory)} ({statistics.usedPercentage.toFixed(1)}%)
          </span>
        </span>
        <span className="stat-summary-separator">•</span>
        <span className="stat-summary-item">
          <span className="stat-summary-label">Free:</span>{' '}
          <span className="stat-value stat-free">
            {formatBytes(statistics.freeMemory)} ({statistics.freePercentage.toFixed(1)}%)
          </span>
        </span>
        <span className="stat-summary-separator">•</span>
        <span className="stat-summary-item">
          <span className="stat-summary-label">Fragmentation:</span>{' '}
          <span
            className={`stat-value stat-fragmentation-${
              statistics.fragmentationRatio > 0.3 ? 'high' : 'low'
            }`}
          >
            {(statistics.fragmentationRatio * 100).toFixed(1)}%
          </span>
        </span>
      </div>

      {/* Detailed view (only visible when expanded) */}
      {!isCollapsed && (
        <div className="stats-details">
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Total Size:</span>
              <span className="stat-value">{formatBytes(statistics.totalSize)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Largest Free Block:</span>
              <span className="stat-value">
                {formatBytes(statistics.largestFreeBlock)}
              </span>
            </div>
          </div>
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Free Blocks:</span>
              <span className="stat-value">{statistics.freeBlockCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Allocated Blocks:</span>
              <span className="stat-value">{statistics.allocatedBlockCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
