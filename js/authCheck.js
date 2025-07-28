import { db, ref, get } from './js/firebase.js';

async function checkVoucherPermission(username) {
  try {
    const response = await fetch('./js/wvouchers.json');
    if (!response.ok) throw new Error('Impossibile caricare wvouchers.json');
    const authorizedUsers = await response.json();

    console.log('Utenti autorizzati:', authorizedUsers);
    const isAuthorized = authorizedUsers.some(user => user.toLowerCase() === username.toLowerCase());
    console.log(`Permesso voucher per ${username}:`, isAuthorized);
    return isAuthorized;
  } catch (error) {
    console.error("Errore caricando wvouchers.json:", error);
    return false;
  }
}

async function hideVoucherSectionIfNoPermission(username) {
  const voucherSection = document.getElementById('voucher-create-section');
  if (!voucherSection) {
    console.log("Sezione voucher-create non trovata");
    return;
  }

  const hasPermission = await checkVoucherPermission(username);
  if (!hasPermission) {
    console.log("Nascondo sezione voucher-create per utente non autorizzato");
    voucherSection.style.display = 'none';
  } else {
    console.log("Utente autorizzato, mostro sezione voucher-create");
    voucherSection.style.display = ''; // mostra la sezione
  }
}

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

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  console.log("Utente loggato:", username);
  console.log("Pagina attuale:", currentPath);

  if (!username) {
    console.log("Utente non loggato, redirect a login");
    window.location.href = '/index.html';
    return;
  }

  try {
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      console.log("Utente non trovato nel DB, rimuovo localStorage e redirect");
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
