import { map, greenIcon, redIcon, pickupMarker, dropoffMarker } from "./map.js";
import { calculateDistance } from "./distance.js";

export function placeMarker(type, latlng, label) {
  const icon = type === "pickup" ? greenIcon : redIcon;
  const marker = L.marker(latlng, { icon }).addTo(map).bindPopup(`${type === "pickup" ? "Pickup" : "Drop-off"}: ${label}`).openPopup();

  if (type === "pickup") {
    window.pickupMarker = marker;
    document.getElementById("pickupSearch").value = label;

  } else {
    window.dropoffMarker = marker;
    document.getElementById("dropoffSearch").value = label;
 
  }

  if (window.pickupMarker && window.dropoffMarker) {
    calculateDistance(window.pickupMarker.getLatLng(), window.dropoffMarker.getLatLng());
  }
}
