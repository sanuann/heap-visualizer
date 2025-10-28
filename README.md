# Heap Memory Visualizer

A React + TypeScript component for visualizing heap memory allocations in embedded systems, helping developers debug out-of-memory situations by displaying heap blocks with interactive filtering and real-time statistics.

---

## 1. How to Build and Run the Project

### Prerequisites

- **Node.js** v18 or higher
- **npm** (comes with Node.js)

### Installation

```bash
npm install
```

### Running the Project

**Start Storybook** (the main deliverable):
```bash
npm run storybook
```
This will launch Storybook at http://localhost:6006 where you can view and interact with the heap visualizer component.

> **Note**: The main component to review is **HeapVisualizer** under "Components/HeapVisualizer". All components are listed in alphabetical order in the sidebar. I didn't know how to customize the sort order in Storybook, so please start by viewing the HeapVisualizer stories first.

**Run Tests**:
```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm run test:run
```

**Build Storybook** (for production):
```bash
npm run build-storybook
```
Static files will be generated in the `storybook-static` directory.

---

## 2. Pull Request Information

### What Was Implemented

This PR implements a complete heap memory visualizer with the following features:

#### Core Requirements (Assignment Specified)
-  **React + TypeScript UI component** for heap visualization
-  **Filter by free/allocated status** - Two checkboxes control visibility of free and allocated blocks
-  **Filter by field_name** - Dropdown selector to filter blocks by specific field names
-  **Storybook integration** - 11+ stories demonstrating various heap states
-  **Tests** - 45 comprehensive tests (requirement was "at least one")

#### Additional Features (Beyond Requirements)
- **Interactive hover tooltips** showing detailed block information (address, size, field name, status)
- **Real-time statistics panel** with memory usage, fragmentation metrics, and block counts
- **Color-coded visualization** with deterministic colors for each field name
- **Keyboard navigation support** with ARIA labels and proper accessibility attributes
- **Responsive design** that works on mobile and desktop
- **Error and loading states** with proper error handling
- **Legend** showing color mappings for all field names

### Implementation Approach

#### Visualization Design Decision

After researching industry-standard heap visualization tools, I chose a **horizontal linear memory map** approach because:

1. **Industry Standard**: Used by professional tools (MemoView, VM Validator, ESP8266 heap visualizer)
2. **Fragmentation Detection**: Immediately reveals "Swiss cheese" fragmentation patterns
3. **Proportional Sizing**: Block width directly represents memory size - makes size differences obvious
4. **Mental Model Alignment**: Matches how developers think about linear address spaces
5. **Scalability**: Shows entire heap at a glance without scrolling

The visualization displays the heap as a horizontal bar where each block's width is proportional to its actual size in bytes. This makes it easy to spot:
- Large allocations that consume significant memory
- Fragmentation (many small free blocks scattered between allocations)
- Memory pressure (ratio of used vs. free memory)

#### Component Architecture

The implementation is split into reusable, testable components:

```
HeapVisualizer (main container)
├── StatisticsPanel (collapsible stats)
├── FilterControls (checkboxes + dropdown)
├── MemoryMap (visualization + tooltips)
└── Legend (color mappings)
```

**Why this structure?**
- **Single Responsibility**: Each component has one clear purpose
- **Testability**: Pure functions and isolated components are easier to test
- **Reusability**: Sub-components could be used independently
- **Performance**: Memoization at component level prevents unnecessary re-renders

#### Data Source Decision

The project includes two data files:
- **`heap_dump.json`** (29KB) - Structured metadata with block information (**Used**)
- **`heap.bin`** (12KB) - Raw binary memory dump (**Not used**)

**Why only use the JSON?**
The JSON file contains all information needed for the visualization (addresses, sizes, allocation status, field names). The binary file would only be useful for displaying actual memory contents (hex dump), which is beyond the core requirements.

**Future use for heap.bin**: Could implement a "hex viewer" modal that shows actual memory bytes when clicking on blocks - useful for debugging data corruption.

