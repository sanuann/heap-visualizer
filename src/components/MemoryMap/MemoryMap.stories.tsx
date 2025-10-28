import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MemoryMap } from './MemoryMap';
import type { HeapBlock } from '../../types/heap';

const meta = {
  title: 'Components/MemoryMap',
  component: MemoryMap,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MemoryMap>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper to demonstrate hover functionality
function MemoryMapWithState(args: any) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div>
      <MemoryMap {...args} hoveredBlockIndex={hoveredIndex} onBlockHover={setHoveredIndex} />
      {hoveredIndex !== null && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f3f4f6', borderRadius: '4px' }}>
          <strong>Hovered Block Index:</strong> {hoveredIndex}
        </div>
      )}
    </div>
  );
}

// Define block arrays once to ensure object reference equality
// (MemoryMap uses Map with object keys, so blocks and allBlocks must share references)

const simpleHeapBlocks: HeapBlock[] = [
  {
    start_address: 0x1000,
    length: 400,
    free: false,
    field_name: 'sBluetoothConnectionCtx',
  },
  {
    start_address: 0x1190,
    length: 300,
    free: true,
    field_name: null,
  },
  {
    start_address: 0x12bc,
    length: 300,
    free: false,
    field_name: 'sWorkEntryCtx',
  },
];

const fragmentedHeapBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 100, free: false, field_name: 'sBluetoothConnectionCtx' },
  { start_address: 0x1064, length: 50, free: true, field_name: null },
  { start_address: 0x1096, length: 120, free: false, field_name: 'sWorkEntryCtx' },
  { start_address: 0x110e, length: 30, free: true, field_name: null },
  { start_address: 0x112c, length: 80, free: false, field_name: 'sTimerCtx' },
  { start_address: 0x117c, length: 40, free: true, field_name: null },
  { start_address: 0x11a4, length: 90, free: false, field_name: 'sNetworkBufferCtx' },
  { start_address: 0x11fe, length: 60, free: true, field_name: null },
  { start_address: 0x123a, length: 100, free: false, field_name: 'sAudioCodecCtx' },
  { start_address: 0x129e, length: 70, free: true, field_name: null },
];

const nearlyFullBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 9500, free: false, field_name: 'sBluetoothConnectionCtx' },
  { start_address: 0x351c, length: 200, free: true, field_name: null },
  { start_address: 0x35e4, length: 300, free: false, field_name: 'sWorkEntryCtx' },
];

const mostlyFreeBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 200, free: false, field_name: 'sBluetoothConnectionCtx' },
  { start_address: 0x10c8, length: 9600, free: true, field_name: null },
  { start_address: 0x3698, length: 200, free: false, field_name: 'sWorkEntryCtx' },
];

const completelyFullBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 3000, free: false, field_name: 'sBluetoothConnectionCtx' },
  { start_address: 0x1bb8, length: 2000, free: false, field_name: 'sWorkEntryCtx' },
  { start_address: 0x2398, length: 2500, free: false, field_name: 'sTimerCtx' },
  { start_address: 0x2d1c, length: 2500, free: false, field_name: 'sNetworkBufferCtx' },
];

const emptyHeapBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 10000, free: true, field_name: null },
];

const noMatchFilterAllBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 400, free: false, field_name: 'sBluetoothConnectionCtx' },
  { start_address: 0x1190, length: 300, free: true, field_name: null },
  { start_address: 0x12bc, length: 300, free: false, field_name: 'sWorkEntryCtx' },
];

const tinyBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 4, free: false, field_name: 'sBluetoothConnectionCtx' },
  { start_address: 0x1004, length: 2, free: true, field_name: null },
  { start_address: 0x1006, length: 8, free: false, field_name: 'sWorkEntryCtx' },
  { start_address: 0x100e, length: 6, free: true, field_name: null },
  { start_address: 0x1014, length: 10, free: false, field_name: 'sTimerCtx' },
  { start_address: 0x101e, length: 970, free: true, field_name: null },
];

const onlyFreeBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 400, free: true, field_name: null },
  { start_address: 0x1190, length: 300, free: true, field_name: null },
  { start_address: 0x12bc, length: 300, free: true, field_name: null },
];

const onlyAllocatedBlocks: HeapBlock[] = [
  { start_address: 0x1000, length: 300, free: false, field_name: 'sBluetoothConnectionCtx' },
  { start_address: 0x112c, length: 400, free: false, field_name: 'sWorkEntryCtx' },
  { start_address: 0x12bc, length: 300, free: false, field_name: 'sTimerCtx' },
];

// Simple scenario with few blocks
export const SimpleHeap: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: simpleHeapBlocks,
    allBlocks: simpleHeapBlocks,
    heapStart: 0x1000,
    heapLength: 1000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// Highly fragmented (swiss cheese pattern)
export const HighlyFragmented: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: fragmentedHeapBlocks,
    allBlocks: fragmentedHeapBlocks,
    heapStart: 0x1000,
    heapLength: 1000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// Nearly full heap (high memory pressure)
export const NearlyFull: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: nearlyFullBlocks,
    allBlocks: nearlyFullBlocks,
    heapStart: 0x1000,
    heapLength: 10000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// Mostly free heap
export const MostlyFree: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: mostlyFreeBlocks,
    allBlocks: mostlyFreeBlocks,
    heapStart: 0x1000,
    heapLength: 10000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// Completely full heap
export const CompletelyFull: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: completelyFullBlocks,
    allBlocks: completelyFullBlocks,
    heapStart: 0x1000,
    heapLength: 10000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// Empty heap
export const Empty: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: emptyHeapBlocks,
    allBlocks: emptyHeapBlocks,
    heapStart: 0x1000,
    heapLength: 10000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// No blocks match filter (with reset button)
export const NoBlocksMatchFilter: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: [], // No blocks pass the filter
    allBlocks: noMatchFilterAllBlocks, // But there are blocks in the heap
    heapStart: 0x1000,
    heapLength: 1000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
    onResetFilters: () => alert('Reset filters clicked!'),
  },
};

// Tiny blocks (stress test for visibility)
export const TinyBlocks: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: tinyBlocks,
    allBlocks: tinyBlocks,
    heapStart: 0x1000,
    heapLength: 1000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// Only free blocks
export const OnlyFreeBlocks: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: onlyFreeBlocks,
    allBlocks: onlyFreeBlocks,
    heapStart: 0x1000,
    heapLength: 1000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};

// Only allocated blocks
export const OnlyAllocatedBlocks: Story = {
  render: (args) => <MemoryMapWithState {...args} />,
  args: {
    blocks: onlyAllocatedBlocks,
    allBlocks: onlyAllocatedBlocks,
    heapStart: 0x1000,
    heapLength: 1000,
    hoveredBlockIndex: null,
    onBlockHover: () => {},
  },
};
