

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.d79ff8b1.js","_app/immutable/chunks/index.e3f5fe78.js","_app/immutable/chunks/stores.065d49fe.js","_app/immutable/chunks/singletons.e7dafbce.js"];
export const stylesheets = [];
export const fonts = [];
