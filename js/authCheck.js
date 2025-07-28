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

async function checkVoucherPermission(username) {
  try {
    const response = await fetch('./js/wvouchers.json'); // <-- qui!
    if (!response.ok) throw new Error('Impossibile caricare wvouchers.json');
    const authorizedUsers = await response.json();
    return authorizedUsers.includes(username);
  } catch (error) {
    console.error("Errore caricando wvouchers.json:", error);
    return false;
  }
}

async function hideVoucherSectionIfNoPermission(username) {
  const voucherSection = document.getElementById('voucher-create-section');
  if (!voucherSection) return;
  const hasPermission = await checkVoucherPermission(username);
  if (!hasPermission) {
    voucherSection.style.display = 'none';
    console.log("Voucher create section nascosta perché non autorizzato");
  } else {
    voucherSection.style.display = '';
  }
}

async function redirectIfNoVoucherPermission(username, currentPath) {
  if (currentPath.endsWith('vouch-create.html')) {
    const hasPermission = await checkVoucherPermission(username);
    if (!hasPermission) {
      alert("Non sei autorizzato a creare vouchers!");
      window.location.href = '/crypto-simulator/dashboard.html'; // redirect corretto
      return true;
    }
  }
  return false;
}

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  if (!username) {
    window.location.href = '/crypto-simulator/index.html';
    return;
  }

  try {
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      localStorage.removeItem('user');
      window.location.href = '/crypto-simulator/index.html';
      return;
    }

    if (await redirectIfNoVoucherPermission(username, currentPath)) return;

    await hideVoucherSectionIfNoPermission(username);

  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    localStorage.removeItem('user');
    window.location.href = '/crypto-simulator/index.html';
  }
}

checkAuth();
