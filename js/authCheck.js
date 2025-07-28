import { db, ref, get } from './js/firebase.js';

async function checkVoucherPermission(username) {
  try {
    // Usa path assoluto per GitHub Pages
    const response = await fetch('/crypto-simulator/wvouchers.json');
    if (!response.ok) throw new Error('Impossibile caricare wvouchers.json');
    const authorizedUsers = await response.json();
    return authorizedUsers.includes(username);
  } catch (error) {
    console.error("Errore caricando wvouchers.json:", error);
    return false; // no permessi se errore
  }
}

async function hideVoucherSectionIfNoPermission(username) {
  const voucherSection = document.getElementById('voucher-create-section');
  if (!voucherSection) return; // se non c’è la sezione, esci

  const hasPermission = await checkVoucherPermission(username);
  if (!hasPermission) {
    voucherSection.style.display = 'none';
  }
}

async function redirectIfNoVoucherPermission(username, currentPath) {
  if (currentPath.endsWith('vouch-create.html')) {
    const hasPermission = await checkVoucherPermission(username);
    if (!hasPermission) {
      alert("Non sei autorizzato a creare vouchers!");
      window.location.href = '/crypto-simulator/index.html';
      return true; // redirect fatto
    }
  }
  return false; // niente redirect
}

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  if (!username) {
    // Non loggato → redirect a login
    window.location.href = '/crypto-simulator/index.html';
    return;
  }

  try {
    // Controllo che l'utente esista su Firebase
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      localStorage.removeItem('user');
      window.location.href = '/crypto-simulator/index.html';
      return;
    }

    // Se siamo in voucher-create.html, redirect se non autorizzato
    const redirected = await redirectIfNoVoucherPermission(username, currentPath);
    if (redirected) return;

    // Nascondo la sezione voucher-create se presente e senza permessi
    await hideVoucherSectionIfNoPermission(username);

  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    localStorage.removeItem('user');
    window.location.href = '/crypto-simulator/index.html';
  }
}

checkAuth();
