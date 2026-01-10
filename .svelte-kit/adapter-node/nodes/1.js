

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.952f04cc.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/singletons.5a9f12cb.js","_app/immutable/chunks/paths.57a359a1.js"];
export const stylesheets = [];
export const fonts = [];
