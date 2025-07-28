import { db, ref, get } from './firebase.js'; // IMPORT CORRETTO SENZA 'js/js'

// Funzione per controllare se l'utente ha permessi voucher
async function checkVoucherPermission(username) {
  try {
    const response = await fetch('./wvouchers.json'); // json in js/
    if (!response.ok) throw new Error('Impossibile caricare wvouchers.json');
    const authorizedUsers = await response.json();
    // authorizedUsers è array tipo ["Ale", "admin", ...]
    return authorizedUsers.includes(username);
  } catch (error) {
    console.error("Errore caricando wvouchers.json:", error);
    return false;
  }
}

// Nascondi sezione voucher se utente non autorizzato
async function hideVoucherSectionIfNoPermission(username) {
  const voucherSection = document.getElementById('voucher-create-section');
  if (!voucherSection) return;
  const hasPermission = await checkVoucherPermission(username);
  if (!hasPermission) {
    voucherSection.style.display = 'none';
  }
}

// Reindirizza se utente non autorizzato su pagina voucher-create
async function redirectIfNoVoucherPermission(username, currentPath) {
  if (currentPath.endsWith('vouch-create.html')) {
    const hasPermission = await checkVoucherPermission(username);
    if (!hasPermission) {
      alert("Non sei autorizzato a creare vouchers!");
      window.location.href = '/index.html';
      return true;
    }
  }
  return false;
}

// Funzione principale di controllo autenticazione
async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  if (!username) {
    window.location.href = '/index.html';
    return;
  }

  try {
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      localStorage.removeItem('user');
      window.location.href = '/index.html';
      return;
    }

    const redirected = await redirectIfNoVoucherPermission(username, currentPath);
    if (redirected) return;

    await hideVoucherSectionIfNoPermission(username);

  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  }
}

checkAuth();
