

export const index = 6;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/register/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/6.020fe804.js","_app/immutable/chunks/index.e3f5fe78.js","_app/immutable/chunks/navigation.54cc5851.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/singletons.e7dafbce.js","_app/immutable/chunks/PageHeading.b0991ad5.js"];
export const stylesheets = [];
export const fonts = [];
