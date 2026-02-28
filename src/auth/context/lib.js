import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

import { FIREBASE_API } from "@/config-global";

const firebaseApp = initializeApp(FIREBASE_API);

export const AUTH = getAuth(firebaseApp);
