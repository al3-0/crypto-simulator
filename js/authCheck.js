import { db, ref, get } from './firebase.js';

async function checkVoucherPermission(username) {
  try {
    const response = await fetch('./wvouchers.json');
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
  }
}

async function redirectIfNoVoucherPermission(username, currentPath) {
  if (currentPath.endsWith('vouch-create.html')) {
    const hasPermission = await checkVoucherPermission(username);
    if (!hasPermission) {
      alert("Non sei autorizzato a creare vouchers!");
      window.location.href = '/crypto-simulator/index.html';
      return true;
    }
  }
  return false;
}

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  // Se non sei loggato vai al login
  if (!username) {
    window.location.href = '/crypto-simulator/index.html';
    return;
  }

  try {
    // Controllo esistenza utente nel DB
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      localStorage.removeItem('user');
      window.location.href = '/crypto-simulator/index.html';
      return;
    }

    // Se la pagina è protetta, redirect se no permessi
    const redirected = await redirectIfNoVoucherPermission(username, currentPath);
    if (redirected) return;

    // Nascondo sezione voucher se non autorizzato
    await hideVoucherSectionIfNoPermission(username);

    // ---- BLOCCO LINK VOUCHER-CREATE IN TUTTE LE PAGINE ----
    // blocca click su link a vouch-create.html se non autorizzato
    const voucherLinks = document.querySelectorAll('a[href$="vouch-create.html"]');
    const hasVoucherPerm = await checkVoucherPermission(username);

    if (!hasVoucherPerm) {
      voucherLinks.forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          alert("Non sei autorizzato ad accedere alla creazione vouchers!");
        });
      });
    }

  } catch (error) {
    console.error("Errore durante l'autenticazione:", error);
    localStorage.removeItem('user');
    window.location.href = '/crypto-simulator/index.html';
  }
}

checkAuth();
