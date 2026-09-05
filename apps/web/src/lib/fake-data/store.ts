// Store minimo tipo pub/sub que simula una fuente de verdad compartida (como seria
// una tabla real) mientras no existe el backend de Gym Tracker / Nutrition Tracker.
// Persiste en localStorage para que Dashboard, Rutinas y Alimentacion vean el mismo
// estado aunque esten en paginas distintas o se recargue el navegador.

export interface FakeStore<T> {
  get: () => T;
  set: (updater: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  hydrateFromStorage: () => void;
}

export function createFakeStore<T>(storageKey: string, initialValue: T): FakeStore<T> {
  let value = initialValue;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // localStorage no disponible (modo privado, cuota, etc.) - no critico para datos de muestra.
    }
  }

  return {
    get: () => value,
    set: (updater) => {
      value = typeof updater === "function" ? (updater as (prev: T) => T)(value) : updater;
      persist();
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    hydrateFromStorage: () => {
      if (typeof window === "undefined") return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          value = JSON.parse(raw) as T;
          notify();
        }
      } catch {
        // valor corrupto en storage - se ignora y se conserva el valor de muestra actual.
      }
    },
  };
}
