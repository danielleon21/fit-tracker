"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { FakeStore } from "@/lib/fake-data/store";

export function useFakeStore<T>(store: FakeStore<T>): T {
  const value = useSyncExternalStore(store.subscribe, store.get, store.get);

  useEffect(() => {
    store.hydrateFromStorage();
  }, [store]);

  return value;
}
