export const map = L.map('map').setView([14.3995, 120.9842], 11);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

export const greenIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
  iconSize: [32, 32]
});
export const redIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
  iconSize: [32, 32]
});

export let pickupMarker = null;
export let dropoffMarker = null;
export let routeLine = null;
