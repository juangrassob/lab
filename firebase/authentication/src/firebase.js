// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAf4I30iAIZ_dFlTqgTJrMKch-fnEjs9ik",
    authDomain: "trip-planner-264c6.firebaseapp.com",
    projectId: "trip-planner-264c6",
    storageBucket: "trip-planner-264c6.firebasestorage.app",
    messagingSenderId: "426449055948",
    appId: "1:426449055948:web:43e8115457375743159269",
    measurementId: "G-DMW2RVZ08D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

