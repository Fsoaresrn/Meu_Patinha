"use client";

import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect, useCallback } from 'react';

// Helper to safely parse JSON from localStorage
function safelyParseJSON<T>(jsonString: string | null, fallback: T): T {
  if (jsonString === null) {
    return fallback;
  }
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Error parsing JSON from localStorage:", error);
    return fallback;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? safelyParseJSON(item, typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue) : (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.localStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
        window.dispatchEvent(new Event("local-storage")); // For cross-tab updates if needed
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures this effect runs only on mount and unmount

  // Optional: Listen to storage events for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        try {
          setStoredValue(event.newValue ? safelyParseJSON(event.newValue, typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue) : (typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue));
        } catch (error) {
          console.warn(`Error handling storage change for key “${key}”:`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener("storage", handleStorageChange);
      window.addEventListener("local-storage", () => setStoredValue(readValue())); // For same-tab updates triggered by setValue
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener("storage", handleStorageChange);
        window.removeEventListener("local-storage", () => setStoredValue(readValue()));
      }
    };
  }, [key, readValue, initialValue]);

  return [storedValue, setValue];
}