### Key Technical Decisions

#### 1. TypeScript Strict Mode
All types are explicitly defined with strict mode enabled. This catches errors at compile time and provides better IDE autocomplete.

#### 2. No UI Component Library
Chose vanilla CSS over libraries like Material-UI for several reasons:
- **Dependencies**: Keeps bundle size small and dependencies minimal
- **Customization**: Full control over styling and animations
- **Demonstration**: Shows CSS skills and understanding of fundamentals
- **Performance**: No framework overhead

#### 3. Performance Optimizations
- **useMemo** for expensive calculations (statistics, filtering, block indexing)
- **useCallback** for event handlers to prevent child re-renders
- **React.memo** on pure components (MemoryMap, FilterControls, StatisticsPanel, Legend)
- **O(1) block lookup** using Map instead of array.findIndex

#### 4. Fragmentation Metric
Implemented industry-standard formula: `1 - (largest_free_block / total_free_memory)`
- **0%** = No fragmentation (all free memory contiguous)
- **50%** = Moderate fragmentation
- **90%** = Severe fragmentation (largest block is only 10% of free memory)

This is used by FreeRTOS, jemalloc, and is the embedded systems community consensus.

### Testing Strategy

**45 tests total** across two test files:

**Unit Tests** (`heapUtils.test.ts` - 27 tests):
- Statistics calculation correctness
- Fragmentation calculation edge cases (0%, 50%, 90%+ scenarios)
- Block filtering logic
- Formatting functions (bytes, addresses)
- Color generation determinism
- Edge cases: empty heaps, single blocks, 1000+ blocks, very large addresses

**Integration Tests** (`HeapVisualizer.test.tsx` - 18 tests):
- Component rendering
- Filter interactions (checkboxes, dropdown)
- Filter combinations
- Loading and error states
- Invalid data handling
- Keyboard accessibility

**Testing Philosophy**: Test behavior, not implementation. Use React Testing Library's user-centric queries.

### Browser Compatibility

- **Modern browsers**: Chrome. (I did not test on others)
- **CSS**: Standard properties, no vendor prefixes needed
- **JavaScript**: ES2020+ features (requires transpilation for older browsers)
- **React**: Version 19 (latest stable)

### What Reviewers Should Be Aware Of

#### 1. Statistics Panel Collapsed by Default
The statistics panel starts collapsed to emphasize the memory map visualization. This was a UX decision - users should see the main visualization first, then drill into stats if needed.

#### 2. Minimum Block Width (2px)
Very small blocks (< 0.2% of heap) are rendered with a 2px minimum width to ensure they're visible and hoverable. Without this, tiny blocks would be invisible or un-clickable.

#### 3. Color Generation
- Predefined colors for known field names (`sBluetoothConnectionCtx` = blue, `sWorkEntryCtx` = green)
- Deterministic HSL color generation for unknown field names (same name = same color across sessions)
- Free blocks always use light gray

**Known limitation**: Colors are not optimized for colorblind users - would need a palette mode selector (see TODOs).

#### 4. No Build Configuration Included
This project uses Vite and Storybook's default configurations. For production deployment, you'd want to add:
- Environment variable handling
- Production optimizations
- CDN configuration for static assets

#### 5. Accessibility Partial Implementation
Current accessibility features:
- ✅ ARIA labels on blocks
- ✅ Keyboard focus states
- ✅ Semantic HTML
- ❌ Arrow key navigation between blocks (would be nice-to-have)
- ❌ Screen reader announcements for stats changes
- ❌ Colorblind-friendly palette

#### 6. Test Coverage
While 45 tests is comprehensive for the utility functions and main component, individual sub-components (`FilterControls`, `StatisticsPanel`, `MemoryMap`, `Legend`) don't have dedicated unit test files. They are tested via integration tests in `HeapVisualizer.test.tsx`.

