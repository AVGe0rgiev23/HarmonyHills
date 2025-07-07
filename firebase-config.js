// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB-XzUlk_zGWQUT02G2qN0xS1GN57vqDN0",
  authDomain: "harmonyhills-2cccb.firebaseapp.com",
  projectId: "harmonyhills-2cccb",
  storageBucket: "harmonyhills-2cccb.firebasestorage.app",
  messagingSenderId: "699055871073",
  appId: "1:699055871073:web:3e07c095be356c88aac620",
  measurementId: "G-ZE2SREX66C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);