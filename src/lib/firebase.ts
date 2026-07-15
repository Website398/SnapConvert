import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Replace these values with YOUR Firebase project config
// (Firebase Console → Project Settings → Your apps → Config)
const firebaseConfig = {
  apiKey: "AIzaSyDtHfdrVKccI57-g-ZvbtgsWm2VfiCIGhw",
  authDomain: "invoices-app-b99f5.firebaseapp.com",
  databaseURL: "https://invoices-app-b99f5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "invoices-app-b99f5",
  storageBucket: "invoices-app-b99f5.firebasestorage.app",
  messagingSenderId: "504512029149",
  appId: "1:504512029149:web:64849761a09e0bcead9634",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const database = getDatabase(app);