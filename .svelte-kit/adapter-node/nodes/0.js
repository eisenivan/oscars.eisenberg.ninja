import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src-svelte/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.f9b0a49d.js","_app/immutable/chunks/control.c2cf8273.js","_app/immutable/chunks/auth.b7d72476.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/paths.57a359a1.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/navigation.7877e110.js","_app/immutable/chunks/singletons.5a9f12cb.js","_app/immutable/chunks/Loader.1d641830.js"];
export const stylesheets = ["_app/immutable/assets/0.3b8d1881.css","_app/immutable/assets/Loader.db00b920.css"];
export const fonts = [];
