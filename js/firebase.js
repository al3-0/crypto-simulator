import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA63kHy6QyUQteu6Vqja3c6wZOM2-h9tRQ",
  authDomain: "coins-7104d.firebaseapp.com",
  databaseURL: "https://coins-7104d-default-rtdb.firebaseio.com",
  projectId: "coins-7104d",
  storageBucket: "coins-7104d.firebasestorage.app",
  messagingSenderId: "893938643778",
  appId: "1:893938643778:web:30cdef9cfbc2776c77cedb",
  measurementId: "G-QSY10CVX1F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function loadUserData(username) {
  if (!username) return null;
  try {
    const snapshot = await get(ref(db, `users/${username}/wallet`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Errore caricamento dati utente:", error);
    return null;
  }
}

export { loadUserData };
