import { autocomplete } from "./autocomplete.js";
import { placeMarker } from "./ui.js";
import { calculateTotalPrice } from "./pricing.js";
import { reverseGeocode } from "./distance.js";
import { map } from "./map.js";
import { copyAndGoToMessenger } from "./messenger.js";

document.getElementById("messengerBtn").addEventListener("click", copyAndGoToMessenger);
autocomplete("pickupSearch", "pickupSuggestions", "pickup");
autocomplete("dropoffSearch", "dropoffSuggestions", "dropoff");

["startTime", "endTime", "vehicle", "distanceInput"].forEach(id =>
  document.getElementById(id).addEventListener("input", calculateTotalPrice)
);

map.on("click", async (e) => {
  if (window.pickupMarker && window.dropoffMarker) return;
  const type = !window.pickupMarker ? "pickup" : "dropoff";
  placeMarker(type, e.latlng, type === "pickup" ? "Pickup Point" : "Drop-off Point");
  const name = await reverseGeocode(e.latlng.lat, e.latlng.lng);
  window[type + "Marker"].setPopupContent(`${type === "pickup" ? "Pickup" : "Drop-off"}: ${name}`).openPopup();
  document.getElementById(type + "Search").value = name;
});
