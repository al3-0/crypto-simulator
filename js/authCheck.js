import { db, ref, get } from './js/firebase.js';

async function checkVoucherPermission(username) {
  try {
    const response = await fetch('./js/wvouchers.json'); // Aggiorna il path se serve
    if (!response.ok) throw new Error('Impossibile caricare wvouchers.json');
    const authorizedUsers = await response.json();

    // Controllo case-insensitive per username autorizzati
    return authorizedUsers.some(user => user.toLowerCase() === username.toLowerCase());
  } catch (error) {
    console.error("Errore caricando wvouchers.json:", error);
    return false; // Se fallisce il fetch, nessuna autorizzazione
  }
}

async function hideVoucherSectionIfNoPermission(username) {
  const voucherSection = document.getElementById('voucher-create-section');
  if (!voucherSection) return; // Se la sezione non esiste, niente da fare

  const hasPermission = await checkVoucherPermission(username);
  if (!hasPermission) {
    voucherSection.style.display = 'none';
  }
}

async function redirectIfNoVoucherPermission(username, currentPath) {
  if (currentPath.endsWith('vouch-create.html')) { // Controlla esatto nome file
    const hasPermission = await checkVoucherPermission(username);
    if (!hasPermission) {
      alert("Non sei autorizzato a creare vouchers!");
      window.location.href = '/index.html';
      return true; // Redirect effettuato
    }
  }
  return false; // Nessun redirect fatto
}

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  if (!username) {
    // Non loggato → reindirizza sempre a login (index.html)
    window.location.href = '/index.html';
    return;
  }

  try {
    // Verifica se l'utente esiste nel DB Firebase
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      localStorage.removeItem('user');
      window.location.href = '/index.html';
      return;
    }

    // Se siamo nella pagina vouch-create.html, redirect se non autorizzati
    const redirected = await redirectIfNoVoucherPermission(username, currentPath);
    if (redirected) return;

    // Nascondi la sezione voucher-create se non autorizzato
    await hideVoucherSectionIfNoPermission(username);

  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  }
}

checkAuth();
