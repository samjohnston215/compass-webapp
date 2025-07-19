const firebaseConfig = {
  apiKey: "AIzaSyCcAduuqgdNmrhQtQHmtnL0kQwXZPu9b2A",
  authDomain: "compassapp-cb4ed.firebaseapp.com",
  databaseURL: "https://compassapp-cb4ed-default-rtdb.firebaseio.com",
  projectId: "compassapp-cb4ed",
  storageBucket: "compassapp-cb4ed.appspot.com",
  messagingSenderId: "820890755353",
  appId: "1:820890755353:web:d4e33e791f925166506588"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let yourID = localStorage.getItem('yourID') || prompt("Enter your ID (e.g., user1)");
let friendID = localStorage.getItem('friendID') || prompt("Enter your friend's ID (e.g., user2)");

if (yourID === friendID) {
  alert('IDs must be different.');
}

localStorage.setItem('yourID', yourID);
localStorage.setItem('friendID', friendID);

function swapIDs() {
  [yourID, friendID] = [friendID, yourID];
  localStorage.setItem('yourID', yourID);
  localStorage.setItem('friendID', friendID);
  location.reload();
}

function toRadians(deg) {
  return deg * Math.PI / 180;
}

function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = toRadians(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
  const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
            Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);
  let bearing = Math.atan2(y, x);
  bearing = bearing * (180 / Math.PI);
  return (bearing + 360) % 360;
}

const needle = document.getElementById('needle');
const tick = document.getElementById('tick-sound');
let yourCoords = { lat: 0, lon: 0 };
let friendCoords = { lat: 0, lon: 0 };

function updateCompass() {
  const bearing = calculateBearing(yourCoords.lat, yourCoords.lon, friendCoords.lat, friendCoords.lon);
  needle.style.transform = `rotate(${bearing}deg)`;
  if (tick) tick.play();
}

navigator.geolocation.watchPosition(position => {
  yourCoords.lat = position.coords.latitude;
  yourCoords.lon = position.coords.longitude;
  db.ref('users/' + yourID).set(yourCoords);
}, error => {
  alert("Error getting location. Make sure GPS is enabled.");
}, {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 5000
});

db.ref('users/' + friendID).on('value', snapshot => {
  const data = snapshot.val();
  if (data && data.lat != null && data.lon != null) {
    friendCoords.lat = data.lat;
    friendCoords.lon = data.lon;
    updateCompass();
  }
});

window.addEventListener('offline', () => alert("You're offline. Compass may not work."));
