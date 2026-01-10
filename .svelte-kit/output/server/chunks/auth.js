import { w as writable } from "./index2.js";
import { getApps, initializeApp, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
  apiKey: "AIzaSyCTs_zk_v9jtFhVXCjUAYJBKfWjf5LMOZU",
  authDomain: "eisenberg-oscars.firebaseapp.com",
  projectId: "eisenberg-oscars",
  storageBucket: "eisenberg-oscars.appspot.com",
  messagingSenderId: "438075122494",
  appId: "1:438075122494:web:ffe656c3d5cf001095c26f"
};
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}
const auth = getAuth(app);
getDatabase(app);
const user = writable(null);
const initializing = writable(true);
onAuthStateChanged(auth, (authUser) => {
  user.set(authUser);
  initializing.set(false);
});
export {
  initializing as i,
  user as u
};
