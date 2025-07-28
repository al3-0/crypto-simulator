import { db, ref, get } from './firebase.js';

async function getIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}

async function checkAuth() {
  const path = window.location.pathname.split('/').pop();

  if (path === 'index.html' || path === 'register.html' || path === '') {
    // Se siamo su index o register, controlla IP per login automatico
    const ip = await getIP();
    if (!ip) return; // Se non prende IP, esce

    try {
      // Cerca utenti con questo IP
      // Per Firebase Realtime DB devi fare una query per tutti gli utenti e filtrarli:
      const usersSnapshot = await get(ref(db, 'users'));
      if (!usersSnapshot.exists()) return;

      const users = usersSnapshot.val();
      for (const [username, userData] of Object.entries(users)) {
        if (userData.ip === ip) {
          // Utente trovato con stesso IP, login automatico
          localStorage.setItem('user', username);
          window.location.href = 'dashboard.html';
          return;
        }
      }
    } catch (err) {
      console.error('Errore durante controllo IP:', err);
    }
    // Se non trovato, non fare nulla, resta sulla pagina (index o register)
  } else {
    // Se siamo su pagina protetta, controlla user localStorage e DB
    const username = localStorage.getItem('user');
    if (!username) {
      window.location.href = 'index.html';
      return;
    }
    try {
      const snapshot = await get(ref(db, `users/${username}`));
      if (!snapshot.exists()) {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
        return;
      }
    } catch (error) {
      console.error('Errore controllo autenticazione:', error);
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    }
  }
}

checkAuth();
