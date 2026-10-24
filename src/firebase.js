import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDp2B5pNTmwfs5d4mPvlriwn2azwZYgLeM",
  authDomain: "logistik-tambang.firebaseapp.com",
  projectId: "logistik-tambang",
  storageBucket: "logistik-tambang.firebasestorage.app",
  messagingSenderId: "710976833868",
  appId: "1:710976833868:web:f4832d27d3306eac1967e9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