**Trade-off**: Faster development vs. more isolated test coverage.

### Potential Discussion Points

1. **Color palette**: Should we add a colorblind mode? High contrast mode?
2. **Performance**: At what heap size should we switch to canvas rendering or virtualization?
3. **API design**: Should the component accept a heap dump URL instead of inline data?
4. **Fragmentation threshold**: Is 30% the right threshold for "high fragmentation" warnings?
5. **heap.bin usage**: Is hex dump viewer worth implementing, or is it scope creep?

---

## 3. Dependencies and Technology Choices

### Core Dependencies

#### **react** (^19.2.0)
- **Why chosen**: Industry-standard UI library with component-based architecture, excellent for building interactive UIs like this visualizer
- **Experience level**: Expert (5+ years of professional React development)
- **Alternatives considered**: Vue - React chosen for familiarity and ecosystem maturity

#### **react-dom** (^19.2.0)
- **Why chosen**: Required peer dependency for React to render to the DOM
- **Experience level**: Expert (5+ years)

### Build Tools

#### **vite** (^7.1.10)
- **Why chosen**: Modern, extremely fast build tool with excellent TypeScript and React support. Much faster than webpack or Create React App.
- **Experience level**: Intermediate
- **Benefits**: Near-instant HMR, optimized production builds, simple configuration

#### **@vitejs/plugin-react** (^5.0.4)
- **Why chosen**: Official Vite plugin for React - enables Fast Refresh and JSX transformation
- **Experience level**: Intermediate

### Type Safety

#### **typescript** (^5.9.3)
- **Why chosen**: Provides compile-time type checking, better IDE support, catches bugs before runtime, improves code documentation through types
- **Experience level**: Expert (5+ years of TypeScript in production)
- **Benefits**: Caught several potential bugs during development (null checks, type mismatches)

#### **@types/react** (^19.2.2)
- **Why chosen**: TypeScript type definitions for React APIs
- **Experience level**: Expert (5+ years)

#### **@types/react-dom** (^19.2.2)
- **Why chosen**: TypeScript type definitions for React DOM APIs
- **Experience level**: Expert (5+ years)

### Component Development

#### **storybook** (^9.1.13)
- **Why chosen**: Required by assignment. Excellent tool for developing UI components in isolation, allows demonstrating different states without building full application
- **Experience level**: Beginner
- **Benefits**: Easy to showcase different heap states, great for documentation and manual testing

#### **@storybook/react-vite** (^9.1.13)
- **Why chosen**: Integrates Storybook with Vite build system - combines fast Vite builds with Storybook's component development workflow
- **Experience level**: Beginner

#### **@storybook/addon-a11y** (^9.1.13)
- **Why chosen**: Provides accessibility testing within Storybook - helps identify ARIA and keyboard navigation issues
- **Experience level**: Beginner
- **Benefits**: Caught several accessibility issues during development

#### **@storybook/addon-docs** (^9.1.13)
- **Why chosen**: Auto-generates documentation from component props and JSDoc comments
- **Experience level**: Beginner

### Testing Framework

#### **vitest** (^3.2.4)
- **Why chosen**: Modern test runner designed for Vite - uses the same config and plugins. Much faster than Jest, better TypeScript integration
- **Experience level**: Intermediate
- **Alternatives considered**: Jest - Vitest chosen for Vite compatibility and speed

#### **@testing-library/react** (^16.3.0)
- **Why chosen**: Industry best practice for testing React components. Focuses on testing user behavior rather than implementation details
- **Experience level**: Intermediate

#### **@testing-library/user-event** (^14.6.1)
- **Why chosen**: Simulates real user interactions (clicks, typing, keyboard navigation) more accurately than fireEvent
- **Experience level**: Intermediate

#### **@testing-library/jest-dom** (^6.9.1)
- **Why chosen**: Provides helpful custom matchers like `toBeInTheDocument()`, `toHaveClass()`, makes test assertions more readable
- **Experience level**: Intermediate

