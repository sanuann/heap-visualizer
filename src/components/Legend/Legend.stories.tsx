import type { Meta, StoryObj } from '@storybook/react';
import { Legend } from './Legend';

const meta = {
  title: 'Components/Legend',
  component: Legend,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Legend>;

export default meta;
type Story = StoryObj<typeof meta>;

// Few field names (typical small application)
export const FewFields: Story = {
  args: {
    fieldNames: ['sBluetoothConnectionCtx', 'sWorkEntryCtx'],
  },
};

// Many field names (complex embedded system)
export const ManyFields: Story = {
  args: {
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

// Single field name
export const SingleField: Story = {
  args: {
    fieldNames: ['sBluetoothConnectionCtx'],
  },
};

// No field names (all free blocks)
export const NoFields: Story = {
  args: {
    fieldNames: [],
  },
};

// Many field names with long names
export const LongFieldNames: Story = {
  args: {
    fieldNames: [
      'sVeryLongBluetoothConnectionContextStructure',
      'sAnotherExtremelyLongWorkEntryContextName',
      'sTimerManagementAndSchedulingContext',
    ],
  },
};

// Realistic embedded system scenario
export const RealisticEmbeddedSystem: Story = {
  args: {
    fieldNames: [
      'sBluetoothConnectionCtx',
      'sWorkEntryCtx',
      'sTimerCtx',
      'sNetworkBufferCtx',
      'sAudioCodecCtx',
    ],
  },
};
