// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyClXChvSPAphMdfSqdbdyrIU5BUWcHLmc4",
    authDomain: "nenek-gaul-scooter.firebaseapp.com",
    projectId: "nenek-gaul-scooter",
    storageBucket: "nenek-gaul-scooter.firebasestorage.app",
    messagingSenderId: "798770533864",
    appId: "1:798770533864:web:e4b7719510de555205005d",
    measurementId: "G-EVDK9W6EC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
