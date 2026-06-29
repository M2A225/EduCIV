import { renderHook, act } from '@testing-library/react';
import { useCommandPalette } from './useCommandPalette';

describe('useCommandPalette', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useCommandPalette());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.filteredItems).toEqual([]);
  });

  it('should open and close', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  it('should toggle', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.isOpen).toBe(false);
  });

  it('should register and filter commands', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => {
      result.current.registerCommands([
        { id: '1', label: 'Test Item', action: vi.fn() },
        { id: '2', label: 'Other Item', action: vi.fn() },
      ]);
    });
    expect(result.current.filteredItems).toHaveLength(2);
    act(() => result.current.setQuery('test'));
    expect(result.current.filteredItems).toHaveLength(1);
    expect(result.current.filteredItems[0].label).toBe('Test Item');
  });

  it('should filter by keywords', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => {
      result.current.registerCommands([
        { id: '1', label: 'Students', keywords: ['élèves', 'users'], action: vi.fn() },
      ]);
    });
    act(() => result.current.setQuery('élèves'));
    expect(result.current.filteredItems).toHaveLength(1);
  });

  it('should handle keyboard navigation', () => {
    const { result } = renderHook(() => useCommandPalette());
    act(() => {
      result.current.registerCommands([
        { id: '1', label: 'First', action: vi.fn() },
        { id: '2', label: 'Second', action: vi.fn() },
      ]);
      result.current.open();
    });

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    });
    expect(result.current.selectedIndex).toBe(1);

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    });
    expect(result.current.selectedIndex).toBe(0);
  });
});
