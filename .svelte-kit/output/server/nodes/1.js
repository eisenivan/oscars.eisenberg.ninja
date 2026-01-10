

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.496d2c1a.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/singletons.8e57d49a.js","_app/immutable/chunks/paths.1b830c06.js"];
export const stylesheets = [];
export const fonts = [];
