import * as universal from '../entries/pages/_page.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { universal };
export const universal_id = "src-svelte/routes/+page.ts";
export const imports = ["_app/immutable/nodes/2.42ff89bd.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/navigation.7877e110.js","_app/immutable/chunks/singletons.5a9f12cb.js","_app/immutable/chunks/paths.57a359a1.js","_app/immutable/chunks/auth.b7d72476.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/helpers.d40725a1.js","_app/immutable/chunks/constants.0cc9b3e7.js","_app/immutable/chunks/Loader.1d641830.js","_app/immutable/chunks/PageHeading.2f32458f.js"];
export const stylesheets = ["_app/immutable/assets/Loader.db00b920.css"];
export const fonts = [];
