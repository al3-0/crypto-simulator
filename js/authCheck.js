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

// Lista utenti autorizzati (hardcoded)
const authorizedUsers = ["Ale"];

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  if (!username) {
    window.location.href = '/crypto-simulator/index.html';
    return;
  }

  try {
    // Verifica esistenza utente nel DB Firebase
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      localStorage.removeItem('user');
      window.location.href = '/crypto-simulator/index.html';
      return;
    }

    // Controlla permessi voucher da lista interna
    const hasPermission = authorizedUsers.includes(username);

    // Nasconde il bottone/elemento voucher-create se non autorizzato
    const voucherSection = document.getElementById('voucher-create-section');
    if (voucherSection && !hasPermission) {
      voucherSection.style.display = 'none';
      console.log("Voucher create section nascosta perché utente non autorizzato.");
    }

    // Se è su pagina di creazione vouchers e non ha permessi, redirect a dashboard
    if (currentPath.endsWith('vouch-create.html') && !hasPermission) {
      alert("Non sei autorizzato a creare vouchers!");
      window.location.href = '/crypto-simulator/dashboard.html';
      return;
    }

  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    localStorage.removeItem('user');
    window.location.href = '/crypto-simulator/index.html';
  }
}

checkAuth();
