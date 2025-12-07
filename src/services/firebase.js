// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBzXo74cP_NyWYowOJSSqDhbKMECQ9wjjE",
  authDomain: "sistema-comandas-f9b26.firebaseapp.com",
  projectId: "sistema-comandas-f9b26",
  storageBucket: "sistema-comandas-f9b26.firebasestorage.app",
  messagingSenderId: "99812665452",
  appId: "1:99812665452:web:b7a37fdb43aca46aa0d049",
  measurementId: "G-K86J6EWE97"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);