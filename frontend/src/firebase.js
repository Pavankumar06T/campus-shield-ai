// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD03vT8m5D32UxtdLlNSlnnWZjbg1-s4K8",
  authDomain: "campus-shield-ai.firebaseapp.com",
  projectId: "campus-shield-ai",
  storageBucket: "campus-shield-ai.firebasestorage.app",
  messagingSenderId: "308176510736",
  appId: "1:308176510736:web:4ce65a0ac84d813f30cf95"
};

const app = initializeApp(firebaseConfig);

// Export these so your components can use them
export const auth = getAuth(app);
export const db = getFirestore(app);