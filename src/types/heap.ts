/**
 * Represents a single memory block in the heap
 */
export interface HeapBlock {
  /** Starting address of the memory block */
  start_address: number;
  /** Length of the block in bytes */
  length: number;
  /** Whether this block is free or allocated */
  free: boolean;
  /** Name of the field (null for free blocks or unnamed allocations) */
  field_name: string | null;
}

/**
 * Represents the entire heap region
 */
export interface HeapRegion {
  /** Starting address of the heap region */
  start_address: number;
  /** Total length of the heap region in bytes */
  length: number;
  /** Array of memory blocks within the heap */
  blocks: HeapBlock[];
}

/**
 * Root data structure returned by the heap dump parser
 */
export interface HeapDumpData {
  data: {
    heap_region: HeapRegion;
  };
}

/**
 * Statistics calculated from the heap dump
 */
export interface HeapStatistics {
  /** Total size of the heap in bytes */
  totalSize: number;
  /** Total used memory in bytes */
  usedMemory: number;
  /** Total free memory in bytes */
  freeMemory: number;
  /** Percentage of memory used */
  usedPercentage: number;
  /** Percentage of memory free */
  freePercentage: number;
  /** Size of the largest contiguous free block in bytes */
  largestFreeBlock: number;
  /** Number of free blocks (fragmentation indicator) */
  freeBlockCount: number;
  /** Number of allocated blocks */
  allocatedBlockCount: number;
  /** Fragmentation ratio (0 = perfectly contiguous, higher = more fragmented) */
  fragmentationRatio: number;
}

/**
 * Filter options for the heap visualizer
 */
export interface FilterOptions {
  /** Whether to show free blocks */
  showFree: boolean;
  /** Whether to show allocated blocks */
  showAllocated: boolean;
  /** Filter by specific field name (null means show all) */
  fieldNameFilter: string | null;
}
