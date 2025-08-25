// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIOh0taxaOZCzjshMBsZwoBHwZAalQ1wg",
  authDomain: "crm-system-ff0eb.firebaseapp.com",
  projectId: "crm-system-ff0eb",
  storageBucket: "crm-system-ff0eb.firebasestorage.app",
  messagingSenderId: "1061188810206",
  appId: "1:1061188810206:web:5ef7536af6600d482cd94f",
  measurementId: "G-D655QJSXTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);