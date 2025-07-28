import { db, ref, get } from './firebase.js';  // perché authcheck.js è in /js/, quindi ./firebase.js

async function checkVoucherPermission(username) {
  try {
    const response = await fetch('./wvouchers.json');  // /js/wvouchers.json perché siamo in /js/
    if (!response.ok) throw new Error('Impossibile caricare wvouchers.json');
    const authorizedUsers = await response.json();
    console.log("Utenti autorizzati:", authorizedUsers);
    console.log(`Controllo permesso per utente: ${username} -> ${authorizedUsers.includes(username)}`);
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
    console.log("Sezione voucher nascosta per utente senza permessi.");
  }
}

async function redirectIfNoVoucherPermission(username, currentPath) {
  if (currentPath.endsWith('vouch-create.html')) {
    const hasPermission = await checkVoucherPermission(username);
    if (!hasPermission) {
      alert("Non sei autorizzato a creare vouchers!");
      window.location.href = '/index.html';  // aggiusta se la home è altrove
      return true;
    }
  }
  return false;
}

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  console.log("checkAuth - utente:", username, "pagina:", currentPath);

  if (!username) {
    console.log("Utente non loggato, redirect a login");
    window.location.href = '/index.html';  // aggiusta percorso
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
