import { describe, it, expect } from 'vitest';
import {
  calculateHeapStatistics,
  filterBlocks,
  getUniqueFieldNames,
  formatBytes,
  formatAddress,
  getColorForFieldName,
  getFreeBlockColor,
} from './heapUtils';
import type { HeapRegion, HeapBlock, FilterOptions } from '../types/heap';

describe('heapUtils', () => {
  const mockBlocks: HeapBlock[] = [
    {
      start_address: 100,
      length: 100,
      free: false,
      field_name: 'sBluetoothConnectionCtx',
    },
    { start_address: 200, length: 200, free: true, field_name: null },
    {
      start_address: 400,
      length: 150,
      free: false,
      field_name: 'sWorkEntryCtx',
    },
    { start_address: 550, length: 50, free: false, field_name: null },
  ];

  const mockHeapRegion: HeapRegion = {
    start_address: 100,
    length: 500,
    blocks: mockBlocks,
  };

  describe('calculateHeapStatistics', () => {
    it('calculates correct statistics', () => {
      const stats = calculateHeapStatistics(mockHeapRegion);

      expect(stats.totalSize).toBe(500);
      expect(stats.usedMemory).toBe(300); // 100 + 150 + 50
      expect(stats.freeMemory).toBe(200);
      expect(stats.usedPercentage).toBe(60);
      expect(stats.freePercentage).toBe(40);
      expect(stats.largestFreeBlock).toBe(200);
      expect(stats.freeBlockCount).toBe(1);
      expect(stats.allocatedBlockCount).toBe(3);
      // Fragmentation: 1 - (200/200) = 0 (no fragmentation, one contiguous block)
      expect(stats.fragmentationRatio).toBe(0);
    });

    it('handles empty heap', () => {
      const emptyHeap: HeapRegion = {
        start_address: 0,
        length: 0,
        blocks: [],
      };
      const stats = calculateHeapStatistics(emptyHeap);

      expect(stats.totalSize).toBe(0);
      expect(stats.usedMemory).toBe(0);
      expect(stats.freeMemory).toBe(0);
      expect(stats.usedPercentage).toBe(0);
      expect(stats.freePercentage).toBe(0);
      expect(stats.fragmentationRatio).toBe(0);
    });

    it('calculates fragmentation correctly - no fragmentation', () => {
      // One contiguous free block
      const heap: HeapRegion = {
        start_address: 0,
        length: 1000,
        blocks: [
          { start_address: 0, length: 600, free: false, field_name: 'allocated' },
          { start_address: 600, length: 400, free: true, field_name: null },
        ],
      };
      const stats = calculateHeapStatistics(heap);

      expect(stats.freeMemory).toBe(400);
      expect(stats.largestFreeBlock).toBe(400);
      // Fragmentation = 1 - (400/400) = 0
      expect(stats.fragmentationRatio).toBe(0);
    });

    it('calculates fragmentation correctly - moderate fragmentation', () => {
      // Multiple free blocks, largest is 50% of free memory
      const heap: HeapRegion = {
        start_address: 0,
        length: 1000,
        blocks: [
          { start_address: 0, length: 200, free: false, field_name: 'allocated' },
          { start_address: 200, length: 200, free: true, field_name: null },
          { start_address: 400, length: 200, free: false, field_name: 'allocated' },
          { start_address: 600, length: 200, free: true, field_name: null },
          { start_address: 800, length: 200, free: false, field_name: 'allocated' },
        ],
      };
      const stats = calculateHeapStatistics(heap);

      expect(stats.freeMemory).toBe(400);
      expect(stats.largestFreeBlock).toBe(200);
      // Fragmentation = 1 - (200/400) = 0.5 = 50%
      expect(stats.fragmentationRatio).toBe(0.5);
    });

    it('calculates fragmentation correctly - high fragmentation', () => {
      // Many small free blocks
      const heap: HeapRegion = {
        start_address: 0,
        length: 1000,
        blocks: [
          { start_address: 0, length: 100, free: false, field_name: 'allocated' },
          { start_address: 100, length: 80, free: true, field_name: null },
          { start_address: 180, length: 100, free: false, field_name: 'allocated' },
          { start_address: 280, length: 60, free: true, field_name: null },
          { start_address: 340, length: 100, free: false, field_name: 'allocated' },
          { start_address: 440, length: 40, free: true, field_name: null },
          { start_address: 480, length: 100, free: false, field_name: 'allocated' },
          { start_address: 580, length: 20, free: true, field_name: null },
        ],
      };
      const stats = calculateHeapStatistics(heap);

      expect(stats.freeMemory).toBe(200); // 80 + 60 + 40 + 20
      expect(stats.largestFreeBlock).toBe(80);
      // Fragmentation = 1 - (80/200) = 0.6 = 60%
      expect(stats.fragmentationRatio).toBe(0.6);
    });

    it('calculates fragmentation correctly - severe fragmentation', () => {
      // Many tiny free blocks
      const heap: HeapRegion = {
        start_address: 0,
        length: 1000,
        blocks: [
          { start_address: 0, length: 100, free: false, field_name: 'allocated' },
          { start_address: 100, length: 10, free: true, field_name: null },
          { start_address: 110, length: 100, free: false, field_name: 'allocated' },
          { start_address: 210, length: 10, free: true, field_name: null },
          { start_address: 220, length: 100, free: false, field_name: 'allocated' },
          { start_address: 320, length: 10, free: true, field_name: null },
          { start_address: 330, length: 100, free: false, field_name: 'allocated' },
          { start_address: 430, length: 10, free: true, field_name: null },
        ],
      };
      const stats = calculateHeapStatistics(heap);

      expect(stats.freeMemory).toBe(40); // 4 blocks × 10 bytes
      expect(stats.largestFreeBlock).toBe(10);
      // Fragmentation = 1 - (10/40) = 0.75 = 75%
      expect(stats.fragmentationRatio).toBe(0.75);
    });
  });

  describe('filterBlocks', () => {
    it('filters free blocks when showFree is false', () => {
      const filters: FilterOptions = {
        showFree: false,
        showAllocated: true,
        fieldNameFilter: null,
      };
      const result = filterBlocks(mockBlocks, filters);

      expect(result).toHaveLength(3);
      expect(result.every((block) => !block.free)).toBe(true);
    });

    it('filters allocated blocks when showAllocated is false', () => {
      const filters: FilterOptions = {
        showFree: true,
        showAllocated: false,
        fieldNameFilter: null,
      };
      const result = filterBlocks(mockBlocks, filters);

      expect(result).toHaveLength(1);
      expect(result.every((block) => block.free)).toBe(true);
    });

    it('filters by field name', () => {
      const filters: FilterOptions = {
        showFree: true,
        showAllocated: true,
        fieldNameFilter: 'sWorkEntryCtx',
      };
      const result = filterBlocks(mockBlocks, filters);

      expect(result).toHaveLength(1);
      expect(result[0].field_name).toBe('sWorkEntryCtx');
    });

    it('returns all blocks when all filters are enabled', () => {
      const filters: FilterOptions = {
        showFree: true,
        showAllocated: true,
        fieldNameFilter: null,
      };
      const result = filterBlocks(mockBlocks, filters);

      expect(result).toHaveLength(4);
    });
  });

  describe('getUniqueFieldNames', () => {
    it('returns unique field names sorted', () => {
      const result = getUniqueFieldNames(mockBlocks);

      expect(result).toEqual(['sBluetoothConnectionCtx', 'sWorkEntryCtx']);
    });

    it('excludes null field names', () => {
      const result = getUniqueFieldNames(mockBlocks);

      expect(result).not.toContain(null);
    });

    it('handles empty blocks array', () => {
      const result = getUniqueFieldNames([]);

      expect(result).toEqual([]);
    });
  });

  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(1536)).toBe('1.50 KB');
      expect(formatBytes(1048576)).toBe('1.00 MB');
      expect(formatBytes(1073741824)).toBe('1.00 GB');
    });
  });

  describe('formatAddress', () => {
    it('formats addresses as hex', () => {
      expect(formatAddress(0)).toBe('0x00000000');
      expect(formatAddress(255)).toBe('0x000000FF');
      expect(formatAddress(536875472)).toBe('0x200011D0');
    });
  });

  describe('getColorForFieldName', () => {
    it('returns consistent color for same field name', () => {
      const color1 = getColorForFieldName('sBluetoothConnectionCtx');
      const color2 = getColorForFieldName('sBluetoothConnectionCtx');

      expect(color1).toBe(color2);
      expect(color1).toBe('#3B82F6');
    });

    it('returns gray for null field name', () => {
      const color = getColorForFieldName(null);

      expect(color).toBe('#9CA3AF');
    });

    it('returns different colors for different field names', () => {
      const color1 = getColorForFieldName('sBluetoothConnectionCtx');
      const color2 = getColorForFieldName('sWorkEntryCtx');

      expect(color1).not.toBe(color2);
    });
  });

  describe('getFreeBlockColor', () => {
    it('returns light gray color', () => {
      const color = getFreeBlockColor();

      expect(color).toBe('#E5E7EB');
    });
  });

  describe('Edge Cases', () => {
    it('handles heap with single block', () => {
      const singleBlockHeap: HeapRegion = {
        start_address: 0,
        length: 100,
        blocks: [
          { start_address: 0, length: 100, free: false, field_name: 'test' },
        ],
      };
      const stats = calculateHeapStatistics(singleBlockHeap);

      expect(stats.totalSize).toBe(100);
      expect(stats.usedMemory).toBe(100);
      expect(stats.freeMemory).toBe(0);
      expect(stats.usedPercentage).toBe(100);
      expect(stats.freePercentage).toBe(0);
      expect(stats.allocatedBlockCount).toBe(1);
      expect(stats.freeBlockCount).toBe(0);
      // No free memory, fragmentation is 0
      expect(stats.fragmentationRatio).toBe(0);
    });

    it('handles completely fragmented heap (many small blocks)', () => {
      // Create 100 blocks alternating between free and allocated
      const fragmentedBlocks: HeapBlock[] = Array.from({ length: 100 }, (_, i) => ({
        start_address: i * 10,
        length: 5,
        free: i % 2 === 0,
        field_name: i % 2 === 0 ? null : `field_${i}`,
      }));

      const fragmentedHeap: HeapRegion = {
        start_address: 0,
        length: 1000,
        blocks: fragmentedBlocks,
      };

      const stats = calculateHeapStatistics(fragmentedHeap);

      expect(stats.freeBlockCount).toBe(50);
      expect(stats.allocatedBlockCount).toBe(50);
      expect(stats.largestFreeBlock).toBe(5);
      expect(stats.usedMemory).toBe(250); // 50 blocks * 5 bytes
      expect(stats.freeMemory).toBe(250); // 50 blocks * 5 bytes
      // Fragmentation = 1 - (5/250) = 0.98 = 98% (severe fragmentation)
      expect(stats.fragmentationRatio).toBe(0.98);
    });

    it('handles large heap with 1000 blocks', () => {
      const largeBlocks: HeapBlock[] = Array.from({ length: 1000 }, (_, i) => ({
        start_address: i * 1024,
        length: 512,
        free: i % 3 === 0, // Every 3rd block is free
        field_name: i % 3 === 0 ? null : `field_${i % 10}`,
      }));

      const largeHeap: HeapRegion = {
        start_address: 0,
        length: 1024000,
        blocks: largeBlocks,
      };

      const stats = calculateHeapStatistics(largeHeap);

      expect(stats.freeBlockCount).toBe(334); // floor(1000/3) + 1
      expect(stats.allocatedBlockCount).toBe(666);
      expect(stats.largestFreeBlock).toBe(512);
      // Free memory: 334 blocks * 512 bytes = 171,008 bytes
      // Fragmentation = 1 - (512 / 171,008) ≈ 0.997 = 99.7% (highly fragmented)
      expect(stats.fragmentationRatio).toBeCloseTo(0.997, 3);
    });

    it('handles heap with very large addresses', () => {
      const largeAddress = 0xFFFFFFFF;
      expect(formatAddress(largeAddress)).toBe('0xFFFFFFFF');

      const highAddressHeap: HeapRegion = {
        start_address: 0xF0000000,
        length: 0x1000,
        blocks: [
          {
            start_address: 0xF0000000,
            length: 0x500,
            free: false,
            field_name: 'high_address_block',
          },
          {
            start_address: 0xF0000500,
            length: 0xB00,
            free: true,
            field_name: null,
          },
        ],
      };

      const stats = calculateHeapStatistics(highAddressHeap);
      expect(stats.totalSize).toBe(0x1000);
      expect(stats.usedMemory).toBe(0x500);
    });

    it('handles heap with all blocks the same size', () => {
      const uniformBlocks: HeapBlock[] = Array.from({ length: 10 }, (_, i) => ({
        start_address: i * 100,
        length: 100,
        free: i % 2 === 0,
        field_name: i % 2 === 0 ? null : 'uniform_field',
      }));

      const uniformHeap: HeapRegion = {
        start_address: 0,
        length: 1000,
        blocks: uniformBlocks,
      };

      const stats = calculateHeapStatistics(uniformHeap);
      expect(stats.usedPercentage).toBe(50);
      expect(stats.freePercentage).toBe(50);
      expect(stats.largestFreeBlock).toBe(100);
      // 5 free blocks of 100 bytes each = 500 bytes free
      // Fragmentation = 1 - (100/500) = 0.8 = 80%
      expect(stats.fragmentationRatio).toBe(0.8);
    });

    it('handles filtering with no matches', () => {
      const blocks: HeapBlock[] = [
        { start_address: 0, length: 100, free: false, field_name: 'test1' },
        { start_address: 100, length: 100, free: false, field_name: 'test2' },
      ];

      const filters: FilterOptions = {
        showFree: false,
        showAllocated: false,
        fieldNameFilter: null,
      };

      const result = filterBlocks(blocks, filters);
      expect(result).toHaveLength(0);
    });

    it('handles very large byte values in formatting', () => {
      expect(formatBytes(1073741824)).toBe('1.00 GB'); // 1 GB
      expect(formatBytes(5368709120)).toBe('5.00 GB'); // 5 GB
      expect(formatBytes(1099511627776)).toBe('1024.00 GB'); // 1 TB (shows as GB)
    });

    it('generates deterministic colors for many unique field names', () => {
      const fieldNames = Array.from({ length: 50 }, (_, i) => `field_${i}`);

      // Colors should be deterministic
      const colors1 = fieldNames.map(getColorForFieldName);
      const colors2 = fieldNames.map(getColorForFieldName);

      expect(colors1).toEqual(colors2);

      // All colors should be unique (except for predefined ones)
      const uniqueColors = new Set(colors1);
      expect(uniqueColors.size).toBeGreaterThanOrEqual(48); // Allow some overlap
    });
  });
});
