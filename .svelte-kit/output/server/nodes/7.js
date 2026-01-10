import * as universal from '../entries/pages/scoreboard/_page.ts.js';

export const index = 7;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/scoreboard/_page.svelte.js')).default;
export { universal };
export const universal_id = "src-svelte/routes/scoreboard/+page.ts";
export const imports = ["_app/immutable/nodes/7.7f24f55d.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/navigation.e0bfb279.js","_app/immutable/chunks/singletons.8e57d49a.js","_app/immutable/chunks/paths.1b830c06.js","_app/immutable/chunks/auth.4dcf20aa.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/constants.0cc9b3e7.js","_app/immutable/chunks/Loader.1d641830.js","_app/immutable/chunks/PageHeading.2f32458f.js"];
export const stylesheets = ["_app/immutable/assets/Loader.db00b920.css"];
export const fonts = [];
