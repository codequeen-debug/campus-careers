import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWaQyK-gEf8VVVXPvlZftWsHw_BJv4IEs",
  authDomain: "campuscareer-79255.firebaseapp.com",
  projectId: "campuscareer-79255",
  storageBucket: "campuscareer-79255.firebasestorage.app",
  messagingSenderId: "181632025232",
  appId: "1:181632025232:web:1ae3691f60e77f3857ce15"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);