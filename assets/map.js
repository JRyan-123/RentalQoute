const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg0ZjY5ZGMzNGMyOTQ5YmJiNDMwNGY0OWZkMjAxMDI4IiwiaCI6Im11cm11cjY0In0="; // 🛑 Replace this


const map = L.map('map').setView([14.5995, 120.9842], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Marker icons
const greenIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png", iconSize: [32, 32] });
const redIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png", iconSize: [32, 32] });

let pickupMarker = null, dropoffMarker = null, routeLine = null;

// Autocomplete
function autocomplete(inputId, suggestionId, type) {
  const input = document.getElementById(inputId);
  const suggestionsBox = document.getElementById(suggestionId);
  let debounceTimeout = null, lastController = null;

  input.addEventListener("input", () => {
    const query = input.value.trim();
    suggestionsBox.innerHTML = "";
    if (query.length < 2 || input.disabled) return;

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      if (lastController) lastController.abort();
      lastController = new AbortController();

      try {
        const res = await fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=PH`, {
          signal: lastController.signal
        });
        const data = await res.json();
        suggestionsBox.innerHTML = "";

        data.features.forEach(item => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.textContent = item.properties.label;
          div.addEventListener("click", () => {
            input.value = item.properties.label;
            placeMarker(type, {
              lat: item.geometry.coordinates[1],
              lng: item.geometry.coordinates[0]
            }, item.properties.label);
            suggestionsBox.innerHTML = "";
          });
          suggestionsBox.appendChild(div);
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error("Autocomplete error:", err);
      }
    }, 500);
  });
}

autocomplete("pickupSearch", "pickupSuggestions", "pickup");
autocomplete("dropoffSearch", "dropoffSuggestions", "dropoff");

async function reverseGeocode(lat, lng) {
  const res = await fetch(`https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}&size=1`);
  const data = await res.json();
  return data.features[0]?.properties?.label || "Unknown location";
}

function placeMarker(type, latlng, name) {
  if (type === "pickup" && !pickupMarker) {
    pickupMarker = L.marker(latlng, { icon: greenIcon }).addTo(map).bindPopup("Pickup: " + name).openPopup();
    document.getElementById("pickupLabel").innerText = name;
    document.getElementById("pickupSearch").value = name;
    document.getElementById("pickupSearch").disabled = true;
  } else if (type === "dropoff" && !dropoffMarker) {
    dropoffMarker = L.marker(latlng, { icon: redIcon }).addTo(map).bindPopup("Drop-off: " + name).openPopup();
    document.getElementById("dropoffLabel").innerText = name;
    document.getElementById("dropoffSearch").value = name;
    document.getElementById("dropoffSearch").disabled = true;
  }

  if (pickupMarker && dropoffMarker) {
    calculateDistance(pickupMarker.getLatLng(), dropoffMarker.getLatLng());
  }
}

async function calculateDistance(pickup, dropoff) {
  const coords = [[pickup.lng, pickup.lat], [dropoff.lng, dropoff.lat]];
  const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ coordinates: coords })
  });
  const data = await res.json();
  const meters = data.features[0].properties.summary.distance;
  const km = (meters / 1000).toFixed(2);

  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.geoJSON(data).addTo(map);

  document.getElementById("distanceInput").value = km;
  document.getElementById("distance").innerText = `Distance: ${km} km`;

  calculateTotalPrice();
}

function calculateTotalPrice() {
  const start = new Date(document.getElementById("startTime").value);
  const end = new Date(document.getElementById("endTime").value);
  const category = document.getElementById("category").value;
  const vehicle = document.getElementById("vehicle").value;
  const km = parseFloat(document.getElementById("distanceInput").value || 0);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    document.getElementById("totalPrice").value = "";
    document.getElementById("priceDisplay").innerText = "Price: ₱0.00";
    return;
  }

  const hours = Math.ceil((end - start) / (1000 * 60 * 60));

  let base = 0, hourlyRate = 0;

  if (vehicle === "l300") {
    base = 1500; hourlyRate = 3000 / 24;
  } else if (vehicle === "jeep") {
    base = 1000; hourlyRate = 2500 / 24;
  } else if (vehicle === "van") {
    base = 2000; hourlyRate = 3500 / 24;
  }

  let regular = base + (hourlyRate * hours) + (km * 20);
  let final = category === "budget" ? regular * 0.85 : regular;

  document.getElementById("totalPrice").value = final.toFixed(2);
  document.getElementById("priceDisplay").innerText = `Price: ₱${final.toFixed(2)}`;
}

function resetMap() {
  if (pickupMarker) map.removeLayer(pickupMarker);
  if (dropoffMarker) map.removeLayer(dropoffMarker);
  if (routeLine) map.removeLayer(routeLine);

  pickupMarker = null;
  dropoffMarker = null;
  routeLine = null;

  ["pickupLabel", "dropoffLabel", "pickupSearch", "dropoffSearch", "distanceInput", "startTime", "endTime", "totalPrice"].forEach(id => {
    document.getElementById(id).value = "";
    if (document.getElementById(id).innerText !== undefined) {
      document.getElementById(id).innerText = "";
    }
  });

  document.getElementById("pickupSearch").disabled = false;
  document.getElementById("dropoffSearch").disabled = false;

  document.getElementById("distance").innerText = "Distance: 0 km";
  document.getElementById("priceDisplay").innerText = "Price: ₱0.00";
}

["startTime", "endTime", "category", "vehicle", "distanceInput"].forEach(id => {
  document.getElementById(id).addEventListener("input", calculateTotalPrice);
});

map.on('click', function (e) {
  if (!pickupMarker || !dropoffMarker) {
    const type = !pickupMarker ? "pickup" : "dropoff";
    const defaultName = type === "pickup" ? "Pickup Point" : "Drop-off Point";

    // Place marker immediately with temporary label
    placeMarker(type, e.latlng, defaultName);

    // Do reverse geocode in background
    reverseGeocode(e.latlng.lat, e.latlng.lng).then(realName => {
      updateMarkerPopup(type, realName);
    });
  }
});


function handleFinalize() {
  const button = event.target;
  button.disabled = true;
  button.innerText = "Preparing...";

  html2canvas(document.getElementById("summaryBox")).then(canvas => {
    // Trigger image download
    const link = document.createElement('a');
    link.download = 'rental_summary.png';
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Re-enable button
    button.disabled = false;
    button.innerText = "📸 Finalize & Message Us";

    // Use timeout to give download a moment before redirect
    setTimeout(() => {
      window.location.href = 'https://m.me/TriarRental';
    }, 1000);
  }).catch(err => {
    alert("❌ Screenshot failed. Try again.");
    console.error(err);
    button.disabled = false;
    button.innerText = "📸 Finalize & Message Us";
  });
}


if (!(navigator.userAgent.includes("FBAN") || navigator.userAgent.includes("FBAV"))) {
  document.getElementById("browserNotice").style.display = "none";
}

function updateMarkerPopup(type, realName) {
  if (type === "pickup" && pickupMarker) {
    pickupMarker.setPopupContent("Pickup: " + realName).openPopup();
    document.getElementById("pickupLabel").innerText = realName;
    document.getElementById("pickupSearch").value = realName;
  } else if (type === "dropoff" && dropoffMarker) {
    dropoffMarker.setPopupContent("Drop-off: " + realName).openPopup();
    document.getElementById("dropoffLabel").innerText = realName;
    document.getElementById("dropoffSearch").value = realName;
  }

  // Re-run distance calculation if both are ready
  if (pickupMarker && dropoffMarker) {
    console.time("Distance calculation");
    calculateDistance(pickupMarker.getLatLng(), dropoffMarker.getLatLng()).then(() => {
      console.timeEnd("Distance calculation");
    });
  }
}
