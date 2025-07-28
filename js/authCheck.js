import { db, ref, get } from './js/firebase.js';

async function checkVoucherPermission(username) {
  try {
    const response = await fetch('./js/wvouchers.json'); // percorso corretto
    if (!response.ok) throw new Error('Impossibile caricare wvouchers.json');
    const authorizedUsers = await response.json();

    // authorizedUsers è un array di username autorizzati, es: ["user1", "user2", "admin"]
    return authorizedUsers.includes(username);
  } catch (error) {
    console.error("Errore caricando wvouchers.json:", error);
    return false; // per sicurezza se fallisce, nessuna autorizzazione
  }
}

async function hideVoucherSectionIfNoPermission(username) {
  const voucherSection = document.getElementById('voucher-create-section');
  if (!voucherSection) return; // se la sezione non esiste, niente da fare

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
      window.location.href = '/crypto-simulator/index.html'; // attenzione al percorso!
      return true; // segnalare che abbiamo fatto redirect
    }
  }
  return false; // nessun redirect fatto
}

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  if (!username) {
    // Non loggato → reindirizza sempre a login (index.html)
    window.location.href = '/crypto-simulator/index.html'; // percorso corretto per login
    return;
  }

  try {
    // Verifico se l'utente esiste nel DB Firebase
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      localStorage.removeItem('user');
      window.location.href = '/crypto-simulator/index.html';
      return;
    }

    // Se siamo nella pagina voucher-create.html, redirect se non autorizzati
    const redirected = await redirectIfNoVoucherPermission(username, currentPath);
    if (redirected) return;

    // Se l'utente è su pagine dove appare la sezione voucher create, ma non ha permessi la nascondo:
    await hideVoucherSectionIfNoPermission(username);

  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    localStorage.removeItem('user');
    window.location.href = '/crypto-simulator/index.html';
  }
}

checkAuth();
