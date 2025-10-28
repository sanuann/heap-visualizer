import type { Meta, StoryObj } from '@storybook/react';
import { HeapVisualizer } from './HeapVisualizer';
import type { HeapDumpData } from '../../types/heap';
import heapDumpJson from '../../../heap_dump.json';

const meta = {
  title: 'Components/HeapVisualizer',
  component: HeapVisualizer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeapVisualizer>;

export default meta;
type Story = StoryObj<typeof meta>;

// The actual heap dump from the provided JSON file
export const ActualHeapDump: Story = {
  args: {
    data: heapDumpJson as HeapDumpData,
  },
};

// Small heap with minimal fragmentation
export const SmallHeapMinimalFragmentation: Story = {
  args: {
    data: {
      data: {
        heap_region: {
          start_address: 0x1000,
          length: 1000,
          blocks: [
            {
              start_address: 0x1000,
              length: 400,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
            {
              start_address: 0x1190,
              length: 300,
              free: false,
              field_name: 'sWorkEntryCtx',
            },
            {
              start_address: 0x12bc,
              length: 300,
              free: true,
              field_name: null,
            },
          ],
        },
      },
    },
  },
};

// Highly fragmented heap (Swiss cheese pattern)
export const HighlyFragmentedHeap: Story = {
  args: {
    data: {
      data: {
        heap_region: {
          start_address: 0x2000,
          length: 1000,
          blocks: [
            {
              start_address: 0x2000,
              length: 50,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
            { start_address: 0x2032, length: 30, free: true, field_name: null },
            {
              start_address: 0x2050,
              length: 50,
              free: false,
              field_name: 'sWorkEntryCtx',
            },
            { start_address: 0x2082, length: 40, free: true, field_name: null },
            {
              start_address: 0x20aa,
              length: 50,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
            { start_address: 0x20dc, length: 35, free: true, field_name: null },
            {
              start_address: 0x20ff,
              length: 50,
              free: false,
              field_name: 'sWorkEntryCtx',
            },
            { start_address: 0x2131, length: 25, free: true, field_name: null },
            {
              start_address: 0x214a,
              length: 50,
              free: false,
              field_name: null,
            },
            { start_address: 0x217c, length: 30, free: true, field_name: null },
            {
              start_address: 0x219a,
              length: 590,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
          ],
        },
      },
    },
  },
};

// Nearly full heap (high memory pressure)
export const NearlyFullHeap: Story = {
  args: {
    data: {
      data: {
        heap_region: {
          start_address: 0x3000,
          length: 2000,
          blocks: [
            {
              start_address: 0x3000,
              length: 800,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
            {
              start_address: 0x3320,
              length: 600,
              free: false,
              field_name: 'sWorkEntryCtx',
            },
            {
              start_address: 0x3578,
              length: 400,
              free: false,
              field_name: null,
            },
            {
              start_address: 0x3708,
              length: 150,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
            { start_address: 0x379e, length: 50, free: true, field_name: null },
          ],
        },
      },
    },
  },
};

// Mostly free heap (low usage)
export const MostlyFreeHeap: Story = {
  args: {
    data: {
      data: {
        heap_region: {
          start_address: 0x4000,
          length: 2000,
          blocks: [
            {
              start_address: 0x4000,
              length: 100,
              free: false,
              field_name: 'sWorkEntryCtx',
            },
            {
              start_address: 0x4064,
              length: 1800,
              free: true,
              field_name: null,
            },
            {
              start_address: 0x4774,
              length: 100,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
          ],
        },
      },
    },
  },
};

// Large free blocks (good for allocation)
export const LargeFreeBlocks: Story = {
  args: {
    data: {
      data: {
        heap_region: {
          start_address: 0x5000,
          length: 3000,
          blocks: [
            {
              start_address: 0x5000,
              length: 200,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
            {
              start_address: 0x50c8,
              length: 1000,
              free: true,
              field_name: null,
            },
            {
              start_address: 0x54b0,
              length: 200,
              free: false,
              field_name: 'sWorkEntryCtx',
            },
            {
              start_address: 0x5578,
              length: 1200,
              free: true,
              field_name: null,
            },
            {
              start_address: 0x5a28,
              length: 400,
              free: false,
              field_name: null,
            },
          ],
        },
      },
    },
  },
};

// Only allocated blocks (completely full)
export const CompletelyFullHeap: Story = {
  args: {
    data: {
      data: {
        heap_region: {
          start_address: 0x6000,
          length: 1000,
          blocks: [
            {
              start_address: 0x6000,
              length: 300,
              free: false,
              field_name: 'sBluetoothConnectionCtx',
            },
            {
              start_address: 0x612c,
              length: 400,
              free: false,
              field_name: 'sWorkEntryCtx',
            },
            {
              start_address: 0x62bc,
              length: 300,
              free: false,
              field_name: null,
            },
          ],
        },
      },
    },
  },
};

// Empty heap (all free)
export const EmptyHeap: Story = {
  args: {
    data: {
      data: {
        heap_region: {
          start_address: 0x7000,
          length: 1000,
          blocks: [
            {
              start_address: 0x7000,
              length: 1000,
              free: true,
              field_name: null,
            },
          ],
        },
      },
    },
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    data: heapDumpJson as HeapDumpData,
    loading: true,
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    data: heapDumpJson as HeapDumpData,
    error: new Error('Failed to fetch heap dump from server'),
  },
};

// Invalid data error
export const InvalidDataError: Story = {
  args: {
    data: { data: null } as any,
  },
};
