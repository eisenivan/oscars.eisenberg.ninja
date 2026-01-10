import { c as create_ssr_component, a as subscribe, b as add_attribute, v as validate_component } from "../../chunks/index3.js";
import { u as user, i as initializing } from "../../chunks/auth.js";
import { L as Loader } from "../../chunks/Loader.js";
const app = "";
const Chrome_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: "h1.svelte-dgzdfp{margin:0}",
  map: null
};
const Chrome = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $user, $$unsubscribe_user;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$result.css.add(css$1);
  $$unsubscribe_user();
  return `<nav class="relative flex flex-wrap items-center justify-between px-2 navbar-expand-lg bg-blue-700 sm:mb-2 md:mb-6"><div class="container mx-auto flex flex-wrap items-center justify-between"><div class="w-full relative flex justify-between lg:w-auto lg:px-4 lg:static lg:block lg:justify-start"><a href="/" class="text-sm font-bold leading-relaxed inline-block mr-4 whitespace-nowrap uppercase text-white"><h1 class="svelte-dgzdfp">oscars // eisenberg // ninja</h1></a>
			<button class="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none" type="button"><span class="block relative w-6 h-px rounded-sm bg-white"></span>
				<span class="block relative w-6 h-px rounded-sm bg-white mt-1"></span>
				<span class="block relative w-6 h-px rounded-sm bg-white mt-1"></span></button></div>
		<div${add_attribute("class", `lg:flex flex-grow items-center ${"hidden sm:hidden lg:block"}`, 0)} id="navbar-menu"><ul class="flex flex-col lg:flex-row list-none ml-auto">${$user ? `<li><a href="/" class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">My Ballot
						</a></li>
					<li><a href="/scoreboard" class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">Leaderboard
						</a></li>
					<li><a href="/profile" class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">Profile
						</a></li>
					<li><button class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">Logout
						</button></li>` : `<li><a href="/login" class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">Login
						</a></li>
					<li><a href="/register" class="bg-blue-900 sm:bg-transparent px-3 py-2 flex items-center text-xs uppercase font-bold leading-snug text-white hover:opacity-75">Register
						</a></li>`}</ul></div></div></nav>

<div class="container mx-auto mt-4 px-4">${slots.default ? slots.default({}) : ``}
</div>`;
});
const _layout_svelte_svelte_type_style_lang = "";
const css = {
  code: "body{margin:0;padding:0}*{box-sizing:border-box}",
  map: null
};
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $initializing, $$unsubscribe_initializing;
  $$unsubscribe_initializing = subscribe(initializing, (value) => $initializing = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  $$unsubscribe_initializing();
  return `${$$result.head += `<!-- HEAD_svelte-d9cgh2_START -->${$$result.title = `<title>Oscars // Eisenberg // Ninja</title>`, ""}<meta name="description" content="Oscars voting application"><!-- HEAD_svelte-d9cgh2_END -->`, ""}

${$initializing ? `${validate_component(Chrome, "Chrome").$$render($$result, {}, {}, {
    default: () => {
      return `${validate_component(Loader, "Loader").$$render($$result, {}, {}, {})}`;
    }
  })}` : `${validate_component(Chrome, "Chrome").$$render($$result, {}, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`}`;
});
export {
  Layout as default
};
