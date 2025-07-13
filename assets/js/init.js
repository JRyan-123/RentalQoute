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


function enableChange(type) {
  const input = document.getElementById(`${type}Search`);
  const label = document.getElementById(`${type}Label`);

  input.addEventListener("click", () => {
    // Remove marker
    if (window[`${type}Marker`]) {
      map.removeLayer(window[`${type}Marker`]);
      window[`${type}Marker`] = null;
    }

    // Remove route line if needed
    if (!window.pickupMarker || !window.dropoffMarker) {
      if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
      }
    }

    // Clear UI
    input.value = "";
    input.disabled = false;
    if (label) label.innerText = "";
    document.getElementById("distance").innerText = "Distance: 0 km";
    document.getElementById("distanceInput").value = "";
    document.getElementById("priceDisplay").innerText = "Price: ₱0.00";

    // Reset price calculation
    calculateTotalPrice();
  });
}
enableChange("pickup");
enableChange("dropoff");


document.getElementById("serviceType").addEventListener("change", () => {
  const service = document.getElementById("serviceType").value;
  const endInputWrapper = document.getElementById("endTime").closest(".input-wrapper");
  const startInputWrapper = document.getElementById("startTime");

  if (service === "hakot") {
    endInputWrapper.style.display = "none";
    startInputWrapper.style.width = "47.5%";

  } else {
    endInputWrapper.style.display = "";
    startInputWrapper.style.width = "95%";

  }

  calculateTotalPrice(); // recalculate after switching
});