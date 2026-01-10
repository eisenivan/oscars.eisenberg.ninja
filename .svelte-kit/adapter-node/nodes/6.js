

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/register/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.65e886e3.js","_app/immutable/chunks/index.d983bbc4.js","_app/immutable/chunks/navigation.7877e110.js","_app/immutable/chunks/singletons.5a9f12cb.js","_app/immutable/chunks/paths.57a359a1.js","_app/immutable/chunks/auth.b7d72476.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/PageHeading.2f32458f.js"];
export const stylesheets = [];
export const fonts = [];
