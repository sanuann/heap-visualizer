import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterControls } from './FilterControls';
import type { FilterOptions } from '../../types/heap';

const meta = {
  title: 'Components/FilterControls',
  component: FilterControls,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FilterControls>;

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive wrapper to demonstrate state management
function FilterControlsWithState(args: any) {
  const [filters, setFilters] = useState<FilterOptions>(args.filters);

  return (
    <div>
      <FilterControls
        {...args}
        filters={filters}
        onShowFreeChange={(show) => setFilters((f) => ({ ...f, showFree: show }))}
        onShowAllocatedChange={(show) => setFilters((f) => ({ ...f, showAllocated: show }))}
        onFieldNameFilterChange={(name) => setFilters((f) => ({ ...f, fieldNameFilter: name }))}
        onReset={() =>
          setFilters({
            showFree: true,
            showAllocated: true,
            fieldNameFilter: null,
          })
        }
      />
      <div style={{ marginTop: '20px', padding: '10px', background: '#f3f4f6', borderRadius: '4px' }}>
        <strong>Current Filter State:</strong>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </div>
    </div>
  );
}

// Default state - all filters enabled
export const Default: Story = {
  render: (args) => <FilterControlsWithState {...args} />,
  args: {
    filters: {
      showFree: true,
      showAllocated: true,
      fieldNameFilter: null,
    },
    fieldNames: ['sBluetoothConnectionCtx', 'sWorkEntryCtx', 'sTimerCtx'],
  },
};

// Only free blocks shown
export const OnlyFreeBlocks: Story = {
  render: (args) => <FilterControlsWithState {...args} />,
  args: {
    filters: {
      showFree: true,
      showAllocated: false,
      fieldNameFilter: null,
    },
    fieldNames: ['sBluetoothConnectionCtx', 'sWorkEntryCtx', 'sTimerCtx'],
  },
};

// Only allocated blocks shown
export const OnlyAllocatedBlocks: Story = {
  render: (args) => <FilterControlsWithState {...args} />,
  args: {
    filters: {
      showFree: false,
      showAllocated: true,
      fieldNameFilter: null,
    },
    fieldNames: ['sBluetoothConnectionCtx', 'sWorkEntryCtx', 'sTimerCtx'],
  },
};

// Specific field name filtered
export const SpecificFieldNameFilter: Story = {
  render: (args) => <FilterControlsWithState {...args} />,
  args: {
    filters: {
      showFree: true,
      showAllocated: true,
      fieldNameFilter: 'sBluetoothConnectionCtx',
    },
    fieldNames: ['sBluetoothConnectionCtx', 'sWorkEntryCtx', 'sTimerCtx'],
  },
};

// Combined filters (allocated blocks with specific field)
export const CombinedFilters: Story = {
  render: (args) => <FilterControlsWithState {...args} />,
  args: {
    filters: {
      showFree: false,
      showAllocated: true,
      fieldNameFilter: 'sWorkEntryCtx',
    },
    fieldNames: ['sBluetoothConnectionCtx', 'sWorkEntryCtx', 'sTimerCtx'],
  },
};

// Many field names (realistic embedded scenario)
export const ManyFieldNames: Story = {
  render: (args) => <FilterControlsWithState {...args} />,
  args: {
    filters: {
      showFree: true,
      showAllocated: true,
      fieldNameFilter: null,
    },
    fieldNames: [
      'sBluetoothConnectionCtx',
      'sWorkEntryCtx',
      'sTimerCtx',
      'sNetworkBufferCtx',
      'sAudioCodecCtx',
      'sSensorDataCtx',
      'sDisplayBufferCtx',
      'sFileHandleCtx',
    ],
  },
};

// No field names (all free blocks)
export const NoFieldNames: Story = {
  render: (args) => <FilterControlsWithState {...args} />,
  args: {
    filters: {
      showFree: true,
      showAllocated: true,
      fieldNameFilter: null,
    },
    fieldNames: [],
  },
};

// Static version (no callbacks) - for visual design review
export const StaticView: Story = {
  args: {
    filters: {
      showFree: true,
      showAllocated: false,
      fieldNameFilter: 'sBluetoothConnectionCtx',
    },
    fieldNames: ['sBluetoothConnectionCtx', 'sWorkEntryCtx', 'sTimerCtx'],
  },
};
