import { db, ref, get } from './firebase.js';  // Assicurati che il percorso sia corretto

async function checkAuth() {
  const username = localStorage.getItem('user');
  if (!username) {
    // Non loggato
    window.location.href = 'index.html';
    return;
  }
  try {
    const snapshot = await get(ref(db, `users/${username}`));
    if (!snapshot.exists()) {
      // Utente non trovato nel DB: logout forzato
      localStorage.removeItem('user');
      window.location.href = 'index.html';
      return;
    }
    // Utente valido, continua normale esecuzione
  } catch (error) {
    console.error('Errore controllo autenticazione:', error);
    // In caso di errore di rete o altro, potresti decidere cosa fare
    // Per sicurezza, meglio rimandare al login
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }
}

// Esegui il controllo appena caricato lo script
checkAuth();