#### **jsdom** (^27.0.0)
- **Why chosen**: DOM implementation for Node.js environment - required for testing React components in Vitest
- **Experience level**: Intermediate

### Intentionally NOT Used

#### Component Libraries (Material-UI, Chakra, Ant Design)
**Why not**: Wanted to demonstrate CSS skills, keep bundle size small, avoid dependency bloat for a standalone component

#### State Management (Redux, Zustand)
**Why not**: Component state is simple enough for React's built-in useState/useMemo - adding a state library would be over-engineering

#### CSS-in-JS (styled-components, emotion)
**Why not**: Plain CSS is sufficient for this component, no need for dynamic theming or complex styling logic

#### Linting/Formatting (ESLint, Prettier)
**Why not**: Time constraints - would add in production but focused on functionality first

---

## 4. TODOs and Future Improvements

### High Priority

#### 1. Enhanced Accessibility
**Why**: Important for inclusive design and enterprise adoption
- **Arrow key navigation**: Use ← → keys to move focus between blocks
- **Screen reader support**: Announce statistics changes when filters update
- **Keyboard shortcuts**: Space to toggle filters, Enter to select blocks
- **High contrast mode**: Better visibility for users with visual impairments
- **Colorblind-friendly palette**: Deuteranopia/protanopia-friendly colors (affects ~8% of males)

#### 2. Sub-component Unit Tests
**Why**: Currently only integration tests cover sub-components
- Add dedicated test files for `FilterControls`, `StatisticsPanel`, `MemoryMap`, `Legend`
- Test each component in isolation with various prop combinations
- Improve test coverage from ~85% to 95%+

#### 3. Click Interactions for Detailed View
**Why**: Users may need more information than tooltips provide
- Click block to open modal/side panel with full details
- Display block metadata: exact byte range, offset from heap start, adjacent blocks
- "Copy address" button for developers to use in debuggers
- Show allocation call stack (if available in future heap dump formats)

### Medium Priority (Nice to Have)

#### 4. Memory Content Viewer (Use heap.bin)
**Why**: Enables debugging data corruption issues
- Load `heap.bin` as ArrayBuffer
- Extract byte range for clicked block
- Display hex dump in modal (16 bytes per line, traditional format)
- Show ASCII representation alongside hex
- Highlight interesting patterns (null bytes, repeated patterns, pointers)

#### 5. Zoom and Pan for Large Heaps
**Why**: Current implementation shows all blocks - becomes unusable with 500+ blocks
- Add zoom controls (buttons or mouse wheel)
- Pan by dragging or arrow keys
- Minimap showing current viewport position
- Virtual scrolling/windowing to render only visible blocks

**Technical approach**: Use canvas rendering or virtual list library (react-window)

#### 6. Search and Highlight
**Why**: Finding specific allocations in large heaps is difficult
- Search by address range (0x1000-0x2000)
- Search by field name (text input with autocomplete)
- Highlight matching blocks (pulsing border or overlay)
- "Jump to block" functionality

#### 7. Export Capabilities
**Why**: Developers need to share findings with team
- Export visualization as PNG (using html2canvas or canvas API)
- Export statistics as CSV for spreadsheet analysis
- Export filtered view as JSON
- Share URL with filters applied (requires URL state management)

#### 8. Advanced Statistics
**Why**: More metrics help diagnose memory issues
- Average allocation size
- Median allocation size
- Standard deviation (identifies outliers)
- Fragmentation by region (if heap has zones)
- Memory utilization over time (if multiple snapshots available)
- Block size distribution histogram

### Low Priority (Future Enhancements)

#### 9. Comparison Mode
**Why**: Tracking memory over time reveals leaks
- Load multiple heap dumps
- Side-by-side comparison view
- Diff view highlighting changes (new allocations, freed blocks)
- Timeline scrubber if temporal data available
- Memory leak detection (blocks that grow over time)

