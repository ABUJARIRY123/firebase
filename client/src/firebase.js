// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxbo87jvDKe4PFg0qpdhe12XZI9Tj7_-0",
  authDomain: "blog-1f60e.firebaseapp.com",
  projectId: "blog-1f60e",
  storageBucket: "blog-1f60e.appspot.com",
  messagingSenderId: "324279317839",
  appId: "1:324279317839:web:d61a091df8e44831c0013a",
  measurementId: "G-M5R8193GSG"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);