const socket = io();

let map;
let markers = {};
let myName = "";

// Load Google Maps script dynamically
async function loadGoogleMaps() {
  try {
    // Get API key from server
    const response = await fetch("/api/config");
    const data = await response.json();
    const apiKey = data.apiKey;

    // Create script tag for Google Maps
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  } catch (error) {
    console.error("Failed to load Google Maps:", error);
    alert("Error: Could not load map. Check your API key.");
  }
}

// Initialize map
window.initMap = function () {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 20.2961, lng: 85.8245 },
    zoom: 14,
    mapTypeControl: true,
    zoomControl: true,
    fullscreenControl: true,
    streetViewControl: true
  });
};

// Load maps when page loads
loadGoogleMaps();

function startSharing() {

  myName = document.getElementById("name").value.trim();

  if (!myName) {
    alert("Enter your name");
    return;
  }

  socket.emit("join", { name: myName });

  navigator.geolocation.watchPosition(

    (pos) => {

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      socket.emit("send-location", { lat, lng });

      map.setCenter({ lat, lng });

    },

    (err) => {
      alert("Location permission required");
      console.error(err);
    },

    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }

  );

}
socket.on("users-update", (users) => {

  const list = document.getElementById("usersList");
  list.innerHTML = "";

  for (let id in users) {

    const user = users[id];

    const div = document.createElement("div");

    div.className =
      "flex items-center gap-3 bg-white/10 p-2 rounded-lg border border-white/20";

    div.innerHTML = `
      <div class="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
        ${user.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <p class="font-semibold">${user.name}</p>
        <p class="text-xs opacity-70">Live</p>
      </div>
    `;

    list.appendChild(div);

    if (user.lat && user.lng) {

      if (!markers[id]) {

        markers[id] = new google.maps.Marker({
          position: { lat: user.lat, lng: user.lng },
          map: map,
          title: user.name
        });

      } else {

        markers[id].setPosition({
          lat: user.lat,
          lng: user.lng
        });

      }

    }

  }

});