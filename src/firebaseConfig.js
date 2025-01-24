// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAED7Vc5zINAX_EZi2l4ww7n0mAzQ-SqvM",
  authDomain: "cursos-custom-demo.firebaseapp.com",
  projectId: "cursos-custom-demo",
  storageBucket: "cursos-custom-demo.appspot.com",
  messagingSenderId: "449288927099",
  appId: "1:449288927099:web:620041008062b89edeafde"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

