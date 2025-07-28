import { db, ref, set, get, child } from './firebase.js';

async function getIP() {
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  return data.ip;
}

window.register = async function() {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;
  const ip = await getIP();

  if (username.length > 15 || /[^a-zA-Z0-9]/.test(username)) {
    alert("Username non valido.");
    return;
  }

  const userRef = ref(db, 'users/' + username);
  const snapshot = await get(userRef);
  if (snapshot.exists()) {
    alert("Username già in uso.");
    return;
  }

  await set(userRef, {
    password,
    ip,
    wallet: {
      BTC: 0,
      ETH: 0,
      LTC: 0
    }
  });

  localStorage.setItem("user", username);
  window.location.href = "dashboard.html";
};

window.login = async function() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  const userRef = ref(db, 'users/' + username);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    alert("Utente non trovato.");
    return;
  }

  const data = snapshot.val();
  if (data.password !== password) {
    alert("Password errata.");
    return;
  }

  localStorage.setItem("user", username);
  window.location.href = "dashboard.html";
};
