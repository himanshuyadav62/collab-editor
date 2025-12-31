import { useEffect, useState, useCallback } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';

interface CursorPosition {
  anchor: number;
  head: number;
}

interface UseAwarenessReturn {
  setCursor: (cursor: CursorPosition | null) => void;
  cursors: Map<number, CursorPosition>;
}

export function useAwareness(provider: HocuspocusProvider | null): UseAwarenessReturn {
  const [cursors, setCursors] = useState<Map<number, CursorPosition>>(new Map());

  const setCursor = useCallback(
    (cursor: CursorPosition | null) => {
      if (provider?.awareness) {
        provider.setAwarenessField('cursor', cursor);
      }
    },
    [provider]
  );

  useEffect(() => {
    if (!provider?.awareness) return;

    const handleChange = () => {
      const states = provider.awareness?.getStates();
      if (states) {
        const newCursors = new Map<number, CursorPosition>();
        states.forEach((state, clientId) => {
          if (state.cursor) {
            newCursors.set(clientId, state.cursor);
          }
        });
        setCursors(newCursors);
      }
    };

    provider.awareness.on('change', handleChange);
    return () => {
      provider.awareness?.off('change', handleChange);
    };
  }, [provider]);

  return { setCursor, cursors };
}
