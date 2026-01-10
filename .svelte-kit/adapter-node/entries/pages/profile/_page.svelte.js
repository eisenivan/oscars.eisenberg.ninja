import { c as create_ssr_component, a as subscribe, v as validate_component, b as add_attribute } from "../../../chunks/index3.js";
import { g as goto, P as PageHeading } from "../../../chunks/PageHeading.js";
import { u as user } from "../../../chunks/auth.js";
/* empty css                                                    */import "firebase/database";
import "firebase/auth";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $user, $$unsubscribe_user;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  let displayName = "";
  let email = "";
  if (!$user) {
    goto("/login");
  }
  {
    if ($user) {
      displayName = $user.displayName || "";
      email = $user.email || "";
    }
  }
  $$unsubscribe_user();
  return `${$$result.head += `<!-- HEAD_svelte-qauvs6_START -->${$$result.title = `<title>Your Profile</title>`, ""}<!-- HEAD_svelte-qauvs6_END -->`, ""}

<div class="w-full mt-2 max-w-sm m-auto bg-blue-100 p-5 border-blue-700 border-8 rounded-sm border-opacity-10 shadow-sm"><header><div class="mx-auto text-center mb-5">${validate_component(PageHeading, "PageHeading").$$render($$result, {}, {}, {
    default: () => {
      return `Your Profile`;
    }
  })}</div></header>
	<form><div><label class="block text-blue-500" for="displayName">Display Name</label>
			<div class="text-xs mb-2 text-black-100 italic">This will be the name that shows up on the leaderboard. Change this to your name.</div>
			<input class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300" type="text" name="displayName"${add_attribute("value", displayName, 0)}></div>
		<div><label class="block mb-2 text-blue-500" for="email">Email</label>
			<input class="w-full p-2 mb-6 text-blue-700 border-b-2 border-blue-500 outline-none focus:bg-gray-300" type="email" name="email"${add_attribute("value", email, 0)}></div>
		<div><button type="submit" class="block text-center bg-blue-700 hover:bg-indigo-700 text-white font-bold py-2 px-4 mb-6 rounded mx-auto w-max-md" ${""}>${`Update Profile`}</button></div></form>

	<div><button type="button" class="block hover:text-indigo-500 text-blue-500 font-bold py-2 px-4 mb-6 mx-auto">Reset Password?
		</button></div></div>`;
});
export {
  Page as default
};
