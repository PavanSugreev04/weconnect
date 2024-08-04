// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQEfwau2b9ox8vfe5E2ajiSH5Hb2J0HjY",
  authDomain: "weconnect2-123.firebaseapp.com",
  projectId: "weconnect2-123",
  storageBucket: "weconnect2-123.appspot.com",
  messagingSenderId: "3657561541",
  appId: "1:3657561541:web:170e33e5adec8564f7c7ac"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();
const storage = getStorage();

export default app;
export { db, storage };
