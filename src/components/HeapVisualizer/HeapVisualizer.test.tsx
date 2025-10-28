import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeapVisualizer } from './HeapVisualizer';
import type { HeapDumpData } from '../../types/heap';

describe('HeapVisualizer', () => {
  const mockHeapData: HeapDumpData = {
    data: {
      heap_region: {
        start_address: 536875472,
        length: 1000,
        blocks: [
          {
            start_address: 536875472,
            length: 100,
            free: false,
            field_name: 'sBluetoothConnectionCtx',
          },
          {
            start_address: 536875572,
            length: 200,
            free: true,
            field_name: null,
          },
          {
            start_address: 536875772,
            length: 150,
            free: false,
            field_name: 'sWorkEntryCtx',
          },
          {
            start_address: 536875922,
            length: 50,
            free: false,
            field_name: null,
          },
        ],
      },
    },
  };

  it('renders the heap visualizer with correct title', () => {
    render(<HeapVisualizer data={mockHeapData} />);
    expect(screen.getByText('Heap Memory Visualizer')).toBeInTheDocument();
  });

  it('displays heap blocks', () => {
    render(<HeapVisualizer data={mockHeapData} />);
    // Should render 4 blocks
    const blocks = screen.getAllByTestId(/heap-block-/);
    expect(blocks).toHaveLength(4);
  });

  it('renders filter controls', () => {
    render(<HeapVisualizer data={mockHeapData} />);

    expect(screen.getByText('Show Free Blocks')).toBeInTheDocument();
    expect(screen.getByText('Show Allocated Blocks')).toBeInTheDocument();
    expect(screen.getByText('Filter by Field Name:')).toBeInTheDocument();
  });

  it('renders legend with field names', () => {
    render(<HeapVisualizer data={mockHeapData} />);

    expect(screen.getByText('Legend:')).toBeInTheDocument();
    // Field names appear in multiple places (legend and dropdown), so use getAllByText
    expect(screen.getAllByText('sBluetoothConnectionCtx').length).toBeGreaterThan(0);
    expect(screen.getAllByText('sWorkEntryCtx').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
  });

  describe('Loading and Error States', () => {
    it('renders loading state when loading prop is true', () => {
      render(<HeapVisualizer data={mockHeapData} loading={true} />);

      expect(screen.getByText('Loading heap dump...')).toBeInTheDocument();
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('renders error state when error prop is provided', () => {
      const error = new Error('Failed to fetch heap dump');
      render(<HeapVisualizer data={mockHeapData} error={error} />);

      expect(screen.getByText('Error Loading Heap Dump')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch heap dump')).toBeInTheDocument();
    });

    it('prioritizes loading state over error state', () => {
      const error = new Error('Some error');
      render(<HeapVisualizer data={mockHeapData} loading={true} error={error} />);

      expect(screen.getByText('Loading heap dump...')).toBeInTheDocument();
      expect(screen.queryByText('Error Loading Heap Dump')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('renders error message for invalid data structure', () => {
      const invalidData = { data: null } as any;
      render(<HeapVisualizer data={invalidData} />);

      expect(screen.getByText('Invalid Heap Data')).toBeInTheDocument();
      expect(screen.getByText('Unable to load heap dump. Please check the data format.')).toBeInTheDocument();
    });

    it('renders error message for missing heap_region', () => {
      const invalidData = { data: {} } as any;
      render(<HeapVisualizer data={invalidData} />);

      expect(screen.getByText('Invalid Heap Data')).toBeInTheDocument();
    });

    it('renders error message for missing blocks array', () => {
      const invalidData = {
        data: {
          heap_region: {
            start_address: 100,
            length: 1000,
            blocks: null,
          },
        },
      } as any;
      render(<HeapVisualizer data={invalidData} />);

      expect(screen.getByText('Invalid Heap Data')).toBeInTheDocument();
      expect(screen.getByText('Heap region must contain a blocks array.')).toBeInTheDocument();
    });

    it('renders error message for invalid heap length', () => {
      const invalidData = {
        data: {
          heap_region: {
            start_address: 100,
            length: 0,
            blocks: [],
          },
        },
      };
      render(<HeapVisualizer data={invalidData} />);

      expect(screen.getByText('Invalid Heap Size')).toBeInTheDocument();
      expect(screen.getByText('Heap region length must be greater than 0.')).toBeInTheDocument();
    });

    it('renders error message for negative heap length', () => {
      const invalidData = {
        data: {
          heap_region: {
            start_address: 100,
            length: -100,
            blocks: [],
          },
        },
      };
      render(<HeapVisualizer data={invalidData} />);

      expect(screen.getByText('Invalid Heap Size')).toBeInTheDocument();
    });
  });

  describe('Interaction Tests', () => {
    it('filters out free blocks when "Show Free Blocks" is unchecked', async () => {
      const user = userEvent.setup();
      render(<HeapVisualizer data={mockHeapData} />);

      // Initially all 4 blocks visible
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(4);

      // Uncheck "Show Free Blocks"
      const checkbox = screen.getByLabelText('Show Free Blocks');
      await user.click(checkbox);

      // Only 3 allocated blocks should remain (blocks 0, 2, 3)
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(3);
    });

    it('filters out allocated blocks when "Show Allocated Blocks" is unchecked', async () => {
      const user = userEvent.setup();
      render(<HeapVisualizer data={mockHeapData} />);

      // Initially all 4 blocks visible
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(4);

      // Uncheck "Show Allocated Blocks"
      const checkbox = screen.getByLabelText('Show Allocated Blocks');
      await user.click(checkbox);

      // Only 1 free block should remain (block 1)
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(1);
    });

    it('filters blocks by field name', async () => {
      const user = userEvent.setup();
      render(<HeapVisualizer data={mockHeapData} />);

      // Initially all 4 blocks visible
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(4);

      // Select specific field name
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'sBluetoothConnectionCtx');

      // Only 1 block should match (block 0)
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(1);
      expect(screen.getByTestId('heap-block-0')).toBeInTheDocument();
    });

    it('shows "no blocks" message when filters exclude all blocks', async () => {
      const user = userEvent.setup();
      render(<HeapVisualizer data={mockHeapData} />);

      // Uncheck both checkboxes
      const freeCheckbox = screen.getByLabelText('Show Free Blocks');
      const allocatedCheckbox = screen.getByLabelText('Show Allocated Blocks');

      await user.click(freeCheckbox);
      await user.click(allocatedCheckbox);

      // Should show no blocks message
      expect(screen.getByText('No blocks match the current filters.')).toBeInTheDocument();
      expect(screen.queryAllByTestId(/heap-block-/)).toHaveLength(0);
    });

    it('resets to all blocks when "All Fields" is selected', async () => {
      const user = userEvent.setup();
      render(<HeapVisualizer data={mockHeapData} />);

      const select = screen.getByRole('combobox');

      // First filter by field name
      await user.selectOptions(select, 'sBluetoothConnectionCtx');
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(1);

      // Then select "All Fields"
      await user.selectOptions(select, '');
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(4);
    });

    it('combines multiple filters correctly', async () => {
      const user = userEvent.setup();
      render(<HeapVisualizer data={mockHeapData} />);

      // Uncheck free blocks and filter by field name
      const freeCheckbox = screen.getByLabelText('Show Free Blocks');
      await user.click(freeCheckbox);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'sWorkEntryCtx');

      // Should only show allocated blocks with field name 'sWorkEntryCtx' (block 2)
      expect(screen.getAllByTestId(/heap-block-/)).toHaveLength(1);
      expect(screen.getByTestId('heap-block-2')).toBeInTheDocument();
    });
  });
});
