import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyArE1KJBg5TsHfT9yd91qsH7gcTWsyJq5U",
  authDomain: "lt-directory.firebaseapp.com",
  projectId: "lt-directory",
  storageBucket: "lt-directory.appspot.com",
  messagingSenderId: "555851426686",
  appId: "1:555851426686:web:cecd59fa38f6af229da12f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
