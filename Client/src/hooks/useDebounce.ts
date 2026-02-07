import { useRef, useCallback } from 'react';

/**
 * Returns a debounced version of a callback function.
 * The callback will only be invoked after the specified delay has passed
 * since the last invocation.
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timerRef = useRef<number | undefined>(undefined);

  return useCallback(
    (...args: Parameters<T>) => {
      clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}
