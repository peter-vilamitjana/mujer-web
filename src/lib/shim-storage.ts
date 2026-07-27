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

  const protect = (target: typeof globalThis, prop: 'localStorage' | 'sessionStorage') => {
    try {
      Object.defineProperty(target, prop, {
        value: noopStorage,
        configurable: true,
        writable: true,
        enumerable: true,
      });
    } catch {
      try { (target as Record<string, unknown>)[prop] = noopStorage; } catch { /* ignore */ }
    }
  };

  protect(global, 'localStorage');
  protect(global, 'sessionStorage');
  protect(globalThis, 'localStorage');
  protect(globalThis, 'sessionStorage');
})();
