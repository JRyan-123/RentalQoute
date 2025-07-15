import { map, routeLine } from "./map.js";
import { apiKey } from "./config.js";
import { calculateTotalPrice } from "./pricing.js";

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}&size=1`);
    const data = await res.json();
    return data.features[0]?.properties?.label || "Unknown location";

  } catch {
    return "Unknown location";
  }
}


export async function calculateDistance(pickup, dropoff) {
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
  window.routeLine = L.geoJSON(data).addTo(map);

  document.getElementById("distanceInput").value = km;
  
  document.getElementById("distance").innerText = `Distance: ${km} km`;
  calculateTotalPrice();
}
