import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "marolio-6f689.firebaseapp.com",
  projectId: "marolio-6f689",
  storageBucket: "marolio-6f689.appspot.com",
  messagingSenderId: "69425841174",
  appId: "1:69425841174:web:195efb35342b3ac0bae137"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);