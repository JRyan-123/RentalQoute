import { placeMarker } from "./ui.js";
import { apiKey } from "./config.js";

export function autocomplete(inputId, suggestionId, type) {
  const input = document.getElementById(inputId);
  const box = document.getElementById(suggestionId);
  let timeout = null, controller = null;

  input.addEventListener("input", () => {
    const query = input.value.trim();
    if (query.length < 2 || input.disabled) {
    box.innerHTML = "";
    box.style.display = "none";
    return;
  }

  box.style.display = "block"; // show suggestions if query is valid

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
          box.style.display = "none"; // hide box
        };
          box.appendChild(div);
        });
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    }, 300);
  });
}
