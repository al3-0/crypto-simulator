import { db, ref, get, child, update } from './firebase.js';

async function getIP() {
  const res = await fetch('https://api.ipify.org?format=json');
  const data = await res.json();
  return data.ip;
}

const username = localStorage.getItem("user");
if (!username) window.location.href = "index.html";

const snapshot = await get(child(ref(db), 'users/' + username));
const userData = snapshot.val();
const ip = await getIP();

if (!userData || userData.ip !== ip) {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// Show/hide dashboard sections
window.showSection = function(sectionId) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));
  document.getElementById(sectionId).classList.remove('hidden');
};

// Toggle password view
window.togglePassword = function() {
  document.getElementById("acc-password").textContent = userData.password;
};

// AFK Timer
let timer = 60;
setInterval(async () => {
  timer--;
  document.getElementById("afk-timer").textContent = timer;
  if (timer <= 0) {
    timer = 60;
    const newBTC = (userData.wallet.BTC || 0) + 0.05;
    userData.wallet.BTC = newBTC;
    await update(ref(db, 'users/' + username + '/wallet'), { BTC: newBTC });
    document.getElementById("acc-btc").textContent = newBTC.toFixed(2);
  }
}, 1000);

// Pre-fill account data
document.getElementById("acc-username").textContent = username;
document.getElementById("acc-btc").textContent = userData.wallet.BTC;
document.getElementById("acc-eth").textContent = userData.wallet.ETH;
document.getElementById("acc-ltc").textContent = userData.wallet.LTC;