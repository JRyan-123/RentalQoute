
*{
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
 input, select { 
    width: 100%; 
    padding: 8px; 
    margin-bottom: 10px; 
    border-radius: 5px; 
    border: 1px solid #ccc; 
    }
.suggestion-item{ 
        padding: 8px; 
        cursor: pointer; 
        background: white; 
        border-bottom: 1px solid #ddd;
    }
.suggestion-item:hover { 
        background-color: #f0f0f0; 
    }
#distance, #priceDisplay , #durationDisplay{ 
        font-weight: bold; 
        font-size: 18px; 
        margin-top: 10px; 
    }
button { 
        padding: 10px 15px; 
        margin-top: 10px; 
        border: none; 
        border-radius: 5px; 
        cursor: pointer; 
    }
    button[type=button] {  
        color: white; 
    }
    #capture{
        background: #4CAF50;
    }
    #capture:hover{
        background: green;
    }
    #reset{
        background:#f44336;
    }
    #reset:hover{
        background:#f22516;
    }
    #title{
        display: flex;
        justify-content: left;
        margin-bottom: 10px;
    }
    #icon-nobg{
        margin-right: 10px;
        height: 35px;
        width: 35px;
    }
        #map { 
        position: absolute;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        z-index: 0;
    }
       .hero{

        position: absolute;
        top: 70%;
        left: 2%;
        width: 90%;
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        z-index: 1;
        overflow-y: auto;
    }




const apiKey = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg0ZjY5ZGMzNGMyOTQ5YmJiNDMwNGY0OWZkMjAxMDI4IiwiaCI6Im11cm11cjY0In0="; // 🛑 Replace this

const map = L.map('map').setView([14.3995, 120.9842], 11); 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const greenIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png", iconSize: [32, 32] });
const redIcon = L.icon({ iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png", iconSize: [32, 32] });

let pickupMarker = null, dropoffMarker = null, routeLine = null;

function autocomplete(inputId, suggestionId, type) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionId);
  let timeout = null, controller = null;

  input.addEventListener("input", () => {
    const query = input.value.trim();
    box.innerHTML = "";
    if (query.length < 2 || input.disabled) return;

    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      if (controller) controller.abort();
      controller = new AbortController();
      try {
        const res = await fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(query)}&boundary.country=PH`, {
          signal: controller.signal
        });
        const data = await res.json();
        box.innerHTML = "";
        data.features.forEach(item => {
          const div = document.createElement("div");
          div.className = "suggestion-item";
          div.textContent = item.properties.label;
          div.onclick = () => {
            input.value = item.properties.label;
            placeMarker(type, {
              lat: item.geometry.coordinates[1],
              lng: item.geometry.coordinates[0]
            }, item.properties.label);
            box.innerHTML = "";
          };
          box.appendChild(div);
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }, 300);
  });
}

function placeMarker(type, latlng, label) {
  const marker = L.marker(latlng, {
    icon: type === "pickup" ? greenIcon : redIcon
  }).addTo(map).bindPopup((type === "pickup" ? "Pickup: " : "Drop-off: ") + label).openPopup();

  if (type === "pickup") {
    pickupMarker = marker;
    document.getElementById("pickupSearch").value = label;
    document.getElementById("pickupSearch").disabled = true;
  } else {
    dropoffMarker = marker;
    document.getElementById("dropoffSearch").value = label;
    document.getElementById("dropoffSearch").disabled = true;
  }

  if (pickupMarker && dropoffMarker) {
    calculateDistance(pickupMarker.getLatLng(), dropoffMarker.getLatLng());
  }
}

function updateMarkerPopup(type, realName) {
  const el = type === "pickup" ? pickupMarker : dropoffMarker;
  if (!el) return;

  el.setPopupContent((type === "pickup" ? "Pickup: " : "Drop-off: ") + realName).openPopup();
  const inputId = type === "pickup" ? "pickupSearch" : "dropoffSearch";
  document.getElementById(inputId).value = realName;

  if (pickupMarker && dropoffMarker) {
    console.time("Distance calc");
    calculateDistance(pickupMarker.getLatLng(), dropoffMarker.getLatLng()).then(() => {
      console.timeEnd("Distance calc");
    });
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}&size=1`);
    const data = await res.json();
    return data.features[0]?.properties?.label || "Unknown location";
  } catch {
    return "Unknown location";
  }
}