#### 10. Alternative Visualizations
**Why**: Different views provide different insights
- **Tree map**: Hierarchical view if allocation metadata includes parent/child relationships
- **Flame graph**: Show allocation patterns and hot spots
- **Timeline view**: Allocation/deallocation events over time
- **3D view**: Fun but probably not practical

#### 11. Performance Optimizations
**Why**: Current implementation may struggle with very large heaps (10,000+ blocks)
- **Canvas rendering**: Replace DOM elements with canvas for large heaps
- **Web Workers**: Move statistics calculations off main thread
- **Virtualization**: Only render visible blocks in viewport
- **Pagination**: Show heap in chunks (pages of 1000 blocks)
- **Streaming**: Handle heap dumps that don't fit in memory

**Technical note**: Current implementation handles 1000 blocks without issues - these optimizations only needed for extreme cases.


### Known Issues / Technical Debt

1. **Magic numbers in CSS**: Several hardcoded values (150px height, 2px min-width) should be CSS variables or constants with comments
2. **Warning emoji in code**: `⚠️` emoji in `HeapVisualizer.tsx` line 183 - should use an icon component instead
3. **Console.log in production**: Development-only debug button logs to console - should be removed or feature-flagged
4. **No error boundary**: Component crashes propagate to parent - should wrap in error boundary
5. **Tooltip positioning**: Tooltips near edges of screen may be cut off - need positioning logic to flip direction

---

## 5. AI-Assisted Development

This project was developed with the assistance of AI tools to enhance productivity and code quality. Here's how AI was utilized throughout the development process:

### Research and Best Practices

**Initial Research (Human-led)**:
- I first conducted independent research on heap memory management in embedded systems
- Studied out-of-memory (OOM) situations and debugging techniques
- Researched industry-standard heap visualization approaches (MemoView, VM Validator, ESP8266 tools)
- Documented findings in `.md` files in the project

**AI-Assisted Analysis**:
- Used AI to summarize and synthesize my research findings
- Asked for recommendations on visualization approaches based on industry standards
- Researched fragmentation calculation formulas used in production systems (FreeRTOS, jemalloc)
- Validated that the chosen formula `1 - (largest_free_block / total_free_memory)` was the embedded systems community standard

### Implementation Support

**Storybook Integration** (New Technology):
- Storybook was completely new to me when starting this project
- AI helped me learn how to configure Storybook with Vite
- Assisted in understanding story patterns and best practices
- Guided creation of 11+ stories demonstrating different heap states

**Testing Strategy**:
- AI generated comprehensive test cases covering edge cases I hadn't considered
- Helped write tests for fragmentation scenarios (0%, 50%, 90%+ fragmentation)
- Assisted with React Testing Library patterns and best practices
- Generated tests for error handling and invalid data scenarios
- Final result: 45 tests with good coverage, though more could be done if I had more time 

**Type Safety**:
- AI reviewed code for missing TypeScript types
- Caught potential null/undefined issues
- Suggested stricter type definitions for better compile-time safety

**Bug Detection**:
- Caught incorrect calculations in early implementations
- other bugs and CSS issues

### Documentation

**README Generation**:
- Structure and write comprehensive documentation with my rough draft provided.

**Code Comments**:
- JSDoc comments for complex functions
- Helped document fragmentation calculation logic with references

### What I Did Independently

To be clear, AI was a **tool to enhance my work**, not a replacement for thinking:
- All architectural decisions were mine (component structure, performance optimizations, data flow, styling approach)
- I chose the horizontal linear memory map visualization based on my research
- I designed the filtering system and statistics calculations
- I decided on the color-coding scheme and UX patterns
- I reviewed, understood, and modified all AI-generated code
- I made final decisions on what to include/exclude from the implementation
- This project represents my understanding of React, TypeScript, testing, and embedded systems concepts - AI simply accelerated the implementation

---

## Author
Sanu Ann Abraham 

Date: 10.20.2025