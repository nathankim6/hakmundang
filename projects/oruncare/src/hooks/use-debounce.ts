
import { useEffect, useState, useRef } from 'react';

export function useDebounce<T>(value: T, delay: number = 1500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousValue = useRef<T>(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render to prevent initial auto-save
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousValue.current = value;
      return;
    }

    // Don't debounce if the value hasn't actually changed
    if (JSON.stringify(previousValue.current) === JSON.stringify(value)) {
      return;
    }
    
    // Clear any existing timeout
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Set a new timeout to update the debounced value after the delay
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
      previousValue.current = value;
      timerRef.current = null;
    }, delay);

    // Cancel the timeout if component unmounts or value changes again
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay]);

  // For immediate unmount cases
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return debouncedValue;
}

// Renamed to avoid naming conflict - this is for callback functions
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 1000
): () => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      callback();
      timerRef.current = null;
    }, delay);
  };
}

// Add a new hook to check if user is actively typing
export function useIsTyping<T>(value: T, delay: number = 1500): boolean {
  const [isTyping, setIsTyping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previousValue = useRef<T>(value);

  useEffect(() => {
    // Don't trigger typing state if the value hasn't actually changed
    if (JSON.stringify(previousValue.current) === JSON.stringify(value)) {
      return;
    }
    
    // Set typing state to true when value changes
    setIsTyping(true);
    previousValue.current = value;
    
    // Clear any existing timeout
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Set a new timeout to update the typing state after the delay
    timerRef.current = setTimeout(() => {
      setIsTyping(false);
      timerRef.current = null;
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay]);

  return isTyping;
}
