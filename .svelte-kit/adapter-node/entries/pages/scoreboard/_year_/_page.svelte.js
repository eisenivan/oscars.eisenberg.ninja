import { c as create_ssr_component, a as subscribe, e as escape, v as validate_component } from "../../../../chunks/index3.js";
import { u as user } from "../../../../chunks/auth.js";
import "lodash.sortby";
import { L as Loader } from "../../../../chunks/Loader.js";
import "firebase/database";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_user;
  $$unsubscribe_user = subscribe(user, (value) => value);
  let { data } = $$props;
  const year = data.year;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$unsubscribe_user();
  return `${$$result.head += `<!-- HEAD_svelte-1sasxa3_START -->${$$result.title = `<title>Leaderboard - ${escape(year)}</title>`, ""}<!-- HEAD_svelte-1sasxa3_END -->`, ""}

${`${validate_component(Loader, "Loader").$$render($$result, {}, {}, {})}`}`;
});
export {
  Page as default
};
