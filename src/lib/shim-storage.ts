/**
 * Ultra-aggressive diagnostic storage shim for SSR.
 */
(() => {
    if (typeof window !== 'undefined') return;

    console.log("[SHIM] === SSR STORAGE DIAGNOSTIC START ===");

    const mockStorage: any = {
        getItem: (key: string) => {
            console.log(`[SHIM-LOG] getItem called for: ${key}`);
            return null;
        },
        setItem: (key: string, val: string) => {
            console.log(`[SHIM-LOG] setItem called for: ${key}`);
        },
        removeItem: () => { },
        clear: () => { },
        key: () => null,
        length: 0,
        [Symbol.toStringTag]: 'Storage'
    };

    const isBroken = (s: any) => !s || typeof s.getItem !== "function";

    const probe = (target: any, name: string) => {
        if (!target) return;
        const s = target[name];
        if (s) {
            console.log(`[SHIM] Found existing ${name} on ${target === global ? 'global' : 'target'}. Type: ${typeof s}`);
            console.log(`[SHIM] ${name} keys: ${Object.keys(s).join(', ')}`);
            const desc = Object.getOwnPropertyDescriptor(target, name);
            console.log(`[SHIM] ${name} descriptor:`, JSON.stringify(desc));

            if (isBroken(s)) {
                console.warn(`[SHIM] ${name} IS BROKEN.`);
                if (desc && desc.configurable) {
                    console.log(`[SHIM] Attempting to delete broken ${name}...`);
                    try { delete target[name]; console.log(`[SHIM] Delete successful.`); } catch (e) { console.error(`[SHIM] Delete failed.`); }
                }
            }
        } else {
            console.log(`[SHIM] No existing ${name} found on ${target === global ? 'global' : 'target'}.`);
        }
    };

    probe(global, 'localStorage');
    probe(globalThis, 'localStorage');

    const protect = (target: any, prop: string) => {
        if (!target) return;
        let actual = target[prop];

        try {
            Object.defineProperty(target, prop, {
                get: () => {
                    if (isBroken(actual)) return mockStorage;
                    return actual;
                },
                set: (v) => {
                    if (isBroken(v)) {
                        console.error(`[SHIM] BLOCKED broken ${prop} assignment.`);
                        return;
                    }
                    actual = v;
                },
                configurable: true,
                enumerable: true
            });
        } catch (e) {
            console.error(`[SHIM] Define property failed for ${prop}:`, e);
            target[prop] = actual || mockStorage;
        }
    };

    protect(global, 'localStorage');
    protect(global, 'sessionStorage');
    protect(globalThis, 'localStorage');
    protect(globalThis, 'sessionStorage');

    console.log("[SHIM] Protection active. === DIAGNOSTIC END ===");
})();