async function calculateDistance(pickup, dropoff) {
  const coords = [[pickup.lng, pickup.lat], [dropoff.lng, dropoff.lat]];
  const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car/geojson", {
    method: "POST",
    headers: { "Authorization": apiKey, "Content-Type": "application/json" },
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
    document.getElementById("durationDisplay").innerText = "Duration: 0 hours";
    return;
  }

  const totalMs = end - start;
  const totalHours = Math.ceil(totalMs / (1000 * 60 * 60));
  const totalDays = Math.floor(totalHours / 24);
  const remainingHours = totalHours % 24;

  // Update UI
  let durationText = `Duration: `;
  if (totalDays > 0) durationText += `${totalDays} day${totalDays > 1 ? "s" : ""} `;
  durationText += `${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
  document.getElementById("durationDisplay").innerText = durationText;

  // Pricing
  const rates = {
    l300: { base: 1500, rate: 3000 / 24 },
    jeep: { base: 1000, rate: 2500 / 24 },
    van: { base: 2000, rate: 3500 / 24 }
  };
  const { base, rate } = rates[vehicle] || { base: 0, rate: 0 };
  let total = base + (rate * totalHours) + (km * 20);
  if (category === "budget") total *= 0.85;

  document.getElementById("totalPrice").value = total.toFixed(2);
  document.getElementById("priceDisplay").innerText = `Price: ₱${total.toFixed(2)}`;
}


function resetMap() {
  if (pickupMarker) map.removeLayer(pickupMarker);
  if (dropoffMarker) map.removeLayer(dropoffMarker);
  if (routeLine) map.removeLayer(routeLine);
  pickupMarker = dropoffMarker = routeLine = null;

  ["pickupSearch", "dropoffSearch", "distanceInput", "startTime", "endTime", "totalPrice"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("pickupSearch").disabled = false;
  document.getElementById("dropoffSearch").disabled = false;
  document.getElementById("distance").innerText = "Distance: 0 km";
  document.getElementById("priceDisplay").innerText = "Price: ₱0.00";
}

function copyAndGoToMessenger() {
  const pickup = document.getElementById("pickupSearch").value;
  const dropoff = document.getElementById("dropoffSearch").value;
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;
  // const category = document.getElementById("category").value;
  const vehicle = document.getElementById("vehicle").value;
  const price = document.getElementById("totalPrice").value;
  const distance = document.getElementById("distanceInput").value;
  const duration = document.getElementById("durationDisplay").value;
// 🏷️ Category: ${category}\n
  const message = `🚐 Van Rental Inquiry:\n\n📍 Pickup: ${pickup}\n📍 Drop-off: ${dropoff}\n🗓️ Start: ${start}\n🗓️ End: ${end}\n🚗 Vehicle: ${vehicle}\n📏 Distance: ${distance} km\n🕗 Duration: ${duration} hours\n💸 Estimated Price: ₱${price}\n\n📋Inclusions:\n✅Driver\n✅Gas\n✅Toll fees\n✅Dual-Aircon\n✅RoundTrip\n\nPlease confirm my booking.`;

  navigator.clipboard.writeText(message).then(() => {
    alert("✅ Details copied! You can now paste in Messenger.");
    window.location.href = "https://m.me/TriarRental";
  }).catch(err => {
    console.error("Copy failed:", err);
    alert("❌ Could not copy the message. Please try again.");
  });
}

// Initialization
autocomplete("pickupSearch", "pickupSuggestions", "pickup");
autocomplete("dropoffSearch", "dropoffSuggestions", "dropoff");

["startTime", "endTime", /*"category",*/ "vehicle", "distanceInput"].forEach(id =>
  document.getElementById(id).addEventListener("input", calculateTotalPrice)
);

map.on("click", async (e) => {
  if (pickupMarker && dropoffMarker) return;
  const type = !pickupMarker ? "pickup" : "dropoff";
  placeMarker(type, e.latlng, type === "pickup" ? "Pickup Point" : "Drop-off Point");
  const name = await reverseGeocode(e.latlng.lat, e.latlng.lng);
  updateMarkerPopup(type, name);
});
