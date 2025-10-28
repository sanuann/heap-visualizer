import type { Meta, StoryObj } from '@storybook/react';
import { StatisticsPanel } from './StatisticsPanel';
import type { HeapStatistics } from '../../types/heap';

const meta = {
  title: 'Components/StatisticsPanel',
  component: StatisticsPanel,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatisticsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// Normal heap with moderate usage
export const ModerateUsage: Story = {
  args: {
    statistics: {
      totalSize: 12000,
      usedMemory: 7200,
      freeMemory: 4800,
      usedPercentage: 60,
      freePercentage: 40,
      largestFreeBlock: 2400,
      freeBlockCount: 5,
      allocatedBlockCount: 12,
      fragmentationRatio: 0.000833, // (5-1)/4800 = low fragmentation
    } as HeapStatistics,
  },
};

// Nearly full heap (high memory pressure)
export const HighMemoryPressure: Story = {
  args: {
    statistics: {
      totalSize: 12000,
      usedMemory: 11400,
      freeMemory: 600,
      usedPercentage: 95,
      freePercentage: 5,
      largestFreeBlock: 200,
      freeBlockCount: 8,
      allocatedBlockCount: 25,
      fragmentationRatio: 0.011667, // (8-1)/600 = high fragmentation
    } as HeapStatistics,
  },
};

// Mostly free heap (low usage)
export const LowUsage: Story = {
  args: {
    statistics: {
      totalSize: 12000,
      usedMemory: 600,
      freeMemory: 11400,
      usedPercentage: 5,
      freePercentage: 95,
      largestFreeBlock: 10800,
      freeBlockCount: 2,
      allocatedBlockCount: 3,
      fragmentationRatio: 0.000088, // (2-1)/11400 = very low fragmentation
    } as HeapStatistics,
  },
};

// Highly fragmented heap (swiss cheese)
export const HighlyFragmented: Story = {
  args: {
    statistics: {
      totalSize: 12000,
      usedMemory: 6000,
      freeMemory: 6000,
      usedPercentage: 50,
      freePercentage: 50,
      largestFreeBlock: 800,
      freeBlockCount: 20,
      allocatedBlockCount: 20,
      fragmentationRatio: 0.003167, // (20-1)/6000 = moderate-high fragmentation
    } as HeapStatistics,
  },
};

// Perfectly contiguous free space (ideal state)
export const PerfectlyContiguous: Story = {
  args: {
    statistics: {
      totalSize: 12000,
      usedMemory: 4000,
      freeMemory: 8000,
      usedPercentage: 33.3,
      freePercentage: 66.7,
      largestFreeBlock: 8000,
      freeBlockCount: 1,
      allocatedBlockCount: 5,
      fragmentationRatio: 0, // (1-1)/8000 = perfect (no fragmentation)
    } as HeapStatistics,
  },
};

// Completely full heap
export const CompletelyFull: Story = {
  args: {
    statistics: {
      totalSize: 12000,
      usedMemory: 12000,
      freeMemory: 0,
      usedPercentage: 100,
      freePercentage: 0,
      largestFreeBlock: 0,
      freeBlockCount: 0,
      allocatedBlockCount: 30,
      fragmentationRatio: 0, // No free blocks = no fragmentation
    } as HeapStatistics,
  },
};

// Empty heap
export const Empty: Story = {
  args: {
    statistics: {
      totalSize: 12000,
      usedMemory: 0,
      freeMemory: 12000,
      usedPercentage: 0,
      freePercentage: 100,
      largestFreeBlock: 12000,
      freeBlockCount: 1,
      allocatedBlockCount: 0,
      fragmentationRatio: 0, // (1-1)/12000 = perfect (single free block)
    } as HeapStatistics,
  },
};

// Small heap (embedded device scenario)
export const SmallEmbeddedDevice: Story = {
  args: {
    statistics: {
      totalSize: 1024,
      usedMemory: 768,
      freeMemory: 256,
      usedPercentage: 75,
      freePercentage: 25,
      largestFreeBlock: 128,
      freeBlockCount: 3,
      allocatedBlockCount: 8,
      fragmentationRatio: 0.007813, // (3-1)/256 = noticeable fragmentation
    } as HeapStatistics,
  },
};
