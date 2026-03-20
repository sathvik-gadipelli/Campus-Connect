import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getAuth, GoogleAuthProvider } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLF7xarmzqJ_zShHGSyR3qyFI2z0ubYb8",
  authDomain: "campus-connect-9084a.firebaseapp.com",
  projectId: "campus-connect-9084a"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
