import type {
  HeapBlock,
  HeapRegion,
  HeapStatistics,
  FilterOptions,
} from '../types/heap';

/**
 * Calculate statistics from a heap region
 */
export function calculateHeapStatistics(
  heapRegion: HeapRegion
): HeapStatistics {
  const { blocks, length: totalSize } = heapRegion;

  let usedMemory = 0;
  let freeMemory = 0;
  let largestFreeBlock = 0;
  let freeBlockCount = 0;
  let allocatedBlockCount = 0;

  blocks.forEach((block) => {
    if (block.free) {
      freeMemory += block.length;
      freeBlockCount++;
      if (block.length > largestFreeBlock) {
        largestFreeBlock = block.length;
      }
    } else {
      usedMemory += block.length;
      allocatedBlockCount++;
    }
  });

  const usedPercentage = totalSize > 0 ? (usedMemory / totalSize) * 100 : 0;
  const freePercentage = totalSize > 0 ? (freeMemory / totalSize) * 100 : 0;

  // Calculate fragmentation ratio using industry standard formula
  // Formula: 1 - (largest free block / total free memory)
  // See Heap_Fragmentation_Research.md for detailed research and references
  const fragmentationRatio = freeMemory > 0
    ? 1 - (largestFreeBlock / freeMemory)
    : 0;

  return {
    totalSize,
    usedMemory,
    freeMemory,
    usedPercentage,
    freePercentage,
    largestFreeBlock,
    freeBlockCount,
    allocatedBlockCount,
    fragmentationRatio,
  };
}

/**
 * Filter blocks based on filter options
 */
export function filterBlocks(
  blocks: HeapBlock[],
  filters: FilterOptions
): HeapBlock[] {
  return blocks.filter((block) => {
    // Filter by free/allocated status
    if (block.free && !filters.showFree) {
      return false;
    }
    if (!block.free && !filters.showAllocated) {
      return false;
    }

    // Filter by field name
    if (filters.fieldNameFilter !== null) {
      if (block.field_name !== filters.fieldNameFilter) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get unique field names from blocks
 */
export function getUniqueFieldNames(blocks: HeapBlock[]): string[] {
  const fieldNames = new Set<string>();

  blocks.forEach((block) => {
    if (block.field_name !== null) {
      fieldNames.add(block.field_name);
    }
  });

  return Array.from(fieldNames).sort();
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;

  // For this use case, most values will be in bytes or KB
  if (bytes < k) {
    return `${bytes} B`;
  } else if (bytes < k * k) {
    return `${(bytes / k).toFixed(2)} KB`;
  } else if (bytes < k * k * k) {
    return `${(bytes / (k * k)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (k * k * k)).toFixed(2)} GB`;
  }
}

/**
 * Format address as hexadecimal
 */
export function formatAddress(address: number): string {
  return `0x${address.toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Get a color for a specific field name (deterministic)
 */
export function getColorForFieldName(fieldName: string | null): string {
  if (fieldName === null) {
    return '#9CA3AF'; // Gray for unnamed allocations
  }

  // Predefined colors for common field names
  const colorMap: Record<string, string> = {
    sBluetoothConnectionCtx: '#3B82F6', // Blue
    sWorkEntryCtx: '#10B981', // Green
  };

  if (colorMap[fieldName]) {
    return colorMap[fieldName];
  }

  // Generate a deterministic color from the field name
  let hash = 0;
  for (let i = 0; i < fieldName.length; i++) {
    hash = fieldName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Get color for free blocks
 */
export function getFreeBlockColor(): string {
  return '#E5E7EB'; // Light gray
}
