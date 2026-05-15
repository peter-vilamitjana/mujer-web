// Polyfill localStorage/sessionStorage for SSR environments where they may be absent or broken.
(() => {
  if (typeof window !== 'undefined') return;

  const noopStorage: Storage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
    [Symbol.iterator]: [][Symbol.iterator],
  } as unknown as Storage;

  const isBroken = (s: unknown) => !s || typeof (s as Storage).getItem !== 'function';

  const protect = (target: typeof globalThis, prop: 'localStorage' | 'sessionStorage') => {
    let actual: Storage | undefined;
    try { actual = target[prop]; } catch { /* absent on some runtimes */ }
    try {
      Object.defineProperty(target, prop, {
        get: () => (isBroken(actual) ? noopStorage : actual),
        set: (v: Storage) => { if (!isBroken(v)) actual = v; },
        configurable: true,
        enumerable: true,
      });
    } catch {
      (target as Record<string, unknown>)[prop] = actual ?? noopStorage;
    }
  };

  protect(global, 'localStorage');
  protect(global, 'sessionStorage');
  protect(globalThis, 'localStorage');
  protect(globalThis, 'sessionStorage');
})();
