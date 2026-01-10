import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src-svelte/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.2cc66107.js","_app/immutable/chunks/control.c2cf8273.js","_app/immutable/chunks/navigation.54cc5851.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/singletons.e7dafbce.js","_app/immutable/chunks/index.e3f5fe78.js","_app/immutable/chunks/Loader.839f4639.js"];
export const stylesheets = ["_app/immutable/assets/0.afbd6c72.css","_app/immutable/assets/Loader.db00b920.css"];
export const fonts = [];
