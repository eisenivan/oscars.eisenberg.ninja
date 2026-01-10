import { c as create_ssr_component, a as subscribe, v as validate_component } from "../../../chunks/index3.js";
import { u as user } from "../../../chunks/auth.js";
import "lodash.sortby";
import { L as Loader } from "../../../chunks/Loader.js";
import "firebase/database";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_user;
  $$unsubscribe_user = subscribe(user, (value) => value);
  $$unsubscribe_user();
  return `${$$result.head += `<!-- HEAD_svelte-11uaxlh_START -->${$$result.title = `<title>Leaderboard</title>`, ""}<!-- HEAD_svelte-11uaxlh_END -->`, ""}

${`${validate_component(Loader, "Loader").$$render($$result, {}, {}, {})}`}`;
});
export {
  Page as default
};
