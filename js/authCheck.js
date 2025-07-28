import { db, ref, get } from './js/firebase.js';

async function getIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return '0.0.0.0';
  }
}

async function checkAuth() {
  const username = localStorage.getItem('user');
  const currentPath = window.location.pathname;

  // Pagine pubbliche dove NON deve essere presente l'utente loggato:
  const publicPages = ['/', '/index.html', '/register.html'];

  if (username) {
    // Se ho username in localStorage, verifico che esista nel DB
    try {
      const snapshot = await get(ref(db, `users/${username}`));
      if (!snapshot.exists()) {
        // User non esiste, pulisco localStorage e redirect a login
        localStorage.removeItem('user');
        if (!publicPages.includes(currentPath)) {
          window.location.href = '/index.html';
        }
        return;
      }

      // Se utente loggato e su pagina pubblica, mando alla dashboard
      if (publicPages.includes(currentPath)) {
        window.location.href = '/dashboard.html';
      }

      // Altrimenti utente loggato su pagina protetta: OK, nessun redirect
    } catch (error) {
      console.error('Errore connessione DB', error);
      // In caso di errore meglio reindirizzare a login per sicurezza
      localStorage.removeItem('user');
      if (!publicPages.includes(currentPath)) {
        window.location.href = '/index.html';
      }
    }
  } else {
    // Non ho username in localStorage, provo a fare login automatico tramite IP su pagine pubbliche
    if (publicPages.includes(currentPath)) {
      try {
        const ip = await getIP();
        // Cerco utente con questo IP
        // ATTENZIONE: questa funzione dipende da come sono strutturati i dati sul db
        // Devi modificare in base a come fai la query nel tuo DB Firebase (firestore o realtime)
        
        // Esempio Realtime DB: cerca tutti gli utenti (attenzione a query in DB grande)
        // Qui facciamo una scansione: NON efficiente ma d'esempio
        const snapshot = await get(ref(db, 'users'));
        if (snapshot.exists()) {
          const users = snapshot.val();
          for (const [userKey, userData] of Object.entries(users)) {
            if (userData.ip === ip) {
              // Found user with matching IP, log in automatically
              localStorage.setItem('user', userKey);
              window.location.href = '/dashboard.html';
              return;
            }
          }
        }
      } catch (error) {
        console.error('Errore durante login automatico IP', error);
      }
      // Se non trovato o errore, resta su pagina pubblica
    } else {
      // Se non ho user e sono su pagina protetta, reindirizzo a login
      window.location.href = '/index.html';
    }
  }
}

// Eseguo subito la verifica
checkAuth();
