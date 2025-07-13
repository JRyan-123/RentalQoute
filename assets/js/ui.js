import { map, greenIcon, redIcon, pickupMarker, dropoffMarker } from "./map.js";
import { calculateDistance } from "./distance.js";

export function placeMarker(type, latlng, label) {
  const icon = type === "pickup" ? greenIcon : redIcon;
  const marker = L.marker(latlng, { icon }).addTo(map).bindPopup(`${type === "pickup" ? "Pickup" : "Drop-off"}: ${label}`).openPopup();

  if (type === "pickup") {
    window.pickupMarker = marker;
    document.getElementById("pickupSearch").value = label;
    document.getElementById("pickupSearch").disabled = true;
  } else {
    window.dropoffMarker = marker;
    document.getElementById("dropoffSearch").value = label;
    document.getElementById("dropoffSearch").disabled = true;
  }

  if (window.pickupMarker && window.dropoffMarker) {
    calculateDistance(window.pickupMarker.getLatLng(), window.dropoffMarker.getLatLng());
  }
}

export function resetMap() {
  if (window.pickupMarker) map.removeLayer(window.pickupMarker);
  if (window.dropoffMarker) map.removeLayer(window.dropoffMarker);
  if (window.routeLine) map.removeLayer(window.routeLine);

  window.pickupMarker = window.dropoffMarker = window.routeLine = null;

  ["pickupSearch", "dropoffSearch", "distanceInput", "startTime", "endTime", "totalPrice"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("pickupSearch").disabled = false;
  document.getElementById("dropoffSearch").disabled = false;
  document.getElementById("distance").innerText = "Distance: 0 km";
  document.getElementById("priceDisplay").innerText = "Price: ₱0.00";
}
